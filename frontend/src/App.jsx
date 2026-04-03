import { useState, useEffect, useRef } from "react";

// Design System Variables
const CONFIG = {
  colors: {
    bg: "#080c10",
    surface: "#0e1318",
    surfaceHigh: "#151b22",
    primary: "#00ffff", // Neon Cyan
    primaryGlow: "rgba(0, 255, 255, 0.3)",
    secondary: "#003b46",
    accent: "#ff0055", // Red Alert
    text: "#f1f4fa",
    subtext: "#a8abb1",
    outline: "rgba(114, 118, 123, 0.2)",
  },
  agents: {
    compliance_agent: { label: "COMPLIANCE", color: "#00ffff" },
    risk_agent: { label: "RISK_ASSESS", color: "#f59e0b" },
    incident_agent: { label: "INCIDENT_IR", color: "#ff0055" },
    identity_agent: { label: "IDENTITY_IAM", color: "#8b5cf6" },
    shadow_it_agent: { label: "SHADOW_SAAS", color: "#ec4899" },
    policy_agent: { label: "POLICY_GEN", color: "#10b981" },
    claude_brain: { label: "CORE_BRAIN", color: "#00ffff" },
  }
};

// --- Styled Components (Functional) ---

function TerminalLine({ type, text }) {
  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "4px", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
      <span style={{ color: CONFIG.colors.primary, opacity: 0.6 }}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
      <span style={{ color: CONFIG.colors.primary, fontWeight: 700 }}>{type}:</span>
      <span style={{ color: CONFIG.colors.text }}>{text}</span>
    </div>
  );
}

