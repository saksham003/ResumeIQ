import logging
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)

_CONNECT_TIMEOUT = 10
_READ_TIMEOUT = 60
_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024


class S3DownloadError(Exception):
    pass


def _validate_url(url: str) -> None:
    if not url or not url.strip():
        raise S3DownloadError("file_url must not be empty.")

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise S3DownloadError(
            f"Unsupported URL scheme '{parsed.scheme}'. Only http/https are allowed."
        )


def download_file(file_url: str) -> bytes:
    _validate_url(file_url)

    logger.info("Downloading file from URL: %s", file_url)

    try:
        response = requests.get(
            file_url,
            timeout=(_CONNECT_TIMEOUT, _READ_TIMEOUT),
            stream=True,
        )
        response.raise_for_status()
    except requests.exceptions.Timeout:
        logger.error("Request timed out for URL: %s", file_url)
        raise S3DownloadError(f"Request timed out while downloading: {file_url}")
    except requests.exceptions.ConnectionError as exc:
        logger.error("Connection error for URL %s: %s", file_url, exc)
        raise S3DownloadError(f"Could not connect to '{file_url}': {exc}")
    except requests.exceptions.HTTPError as exc:
        status = exc.response.status_code if exc.response is not None else "unknown"
        logger.error("HTTP %s error for URL %s: %s", status, file_url, exc)
        raise S3DownloadError(f"HTTP {status} error downloading file: {exc}")
    except requests.exceptions.RequestException as exc:
        logger.error("Unexpected request error for URL %s: %s", file_url, exc)
        raise S3DownloadError(f"Failed to download file: {exc}")

    content_length = response.headers.get("Content-Length")
    if content_length and int(content_length) > _MAX_FILE_SIZE_BYTES:
        raise S3DownloadError(
            f"File size ({int(content_length) // (1024 * 1024)} MB) exceeds the "
            f"{_MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB limit."
        )

    chunks: list[bytes] = []
    total = 0
    for chunk in response.iter_content(chunk_size=8192):
        total += len(chunk)
        if total > _MAX_FILE_SIZE_BYTES:
            raise S3DownloadError(
                f"Downloaded content exceeded the {_MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB limit."
            )
        chunks.append(chunk)

    file_bytes = b"".join(chunks)
    logger.info("Successfully downloaded %d bytes from %s", len(file_bytes), file_url)
    return file_bytes
