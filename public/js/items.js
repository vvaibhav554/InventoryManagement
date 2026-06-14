class Items {
    constructor() {
        this.items = [];
        this.filteredItems = [];
        this.init();
    }

    init() {
        this.setupItemForm();
    }

    setupItemForm() {
        // Use event delegation for item form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'itemForm') {
                this.handleItemSubmit(e);
            }
        });
    }

    async loadItems() {
        try {
            const response = await API.getItems();
            this.items = response;
            this.filteredItems = [...this.items];
            this.renderItems();
        } catch (error) {
            console.error('Error loading items:', error);
            if (window.ui && typeof window.window.ui && window.ui.showNotification === 'function') {
                window.window.ui && window.ui.showNotification('Failed to load items', 'error');
            }
        }
    }

    renderItems() {
        const tbody = document.getElementById('itemsTableBody');

        if (this.filteredItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-secondary);">
                        No items found
                    </td>
                </tr>
            `;
            return;
        }

        const itemsHtml = this.filteredItems.map(item => {
            const totalValue = item.quantity * item.price_per_unit;
            const isLowStock = item.quantity <= (item.max_capacity * 0.15);
            const statusBadge = isLowStock
                ? '<span class="badge danger">Low Stock</span>'
                : '<span class="badge success">In Stock</span>';

            return `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price_per_unit.toFixed(2)}</td>
                    <td>₹${totalValue.toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="window.items.editItem('${item._id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="window.items.stockIn('${item._id}')" title="Stock In">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.items.stockOut('${item._id}')" title="Stock Out">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.items.deleteItem('${item._id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = itemsHtml;
    }

    filterItems() {
        const searchInput = document.getElementById('itemSearch');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        this.filteredItems = this.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );
        this.renderItems();
    }

    openAddModal() {
        window.ui && window.ui.openModal('Add New Item');
    }

    async handleItemSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const editId = form.getAttribute('data-edit-id');

        const itemData = {
            name: form.itemName.value,
            quantity: parseInt(form.itemQuantity.value),
            price_per_unit: parseFloat(form.itemPrice.value),
            max_capacity: parseInt(form.itemMaxCapacity.value)
        };

        try {
            if (editId) {
                await API.updateItem(editId, itemData);
                window.ui && window.ui.showNotification('Item updated successfully', 'success');
            } else {
                await API.createItem(itemData);
                window.ui && window.ui.showNotification('Item created successfully', 'success');
            }

            window.ui && window.ui.closeModal();
            this.loadItems();
        } catch (error) {
            window.ui && window.ui.showNotification(error.message, 'error');
        }
    }

    async editItem(id) {
        const item = this.items.find(item => item._id === id);
        if (!item) return;

        window.ui && window.ui.openModal('Edit Item', item);
    }

    async deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            await API.deleteItem(id);
            window.ui && window.ui.showNotification('Item deleted successfully', 'success');
            this.loadItems();
        } catch (error) {
            window.ui && window.ui.showNotification(error.message, 'error');
        }
    }

    async stockIn(id) {
        const item = this.items.find(item => item._id === id);
        if (!item) return;

        const quantity = prompt(`Enter quantity to add to ${item.name}:`);
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            window.ui && window.ui.showNotification('Please enter a valid quantity', 'error');
            return;
        }

        try {
            await API.createTransaction({
                item_id: id,
                transaction_type: 'IN',
                quantity: parseInt(quantity)
            });
            window.ui && window.ui.showNotification('Stock added successfully', 'success');
            this.loadItems();
        } catch (error) {
            window.ui && window.ui.showNotification(error.message, 'error');
        }
    }

    async stockOut(id) {
        const item = this.items.find(item => item._id === id);
        if (!item) return;

        const quantity = prompt(`Enter quantity to remove from ${item.name}:`);
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            window.ui && window.ui.showNotification('Please enter a valid quantity', 'error');
            return;
        }

        if (quantity > item.quantity) {
            window.ui && window.ui.showNotification('Insufficient stock available', 'error');
            return;
        }

        try {
            await API.createTransaction({
                item_id: id,
                transaction_type: 'OUT',
                quantity: parseInt(quantity)
            });
            window.ui && window.ui.showNotification('Stock removed successfully', 'success');
            this.loadItems();
        } catch (error) {
            window.ui && window.ui.showNotification(error.message, 'error');
        }
    }
}

window.items = new Items();