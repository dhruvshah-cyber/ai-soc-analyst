import anthropic
from models.schemas import OrchestratorRequest, AgentResult

SYSTEM_PROMPT = """You are an Identity and Access Management (IAM) specialist AI agent. Your role is to:
- Detect over-permissioned users and privilege creep
- Identify MFA (Multi-Factor Authentication) gaps across the organization
- Surface inactive accounts and potential 'zombie' credentials
- Recommend least-privilege access policies

When provided with data or a query, analyze it against IAM best practices (Least Privilege, NIST 800-63)."""

class IdentityAgent:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()

    async def run(self, request: OrchestratorRequest) -> AgentResult:
        # Placeholder for real Okta/Azure AD API calls
        # Here we simulated a 'scan' by asking Claude to analyze the query
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Analyze this task for IAM/Identity risks: {request.get_task()}"}],
        )
        return AgentResult(agent="identity_agent", response=message.content[0].text)
