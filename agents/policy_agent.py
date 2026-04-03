import anthropic
from models.schemas import OrchestratorRequest, AgentResult

SYSTEM_PROMPT = """You are a Security Policy AI agent. Your role is to:
- Draft comprehensive security policies (AUP, Incident Response, Backup)
- Tailor policies to the user's business type and industry (SMB, Fintech, Healthcare)
- Ensure policies align with frameworks like NIST, ISO 27001, and SOC 2
- Provide clear, actionable executive summaries for each policy section

Always use a professional, authoritative, yet accessible tone for SMB owners."""

class PolicyAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()

    async def run(self, request: OrchestratorRequest) -> AgentResult:
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Draft/Analyze security policy based on this request: {request.get_task()}"}],
        )
        return AgentResult(agent="policy_agent", response=message.content[0].text)
