import anthropic
from models.schemas import OrchestratorRequest, AgentResult


SYSTEM_PROMPT = """You are a compliance specialist AI agent. Your role is to:
- Assess compliance with regulatory frameworks (SOC 2, ISO 27001, GDPR, HIPAA, PCI-DSS)
- Identify compliance gaps and violations
- Provide remediation recommendations
- Generate audit-ready reports

Always cite the specific control or regulation when flagging an issue."""


class ComplianceAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()

    async def run(self, request: OrchestratorRequest) -> AgentResult:
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": request.get_task()}],
        )
        return AgentResult(agent="compliance_agent", response=message.content[0].text)
