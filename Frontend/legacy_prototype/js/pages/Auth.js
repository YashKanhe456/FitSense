import { api } from '../api.js';
import { setUser } from '../state.js';

export const renderLogin = () => {
    // Expose handlers globally for HTML inline onclick
    window.handleLoginSubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await api.login({ email, password });
            if(res.success) {
                setUser(res.data, res.data.token);
                // Redirect user
                window.location.hash = res.data.role === 'admin' ? '#/admin' : '#/shop';
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return `
        <section id="login" style="padding: 100px 0;">
            <div class="auth-container">
                <div class="auth-card">
                    <h2 style="margin-bottom: 30px; text-align:center;">Welcome Back</h2>
                    <form onsubmit="handleLoginSubmit(event)">
                        <div class="form-group">
                            <label for="login-email">Email Address</label>
                            <input type="email" id="login-email" class="form-input" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" class="form-input" placeholder="Enter your password" required>
                        </div>
                        <button type="submit" class="btn btn-block">Login</button>
                    </form>
                    <p style="margin-top: 20px; color: var(--text-secondary); text-align:center;">
                        Don't have an account? <a href="#/register" style="color: var(--accent-gold);">Register here</a>
                    </p>
                </div>
            </div>
        </section>
    `;
};

export const renderRegister = () => {
    window.handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (password !== confirm) {
            return alert("Passwords do not match");
        }

        try {
            const res = await api.register({ name, email, password });
            if(res.success) {
                setUser(res.data, res.data.token);
                window.location.hash = '#/shop';
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return `
        <section id="register" style="padding: 100px 0;">
            <div class="auth-container">
                <div class="auth-card">
                    <h2 style="margin-bottom: 30px; text-align:center;">Create Account</h2>
                    <form onsubmit="handleRegisterSubmit(event)">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="reg-name" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" id="reg-email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" id="reg-password" class="form-input" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" id="reg-confirm" class="form-input" required minlength="6">
                        </div>
                        <button type="submit" class="btn btn-block">Register</button>
                    </form>
                    <p style="margin-top: 20px; color: var(--text-secondary); text-align:center;">
                        Already have an account? <a href="#/login" style="color: var(--accent-gold);">Login here</a>
                    </p>
                </div>
            </div>
        </section>
    `;
};
