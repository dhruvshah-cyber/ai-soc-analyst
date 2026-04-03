import anthropic
from models.schemas import OrchestratorRequest, AgentResult


SYSTEM_PROMPT = """You are a cybersecurity risk assessment AI agent. Your role is to:
- Evaluate threats and vulnerabilities in systems and infrastructure
- Score risk using CVSS or likelihood/impact matrices
- Prioritize risks by severity and business impact
- Recommend mitigation controls

Structure your output with: Risk ID, Description, Severity (Critical/High/Medium/Low), Likelihood, Impact, and Mitigation."""


class RiskAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()

    async def run(self, request: OrchestratorRequest) -> AgentResult:
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": request.get_task()}],
        )
        return AgentResult(agent="risk_agent", response=message.content[0].text)
