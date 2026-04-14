document.addEventListener('DOMContentLoaded', () => {
    
    // Animate Log Stream
    const logStream = document.getElementById('log-stream');
    const threatAlert = document.getElementById('threat-alert');
    
    const possibleLogs = [
        "[NET] Ingress traffic analyzed from IP 192.168.1.45 (Safe)",
        "[SYS] LLM Triage Module: Processing anomalies...",
        "[AUTH] Tenant workspace isolated successfully",
        "[NET] Deep packet inspection completed on target alpha",
        { text: "[WARN] Anomalous request rate detected from IP 45.33.22.11", type: "warn" },
        { text: "[ERROR] INTRUSION ATTEMPT BLOCKED - Signature match: CVE-2024-110", type: "error" },
        "[SYS] Model updated with latest threat signatures",
        "[NET] Outbound connection tracked",
        "[SYS] Aggregation scheduler tick completed"
    ];

    let logCounter = 0;

    function addLog() {
        if(logStream.children.length > 20) {
            logStream.removeChild(logStream.firstChild);
        }

        let logObj = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
        let logText, logType;

        if (typeof logObj === 'object') {
            logText = logObj.text;
            logType = logObj.type;
        } else {
            logText = logObj;
            logType = "info";
        }

        const logEl = document.createElement('div');
        logEl.className = 'log-entry';
        if(logType !== "info") logEl.classList.add(logType);
        
        logEl.textContent = `[${new Date().toLocaleTimeString()}] ${logText}`;
        logStream.appendChild(logEl);
        
        // Scroll to bottom
        logStream.scrollTop = logStream.scrollHeight;

        // Threat Alert Interaction
        if (logType === "error") {
            triggerThreatAlert();
        }

        setTimeout(addLog, Math.random() * 2000 + 500);
    }

    function triggerThreatAlert() {
        threatAlert.classList.add('danger');
        let icon = threatAlert.querySelector('.alert-icon');
        let infoStrong = threatAlert.querySelector('.alert-info strong');
        let infoSpan = threatAlert.querySelector('.alert-info span');
        let status = threatAlert.querySelector('.alert-status');

        icon.textContent = "🚨";
        infoStrong.textContent = "Critical Threat Blocked";
        infoSpan.textContent = "LLM Triage classified attack as High Severity";
        status.textContent = "Mitigated";

        setTimeout(() => {
            threatAlert.classList.remove('danger');
            icon.textContent = "⚡";
            infoStrong.textContent = "Network Scan in Progress...";
            infoSpan.textContent = "Analyzing incoming traffic patterns";
            status.textContent = "Processing";
        }, 5000);
    }

    setTimeout(addLog, 1500);

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- WORKING SERVICES IMPLEMENTATION ---
    const analyzeBtn = document.getElementById('demo-analyze-btn');
    const analyzeInput = document.getElementById('demo-log-input');
    const analyzeResult = document.getElementById('demo-analyze-result');
    
    if(analyzeBtn && analyzeInput) {
        analyzeBtn.addEventListener('click', async () => {
            const logTxt = analyzeInput.value || analyzeInput.placeholder;
            analyzeBtn.textContent = '...';
            analyzeResult.style.display = 'block';
            analyzeResult.innerHTML = 'Connecting to ScropIDS Triage Engine...';
            
            try {
                const res = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ log: logTxt })
                });
                const data = await res.json();
                
                if(data.error) throw new Error(data.error);
                
                analyzeResult.innerHTML = `<span style="color: ${data.color}">[${data.threat_level}]</span> ${data.analysis}`;
            } catch (e) {
                analyzeResult.innerHTML = `<span style="color: #f83600">Error processing log: ${e.message}</span>`;
            } finally {
                analyzeBtn.textContent = 'Analyze';
            }
        });
    }

    const scanBtn = document.getElementById('demo-scan-btn');
    const scanInput = document.getElementById('demo-scan-input');
    const scanResult = document.getElementById('demo-scan-result');
    
    if(scanBtn && scanInput) {
        scanBtn.addEventListener('click', async () => {
            const target = scanInput.value || 'localhost';
            scanBtn.textContent = '...';
            scanResult.style.display = 'block';
            scanResult.innerHTML = 'Establishing secure socket connection tunnel...\nScanning standard ports...';
            
            try {
                const res = await fetch('/api/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target: target })
                });
                const data = await res.json();
                
                if(data.error) throw new Error(data.error);
                
                let out = `<b>Target:</b> ${data.target}\n----------------------------------\n`;
                data.results.forEach(r => {
                    out += `PORT ${r.port.toString().padEnd(5)} : <span style="color:${r.color}">${r.status}</span>\n`;
                });
                scanResult.innerHTML = out;
            } catch (e) {
                scanResult.innerHTML = `<span style="color: #f83600">Scan failed: ${e.message}</span>`;
            } finally {
                scanBtn.textContent = 'Start Scan';
            }
        });
    }
});
