import logging

from fastapi import APIRouter, HTTPException, status

from app.models.resume import (
    AIAnalysis,
    ProcessResumeRequest,
    ProcessResumeResponse,
)
from app.services.ai_service import AIServiceError, analyze_resume
from app.services.pdf_service import PDFExtractionError, extract_text_from_pdf
from app.services.s3_service import S3DownloadError, download_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/process-resume", tags=["Resume"])


@router.post(
    "",
    response_model=ProcessResumeResponse,
    status_code=status.HTTP_200_OK,
    summary="Process a resume PDF",
    description=(
        "Accepts a publicly accessible PDF URL (e.g. an S3 pre-signed URL), "
        "downloads the file, extracts its text, runs AI analysis via Google Gemini, "
        "and returns a structured evaluation with score, strengths, weaknesses, "
        "suggestions, and missing keywords."
    ),
)
async def process_resume_endpoint(
    request: ProcessResumeRequest,
) -> ProcessResumeResponse:
    file_url = request.fileUrl
    logger.info("Processing resume request | fileUrl=%s", file_url)

    try:
        logger.info("[1/3] Downloading file...")
        file_bytes = download_file(file_url)
        logger.info("[1/3] Downloaded %d bytes.", len(file_bytes))
    except S3DownloadError as exc:
        logger.warning("Download failed for %s: %s", file_url, exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to download file: {exc}",
        )

    try:
        logger.info("[2/3] Extracting text from PDF...")
        resume_text = extract_text_from_pdf(file_bytes)
        logger.info("[2/3] Extracted %d characters.", len(resume_text))
    except PDFExtractionError as exc:
        logger.warning("PDF extraction failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not extract text from PDF: {exc}",
        )

    try:
        logger.info("[3/3] Running AI analysis...")
        ai_result = await analyze_resume(resume_text)
        logger.info(
            "[3/3] AI analysis complete | score=%d strengths=%d weaknesses=%d",
            ai_result.overall_score,
            len(ai_result.strengths),
            len(ai_result.weaknesses),
        )
    except AIServiceError as exc:
        logger.error("AI analysis failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis error: {exc}",
        )

    response = ProcessResumeResponse(
        success=True,
        file_url=file_url,
        extracted_text_length=len(resume_text),
        analysis=AIAnalysis(
            overall_score=ai_result.overall_score,
            strengths=ai_result.strengths,
            weaknesses=ai_result.weaknesses,
            suggestions=ai_result.suggestions,
            missing_keywords=ai_result.missing_keywords,
        ),
    )

    logger.info(
        "Resume processed successfully | fileUrl=%s score=%d",
        file_url,
        ai_result.overall_score,
    )
    return response
