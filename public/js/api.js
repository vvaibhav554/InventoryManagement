const API_BASE_URL = '/api';

class API {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async signup(username, email, password) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    static async getItems() {
        return this.request('/items');
    }

    static async createItem(itemData) {
        return this.request('/items', {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    }

    static async updateItem(id, itemData) {
        return this.request(`/items/${id}`, {
            method: 'PUT',
            body: JSON.stringify(itemData)
        });
    }

    static async deleteItem(id) {
        return this.request(`/items/${id}`, {
            method: 'DELETE'
        });
    }

    static async createTransaction(transactionData) {
        return this.request('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
    }

    static async getTransactions(startDate, endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        return this.request(`/transactions?${params.toString()}`);
    }

    static async getDashboard() {
        return this.request('/dashboard');
    }

    static async getMonthlyReports(year, month) {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (month) params.append('month', month);

        return this.request(`/reports/monthly?${params.toString()}`);
    }
}

window.API = API;