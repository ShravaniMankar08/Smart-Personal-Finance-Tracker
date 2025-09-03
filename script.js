// Data structure to simulate a database
const financeDB = {
    users: JSON.parse(localStorage.getItem('users')) || [],
    transactions: JSON.parse(localStorage.getItem('transactions')) || [],
    categories: [
        { id: 1, name: 'Salary', type: 'income' },
        { id: 2, name: 'Freelance', type: 'income' },
        { id: 3, name: 'Investment', type: 'income' },
        { id: 4, name: 'Gift', type: 'income' },
        { id: 5, name: 'Food', type: 'expense' },
        { id: 6, name: 'Rent', type: 'expense' },
        { id: 7, name: 'Transport', type: 'expense' },
        { id: 8, name: 'Entertainment', type: 'expense' },
        { id: 9, name: 'Healthcare', type: 'expense' },
        { id: 10, name: 'Education', type: 'expense' },
        { id: 11, name: 'Shopping', type: 'expense' },
        { id: 12, name: 'Other', type: 'both' }
    ],
    goals: JSON.parse(localStorage.getItem('goals')) || [],
    currentUser: null
};

// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const transactionList = document.getElementById('transaction-list');
const transactionSearch = document.getElementById('transaction-search');
const addGoalBtn = document.getElementById('add-goal-btn');
const goalsList = document.getElementById('goals-list');
const transactionCategory = document.getElementById('transaction-category');
const userName = document.getElementById('user-name');
const totalIncome = document.getElementById('total-income');
const totalExpense = document.getElementById('total-expense');
const currentBalance = document.getElementById('current-balance');

// Initialize the application
function initApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        financeDB.currentUser = JSON.parse(savedUser);
        showApp();
    }

    // Populate category dropdown
    populateCategories();

    // Set today's date as default
    document.getElementById('transaction-date').valueAsDate = new Date();

    // Set up event listeners
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
    addTransactionBtn.addEventListener('click', addTransaction);
    transactionSearch.addEventListener('input', filterTransactions);
    addGoalBtn.addEventListener('click', addGoal);

    // Update UI
    updateSummary();
    renderTransactions();
    renderGoals();
    renderCharts();
}

// Authentication functions
function switchAuthTab(tab) {
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    const user = financeDB.users.find(u => u.email === email && u.password === password);
    if (user) {
        financeDB.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showApp();
    } else {
        alert('Invalid email or password');
    }
}

function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    // Check if user already exists
    if (financeDB.users.some(u => u.email === email)) {
        alert('User with this email already exists');
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password
    };

    financeDB.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(financeDB.users));

    financeDB.currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    showApp();
    alert('Registration successful!');
}

function handleLogout() {
    financeDB.currentUser = null;
    localStorage.removeItem('currentUser');
    showAuth();
}

function showApp() {
    authSection.style.display = 'none';
    appSection.classList.remove('hidden');
    userName.textContent = financeDB.currentUser.name;
    updateSummary();
    renderTransactions();
    renderGoals();
    renderCharts();
}

function showAuth() {
    authSection.style.display = 'block';
    appSection.classList.add('hidden');
}

// Transaction functions
function addTransaction() {
    const type = document.getElementById('transaction-type').value;
    const categoryId = parseInt(document.getElementById('transaction-category').value);
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const description = document.getElementById('transaction-description').value;
    const date = document.getElementById('transaction-date').value;

    if (!categoryId || !amount || !description || !date) {
        alert('Please fill all fields');
        return;
    }

    const category = financeDB.categories.find(c => c.id === categoryId);

    const newTransaction = {
        id: Date.now(),
        userId: financeDB.currentUser.id,
        type,
        category: category.name,
        amount,
        description,
        date
    };

    financeDB.transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(financeDB.transactions));

    // Reset form
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-description').value = '';
    document.getElementById('transaction-date').valueAsDate = new Date();

    // Update UI
    updateSummary();
    renderTransactions();
    renderCharts();

    alert('Transaction added successfully!');
}

function renderTransactions() {
    const userTransactions = financeDB.transactions.filter(
        t => t.userId === financeDB.currentUser.id
    );

    // Sort by date (newest first)
    userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userTransactions.length === 0) {
        transactionList.innerHTML = '<p class="text-center">No transactions yet</p>';
        return;
    }

    transactionList.innerHTML = userTransactions.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-details">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-category">${transaction.category}</div>
                <small class="text-muted">${new Date(transaction.date).toLocaleDateString()}</small>
            </div>
            <div class="transaction-amount ${transaction.type === 'income' ? 'income-color' : 'expense-color'}">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
}

function filterTransactions() {
    const searchTerm = transactionSearch.value.toLowerCase();
    const transactionItems = transactionList.querySelectorAll('.transaction-item');
    
    transactionItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
}

// Goal functions
function addGoal() {
    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);

    if (!name || !target) {
        alert('Please fill all fields');
        return;
    }

    const newGoal = {
        id: Date.now(),
        userId: financeDB.currentUser.id,
        name,
        target,
        current: 0
    };

    financeDB.goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(financeDB.goals));

    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    renderGoals();
}

function renderGoals() {
    const userGoals = financeDB.goals.filter(
        g => g.userId === financeDB.currentUser.id
    );

    if (userGoals.length === 0) {
        goalsList.innerHTML = '<p class="text-center">No goals set yet</p>';
        return;
    }

    goalsList.innerHTML = userGoals.map(goal => `
        <div class="goal-item">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>${goal.name}</strong>
                <span>$${goal.current.toFixed(2)} / $${goal.target.toFixed(2)}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar" role="progressbar" 
                    style="width: ${(goal.current / goal.target) * 100}%">
                    ${Math.round((goal.current / goal.target) * 100)}%
                </div>
            </div>
        </div>
    `).join('');
}

// Chart functions
function renderCharts() {
    const userTransactions = financeDB.transactions.filter(
        t => t.userId === financeDB.currentUser.id
    );

    // Expense breakdown chart
    const expenseTransactions = userTransactions.filter(t => t.type === 'expense');
    const expenseByCategory = {};

    expenseTransactions.forEach(transaction => {
        if (!expenseByCategory[transaction.category]) {
            expenseByCategory[transaction.category] = 0;
        }
        expenseByCategory[transaction.category] += transaction.amount;
    });

    const expenseCtx = document.getElementById('expense-chart').getContext('2d');
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }

    if (Object.keys(expenseByCategory).length > 0) {
        window.expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expenseByCategory),
                datasets: [{
                    data: Object.values(expenseByCategory),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4DC9F6', '#F67019', '#537BC4', '#ACC236'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    } else {
        expenseCtx.font = '16px Arial';
        expenseCtx.fillStyle = '#6c757d';
        expenseCtx.textAlign = 'center';
        expenseCtx.fillText('No expense data available', expenseCtx.canvas.width / 2, expenseCtx.canvas.height / 2);
    }
}

// Helper functions
function populateCategories() {
    const typeSelect = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('transaction-category');
    
    function updateCategories() {
        const type = typeSelect.value;
        const categories = financeDB.categories.filter(c => c.type === type || c.type === 'both');
        
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        categories.forEach(category => {
            categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    }
    
    typeSelect.addEventListener('change', updateCategories);
    updateCategories();
}

function updateSummary() {
    const userTransactions = financeDB.transactions.filter(
        t => t.userId === financeDB.currentUser.id
    );

    const income = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const expense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = income - expense;

    totalIncome.textContent = `$${income.toFixed(2)}`;
    totalExpense.textContent = `$${expense.toFixed(2)}`;
    currentBalance.textContent = `$${balance.toFixed(2)}`;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);