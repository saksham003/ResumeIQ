
const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

const REQUEST_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 120_000);

export interface AIAnalysis {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missing_keywords: string[];
}

export interface AIServiceResponse {
  success: boolean;
  file_url: string;
  extracted_text_length: number;
  analysis: AIAnalysis;
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isRetryable: boolean = true
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export async function callProcessResume(
  fileUrl: string
): Promise<AIServiceResponse> {
  const endpoint = `${AI_SERVICE_URL}/process-resume`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new AIServiceError(
        `AI service timed out after ${REQUEST_TIMEOUT_MS / 1000}s`,
        undefined,
        true
      );
    }
    throw new AIServiceError(
      `Network error calling AI service: ${err.message}`,
      undefined,
      true 
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body?.detail ?? detail;
    } catch {
      /* ignore JSON parse errors */
    }

    const isRetryable = response.status >= 500;
    throw new AIServiceError(
      `AI service returned HTTP ${response.status}: ${detail}`,
      response.status,
      isRetryable
    );
  }

  const data = (await response.json()) as AIServiceResponse;

  if (!data.success || !data.analysis) {
    throw new AIServiceError(
      "AI service returned an unexpected response shape.",
      undefined,
      false
    );
  }

  return data;
}
