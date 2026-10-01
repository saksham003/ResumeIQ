import json
import logging
import re
from typing import Any

from google import genai
from google.genai import types

from app.utils.config import get_settings

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """\
You are an expert technical recruiter and career coach with 15+ years of experience \
evaluating resumes across software engineering, data science, product management, and design roles.

Your task is to perform a detailed, objective analysis of the resume text provided by the user.

ANALYSIS GUIDELINES:
- Be specific and actionable — vague feedback is not helpful.
- Base scores on real-world hiring standards used by top tech companies.
- Identify concrete missing keywords that appear in modern job descriptions for the implied role.
- Strengths should highlight genuine differentiators, not generic praise.
- Suggestions must be prioritised by impact (highest impact first).
- If the resume text is too short or garbled, reflect that in a low score with an appropriate weakness.

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown fences, no commentary:
{
  "overall_score": <integer 0-100>,
  "strengths": [
    "<specific strength>",
    ...
  ],
  "weaknesses": [
    "<specific weakness>",
    ...
  ],
  "suggestions": [
    "<prioritised, actionable suggestion>",
    ...
  ],
  "missing_keywords": [
    "<keyword or phrase>",
    ...
  ]
}

SCORING RUBRIC:
  90-100 : Exceptional — ready to send to any top company.
  75-89  : Strong — minor improvements needed.
  60-74  : Decent — noticeable gaps that will cost shortlists.
  40-59  : Needs work — significant structural or content issues.
  0-39   : Poor — fundamental problems that must be addressed first.
"""

_USER_PROMPT_TEMPLATE = """\
Please analyse the following resume and return the JSON evaluation:

--- RESUME START ---
{resume_text}
--- RESUME END ---
"""


class ResumeAnalysis:
    def __init__(
        self,
        overall_score: int,
        strengths: list[str],
        weaknesses: list[str],
        suggestions: list[str],
        missing_keywords: list[str],
    ) -> None:
        self.overall_score = overall_score
        self.strengths = strengths
        self.weaknesses = weaknesses
        self.suggestions = suggestions
        self.missing_keywords = missing_keywords

    def to_dict(self) -> dict[str, Any]:
        return {
            "overall_score": self.overall_score,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "suggestions": self.suggestions,
            "missing_keywords": self.missing_keywords,
        }


class AIServiceError(Exception):
    pass


def _init_gemini() -> genai.Client:
    settings = get_settings()

    if not settings.gemini_api_key:
        raise AIServiceError(
            "GEMINI_API_KEY is not set. "
            "Add it to your .env file or environment variables."
        )

    client = genai.Client(
        api_key=settings.gemini_api_key,
        http_options={"api_version": "v1"},
    )
    logger.info("Gemini client initialised (model: %s)", settings.gemini_model)
    return client


def _parse_response(raw: str) -> dict[str, Any]:
    stripped = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
    stripped = re.sub(r"\s*```$", "", stripped)

    try:
        return json.loads(stripped)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse Gemini JSON response: %s\nRaw:\n%s", exc, raw)
        raise AIServiceError(f"Gemini returned an invalid JSON response: {exc}") from exc


def _validate_payload(data: dict[str, Any]) -> ResumeAnalysis:
    required_int = "overall_score"
    required_lists = ["strengths", "weaknesses", "suggestions", "missing_keywords"]

    if required_int not in data:
        raise AIServiceError("Response missing 'overall_score'.")

    score = data[required_int]
    if not isinstance(score, (int, float)):
        raise AIServiceError(f"'overall_score' must be a number, got {type(score).__name__}.")

    score = max(0, min(100, int(score)))

    lists: dict[str, list[str]] = {}
    for field in required_lists:
        value = data.get(field, [])
        if not isinstance(value, list):
            logger.warning("Field '%s' is not a list — defaulting to [].", field)
            value = []
        lists[field] = [str(item) for item in value]

    return ResumeAnalysis(
        overall_score=score,
        strengths=lists["strengths"],
        weaknesses=lists["weaknesses"],
        suggestions=lists["suggestions"],
        missing_keywords=lists["missing_keywords"],
    )


async def analyze_resume(text: str) -> ResumeAnalysis:
    if not text or not text.strip():
        raise AIServiceError("Resume text is empty — nothing to analyse.")

    logger.info("Sending resume to Gemini for analysis (%d chars).", len(text))

    try:
        client = _init_gemini()
        settings = get_settings()
        user_prompt = _USER_PROMPT_TEMPLATE.format(resume_text=text.strip())
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.2,
                top_p=0.9,
                max_output_tokens=2048,
            ),
        )
    except AIServiceError:
        raise
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        raise AIServiceError(f"Gemini API error: {exc}") from exc

    raw_text = response.text
    logger.debug("Raw Gemini response:\n%s", raw_text)

    payload = _parse_response(raw_text)
    analysis = _validate_payload(payload)

    logger.info(
        "Resume analysis complete — score: %d, strengths: %d, weaknesses: %d, "
        "suggestions: %d, missing_keywords: %d",
        analysis.overall_score,
        len(analysis.strengths),
        len(analysis.weaknesses),
        len(analysis.suggestions),
        len(analysis.missing_keywords),
    )

    return analysis