function AgentStatus({ name, active }) {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "10px", 
      padding: "10px 24px", 
      background: active ? "rgba(0, 255, 255, 0.05)" : "transparent",
      borderLeft: `2px solid ${active ? CONFIG.agents[name].color : "transparent"}`,
      transition: "all 0.3s ease",
      opacity: active ? 1 : 0.6
    }}>
      <div style={{ 
        width: "6px", 
        height: "6px", 
        background: active ? CONFIG.agents[name].color : "#333",
        boxShadow: active ? `0 0 10px ${CONFIG.agents[name].color}` : "none",
        borderRadius: "0" 
      }} />
      <span style={{ 
        fontSize: "10px", 
        fontWeight: active ? 700 : 400, 
        color: active ? "#fff" : CONFIG.colors.subtext,
        letterSpacing: "1px"
      }}>
        {CONFIG.agents[name].label}
      </span>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState([
    { type: "SYSTEM", text: "SecureFlow OS v4.5.1 initialized." },
    { type: "AUTH", text: "Sentinel connection established." },
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type, text) => {
    setLogs(prev => [...prev.slice(-100), { type, text }]);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const task = input;
    setInput("");
    setLoading(true);
    setResults([]);
    setActiveAgents([]);
    addLog("ROUTING", `Task analysis: "${task.substring(0, 40)}..."`);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: task }),
      });

      if (!response.ok) throw new Error("Sentinel communication failure.");

      const data = await response.json();
      
      const resList = data.results || [{ agent: data.agent, response: data.response }];
      setResults(resList);
      setActiveAgents(resList.map(r => r.agent));
      
      addLog("SUCCESS", `${resList.length} intelligence modules synthesized.`);
    } catch (err) {
      addLog("ERROR", err.message);
      setResults([{ agent: "claude_brain", response: "Critical error in core orchestrator. Check system logs." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: CONFIG.colors.bg, 
      color: CONFIG.colors.text,
      fontFamily: "Inter, system-ui, sans-serif",
      display: "grid",
      gridTemplateColumns: "240px 1fr 320px",
      gridTemplateRows: "1fr",
      padding: "0",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${CONFIG.colors.primary}; opacity: 0.2; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT SIDEBAR */}
      <div style={{ 
        background: CONFIG.colors.surface, 
        borderRight: `1px solid ${CONFIG.colors.outline}`,
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "32px 24px", borderBottom: `1px solid ${CONFIG.colors.outline}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ 
              width: "14px", height: "14px", background: CONFIG.colors.primary, 
              boxShadow: `0 0 15px ${CONFIG.colors.primary}` 
            }} />
            <span style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "1.5px" }}>SECUREFLOW</span>
          </div>
          <div style={{ fontSize: "10px", color: CONFIG.colors.primary, marginTop: "6px", fontWeight: 700, opacity: 0.8 }}>SENTINEL_NODE::4.5</div>
        </div>

        <div style={{ flex: 1, padding: "24px 0" }}>
          <div style={{ padding: "0 24px", fontSize: "10px", color: CONFIG.colors.subtext, marginBottom: "16px", fontWeight: 800, letterSpacing: "1px" }}>ACTIVE_TELEMETRY</div>
          {Object.keys(CONFIG.agents).map(agent => (
            <AgentStatus key={agent} name={agent} active={activeAgents.includes(agent)} />
          ))}
        </div>

        <div style={{ padding: "32px 24px", fontSize: "10px", color: CONFIG.colors.subtext, opacity: 0.4 }}>
          SYSTEM_STATE: STABLE<br />
          OPERATOR: AUTHORIZED
        </div>
      </div>

      {/* CENTER: COMMAND CENTER */}
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* HUD HEADER */}
        <div style={{ 
          height: "64px", 
          borderBottom: `1px solid ${CONFIG.colors.outline}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: "linear-gradient(to right, rgba(0, 255, 255, 0.03), transparent)"
        }}>
          <div style={{ display: "flex", gap: "32px" }}>
            <div>
              <div style={{ fontSize: "9px", color: CONFIG.colors.subtext, fontWeight: 800 }}>THREAT_LEVEL</div>
              <div style={{ fontSize: "13px", color: CONFIG.colors.primary, fontWeight: 800 }}>MINIMAL</div>
            </div>
            <div>
              <div style={{ fontSize: "9px", color: CONFIG.colors.subtext, fontWeight: 800 }}>UPTIME_VAL</div>
              <div style={{ fontSize: "13px", color: CONFIG.colors.text, fontWeight: 800 }}>99.982%</div>
            </div>
          </div>
          <div style={{ 
            fontSize: "10px", 
            fontWeight: 800, 
            color: CONFIG.colors.primary,
            letterSpacing: "2px",
            animation: "pulse 2s infinite ease-in-out"
          }}>
            [ SCANNING_LIVE ]
          </div>
        </div>

        {/* MAIN FEED */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          {results.length === 0 && !loading && (
            <div style={{ 
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              opacity: 0.2
            }}>
              <div style={{ width: "100px", height: "100px", border: `2px solid ${CONFIG.colors.primary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "40px", height: "40px", border: `4px solid ${CONFIG.colors.primary}` }} />
              </div>
              <p style={{ marginTop: "24px", fontSize: "12px", fontWeight: 800, letterSpacing: "2px" }}>AWAITING_INPUT_COMMAND</p>
            </div>
          )}

          {results.map((res, i) => (
            <div key={i} style={{ 
              background: CONFIG.colors.surfaceHigh,
              border: `1px solid ${CONFIG.colors.outline}`,
              padding: "32px",
              position: "relative",
            }}>
              <div style={{ 
                position: "absolute", top: 0, left: 0, width: "4px", height: "100%", 
                background: CONFIG.agents[res.agent]?.color || CONFIG.colors.primary 
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ 
                  fontSize: "11px", fontWeight: 900, color: CONFIG.agents[res.agent]?.color || CONFIG.colors.primary,
                  letterSpacing: "2px"
                }}>
                  :: {CONFIG.agents[res.agent]?.label || res.agent.toUpperCase()}
                </span>
                <span style={{ fontSize: "10px", color: CONFIG.colors.subtext, fontWeight: 700 }}>CERT: VALID</span>
              </div>
              <div style={{ 
                fontSize: "14px", lineHeight: "1.7", color: "#e2e8f0", 
                fontFamily: "JetBrains Mono, monospace", whiteSpace: "pre-wrap" 
              }}>
                {res.response}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ padding: "32px", border: `1px solid ${CONFIG.colors.primary}`, background: "rgba(0, 255, 255, 0.02)" }}>
              <TerminalLine type="CORE" text="Initializing specialist agents..." />
              <TerminalLine type="SYNT" text="Awaiting intelligence synthesis..." />
              <div style={{ height: "2px", background: CONFIG.colors.primary, width: "30%", marginTop: "16px", animation: "pulse 0.8s infinite" }} />
            </div>
          )}
        </div>

        {/* INPUT TERMINAL */}
        <div style={{ 
          padding: "32px", 
          borderTop: `1px solid ${CONFIG.colors.outline}`,
          background: CONFIG.colors.surface
        }}>
          <form onSubmit={handleAnalyze} style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ 
                position: "absolute", left: "16px", top: "14px", color: CONFIG.colors.primary, 
                fontFamily: "JetBrains Mono", fontWeight: "bold", fontSize: "14px"
              }}>&gt;</span>
              <input 
                type="text"
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="PROMPT_SECURITY_QUERY..."
                style={{ 
                  width: "100%",
                  background: CONFIG.colors.bg,
                  border: `1px solid ${CONFIG.colors.outline}`,
                  padding: "16px 16px 16px 36px",
                  color: CONFIG.colors.text,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = CONFIG.colors.primary}
                onBlur={e => e.target.style.borderColor = CONFIG.colors.outline}
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              style={{ 
                background: loading ? CONFIG.colors.secondary : CONFIG.colors.primary,
                color: CONFIG.colors.bg,
                border: "none",
                fontWeight: 800,
                padding: "0 40px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "12px",
                letterSpacing: "1.5px",
                transition: "all 0.2s"
              }}
            >
              {loading ? "PROCESSING..." : "ENTER"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT SIDEBAR: SYSTEM LOGS */}
      <div style={{ 
        background: CONFIG.colors.surface, 
        borderLeft: `1px solid ${CONFIG.colors.outline}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh"
      }}>
        <div style={{ padding: "32px 24px", borderBottom: `1px solid ${CONFIG.colors.outline}` }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: CONFIG.colors.subtext, letterSpacing: "1px" }}>SYSTEM_LOGS</div>
        </div>
        
        <div style={{ 
          flex: 1, 
          padding: "24px", 
          overflowY: "auto",
          fontSize: "11px",
          display: "flex",
          flexDirection: "column",
          gap: "4px"
        }}>
          {logs.map((log, i) => (
            <TerminalLine key={i} type={log.type} text={log.text} />
          ))}
          <div ref={logEndRef} />
        </div>

        <div style={{ padding: "24px", background: CONFIG.colors.bg, borderTop: `1px solid ${CONFIG.colors.outline}` }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: CONFIG.colors.subtext, marginBottom: "16px", letterSpacing: "1px" }}>GLOBAL_THREAT_MAP</div>
          <div style={{ 
            height: "160px", 
            border: `1px solid ${CONFIG.colors.outline}`,
            background: "rgba(0, 255, 255, 0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative"
          }}>
             <div style={{ width: "90px", height: "90px", border: "1px solid rgba(0, 255, 255, 0.1)", borderRadius: "50%", position: "relative" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", width: "2px", height: "2px", background: CONFIG.colors.primary, transform: "translate(-50%, -50%)" }} />
                <div style={{ position: "absolute", top: "10%", left: "70%", width: "5px", height: "5px", background: CONFIG.colors.accent, boxShadow: `0 0 10px ${CONFIG.colors.accent}`, animation: "pulse 1.5s infinite" }} />
                <div style={{ position: "absolute", bottom: "20%", left: "30%", width: "4px", height: "4px", background: CONFIG.colors.primary, boxShadow: `0 0 10px ${CONFIG.colors.primary}` }} />
             </div>
             <div style={{ position: "absolute", bottom: "10px", right: "10px", fontSize: "8px", fontWeight: 700, color: CONFIG.colors.subtext }}>LOC::0,0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
