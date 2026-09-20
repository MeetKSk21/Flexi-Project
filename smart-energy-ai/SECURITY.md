# Security Policy & Architecture: SmartEnergy AI

## 1. Overview & Threat Model
SmartEnergy AI is an intelligent energy analysis and decision-support platform designed for academic and residential smart-meter analytics. It integrates machine learning and multi-agent AI orchestration. The threat model accounts for:
- Untrusted user CSV uploads and corrupted file inputs.
- Potential prompt injection via user-supplied chat queries.
- Leakage of cloud API credentials.
- Inadvertent generation of hazardous electrical instructions.
- Denial of Service (DoS) through oversized payload uploads.

---

## 2. API Key Protection & Secrets Management
- **Zero Hard-Coded Credentials**: API keys are never embedded in the codebase.
- **Environment Isolation**: Loaded dynamically via `.env` with strict exclusions in `.gitignore`.
- **Sensitive Log Sanitization**: All logging channels use `SensitiveDataFilter` (`utils/logging_config.py`) which pattern-matches and redacts `gsk_*` and `sk-*` API tokens.
- **Safe Fallback**: If keys are missing or invalid, the system automatically falls back to offline deterministic synthesis without terminating or crashing.

---

## 3. Data Ingestion & CSV Input Validation
- **Size Restriction**: Uploaded files are capped at **15 MB** to prevent buffer and memory exhaustion.
- **Schema & Type Enforcement**: Files must possess the required `.csv` extension and contain validated `timestamp` and `energy_kwh` columns.
- **Negative Value Guardrails**: Energy cannot physically be negative; any negative values are immediately logged and clipped to zero.
- **No Code Execution**: Uploaded CSV files are parsed strictly via Pandas dataframes; they are never evaluated, executed, or compiled as scripts.

---

## 4. LLM Safety & Prompt Injection Mitigation
- **Role-Bounded System Instructions**: Every agent operates under constrained system prompts explicitly restricting advice to software and behavioral adjustments.
- **Execution Sandboxing**: LLM outputs are treated strictly as advisory natural language text. The system contains **zero `eval()`, `exec()`, or subshell execution** based on LLM outputs.
- **Allowlisted Tool Architecture**: Agents access deterministic data services through strictly typed, pre-programmed Python functions.

---

## 5. Energy Safety & Physical Disclaimer
> **CRITICAL SAFETY DIRECTIVE**:  
> SmartEnergy AI provides software-level consumption optimization, behavioral recommendations, and load scheduling.  
> It **NEVER** directs users to alter circuit breakers, touch exposed wiring, modify main distribution panels, or tamper with physical electrical installations.  
> Flagged anomalies represent statistical variations in load profiles and do not constitute certified diagnostic proof of electrical faults.

---

## 6. Dependency & Vulnerability Management
- All dependencies are pinned in `requirements.txt`.
- Routine updates via `pip` are supported.
- Standard CVE checks can be audited via `pip-audit`.
