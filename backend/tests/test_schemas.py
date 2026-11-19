import pytest
from pydantic import ValidationError

from app.models.schemas import CpuMetrics


def test_cpu_serializes_utc_with_unknown_hardware():
    cpu = CpuMetrics(utilization_percent=0, timestamp="2026-01-01T01:00:00+01:00")
    assert cpu.model_dump(mode="json") == {
        "physical_cores": None,
        "logical_cores": None,
        "frequency_mhz": None,
        "utilization_percent": 0,
        "timestamp": "2026-01-01T00:00:00Z",
    }


@pytest.mark.parametrize(
    ("percent", "timestamp"),
    [(101, "2026-01-01T00:00:00Z"), (50, "2026-01-01T00:00:00")],
)
def test_cpu_rejects_invalid_measurements(percent, timestamp):
    with pytest.raises(ValidationError):
        CpuMetrics(utilization_percent=percent, timestamp=timestamp)
