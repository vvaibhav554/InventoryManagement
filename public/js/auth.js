class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.updateUI();
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
            } catch (error) {
                this.logout();
            }
        } else {
            this.logout();
        }
    }

    setupEventListeners() {
        // Use event delegation for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                this.handleLogin(e);
            } else if (e.target.id === 'signupForm') {
                this.handleSignup(e);
            }
        });

        // Logout button is handled in UI.js event delegation
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await API.login(email, password);

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            this.currentUser = response.user;
            this.isAuthenticated = true;

            this.updateUI();

            if (typeof window.showNotification === 'function') {
                window.showNotification('Login successful!', 'success');
            }

            if (typeof window.loadPage === 'function') {
                window.loadPage('dashboard');
            }
        } catch (error) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(error.message, 'error');
            }
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const form = e.target;
        const username = form.username.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        if (password !== confirmPassword) {
            window.showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await API.signup(username, email, password);

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            this.currentUser = response.user;
            this.isAuthenticated = true;

            this.updateUI();

            if (typeof window.showNotification === 'function') {
                window.showNotification('Account created successfully!', 'success');
            }

            if (typeof window.loadPage === 'function') {
                window.loadPage('dashboard');
            }
        } catch (error) {
            if (typeof window.showNotification === 'function') {
                window.showNotification(error.message, 'error');
            }
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.updateUI();

        // Safely call loadPage if it exists
        if (typeof window.loadPage === 'function') {
            window.loadPage('landing');
        }

        if (typeof window.showNotification === 'function') {
            window.showNotification('Logged out successfully', 'success');
        }
    }

    updateUI() {
        const authElements = document.querySelectorAll('.auth-only');
        const guestElements = document.querySelectorAll('.guest-only');

        authElements.forEach(el => {
            el.style.display = this.isAuthenticated ? 'block' : 'none';
        });

        guestElements.forEach(el => {
            el.style.display = this.isAuthenticated ? 'none' : 'block';
        });
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('Please login to continue', 'warning');
            }
            if (typeof window.loadPage === 'function') {
                window.loadPage('login');
            }
            return false;
        }
        return true;
    }
}

window.auth = new Auth();