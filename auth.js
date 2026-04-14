document.addEventListener('DOMContentLoaded', () => {
    
    // Elements for Form View
    const loginFormSection = document.getElementById('loginFormSection');
    const registerFormSection = document.getElementById('registerFormSection');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Elements for OTP View
    const otpSection = document.getElementById('otpSection');
    const otpEmailDisplay = document.getElementById('otpEmailDisplay');
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    
    // Timer Elements
    const timerText = document.getElementById('timerText');
    const resendBtn = document.getElementById('resendBtn');
    let timerInterval;

    // Handle Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const btn = loginForm.querySelector('button[type="submit"]');
            btn.innerHTML = 'Sending OTP...';
            btn.disabled = true;
            
            try {
                const response = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, purpose: 'Login' })
                });
                
                if (response.ok) {
                    showOtpSection(email);
                } else {
                    const data = await response.json();
                    alert("Error: " + (data.error || "Failed to send OTP"));
                }
            } catch (err) {
                alert("Network error, could not reach backend.");
                console.error(err);
            } finally {
                btn.innerHTML = 'Sign In';
                btn.disabled = false;
            }
        });
        
        document.getElementById('backToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            hideOtpSection(loginFormSection);
        });
    }

    // Handle Register Form Submit
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const btn = registerForm.querySelector('button[type="submit"]');
            btn.innerHTML = 'Sending OTP...';
            btn.disabled = true;
            
            try {
                const response = await fetch('/api/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, purpose: 'Registration' })
                });
                
                if (response.ok) {
                    showOtpSection(email);
                } else {
                    const data = await response.json();
                    alert("Error: " + (data.error || "Failed to send OTP"));
                }
            } catch (err) {
                alert("Network error, could not reach backend.");
                console.error(err);
            } finally {
                btn.innerHTML = 'Create Account';
                btn.disabled = false;
            }
        });
        
        document.getElementById('backToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            hideOtpSection(registerFormSection);
        });
    }

    // OTP Logic Functions
    function showOtpSection(email) {
        if(loginFormSection) loginFormSection.style.display = 'none';
        if(registerFormSection) registerFormSection.style.display = 'none';
        
        otpSection.style.display = 'block';
        otpEmailDisplay.textContent = email;
        
        // Reset inputs
        otpInputs.forEach(input => input.value = '');
        otpInputs[0].focus();
        
        startTimer(30);
    }

    function hideOtpSection(formSection) {
        otpSection.style.display = 'none';
        formSection.style.display = 'block';
        clearInterval(timerInterval);
    }

    // OTP Input Navigation
    otpInputs.forEach((input, index) => {
        // Only allow numbers
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                if (!input.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
        
        input.addEventListener('input', function(e) {
            // Replace non-numeric with nothing
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            // If all filled, auto verify or enable button styling
            const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
            if(allFilled) {
                verifyOtpBtn.style.transform = 'scale(1.02)';
                setTimeout(() => verifyOtpBtn.style.transform = 'scale(1)', 200);
            }
        });
        
        // Handle Paste
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
            if (pastedData) {
                for (let i = 0; i < pastedData.length; i++) {
                    if (index + i < otpInputs.length) {
                        otpInputs[index + i].value = pastedData[i];
                    }
                }
                const focusIndex = Math.min(index + pastedData.length, otpInputs.length - 1);
                otpInputs[focusIndex].focus();
            }
        });
    });

    // Handle OTP Verify Click
    if(verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', async () => {
            const code = Array.from(otpInputs).map(inp => inp.value).join('');
            if (code.length === 6) {
                verifyOtpBtn.innerHTML = 'Verifying...';
                verifyOtpBtn.style.opacity = '0.8';
                
                const email = otpEmailDisplay.textContent;
                
                try {
                    const response = await fetch('/api/verify-otp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email, otp: code })
                    });
                    
                    if (response.ok) {
                        alert('Authentication Successful! Welcome to ScropIDS.');
                        // Routing depending on logic (normally backend driven, but for presentation:)
                        if (email.includes('admin')) {
                            window.location.href = 'admin.html';
                        } else {
                            window.location.href = 'customer.html';
                        }
                    } else {
                        const data = await response.json();
                        alert("Verification Failed: " + (data.error || "Invalid OTP"));
                        otpInputs.forEach(inp => {
                            inp.style.borderColor = 'var(--accent)';
                            setTimeout(() => inp.style.borderColor = '', 1000);
                        });
                        verifyOtpBtn.innerHTML = 'Verify Email';
                        verifyOtpBtn.style.opacity = '1';
                    }
                } catch (err) {
                    alert("Network error during verification.");
                    verifyOtpBtn.innerHTML = 'Verify Email';
                    verifyOtpBtn.style.opacity = '1';
                }
            } else {
                otpInputs.forEach(inp => {
                    inp.style.borderColor = 'var(--accent)';
                    setTimeout(() => inp.style.borderColor = '', 1000);
                });
            }
        });
    }

    // OTP Resend Timer
    function startTimer(duration) {
        let timer = duration;
        resendBtn.style.display = 'none';
        timerText.parentElement.style.display = 'block';
        
        clearInterval(timerInterval);
        
        timerInterval = setInterval(function () {
            let seconds = parseInt(timer % 60, 10);
            seconds = seconds < 10 ? "0" + seconds : seconds;
            
            timerText.textContent = "00:" + seconds;

            if (--timer < 0) {
                clearInterval(timerInterval);
                timerText.parentElement.style.display = 'none';
                resendBtn.style.display = 'inline-block';
            }
        }, 1000);
    }
    
    if(resendBtn) {
        resendBtn.addEventListener('click', () => {
            // Simulate resending
            startTimer(30);
            // Optionally clear inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        });
    }
});
