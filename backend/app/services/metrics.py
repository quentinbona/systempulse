import math
import os
import platform
import socket
from datetime import UTC, datetime
from pathlib import Path

import psutil

from app.models.schemas import (
    CpuHardware,
    CpuMetrics,
    DiskMetrics,
    MemoryMetrics,
    MetricsResponse,
    SystemResponse,
)


class CollectionError(Exception):
    """A required system measurement is unavailable."""


READ_ERRORS = (OSError, psutil.Error, NotImplementedError, ValueError, OverflowError)


def optional_read(read):
    try:
        value = read()
    except (*READ_ERRORS, AttributeError):
        return None
    return value if value and value > 0 and math.isfinite(value) else None


def hardware():
    return CpuHardware(
        physical_cores=optional_read(lambda: psutil.cpu_count(logical=False)),
        logical_cores=optional_read(lambda: psutil.cpu_count(logical=True)),
        frequency_mhz=optional_read(lambda: psutil.cpu_freq().current),
    )


def collect_metrics() -> MetricsResponse:
    try:
        # A positive interval measures two samples even on a worker's first call.
        utilization = psutil.cpu_percent(interval=0.1)
        measured_at = datetime.now(UTC)
        memory = psutil.virtual_memory()
        root = Path(os.environ.get("SystemRoot", "/")).anchor or "/"
        disk = psutil.disk_usage(root)
        return MetricsResponse(
            timestamp=datetime.now(UTC),
            cpu=CpuMetrics(
                **hardware().model_dump(),
                timestamp=measured_at,
                utilization_percent=utilization,
            ),
            memory=MemoryMetrics(
                total_bytes=memory.total,
                used_bytes=memory.used,
                available_bytes=memory.available,
                utilization_percent=memory.percent,
            ),
            disk=DiskMetrics(
                total_bytes=disk.total,
                used_bytes=disk.used,
                free_bytes=disk.free,
                utilization_percent=disk.percent,
            ),
        )
    except READ_ERRORS as exc:
        raise CollectionError("Host metrics are temporarily unavailable.") from exc


def operating_system() -> str:
    name = platform.system()
    if name != "Darwin":
        return name
    try:
        version = platform.mac_ver()[0]
    except OSError:
        version = ""
    return f"macOS {version}" if version else "macOS"


def collect_system() -> SystemResponse:
    try:
        boot = datetime.fromtimestamp(psutil.boot_time(), UTC)
        now = datetime.now(UTC)
        return SystemResponse(
            hostname=socket.gethostname(),
            operating_system=operating_system(),
            uptime_seconds=max(0, int((now - boot).total_seconds())),
            boot_timestamp=boot,
            timestamp=now,
            cpu=hardware(),
        )
    except READ_ERRORS as exc:
        raise CollectionError("System information is temporarily unavailable.") from exc
