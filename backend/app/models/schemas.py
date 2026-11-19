"""Public response contracts for the SystemPulse API."""

from datetime import UTC
from typing import Annotated, Literal

from pydantic import (
    AfterValidator,
    AwareDatetime,
    BaseModel,
    Field,
    NonNegativeInt,
    PositiveInt,
)

Percentage = Annotated[float, Field(ge=0, le=100)]
UtcTimestamp = Annotated[
    AwareDatetime, AfterValidator(lambda value: value.astimezone(UTC))
]


class HealthResponse(BaseModel):
    status: Literal["ok"]


class CpuHardware(BaseModel):
    physical_cores: PositiveInt | None = None
    logical_cores: PositiveInt | None = None
    frequency_mhz: Annotated[float, Field(ge=0, allow_inf_nan=False)] | None = None


class CpuMetrics(CpuHardware):
    utilization_percent: Percentage
    timestamp: UtcTimestamp


class MemoryMetrics(BaseModel):
    total_bytes: NonNegativeInt
    used_bytes: NonNegativeInt
    available_bytes: NonNegativeInt
    utilization_percent: Percentage


class DiskMetrics(BaseModel):
    """psutil readings for the system root filesystem.

    On APFS, total and available bytes may reflect shared container capacity,
    while used bytes belong to the selected volume. On POSIX, utilization is
    the used fraction of used plus user-available bytes.
    """

    total_bytes: NonNegativeInt
    used_bytes: NonNegativeInt
    free_bytes: NonNegativeInt
    utilization_percent: Percentage


class MetricsResponse(BaseModel):
    timestamp: UtcTimestamp
    cpu: CpuMetrics
    memory: MemoryMetrics
    disk: DiskMetrics


class SystemResponse(BaseModel):
    hostname: str
    operating_system: str
    uptime_seconds: NonNegativeInt
    boot_timestamp: UtcTimestamp
    timestamp: UtcTimestamp
    cpu: CpuHardware
