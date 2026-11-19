from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.models.schemas import HealthResponse, MetricsResponse, SystemResponse
from app.services import metrics


@pytest.fixture
def host(monkeypatch):
    source = Mock(wraps=metrics.psutil)
    source.Error = metrics.psutil.Error
    source.cpu_count.side_effect = lambda logical: 8 if logical else 4
    source.cpu_freq.return_value = SimpleNamespace(current=2400)
    source.cpu_percent.return_value = 25
    source.virtual_memory.return_value = SimpleNamespace(
        total=1000, used=400, available=550, percent=45
    )
    source.disk_usage.return_value = SimpleNamespace(
        total=2000, used=500, free=1500, percent=25
    )
    source.boot_time.return_value = 100
    monkeypatch.setattr(metrics, "psutil", source)
    monkeypatch.setattr(metrics.socket, "gethostname", lambda: "test-host")
    monkeypatch.setattr(metrics.platform, "system", lambda: "TestOS")
    clock = Mock(wraps=datetime)
    clock.now.return_value = datetime.fromtimestamp(160, UTC)
    monkeypatch.setattr(metrics, "datetime", clock)
    return source


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:5173")
    with TestClient(create_app()) as connection:
        yield connection


def test_metrics(host, client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    snapshot = MetricsResponse.model_validate(response.json())
    host.cpu_percent.assert_called_once_with(interval=0.1)
    assert snapshot.cpu.utilization_percent == 25
    assert (
        snapshot.cpu.timestamp == snapshot.timestamp == datetime.fromtimestamp(160, UTC)
    )
    assert snapshot.memory.model_dump() == dict(
        total_bytes=1000, used_bytes=400, available_bytes=550, utilization_percent=45
    )
    assert snapshot.disk.model_dump() == dict(
        total_bytes=2000, used_bytes=500, free_bytes=1500, utilization_percent=25
    )


def test_system(host, client):
    response = client.get("/api/system")
    assert response.status_code == 200
    system = SystemResponse.model_validate(response.json())
    assert (system.hostname, system.operating_system) == ("test-host", "TestOS")
    assert system.uptime_seconds == 60
    assert system.boot_timestamp == datetime.fromtimestamp(100, UTC)
    assert system.cpu.model_dump() == dict(
        physical_cores=4, logical_cores=8, frequency_mhz=2400
    )


def test_missing_hardware(host):
    host.cpu_count.side_effect = lambda logical: 8 if logical else None
    host.cpu_freq.side_effect = NotImplementedError
    cpu = metrics.collect_metrics().cpu
    assert cpu.frequency_mhz is None and cpu.physical_cores is None
    assert cpu.logical_cores == 8


@pytest.mark.parametrize(
    ("endpoint", "reader"), [("metrics", "disk_usage"), ("system", "boot_time")]
)
def test_unavailable(host, client, endpoint, reader):
    getattr(host, reader).side_effect = PermissionError("private details")
    response = client.get(f"/api/{endpoint}")
    assert response.status_code == 503
    assert "unavailable" in response.json()["detail"]
    assert "private details" not in response.text
    assert client.get("/api/health").json() == {"status": "ok"}


def test_cors(client):
    for origin in ["http://localhost:5173", "https://other.example"]:
        response = client.get("/api/health", headers={"Origin": origin})
        allowed = response.headers.get("access-control-allow-origin")
        assert allowed == (origin if origin.startswith("http://localhost") else None)


@pytest.mark.parametrize(
    ("version", "expected"), [("15.5", "macOS 15.5"), ("", "macOS")]
)
def test_macos_name(host, client, monkeypatch, version, expected):
    monkeypatch.setattr(metrics.platform, "system", lambda: "Darwin")
    monkeypatch.setattr(metrics.platform, "mac_ver", lambda: (version, (), ""))
    assert client.get("/api/system").json()["operating_system"] == expected


def test_missing_frequency_and_idle_cpu(host, client):
    host.cpu_freq.return_value = None
    host.cpu_percent.return_value = 0
    cpu = client.get("/api/metrics").json()["cpu"]
    assert cpu["utilization_percent"] == 0
    assert cpu["frequency_mhz"] is None


@pytest.mark.parametrize("reader", ["cpu_percent", "virtual_memory"])
def test_required_read_failure_recovers(host, client, reader):
    getattr(host, reader).side_effect = OSError("private path")
    response = client.get("/api/metrics")
    assert response.status_code == 503
    assert "private path" not in response.text
    getattr(host, reader).side_effect = None
    assert client.get("/api/metrics").status_code == 200


def test_preflight_rejects_write_method(client):
    response = client.options(
        "/api/system",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 400
    assert "POST" not in response.headers["access-control-allow-methods"]


def test_health_schema(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert HealthResponse.model_validate(response.json()).status == "ok"


def test_shared_disk_preserves_independent_filesystem_counters(host, client):
    host.disk_usage.return_value = SimpleNamespace(
        total=1000, used=200, free=50, percent=80
    )
    assert client.get("/api/metrics").json()["disk"] == {
        "total_bytes": 1000,
        "used_bytes": 200,
        "free_bytes": 50,
        "utilization_percent": 80,
    }
