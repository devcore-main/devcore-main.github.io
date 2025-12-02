// Authentication and Validation JavaScript

// Admin credentials
const ADMIN_EMAIL = 'devcore.communicate@gmail.com';
const ADMIN_PASSWORD = 'dev_core_25.6.2025';

// API Base URL - Auto-detect environment
const API_BASE_URL = (() => {
    // Check if we're in production (Render)
    if (window.location.protocol === 'https:' || window.location.hostname !== 'localhost') {
        // Use Render backend URL (update this with your Render URL)
        const renderUrl = window.location.origin.replace(/\/$/, '');
        return `${renderUrl}/api`;
    }
    // Local development
    return 'http://localhost:5000/api';
})();

// Utility Functions
const utils = {
    // Check if user is logged in
    isLoggedIn: () => {
        return localStorage.getItem('authToken') !== null;
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set user session
    setSession: (token, user) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Clear session
    clearSession: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    // Redirect based on user role
    redirectUser: (user) => {
        if (user.email === ADMIN_EMAIL) {
            window.location.href = 'admin_panel.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    },

    // Show message
    showMessage: (elementId, message, type) => {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `form-message ${type}`;
            messageEl.style.display = 'block';

            if (type === 'success') {
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 3000);
            }
        }
    },

    // Hide message
    hideMessage: (elementId) => {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }
};

// Validation Functions
const validators = {
    // Validate full name
    validateFullName: (name) => {
        if (!name || name.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters' };
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return { valid: false, message: 'Name can only contain letters and spaces' };
        }
        return { valid: true, message: '' };
    },

    // Validate username
    validateUsername: (username) => {
        if (!username || username.length < 3) {
            return { valid: false, message: 'Username must be at least 3 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        return { valid: true, message: '' };
    },

    // Validate email
    validateEmail: (email) => {
        if (!email) {
            return { valid: false, message: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        return { valid: true, message: '' };
    },

    // Validate phone
    validatePhone: (phone) => {
        if (!phone) {
            return { valid: false, message: 'Phone number is required' };
        }
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return { valid: false, message: 'Please enter a valid phone number' };
        }
        return { valid: true, message: '' };
    },

    // Validate password
    validatePassword: (password) => {
        if (!password || password.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters' };
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return { valid: false, message: 'Password must contain at least one lowercase letter' };
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return { valid: false, message: 'Password must contain at least one uppercase letter' };
        }
        if (!/(?=.*\d)/.test(password)) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: '' };
    },

    // Check password strength
    checkPasswordStrength: (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/(?=.*[a-z])/.test(password)) strength++;
        if (/(?=.*[A-Z])/.test(password)) strength++;
        if (/(?=.*\d)/.test(password)) strength++;
        if (/(?=.*[@$!%*?&])/.test(password)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    },

    // Validate confirm password
    validateConfirmPassword: (password, confirmPassword) => {
        if (!confirmPassword) {
            return { valid: false, message: 'Please confirm your password' };
        }
        if (password !== confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }
        return { valid: true, message: '' };
    }
};

// Display error in form field
function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);

    if (field) {
        field.classList.remove('success');
        field.classList.add('error');
    }

    if (errorEl) {
        errorEl.textContent = message;
    }
}

// Clear field error
function clearFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);

    if (field) {
        field.classList.remove('error', 'success');
    }

    if (errorEl) {
        errorEl.textContent = '';
    }
}

// Show field success
function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('error');
        field.classList.add('success');
    }
}

