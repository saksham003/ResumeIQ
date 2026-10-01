import io
import logging
from typing import Optional

import pdfplumber

logger = logging.getLogger(__name__)


class PDFExtractionError(Exception):
    pass


def _clean_text(text: str) -> str:
    lines = text.splitlines()
    cleaned_lines: list[str] = []
    blank_run = 0

    for line in lines:
        stripped = line.strip()
        if stripped:
            blank_run = 0
            cleaned_lines.append(stripped)
        else:
            blank_run += 1
            if blank_run == 1:
                cleaned_lines.append("")

    return "\n".join(cleaned_lines).strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not file_bytes:
        raise PDFExtractionError("file_bytes is empty — nothing to extract.")

    logger.info("Starting PDF text extraction (%d bytes).", len(file_bytes))

    try:
        pdf_stream = io.BytesIO(file_bytes)
        with pdfplumber.open(pdf_stream) as pdf:
            total_pages = len(pdf.pages)
            logger.info("PDF has %d page(s).", total_pages)

            page_texts: list[str] = []

            for page_num, page in enumerate(pdf.pages, start=1):
                try:
                    raw_text: Optional[str] = page.extract_text()
                except Exception as exc:
                    logger.warning("Could not extract text from page %d: %s", page_num, exc)
                    continue

                if not raw_text or not raw_text.strip():
                    logger.debug(
                        "Page %d/%d is empty or image-only — skipping.",
                        page_num,
                        total_pages,
                    )
                    continue

                cleaned = _clean_text(raw_text)
                page_texts.append(cleaned)
                logger.debug(
                    "Page %d/%d: extracted %d characters.",
                    page_num,
                    total_pages,
                    len(cleaned),
                )

    except PDFExtractionError:
        raise
    except Exception as exc:
        logger.error("Failed to open or parse PDF: %s", exc)
        raise PDFExtractionError(f"Invalid or unreadable PDF: {exc}") from exc

    if not page_texts:
        raise PDFExtractionError(
            "No readable text found in the PDF. "
            "The document may be image-based or password-protected."
        )

    combined = "\n\n".join(page_texts)
    logger.info(
        "PDF extraction complete: %d page(s) with text, %d total characters.",
        len(page_texts),
        len(combined),
    )
    return combined
