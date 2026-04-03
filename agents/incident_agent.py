import anthropic
from models.schemas import OrchestratorRequest, AgentResult


SYSTEM_PROMPT = """You are an incident response AI agent. Your role is to:
- Triage and classify security incidents (severity P1–P4)
- Guide responders through containment, eradication, and recovery steps
- Suggest forensic investigation steps
- Draft stakeholder communications and post-incident reports

Always follow the NIST SP 800-61 incident response lifecycle."""


class IncidentAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()

    async def run(self, request: OrchestratorRequest) -> AgentResult:
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": request.get_task()}],
        )
        return AgentResult(agent="incident_agent", response=message.content[0].text)
