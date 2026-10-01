from pydantic import BaseModel, field_validator
from typing import Optional


class ProcessResumeRequest(BaseModel):
    fileUrl: str

    @field_validator("fileUrl")
    @classmethod
    def file_url_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("fileUrl must not be empty.")
        return v.strip()

    model_config = {
        "json_schema_extra": {
            "example": {
                "fileUrl": "https://your-bucket.s3.amazonaws.com/resumes/john_doe.pdf",
            }
        }
    }


class AIAnalysis(BaseModel):
    overall_score: int
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    missing_keywords: list[str]


class ProcessResumeResponse(BaseModel):
    success: bool
    file_url: str
    extracted_text_length: int
    analysis: AIAnalysis


class HealthResponse(BaseModel):
    status: str
    version: str
    service: str
