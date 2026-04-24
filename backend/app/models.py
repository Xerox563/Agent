from pydantic import BaseModel, EmailStr, Field
from typing import Any, Literal


class IngestEmailRequest(BaseModel):
    max_results: int = Field(default=10, ge=1, le=50)


class ParseResumeRequest(BaseModel):
    candidate_id: str
    attachment_path: str


class CandidateClassifyRequest(BaseModel):
    candidate_id: str


class SendEmailRequest(BaseModel):
    to: EmailStr
    subject: str
    body: str


class ProcessReplyRequest(BaseModel):
    candidate_id: str
    reply_body: str


class CandidateSummary(BaseModel):
    id: str
    email: str
    name: str | None = None
    status: Literal['NEW', 'QUALIFIED', 'REJECTED', 'NEEDS_MORE_INFO'] | None = None
    score: int | None = None
    summary: str | None = None


class AIJsonResult(BaseModel):
    data: dict[str, Any]
