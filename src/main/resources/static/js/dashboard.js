// Require authentication
if (!requireAuth()) {
    throw new Error('Not authenticated');
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupForms();
});

// Display current date
const dateDisplay = document.getElementById('currentDate');
if (dateDisplay) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Set default dates
const today = new Date().toISOString().split('T')[0];
document.getElementById('expenseDate').value = today;
document.getElementById('incomeDate').value = today;

// Set default budget month and year
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();
document.getElementById('budgetMonth').value = currentMonth;
document.getElementById('budgetYear').value = currentYear;

// Initialize dashboard
async function initializeDashboard() {
    await loadDashboardStats();
    await loadBudgetProgress();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const startDate = firstDayOfMonth.toISOString().split('T')[0];
        const endDate = lastDayOfMonth.toISOString().split('T')[0];

        // Fetch expenses
        const expensesResponse = await authenticatedFetch(
            `${API_BASE_URL}/expenses/date-range?startDate=${startDate}&endDate=${endDate}`
        );
        const expenses = await expensesResponse.json();

        // Fetch incomes
        const incomesResponse = await authenticatedFetch(
            `${API_BASE_URL}/incomes`
        );
        const incomes = await incomesResponse.json();

        // Calculate totals
        const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalIncome = incomes
            .filter(income => {
                const incomeDate = new Date(income.transactionDate);
                return incomeDate >= firstDayOfMonth && incomeDate <= lastDayOfMonth;
            })
            .reduce((sum, income) => sum + parseFloat(income.amount), 0);
        const balance = totalIncome - totalExpenses;

        // Update UI
        document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;

        // Calculate budget status
        const budgetResponse = await authenticatedFetch(
            `${API_BASE_URL}/budgets/month/${currentMonth}/year/${currentYear}`
        );
        const budgets = await budgetResponse.json();

        if (budgets.length > 0) {
            const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.budgetAmount), 0);
            const budgetPercentage = totalBudget > 0 ? (totalExpenses / totalBudget * 100) : 0;
            document.getElementById('budgetStatus').textContent = `${budgetPercentage.toFixed(1)}%`;
        }

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load budget progress
async function loadBudgetProgress() {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const response = await authenticatedFetch(
            `${API_BASE_URL}/budgets/progress?month=${currentMonth}&year=${currentYear}`
        );
        const budgetProgress = await response.json();

        const container = document.getElementById('budgetProgress');

        if (budgetProgress.length === 0) {
            container.innerHTML = '<p style="color: #6B7280; margin-top: 1rem;">No budgets set for this month. Create a budget above to start tracking!</p>';
            return;
        }

        container.innerHTML = '';

        budgetProgress.forEach(budget => {
            const percentage = Math.min(budget.percentage, 100);
            let progressClass = '';

            if (percentage >= 90) {
                progressClass = 'danger';
            } else if (percentage >= 70) {
                progressClass = 'warning';
            }

            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            budgetItem.innerHTML = `
                <div class="budget-header">
                    <span class="budget-category">${budget.category}</span>
                    <span class="budget-amounts">$${parseFloat(budget.spent).toFixed(2)} / $${parseFloat(budget.budgetAmount).toFixed(2)}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar ${progressClass}" style="width: ${percentage}%">
                        ${percentage.toFixed(0)}%
                    </div>
                </div>
            `;
            container.appendChild(budgetItem);
        });

    } catch (error) {
        console.error('Error loading budget progress:', error);
    }
}

// Setup form handlers
function setupForms() {
    // Expense form
    document.getElementById('expenseForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const expenseData = {
            amount: parseFloat(document.getElementById('expenseAmount').value),
            category: document.getElementById('expenseCategory').value,
            transactionDate: document.getElementById('expenseDate').value,
            description: document.getElementById('expenseDescription').value || ''
        };

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                showSuccess('Expense added successfully!');
                e.target.reset();
                document.getElementById('expenseDate').value = today;
                await loadDashboardStats();
                await loadBudgetProgress();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Failed to add expense'));
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('An error occurred while adding the expense');
        }
    });

    // Income form
    document.getElementById('incomeForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const incomeData = {
            amount: parseFloat(document.getElementById('incomeAmount').value),
            source: document.getElementById('incomeSource').value,
            frequency: document.getElementById('incomeFrequency').value,
            transactionDate: document.getElementById('incomeDate').value,
            recurring: document.getElementById('incomeRecurring').checked,
            description: document.getElementById('incomeDescription').value || ''
        };

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/incomes`, {
                method: 'POST',
                body: JSON.stringify(incomeData)
            });

            if (response.ok) {
                showSuccess('Income added successfully!');
                e.target.reset();
                document.getElementById('incomeDate').value = today;
                await loadDashboardStats();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Failed to add income'));
            }
        } catch (error) {
            console.error('Error adding income:', error);
            alert('An error occurred while adding the income');
        }
    });

    // Budget form
    document.getElementById('budgetForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const budgetData = {
            category: document.getElementById('budgetCategory').value,
            budgetAmount: parseFloat(document.getElementById('budgetAmount').value),
            month: parseInt(document.getElementById('budgetMonth').value),
            year: parseInt(document.getElementById('budgetYear').value)
        };

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/budgets`, {
                method: 'POST',
                body: JSON.stringify(budgetData)
            });

            if (response.ok) {
                showSuccess('Budget set successfully!');
                e.target.reset();
                document.getElementById('budgetMonth').value = currentMonth;
                document.getElementById('budgetYear').value = currentYear;
                await loadDashboardStats();
                await loadBudgetProgress();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.message || 'Failed to set budget'));
            }
        } catch (error) {
            console.error('Error setting budget:', error);
            alert('An error occurred while setting the budget');
        }
    });
}
