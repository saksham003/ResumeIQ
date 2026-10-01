import re
from app.models.resume import ResumeRequest, ResumeResponse


SKILL_KEYWORDS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "react", "vue", "angular", "node.js", "fastapi", "django", "flask",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform",
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "git", "ci/cd", "agile", "scrum", "rest api", "graphql",
]


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found_skills = []
    for skill in SKILL_KEYWORDS:
        if skill in text_lower:
            found_skills.append(skill.title())
    return found_skills


def estimate_experience(text: str) -> int | None:
    patterns = [
        r"(\d+)\+?\s*years?\s*of\s*experience",
        r"(\d+)\+?\s*years?\s*experience",
        r"experience\s*of\s*(\d+)\+?\s*years?",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    return None


def calculate_match_score(resume_text: str, job_description: str | None) -> float | None:
    if not job_description:
        return None

    resume_words = set(re.findall(r"\b\w{4,}\b", resume_text.lower()))
    job_words = set(re.findall(r"\b\w{4,}\b", job_description.lower()))

    if not job_words:
        return None

    intersection = resume_words & job_words
    score = (len(intersection) / len(job_words)) * 100
    return round(min(score, 100.0), 1)


def generate_summary(resume_text: str, skills: list[str], experience_years: int | None) -> str:
    parts = []
    if experience_years:
        parts.append(f"Candidate has approximately {experience_years} years of experience.")
    if skills:
        top_skills = ", ".join(skills[:5])
        parts.append(f"Key skills include: {top_skills}.")
    if not parts:
        parts.append("Resume processed successfully.")
    return " ".join(parts)


def build_recommendations(
    skills: list[str], match_score: float | None, job_description: str | None
) -> list[str]:
    recommendations = []
    if not skills:
        recommendations.append("Consider adding a dedicated skills section to your resume.")
    if match_score is not None and match_score < 50:
        recommendations.append(
            "Resume keyword overlap with the job description is low. "
            "Tailor your resume to better match the role requirements."
        )
    if job_description and match_score is not None and match_score >= 75:
        recommendations.append("Great match! Your resume aligns well with the job description.")
    if len(skills) < 3:
        recommendations.append(
            "Highlight more technical skills relevant to your target roles."
        )
    if not recommendations:
        recommendations.append("Your resume looks solid. Ensure it is ATS-friendly.")
    return recommendations


async def process_resume(request: ResumeRequest) -> ResumeResponse:
    skills = extract_skills(request.resume_text)
    experience_years = estimate_experience(request.resume_text)
    match_score = calculate_match_score(request.resume_text, request.job_description)
    summary = generate_summary(request.resume_text, skills, experience_years)
    recommendations = build_recommendations(skills, match_score, request.job_description)

    return ResumeResponse(
        success=True,
        candidate_name=request.candidate_name,
        summary=summary,
        skills=skills,
        experience_years=experience_years,
        match_score=match_score,
        recommendations=recommendations,
    )
