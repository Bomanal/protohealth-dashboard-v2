"""Helpers for logging server-side errors without leaking PHI.

Database exception messages can embed row values (e.g. "Key (phone_number)=(...)
already exists") so we log only the exception type, the Postgres SQLSTATE code and
the constraint name. Clients always receive a generic message.
"""
import logging
from typing import Optional


def describe_exception(exc: BaseException) -> str:
    """Return a PHI-free description of an exception suitable for server logs."""
    parts = [type(exc).__name__]
    orig = getattr(exc, "orig", None)
    if orig is not None:
        parts.append(f"orig={type(orig).__name__}")
        pgcode: Optional[str] = getattr(orig, "pgcode", None)
        if pgcode:
            parts.append(f"pgcode={pgcode}")
        diag = getattr(orig, "diag", None)
        constraint = getattr(diag, "constraint_name", None) if diag is not None else None
        if constraint:
            parts.append(f"constraint={constraint}")
    return " ".join(parts)


def log_error(logger: logging.Logger, context: str, exc: BaseException) -> None:
    """Log an error with context but without exception message text (may contain PHI)."""
    logger.error("%s: %s", context, describe_exception(exc))
