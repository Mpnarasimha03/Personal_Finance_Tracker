// Require authentication
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

let allTransactions = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    setupFilterHandlers();
    setupModalHandlers();
});

// Load all transactions
async function loadTransactions() {
    try {
        // Fetch expenses
        const expensesResponse = await authenticatedFetch(`${API_BASE_URL}/expenses`);
        const expenses = await expensesResponse.json();

        // Fetch incomes
        const incomesResponse = await authenticatedFetch(`${API_BASE_URL}/incomes`);
        const incomes = await incomesResponse.json();

        // Combine and format transactions
        allTransactions = [
            ...expenses.map(exp => ({
                ...exp,
                type: 'expense',
                categoryOrSource: exp.category
            })),
            ...incomes.map(inc => ({
                ...inc,
                type: 'income',
                categoryOrSource: inc.source
            }))
        ];

        // Sort by date (most recent first)
        allTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

        displayTransactions(allTransactions);
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('transactionsList').innerHTML = '<tr><td colspan="6" class="no-data">Error loading transactions</td></tr>';
    }
}

// Display transactions in table
function displayTransactions(transactions) {
    const tbody = document.getElementById('transactionsList');

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No transactions found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(transaction => {
        const date = new Date(transaction.transactionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const typeClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountClass = transaction.type === 'income' ? 'amount-positive' : 'amount-negative';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';

        return `
            <tr>
                <td>${date}</td>
                <td><span class="transaction-type ${typeClass}">${transaction.type}</span></td>
                <td>${transaction.categoryOrSource}</td>
                <td>${transaction.description || '-'}</td>
                <td class="${amountClass}">${amountPrefix}$${parseFloat(transaction.amount).toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-small" onclick="editTransaction(${transaction.id}, '${transaction.type}')">Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteTransaction(${transaction.id}, '${transaction.type}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter transactions
function filterTransactions() {
    const filterType = document.getElementById('filterType').value;
    const filterCategory = document.getElementById('filterCategory').value;
    const searchQuery = document.getElementById('searchQuery').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    let filtered = allTransactions;

    // Filter by type
    if (filterType !== 'all') {
        filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category (for expenses)
    if (filterCategory) {
        filtered = filtered.filter(t => t.categoryOrSource === filterCategory);
    }

    // Search in description
    if (searchQuery) {
        filtered = filtered.filter(t =>
            (t.description && t.description.toLowerCase().includes(searchQuery)) ||
            t.categoryOrSource.toLowerCase().includes(searchQuery)
        );
    }

    // Filter by date range
    if (startDate) {
        filtered = filtered.filter(t => new Date(t.transactionDate) >= new Date(startDate));
    }
    if (endDate) {
        filtered = filtered.filter(t => new Date(t.transactionDate) <= new Date(endDate));
    }

    displayTransactions(filtered);
}

// Setup filter handlers
function setupFilterHandlers() {
    document.getElementById('applyFilters').addEventListener('click', filterTransactions);

    document.getElementById('resetFilters').addEventListener('click', () => {
        document.getElementById('filterType').value = 'all';
        document.getElementById('filterCategory').value = '';
        document.getElementById('searchQuery').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        displayTransactions(allTransactions);
    });

    // Real-time search
    document.getElementById('searchQuery').addEventListener('input', filterTransactions);
}

// Edit transaction
async function editTransaction(id, type) {
    try {
        const endpoint = type === 'expense' ? 'expenses' : 'incomes';
        const response = await authenticatedFetch(`${API_BASE_URL}/${endpoint}`);
        const items = await response.json();
        const item = items.find(i => i.id === id);

        if (!item) {
            alert('Transaction not found');
            return;
        }

        // Populate modal
        document.getElementById('editId').value = id;
        document.getElementById('editType').value = type;
        document.getElementById('editAmount').value = item.amount;
        document.getElementById('editDate').value = item.transactionDate;
        document.getElementById('editDescription').value = item.description || '';

        if (type === 'expense') {
            document.getElementById('editCategoryGroup').style.display = 'block';
            document.getElementById('editSourceGroup').style.display = 'none';
            document.getElementById('editCategory').value = item.category;
            document.getElementById('modalTitle').textContent = 'Edit Expense';
        } else {
            document.getElementById('editCategoryGroup').style.display = 'none';
            document.getElementById('editSourceGroup').style.display = 'block';
            document.getElementById('editSource').value = item.source;
            document.getElementById('modalTitle').textContent = 'Edit Income';
        }

        // Show modal
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading transaction:', error);
        alert('Error loading transaction details');
    }
}

// Delete transaction
async function deleteTransaction(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    try {
        const endpoint = type === 'expense' ? 'expenses' : 'incomes';
        const response = await authenticatedFetch(`${API_BASE_URL}/${endpoint}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showSuccess('Transaction deleted successfully!');
            await loadTransactions();
        } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'Failed to delete transaction'));
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('An error occurred while deleting the transaction');
    }
}

// Setup modal handlers
function setupModalHandlers() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelEdit');

    closeBtn.onclick = () => modal.style.display = 'none';
    cancelBtn.onclick = () => modal.style.display = 'none';

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editId').value;
        const type = document.getElementById('editType').value;
        const amount = parseFloat(document.getElementById('editAmount').value);
        const date = document.getElementById('editDate').value;
        const description = document.getElementById('editDescription').value;

        let data = {
            amount,
            transactionDate: date,
            description
        };

        if (type === 'expense') {
            data.category = document.getElementById('editCategory').value;
        } else {
            data.source = document.getElementById('editSource').value;
            data.frequency = 'ONE_TIME';
            data.recurring = false;
        }

        try {
            const endpoint = type === 'expense' ? 'expenses' : 'incomes';
            const response = await authenticatedFetch(`${API_BASE_URL}/${endpoint}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showSuccess('Transaction updated successfully!');
                modal.style.display = 'none';
                await loadTransactions();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Failed to update transaction'));
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('An error occurred while updating the transaction');
        }
    });
}
