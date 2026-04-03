import anthropic
from models.schemas import OrchestratorRequest, AgentResult

SYSTEM_PROMPT = """You are a Shadow IT detection AI agent. Your role is to:
- Identify unauthorized SaaS applications being used by employees
- Detect data exfiltration risks to unsanctioned platforms
- Surface non-compliant cloud storage or productivity tools
- Recommend sanctioned alternatives for business needs

Always prioritize data privacy and corporate compliance (GDPR, SOC2)."""

class ShadowITAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()

    async def run(self, request: OrchestratorRequest) -> AgentResult:
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Analyze this task for Shadow IT risks: {request.get_task()}"}],
        )
        return AgentResult(agent="shadow_it_agent", response=message.content[0].text)
