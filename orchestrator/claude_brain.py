import asyncio
import anthropic
from agents.compliance_agent import ComplianceAgent
from agents.risk_agent import RiskAgent
from agents.incident_agent import IncidentAgent
from agents.identity_agent import IdentityAgent
from agents.shadow_it_agent import ShadowITAgent
from agents.policy_agent import PolicyAgent
from models.schemas import OrchestratorRequest, OrchestratorResponse


class ClaudeBrain:
    def __init__(self):
        self.client = anthropic.AsyncAnthropic()
        self.compliance_agent = ComplianceAgent()
        self.risk_agent = RiskAgent()
        self.incident_agent = IncidentAgent()
        self.identity_agent = IdentityAgent()
        self.shadow_it_agent = ShadowITAgent()
        self.policy_agent = PolicyAgent()

    async def route(self, request: OrchestratorRequest) -> OrchestratorResponse:
        task = request.get_task().lower()

        # Routing Logic
        is_compliance = any(k in task for k in ["compliance", "hipaa", "gdpr", "soc2", "compliant"])
        is_risk       = any(k in task for k in ["risk", "vulnerabilit", "threat", "port", "scan"])
        is_incident   = any(k in task for k in ["incident", "breach", "attack", "login", "suspicious", "malware"])
        is_identity   = any(k in task for k in ["identity", "iam", "mfa", "permission", "okta", "credential"])
        is_shadow_it  = any(k in task for k in ["shadow it", "unauthorized", "saas", "app", "unsanctioned"])
        is_policy     = any(k in task for k in ["policy", "draft", "procedure", "aup", "guideline"])

        active = []
        if is_compliance:
            active.append(self.compliance_agent.run(request))
        if is_risk:
            active.append(self.risk_agent.run(request))
        if is_incident:
            active.append(self.incident_agent.run(request))
        if is_identity:
            active.append(self.identity_agent.run(request))
        if is_shadow_it:
            active.append(self.shadow_it_agent.run(request))
        if is_policy:
            active.append(self.policy_agent.run(request))

        if len(active) > 1:
            results = await asyncio.gather(*active)
            combined = "\n\n---\n\n".join(f"**[{r.agent}]**\n{r.response}" for r in results)
            return OrchestratorResponse(
                agent=", ".join(r.agent for r in results),
                response=combined,
                results=list(results),
            )
        elif len(active) == 1:
            result = await active[0]
            return OrchestratorResponse(agent=result.agent, response=result.response, results=[result])
        else:
            result = await self._general_response(request)
            return OrchestratorResponse(agent=result.agent, response=result.response, results=[result])

    async def _general_response(self, request: OrchestratorRequest):
        from models.schemas import AgentResult
        message = await self.client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{"role": "user", "content": request.get_task()}],
        )
        return AgentResult(agent="claude_brain", response=message.content[0].text)
