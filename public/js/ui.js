class UI {
    constructor() {
        this.currentPage = 'landing';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModal();
        this.setupNotifications();
    }

    setupNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navLinksContainer = document.getElementById('navLinks');

        // Use event delegation for navigation links
        document.addEventListener('click', (e) => {
            // Handle navigation links
            if (e.target.matches('.nav-links a[data-page]') || e.target.closest('.nav-links a[data-page]')) {
                e.preventDefault();
                const link = e.target.matches('.nav-links a[data-page]') ? e.target : e.target.closest('.nav-links a[data-page]');
                const page = link.getAttribute('data-page');
                this.loadPage(page);
                navLinksContainer.classList.remove('active');
            }

            // Handle hero buttons (Get Started, Login, etc.)
            if (e.target.matches('.hero-buttons .btn[data-page]') || e.target.closest('.hero-buttons .btn[data-page]')) {
                e.preventDefault();
                const button = e.target.matches('.hero-buttons .btn[data-page]') ? e.target : e.target.closest('.hero-buttons .btn[data-page]');
                const page = button.getAttribute('data-page');
                this.loadPage(page);
            }

            // Handle inline navigation links
            if (e.target.matches('a[onclick*="window.loadPage"]') || e.target.closest('a[onclick*="window.loadPage"]')) {
                e.preventDefault();
            }

            // Handle logout button
            if (e.target.matches('#logoutBtn') || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                if (window.auth) {
                    window.auth.logout();
                }
            }
        });

        // Handle direct function calls from HTML
        window.loadPage = (page) => {
            this.loadPage(page);
        };

        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navLinksContainer.classList.toggle('active');
            });
        }
    }

    setupModal() {
        const modal = document.getElementById('itemModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    setupNotifications() {
        const notification = document.getElementById('notification');
        notification.addEventListener('click', () => {
            this.hideNotification();
        });
    }

    loadPage(page) {
        if (page === 'login' || page === 'signup') {
            if (auth.isAuthenticated) {
                this.loadPage('dashboard');
                return;
            }
        } else if (page !== 'landing') {
            if (!auth.requireAuth()) {
                return;
            }
        }

        this.currentPage = page;
        const pageContent = document.getElementById('pageContent');

        let html = '';
        switch (page) {
            case 'login':
                html = this.getLoginPage();
                break;
            case 'signup':
                html = this.getSignupPage();
                break;
            case 'dashboard':
                html = this.getDashboardPage();
                break;
            case 'items':
                html = this.getItemsPage();
                break;
            case 'reports':
                html = this.getReportsPage();
                break;
            default:
                html = this.getLandingPage();
        }

        pageContent.innerHTML = html;

        this.initializePageComponents(page);
    }

    getLandingPage() {
        return `
            <div class="landing-page">
                <div class="hero">
                    <h1>Inventory Management System</h1>
                    <p>Complete solution for managing your business inventory with real-time tracking and reporting</p>
                    <div class="hero-buttons">
                        <button class="btn btn-primary guest-only" onclick="window.loadPage('signup')">Get Started</button>
                        <button class="btn btn-secondary guest-only" onclick="window.loadPage('login')">Login</button>
                        <button class="btn btn-primary auth-only" onclick="window.loadPage('dashboard')">Go to Dashboard</button>
                    </div>
                </div>

                <div class="features">
                    <div class="feature-card">
                        <i class="fas fa-chart-line"></i>
                        <h3>Real-time Analytics</h3>
                        <p>Track inventory levels and get insights into stock movement patterns</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Low Stock Alerts</h3>
                        <p>Automatic notifications when items fall below 15% of capacity</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-file-alt"></i>
                        <h3>Monthly Reports</h3>
                        <p>Generate comprehensive reports with visual charts and analytics</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-users"></i>
                        <h3>User Management</h3>
                        <p>Secure authentication system with individual user accounts</p>
                    </div>
                </div>
            </div>
        `;
    }

    getLoginPage() {
        return `
            <div class="auth-form">
                <h2>Login to Your Account</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                </form>
                <p style="text-align: center; margin-top: 1rem;">
                    Don't have an account? <a href="#" onclick="window.loadPage('signup')">Sign up</a>
                </p>
            </div>
        `;
    }

    getSignupPage() {
        return `
            <div class="auth-form">
                <h2>Create Your Account</h2>
                <form id="signupForm">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Sign Up</button>
                </form>
                <p style="text-align: center; margin-top: 1rem;">
                    Already have an account? <a href="#" onclick="window.loadPage('login')">Login</a>
                </p>
            </div>
        `;
    }

    getDashboardPage() {
        return `
            <div class="dashboard-page">
                <h1>Dashboard</h1>

                <div class="stats-grid" id="dashboardStats">
                    <div class="stat-card">
                        <h3 id="totalItems">0</h3>
                        <p>Total Items</p>
                    </div>
                    <div class="stat-card danger">
                        <h3 id="lowStockItems">0</h3>
                        <p>Low Stock Items</p>
                    </div>
                    <div class="stat-card success">
                        <h3 id="totalValue">₹0</h3>
                        <p>Total Inventory Value</p>
                    </div>
                    <div class="stat-card warning">
                        <h3 id="stockMovement">0</h3>
                        <p>Stock Movement (30 days)</p>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Low Stock Alerts</h2>
                    </div>
                    <div id="lowStockList">
                        <p style="text-align: center; color: var(--text-secondary);">No low stock items</p>
                    </div>
                </div>
            </div>
        `;
    }

    getItemsPage() {
        return `
            <div class="items-page">
                <div class="card">
                    <div class="card-header">
                        <h2>Inventory Items</h2>
                        <button class="btn btn-primary" onclick="window.items.openAddModal()">
                            <i class="fas fa-plus"></i> Add Item
                        </button>
                    </div>

                    <div class="search-bar">
                        <input type="text" id="itemSearch" placeholder="Search items..." onkeyup="window.items.filterItems()">
                    </div>

                    <div class="table-container">
                        <table class="table" id="itemsTable">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Price/Unit (₹)</th>
                                    <th>Total Value</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="itemsTableBody">
                                <tr>
                                    <td colspan="6" style="text-align: center; color: var(--text-secondary);">
                                        Loading items...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getReportsPage() {
        return `
            <div class="reports-page">
                <div class="card">
                    <div class="card-header">
                        <h2>Monthly Reports</h2>
                        <div>
                            <select id="reportMonth" onchange="window.reports.loadReport()">
                                <option value="">Select Month</option>
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <select id="reportYear" onchange="window.reports.loadReport()">
                                <option value="">Select Year</option>
                            </select>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card success">
                            <h3 id="totalStockIn">0</h3>
                            <p>Total Stock In</p>
                        </div>
                        <div class="stat-card danger">
                            <h3 id="totalStockOut">0</h3>
                            <p>Total Stock Out</p>
                        </div>
                        <div class="stat-card warning">
                            <h3 id="totalTransactions">0</h3>
                            <p>Total Transactions</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>Stock Movement Chart</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="stockChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3>Recent Transactions</h3>
                        </div>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Item</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody id="transactionsTableBody">
                                    <tr>
                                        <td colspan="4" style="text-align: center; color: var(--text-secondary);">
                                            Loading transactions...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initializePageComponents(page) {
        auth.updateUI();

        switch (page) {
            case 'dashboard':
                window.dashboard.loadDashboard();
                break;
            case 'items':
                window.items.loadItems();
                break;
            case 'reports':
                window.reports.initializeReport();
                break;
        }
    }

    openModal(title = 'Add Item', itemData = null) {
        const modal = document.getElementById('itemModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('itemForm');

        modalTitle.textContent = title;

        if (itemData) {
            form.itemName.value = itemData.name;
            form.itemQuantity.value = itemData.quantity;
            form.itemPrice.value = itemData.price_per_unit;
            form.itemMaxCapacity.value = itemData.max_capacity;
            form.setAttribute('data-edit-id', itemData._id);
        } else {
            form.reset();
            form.removeAttribute('data-edit-id');
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'none';
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');

        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            this.hideNotification();
        }, 3000);
    }

    hideNotification() {
        const notification = document.getElementById('notification');
        notification.classList.remove('show');
    }
}

window.ui = new UI();
window.loadPage = (page) => ui.loadPage(page);
window.showNotification = (message, type) => ui.showNotification(message, type);
window.openModal = (title, itemData) => ui.openModal(title, itemData);
window.closeModal = () => ui.closeModal();