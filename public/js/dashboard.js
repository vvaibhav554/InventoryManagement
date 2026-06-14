class Dashboard {
    constructor() {
        this.dashboardData = null;
    }

    async loadDashboard() {
        try {
            const response = await API.getDashboard();
            this.dashboardData = response;
            this.updateDashboardUI();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            if (window.ui && typeof window.ui.showNotification === 'function') {
            window.ui.showNotification('Failed to load dashboard data', 'error');
        }
        }
    }

    updateDashboardUI() {
        if (!this.dashboardData) return;

        const totalItemsElement = document.getElementById('totalItems');
        const lowStockItemsElement = document.getElementById('lowStockItems');
        const totalValueElement = document.getElementById('totalValue');
        const stockMovementElement = document.getElementById('stockMovement');

        if (totalItemsElement) totalItemsElement.textContent = this.dashboardData.totalItems;
        if (lowStockItemsElement) lowStockItemsElement.textContent = this.dashboardData.lowStockItems;
        if (totalValueElement) totalValueElement.textContent = `₹${this.dashboardData.totalValue.toFixed(2)}`;
        if (stockMovementElement) stockMovementElement.textContent = `${this.dashboardData.stockIn + this.dashboardData.stockOut}`;

        this.updateLowStockList();
    }

    updateLowStockList() {
        const lowStockList = document.getElementById('lowStockList');
        const lowStockItems = this.dashboardData.lowStockItemsList;

        if (lowStockItems.length === 0) {
            lowStockList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No low stock items</p>';
            return;
        }

        const itemsHtml = lowStockItems.map(item => {
            const threshold = item.max_capacity * 0.15;
            const percentage = ((item.quantity / item.max_capacity) * 100).toFixed(1);

            return `
                <div class="low-stock-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.5rem; margin-bottom: 0.5rem;">
                    <div>
                        <strong>${item.name}</strong>
                        <div style="color: var(--text-secondary); font-size: 0.875rem;">
                            ${item.quantity} / ${item.max_capacity} (${percentage}%)
                        </div>
                    </div>
                    <div>
                        <span class="badge danger">Low Stock</span>
                    </div>
                </div>
            `;
        }).join('');

        lowStockList.innerHTML = itemsHtml;
    }
}

window.dashboard = new Dashboard();