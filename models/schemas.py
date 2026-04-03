from pydantic import BaseModel
from typing import Optional


class OrchestratorRequest(BaseModel):
    org_id: Optional[str] = None
    user_message: str
    org_context: Optional[dict] = None
    # legacy support
    task: Optional[str] = None
    context: Optional[str] = None
    metadata: Optional[dict] = None

    def get_task(self) -> str:
        return self.user_message or self.task or ""


class AgentResult(BaseModel):
    agent: str
    response: str


class OrchestratorResponse(BaseModel):
    agent: str
    response: str
    results: Optional[list[AgentResult]] = None