// Signup Form Handler
if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    const submitBtn = document.getElementById('submitBtn');

    // Real-time validation
    const fullnameInput = document.getElementById('fullname');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsInput = document.getElementById('terms');

    // Full name validation
    if (fullnameInput) {
        fullnameInput.addEventListener('blur', () => {
            const result = validators.validateFullName(fullnameInput.value);
            if (result.valid) {
                clearFieldError('fullname', 'fullnameError');
                showFieldSuccess('fullname');
            } else {
                showFieldError('fullname', 'fullnameError', result.message);
            }
        });
    }

    // Username validation
    if (usernameInput) {
        usernameInput.addEventListener('blur', () => {
            const result = validators.validateUsername(usernameInput.value);
            if (result.valid) {
                clearFieldError('username', 'usernameError');
                showFieldSuccess('username');
            } else {
                showFieldError('username', 'usernameError', result.message);
            }
        });
    }

    // Email validation
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const result = validators.validateEmail(emailInput.value);
            if (result.valid) {
                clearFieldError('email', 'emailError');
                showFieldSuccess('email');
            } else {
                showFieldError('email', 'emailError', result.message);
            }
        });
    }

    // Phone validation
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            const result = validators.validatePhone(phoneInput.value);
            if (result.valid) {
                clearFieldError('phone', 'phoneError');
                showFieldSuccess('phone');
            } else {
                showFieldError('phone', 'phoneError', result.message);
            }
        });
    }

    // Password validation with strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strengthEl = document.getElementById('passwordStrength');

            if (password) {
                const strength = validators.checkPasswordStrength(password);
                if (strengthEl) {
                    strengthEl.className = `password-strength ${strength}`;
                    strengthEl.innerHTML = `<div class="password-strength-bar"></div>`;
                }
            } else {
                if (strengthEl) {
                    strengthEl.className = 'password-strength';
                    strengthEl.innerHTML = '';
                }
            }
        });

        passwordInput.addEventListener('blur', () => {
            const result = validators.validatePassword(passwordInput.value);
            if (result.valid) {
                clearFieldError('password', 'passwordError');
                showFieldSuccess('password');
            } else {
                showFieldError('password', 'passwordError', result.message);
            }
        });
    }

    // Confirm password validation
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('blur', () => {
            const result = validators.validateConfirmPassword(
                passwordInput.value,
                confirmPasswordInput.value
            );
            if (result.valid) {
                clearFieldError('confirmPassword', 'confirmPasswordError');
                showFieldSuccess('confirmPassword');
            } else {
                showFieldError('confirmPassword', 'confirmPasswordError', result.message);
            }
        });
    }

    // Form submission
    signupForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        utils.hideMessage('formMessage');

        // Get form values
        const fullname = fullnameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const terms = termsInput.checked;

        // Validate all fields
        let isValid = true;

        const fullnameResult = validators.validateFullName(fullname);
        if (!fullnameResult.valid) {
            showFieldError('fullname', 'fullnameError', fullnameResult.message);
            isValid = false;
        }

        const usernameResult = validators.validateUsername(username);
        if (!usernameResult.valid) {
            showFieldError('username', 'usernameError', usernameResult.message);
            isValid = false;
        }

        const emailResult = validators.validateEmail(email);
        if (!emailResult.valid) {
            showFieldError('email', 'emailError', emailResult.message);
            isValid = false;
        }

        const phoneResult = validators.validatePhone(phone);
        if (!phoneResult.valid) {
            showFieldError('phone', 'phoneError', phoneResult.message);
            isValid = false;
        }

        const passwordResult = validators.validatePassword(password);
        if (!passwordResult.valid) {
            showFieldError('password', 'passwordError', passwordResult.message);
            isValid = false;
        }

        const confirmPasswordResult = validators.validateConfirmPassword(password, confirmPassword);
        if (!confirmPasswordResult.valid) {
            showFieldError('confirmPassword', 'confirmPasswordError', confirmPasswordResult.message);
            isValid = false;
        }

        if (!terms) {
            const termsError = document.getElementById('termsError');
            if (termsError) {
                termsError.textContent = 'You must agree to the terms and conditions';
            }
            isValid = false;
        }

        if (!isValid) {
            utils.showMessage('formMessage', 'Please fix the errors above', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-block';

        try {
            // Send signup request
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullname,
                    username,
                    email,
                    phone,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                utils.showMessage('formMessage', 'Account created successfully! Redirecting...', 'success');
                // Set session and redirect
                utils.setSession(data.token, data.user);
                setTimeout(() => {
                    utils.redirectUser(data.user);
                }, 1500);
            } else {
                utils.showMessage('formMessage', data.message || 'Signup failed. Please try again.', 'error');
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').style.display = 'inline';
                submitBtn.querySelector('.btn-loader').style.display = 'none';
            }
        } catch (error) {
            console.error('Signup error:', error);
            utils.showMessage('formMessage', 'Network error. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
        }
    });
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const showPasswordCheckbox = document.getElementById('showPassword');
    const passwordInput = document.getElementById('password');

    // Show/hide password
    if (showPasswordCheckbox && passwordInput) {
        showPasswordCheckbox.addEventListener('change', () => {
            passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
        });
    }

    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const result = validators.validateEmail(emailInput.value);
            if (result.valid) {
                clearFieldError('email', 'emailError');
                showFieldSuccess('email');
            } else {
                showFieldError('email', 'emailError', result.message);
            }
        });
    }

    // Form submission
    loginForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        utils.hideMessage('formMessage');

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = document.getElementById('remember').checked;

        // Validate email
        const emailResult = validators.validateEmail(email);
        if (!emailResult.valid) {
            showFieldError('email', 'emailError', emailResult.message);
            utils.showMessage('formMessage', 'Please fix the errors above', 'error');
            return;
        }

        if (!password) {
            showFieldError('password', 'passwordError', 'Password is required');
            utils.showMessage('formMessage', 'Please fix the errors above', 'error');
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-block';

        try {
            // Send login request
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    remember
                })
            });

            const data = await response.json();

            if (response.ok) {
                utils.showMessage('formMessage', 'Login successful! Redirecting...', 'success');
                // Set session and redirect
                utils.setSession(data.token, data.user);

                if (remember) {
                    // Store remember me preference
                    localStorage.setItem('rememberMe', 'true');
                }

                setTimeout(() => {
                    utils.redirectUser(data.user);
                }, 1500);
            } else {
                utils.showMessage('formMessage', data.message || 'Invalid email or password', 'error');
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').style.display = 'inline';
                submitBtn.querySelector('.btn-loader').style.display = 'none';
            }
        } catch (error) {
            console.error('Login error:', error);
            utils.showMessage('formMessage', 'Network error. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
        }
    });
}

// Check if user is already logged in (redirect if on login/signup pages)
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
    if (utils.isLoggedIn()) {
        const user = utils.getCurrentUser();
        if (user) {
            utils.redirectUser(user);
        }
    }
}

// Logout function (can be called from anywhere)
window.logout = function() {
    utils.clearSession();
    window.location.href = 'login.html';
};

// Export for use in other scripts
window.authUtils = utils;
window.validators = validators;