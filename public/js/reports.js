class Reports {
    constructor() {
        this.chart = null;
        this.reportData = null;
    }

    initializeReport() {
        this.populateYearDropdown();
        this.loadReport();
    }

    populateYearDropdown() {
        const yearSelect = document.getElementById('reportYear');
        const monthSelect = document.getElementById('reportMonth');

        if (!yearSelect || !monthSelect) return;

        const currentYear = new Date().getFullYear();

        yearSelect.innerHTML = '<option value="">Select Year</option>';
        for (let year = currentYear; year >= currentYear - 5; year--) {
            yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        }

        const currentMonth = new Date().getMonth() + 1;
        monthSelect.value = currentMonth;
        yearSelect.value = currentYear;
    }

    async loadReport() {
        const monthSelect = document.getElementById('reportMonth');
        const yearSelect = document.getElementById('reportYear');

        if (!monthSelect || !yearSelect) return;

        const month = monthSelect.value;
        const year = yearSelect.value;

        if (!month || !year) {
            window.ui && window.ui.showNotification('Please select both month and year', 'warning');
            return;
        }

        try {
            const response = await API.getMonthlyReports(year, month);
            this.reportData = response;
            this.updateReportUI();
            this.renderChart();
        } catch (error) {
            console.error('Error loading report:', error);
            window.ui && window.ui.showNotification('Failed to load report data', 'error');
        }
    }

    updateReportUI() {
        if (!this.reportData) return;

        const stockInElement = document.getElementById('totalStockIn');
        const stockOutElement = document.getElementById('totalStockOut');
        const transactionsElement = document.getElementById('totalTransactions');

        if (stockInElement) stockInElement.textContent = this.reportData.summary.totalStockIn;
        if (stockOutElement) stockOutElement.textContent = this.reportData.summary.totalStockOut;
        if (transactionsElement) transactionsElement.textContent = this.reportData.summary.totalTransactions;

        this.renderTransactions();
    }

    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        const transactions = this.reportData.transactions.slice(0, 10);

        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-secondary);">
                        No transactions found for this period
                    </td>
                </tr>
            `;
            return;
        }

        const transactionsHtml = transactions.map(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            const typeBadge = transaction.transaction_type === 'IN'
                ? '<span class="badge success">IN</span>'
                : '<span class="badge danger">OUT</span>';

            return `
                <tr>
                    <td>${date}</td>
                    <td>${transaction.item_id.name}</td>
                    <td>${typeBadge}</td>
                    <td>${transaction.quantity_changed}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = transactionsHtml;
    }

    renderChart() {
        if (!this.reportData) return;

        const ctx = document.getElementById('stockChart');
        if (!ctx) return;

        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = this.reportData.chartData;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(item => new Date(item.date).toLocaleDateString()),
                datasets: [{
                    label: 'Stock In',
                    data: chartData.map(item => item.stockIn),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Stock Out',
                    data: chartData.map(item => item.stockOut),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Stock Movement Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantity'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }
}

window.reports = new Reports();