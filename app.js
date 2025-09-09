// BudgetBuddy Enhanced Expense Tracker JavaScript
// In-memory data management with full interactive functionality

// Application Data Structure (In-Memory)
let appData = {
    currentProfile: 'Personal',
    profiles: {
        'Personal': {
            name: 'Personal',
            currency: '$',
            transactions: [
                {id: 1, date: '2024-09-08', category: 'Salary', amount: 3200.00, type: 'Income', description: 'Monthly salary'},
                {id: 2, date: '2024-09-07', category: 'Food & Dining', amount: -85.50, type: 'Expense', description: 'Grocery shopping'},
                {id: 3, date: '2024-09-06', category: 'Transportation', amount: -45.20, type: 'Expense', description: 'Gas station'},
                {id: 4, date: '2024-09-05', category: 'Food & Dining', amount: -12.75, type: 'Expense', description: 'Coffee shop'},
                {id: 5, date: '2024-09-04', category: 'Freelance', amount: 500.00, type: 'Income', description: 'Website project'},
                {id: 6, date: '2024-09-03', category: 'Bills & Utilities', amount: -120.00, type: 'Expense', description: 'Electric bill'},
                {id: 7, date: '2024-09-02', category: 'Food & Dining', amount: -67.80, type: 'Expense', description: 'Restaurant dinner'}
            ],
            budgets: {
                'Food & Dining': 800,
                'Transportation': 400,
                'Bills & Utilities': 300,
                'Entertainment': 200,
                'Shopping': 150,
                'Healthcare': 250,
                'Education': 100
            }
        },
        'Business': {
            name: 'Business',
            currency: '$',
            transactions: [
                {id: 8, date: '2024-09-08', category: 'Business Income', amount: 2500.00, type: 'Income', description: 'Client payment'},
                {id: 9, date: '2024-09-07', category: 'Office Expenses', amount: -150.00, type: 'Expense', description: 'Office supplies'},
                {id: 10, date: '2024-09-06', category: 'Transportation', amount: -75.00, type: 'Expense', description: 'Business travel'}
            ],
            budgets: {
                'Office Expenses': 500,
                'Transportation': 300,
                'Marketing': 400,
                'Equipment': 600
            }
        },
        'Family': {
            name: 'Family',
            currency: '$',
            transactions: [
                {id: 11, date: '2024-09-08', category: 'Household', amount: -200.00, type: 'Expense', description: 'Family groceries'},
                {id: 12, date: '2024-09-07', category: 'Education', amount: -120.00, type: 'Expense', description: 'School supplies'}
            ],
            budgets: {
                'Household': 1000,
                'Education': 300,
                'Healthcare': 400,
                'Entertainment': 250
            }
        }
    },
    categories: ['Food & Dining', 'Transportation', 'Bills & Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Business Income', 'Office Expenses', 'Marketing', 'Equipment', 'Household', 'Freelance', 'Salary', 'Other'],
    nextTransactionId: 13
};

// Application State
let currentSection = 'dashboard';

// Bootstrap modal instances
let addExpenseModal, profileModal, confirmDeleteModal;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('BudgetBuddy initializing...');
    
    // Small delay to ensure Bootstrap is fully loaded
    setTimeout(() => {
        initializeBootstrapComponents();
        setupEventListeners();
        initializeProfile();
        loadDashboard();
        setupResponsive();
        console.log('BudgetBuddy initialized successfully');
    }, 100);
});

// Initialize Bootstrap Components
function initializeBootstrapComponents() {
    try {
        const addExpenseModalEl = document.getElementById('addExpenseModal');
        const profileModalEl = document.getElementById('profileModal');
        const confirmDeleteModalEl = document.getElementById('confirmDeleteModal');
        
        if (addExpenseModalEl) {
            addExpenseModal = new bootstrap.Modal(addExpenseModalEl);
        }
        if (profileModalEl) {
            profileModal = new bootstrap.Modal(profileModalEl);
        }
        if (confirmDeleteModalEl) {
            confirmDeleteModal = new bootstrap.Modal(confirmDeleteModalEl);
        }
        
        console.log('Bootstrap modals initialized');
    } catch (error) {
        console.error('Error initializing Bootstrap components:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation links with delegation
    document.body.addEventListener('click', function(e) {
        // Navigation handling
        if (e.target.matches('[data-section]') || e.target.closest('[data-section]')) {
            e.preventDefault();
            const target = e.target.matches('[data-section]') ? e.target : e.target.closest('[data-section]');
            const section = target.dataset.section;
            handleNavigation(section);
            return;
        }
        
        // Profile switching
        if (e.target.matches('.profile-option') || e.target.closest('.profile-option')) {
            e.preventDefault();
            const profileOption = e.target.matches('.profile-option') ? e.target : e.target.closest('.profile-option');
            const profileName = profileOption.dataset.profile;
            if (profileName) {
                switchProfile(profileName);
            }
            return;
        }
        
        // Floating Action Button
        if (e.target.matches('#addExpenseBtn') || e.target.closest('#addExpenseBtn')) {
            e.preventDefault();
            openAddExpenseModal();
            return;
        }
        
        // Save Transaction Button
        if (e.target.matches('#saveTransactionBtn') || e.target.closest('#saveTransactionBtn')) {
            e.preventDefault();
            saveTransaction();
            return;
        }
        
        // Save Profile Button
        if (e.target.matches('#saveProfileBtn') || e.target.closest('#saveProfileBtn')) {
            e.preventDefault();
            saveProfile();
            return;
        }
        
        // Mobile sidebar controls
        if (e.target.matches('#sidebarToggle') || e.target.closest('#sidebarToggle')) {
            e.preventDefault();
            toggleSidebar();
            return;
        }
        
        if (e.target.matches('#sidebarClose') || e.target.closest('#sidebarClose')) {
            e.preventDefault();
            closeSidebar();
            return;
        }
        
        if (e.target.matches('#mobileOverlay')) {
            closeSidebar();
            return;
        }
    });

    // Form input listeners
    document.body.addEventListener('input', function(e) {
        if (e.target.closest('#expenseForm')) {
            validateExpenseForm();
        }
        if (e.target.closest('#profileForm')) {
            validateProfileForm();
        }
    });

    // Transaction type change listener
    document.body.addEventListener('change', function(e) {
        if (e.target.matches('#transactionType')) {
            updateCategoryOptions();
        }
    });

    // Set initial date
    setTimeout(() => {
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }, 200);
}

// Initialize Profile
function initializeProfile() {
    updateCurrencySymbol();
}

// Handle Navigation
function handleNavigation(section) {
    console.log('Navigating to:', section);
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section
    loadSection(section);
    closeSidebar();
}

// Load Section
function loadSection(section) {
    currentSection = section;
    console.log('Loading section:', section);
    
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            loadDashboard();
    }
    
    updatePageHeader(section);
}

// Update Page Header
function updatePageHeader(section) {
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your financial overview.' },
        categories: { title: 'Categories', subtitle: 'Manage your spending categories and budgets.' },
        reports: { title: 'Reports', subtitle: 'View detailed financial reports and analytics.' },
        settings: { title: 'Settings', subtitle: 'Manage profiles and account preferences.' }
    };
    
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    if (pageTitle) pageTitle.textContent = titles[section]?.title || section;
    if (pageSubtitle) pageSubtitle.textContent = titles[section]?.subtitle || '';
}

// Profile Management
function switchProfile(profileName) {
    console.log('Switching to profile:', profileName);
    
    if (appData.profiles[profileName]) {
        appData.currentProfile = profileName;
        
        const currentProfileName = document.getElementById('currentProfileName');
        if (currentProfileName) {
            currentProfileName.textContent = profileName;
        }
        
        updateCurrencySymbol();
        loadSection(currentSection);
        showToast('Profile switched to ' + profileName, 'success');
    }
}

function updateCurrencySymbol() {
    const profile = getCurrentProfile();
    const symbol = profile.currency;
    
    const currencyElements = document.querySelectorAll('#currencySymbol, .currency-symbol');
    currencyElements.forEach(el => {
        el.textContent = symbol;
    });
}

// Dashboard Functions
function loadDashboard() {
    console.log('Loading dashboard...');
    const profile = getCurrentProfile();
    const stats = calculateStats(profile);
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        ${createOverviewCards(stats)}
        <div class="row">
            ${createRecentTransactions(profile)}
            ${createSpendingBreakdown(profile, stats)}
        </div>
    `;
}

function createOverviewCards(stats) {
    return `
        <div class="row mb-4">
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card overview-card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-2">Total Balance</h6>
                                <h3 class="text-success mb-0 fw-bold">${formatCurrency(stats.balance)}</h3>
                            </div>
                            <div class="icon-circle bg-success bg-opacity-10">
                                <i class="fas fa-dollar-sign text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card overview-card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-2">Total Income</h6>
                                <h3 class="text-success mb-0 fw-bold">${formatCurrency(stats.totalIncome)}</h3>
                            </div>
                            <div class="icon-circle bg-success bg-opacity-10">
                                <i class="fas fa-arrow-up text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card overview-card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-2">Total Expenses</h6>
                                <h3 class="text-danger mb-0 fw-bold">${formatCurrency(Math.abs(stats.totalExpenses))}</h3>
                            </div>
                            <div class="icon-circle bg-danger bg-opacity-10">
                                <i class="fas fa-arrow-down text-danger"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-xl-3 col-md-6 mb-3">
                <div class="card overview-card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title text-muted mb-2">Savings Rate</h6>
                                <h3 class="text-info mb-0 fw-bold">${stats.savingsRate}%</h3>
                            </div>
                            <div class="icon-circle bg-info bg-opacity-10">
                                <i class="fas fa-piggy-bank text-info"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createRecentTransactions(profile) {
    const recentTransactions = profile.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    return `
        <div class="col-lg-8 mb-4">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-semibold">
                            <i class="fas fa-list me-2 text-primary"></i>
                            Recent Transactions
                        </h5>
                        <button class="btn btn-sm btn-outline-primary" data-section="reports">
                            View All
                        </button>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr >
                                    <th id="#transactionsTableHeader" scope="col">Date</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentTransactions.map(transaction => `
                                    <tr>
                                        <td>${formatDate(transaction.date)}</td>
                                        <td>${transaction.category}</td>
                                        <td>${transaction.description || '-'}</td>
                                        <td class="${transaction.amount > 0 ? 'text-success' : 'text-danger'} fw-semibold">
                                            ${transaction.amount > 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                                        </td>
                                        <td>
                                            <span class="badge ${transaction.type === 'Income' ? 'bg-success' : 'bg-danger'}">
                                                ${transaction.type}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createSpendingBreakdown(profile, stats) {
    return `
        <div class="col-lg-4 mb-4">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                    <h5 class="mb-0 fw-semibold">
                        <i class="fas fa-chart-pie me-2 text-primary"></i>
                        Spending Breakdown
                    </h5>
                </div>
                <div class="card-body">
                    ${createCategoryBreakdown(stats.categoryExpenses, stats.totalExpenses)}
                </div>
            </div>
        </div>
    `;
}

function createCategoryBreakdown(categoryExpenses, totalExpenses) {
    const sortedCategories = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
        .slice(0, 5);
    
    if (sortedCategories.length === 0) {
        return '<p class="text-muted text-center">No expense data available</p>';
    }
    
    return sortedCategories.map(([category, amount], index) => {
        const percentage = totalExpenses !== 0 ? (Math.abs(amount) / Math.abs(totalExpenses) * 100) : 0;
        const colors = ['danger', 'warning', 'info', 'primary', 'secondary'];
        const color = colors[index] || 'secondary';
        
        return `
            <div class="spending-category mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-medium">${category}</span>
                    <span class="text-muted">${percentage.toFixed(1)}% - ${formatCurrency(Math.abs(amount))}</span>
                </div>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-${color}" style="width: ${percentage}%" 
                         role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Categories Functions
function loadCategories() {
    console.log('Loading categories...');
    const profile = getCurrentProfile();
    const categoryStats = calculateCategoryStats(profile);
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-12 mb-4">
                <div class="search-controls">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0">Category Budget Management</h5>
                        <button class="btn btn-primary btn-sm" onclick="showToast('Budget management coming soon!', 'success')">
                            <i class="fas fa-plus me-2"></i>Set Budget
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            ${Object.entries(profile.budgets).map(([category, budget]) => {
                const spent = Math.abs(categoryStats[category] || 0);
                const percentage = budget > 0 ? (spent / budget * 100) : 0;
                const isOverBudget = percentage > 100;
                
                return `
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h6 class="mb-0 fw-semibold">${category}</h6>
                                    <span class="badge ${isOverBudget ? 'bg-danger' : 'bg-success'}">
                                        ${percentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div class="budget-progress mb-3">
                                    <div class="progress" style="height: 12px;">
                                        <div class="progress-bar ${isOverBudget ? 'bg-danger' : 'bg-success'}" 
                                             style="width: ${Math.min(percentage, 100)}%" 
                                             role="progressbar" aria-valuenow="${percentage}" 
                                             aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        Spent: ${formatCurrency(spent)}
                                    </small>
                                    <small class="text-muted">
                                        Budget: ${formatCurrency(budget)}
                                    </small>
                                </div>
                                <div class="text-center mt-2">
                                    <small class="${isOverBudget ? 'text-danger over-budget' : 'text-success under-budget'}">
                                        ${isOverBudget ? 'Over budget by ' + formatCurrency(spent - budget) : 
                                                        'Remaining: ' + formatCurrency(budget - spent)}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Reports Functions
function loadReports() {
    console.log('Loading reports...');
    const profile = getCurrentProfile();
    const stats = calculateStats(profile);
    const monthlyData = calculateMonthlyStats(profile);
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="search-controls">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="searchTransactions" class="form-label">Search</label>
                                <input type="text" class="form-control" id="searchTransactions" 
                                       placeholder="Search transactions...">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="filterCategory" class="form-label">Category</label>
                                <select class="form-control" id="filterCategory">
                                    <option value="">All Categories</option>
                                    ${appData.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="filterType" class="form-label">Type</label>
                                <select class="form-control" id="filterType">
                                    <option value="">All Types</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="sortBy" class="form-label">Sort By</label>
                                <select class="form-control" id="sortBy">
                                    <option value="date">Date</option>
                                    <option value="amount">Amount</option>
                                    <option value="category">Category</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <button class="btn btn-success export-btn" onclick="exportTransactions()">
                                <i class="fas fa-download me-2"></i>Export CSV
                            </button>
                            <button class="btn btn-primary ms-2" onclick="filterTransactions()">
                                <i class="fas fa-search me-2"></i>Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card report-card border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-calendar-month text-primary mb-3" style="font-size: 2rem;"></i>
                        <h6 class="text-muted mb-2">This Month</h6>
                        <div class="report-value text-primary">${formatCurrency(monthlyData.currentMonth.net)}</div>
                        <div class="report-change ${monthlyData.monthlyChange >= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${monthlyData.monthlyChange >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(monthlyData.monthlyChange).toFixed(1)}% from last month
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card report-card border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-chart-line text-success mb-3" style="font-size: 2rem;"></i>
                        <h6 class="text-muted mb-2">Avg. Monthly Income</h6>
                        <div class="report-value text-success">${formatCurrency(monthlyData.avgIncome)}</div>
                        <div class="report-change positive">
                            <i class="fas fa-arrow-up"></i>
                            Steady growth
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card report-card border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-chart-bar text-danger mb-3" style="font-size: 2rem;"></i>
                        <h6 class="text-muted mb-2">Avg. Monthly Expenses</h6>
                        <div class="report-value text-danger">${formatCurrency(Math.abs(monthlyData.avgExpenses))}</div>
                        <div class="report-change ${monthlyData.expenseChange <= 0 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${monthlyData.expenseChange <= 0 ? 'down' : 'up'}"></i>
                            ${Math.abs(monthlyData.expenseChange).toFixed(1)}% change
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card report-card border-0 shadow-sm">
                    <div class="card-body">
                        <i class="fas fa-piggy-bank text-info mb-3" style="font-size: 2rem;"></i>
                        <h6 class="text-muted mb-2">Savings Rate</h6>
                        <div class="report-value text-info">${stats.savingsRate}%</div>
                        <div class="report-change ${stats.savingsRate >= 20 ? 'positive' : 'negative'}">
                            <i class="fas fa-arrow-${stats.savingsRate >= 20 ? 'up' : 'down'}"></i>
                            ${stats.savingsRate >= 20 ? 'Great' : 'Needs improvement'}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-bottom">
                        <h5 class="mb-0 fw-semibold">
                            <i class="fas fa-list me-2 text-primary"></i>
                            All Transactions
                        </h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th id="transactionsTableHeader" scope="col">Date</th>
                                        <th  id="transactionsTableHeader" scope="col">Category</th>
                                        <th  id="transactionsTableHeader" scope="col">Description</th>
                                        <th   id="transactionsTableHeader" scope="col">Amount</th>
                                        <th  id="transactionsTableHeader"  scope="col">Type</th>
                                        <th  id="transactionsTableHeader"  scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="transactionsTableBody">
                                    <!-- Will be populated by filterTransactions() -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load transactions after HTML is inserted
    setTimeout(() => filterTransactions(), 100);
}

// Settings Functions
function loadSettings() {
    console.log('Loading settings...');
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="settings-section">
                    <h3 class="settings-title">Profile Management</h3>
                    <div class="mb-4">
                        <button class="btn btn-primary" onclick="openProfileModal()">
                            <i class="fas fa-plus me-2"></i>Add New Profile
                        </button>
                    </div>
                    <div id="profilesList">
                        ${Object.entries(appData.profiles).map(([key, profile]) => `
                            <div class="profile-item ${key === appData.currentProfile ? 'active' : ''}">
                                <div class="profile-info">
                                    <h6>${profile.name}</h6>
                                    <small>Currency: ${profile.currency} • ${profile.transactions.length} transactions</small>
                                </div>
                                <div class="profile-actions">
                                    <button class="btn btn-sm btn-outline-primary me-2" onclick="switchProfile('${key}')">
                                        ${key === appData.currentProfile ? 'Current' : 'Switch'}
                                    </button>
                                    ${key !== 'Personal' ? `
                                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteProfile('${key}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-title">Category Management</h3>
                    <div class="row">
                        ${appData.categories.map(category => `
                            <div class="col-md-6 mb-2">
                                <div class="d-flex justify-content-between align-items-center p-2 border rounded">
                                    <span class="text-muted">${category}</span>
                                    <button class="btn btn-sm btn-outline-danger" onclick="removeCategory('${category}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3">
                        <div class="input-group">
                            <input type="text" class="form-control" id="newCategoryInput" placeholder="Add new category">
                            <button class="btn btn-primary" onclick="addCategory()">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Transaction Management
function openAddExpenseModal() {
    console.log('Opening add expense modal...');
    
    // Set default values
    setTimeout(() => {
        const dateInput = document.getElementById('transactionDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        updateCategoryOptions();
    }, 100);
    
    if (addExpenseModal) {
        addExpenseModal.show();
    } else {
        // Fallback if modal not initialized
        const modalEl = document.getElementById('addExpenseModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
}

function updateCategoryOptions() {
    const typeSelect = document.getElementById('transactionType');
    const categorySelect = document.getElementById('transactionCategory');
    
    if (!typeSelect || !categorySelect) return;
    
    const type = typeSelect.value;
    let categories = [...appData.categories];
    
    if (type === 'Income') {
        categories = categories.filter(cat => 
            cat.includes('Income') || cat.includes('Salary') || cat.includes('Freelance')
        );
    } else if (type === 'Expense') {
        categories = categories.filter(cat => 
            !cat.includes('Income') && !cat.includes('Salary') && !cat.includes('Freelance')
        );
    }
    
    categorySelect.innerHTML = '<option value="">Select category</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function validateExpenseForm() {
    const form = document.getElementById('expenseForm');
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });
    
    const saveBtn = document.getElementById('saveTransactionBtn');
    if (saveBtn) {
        saveBtn.disabled = !isValid;
    }
    
    return isValid;
}

function saveTransaction() {
    console.log('Saving transaction...');
    
    const formData = {
        date: document.getElementById('transactionDate')?.value || new Date().toISOString().split('T')[0],
        type: document.getElementById('transactionType')?.value || '',
        category: document.getElementById('transactionCategory')?.value || '',
        amount: parseFloat(document.getElementById('transactionAmount')?.value || '0'),
        description: document.getElementById('transactionDescription')?.value || ''
    };
    
    // Basic validation
    if (!formData.type || !formData.category || !formData.amount) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Adjust amount sign based on type
    if (formData.type === 'Expense' && formData.amount > 0) {
        formData.amount = -formData.amount;
    }
    
    const profile = getCurrentProfile();
    const newTransaction = {
        id: appData.nextTransactionId++,
        ...formData
    };
    
    profile.transactions.push(newTransaction);
    
    // Hide modal and reset form
    if (addExpenseModal) {
        addExpenseModal.hide();
    }
    
    const form = document.getElementById('expenseForm');
    if (form) {
        form.reset();
        form.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
    }
    
    // Refresh current section
    loadSection(currentSection);
    showToast('Transaction added successfully!', 'success');
}

// Profile Management Functions
function openProfileModal() {
    console.log('Opening profile modal...');
    if (profileModal) {
        profileModal.show();
    } else {
        const modalEl = document.getElementById('profileModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
}

function validateProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return false;
    
    const nameInput = document.getElementById('profileName');
    const isValid = nameInput && nameInput.value.trim() !== '' && !appData.profiles[nameInput.value.trim()];
    
    if (nameInput) {
        if (isValid) {
            nameInput.classList.remove('is-invalid');
            nameInput.classList.add('is-valid');
        } else {
            nameInput.classList.add('is-invalid');
            nameInput.classList.remove('is-valid');
        }
    }
    
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.disabled = !isValid;
    }
    
    return isValid;
}

function saveProfile() {
    console.log('Saving profile...');
    
    const name = document.getElementById('profileName')?.value.trim() || '';
    const currency = document.getElementById('profileCurrency')?.value || '$';
    
    if (!name || appData.profiles[name]) {
        showToast('Please enter a valid, unique profile name', 'error');
        return;
    }
    
    appData.profiles[name] = {
        name: name,
        currency: currency,
        transactions: [],
        budgets: {
            'Food & Dining': 500,
            'Transportation': 300,
            'Bills & Utilities': 200,
            'Entertainment': 150,
            'Shopping': 100,
            'Healthcare': 200,
            'Education': 100
        }
    };
    
    // Hide modal and reset form
    if (profileModal) {
        profileModal.hide();
    }
    
    const form = document.getElementById('profileForm');
    if (form) {
        form.reset();
    }
    
    if (currentSection === 'settings') {
        loadSettings();
    }
    showToast('Profile created successfully!', 'success');
}

// Utility Functions
function getCurrentProfile() {
    return appData.profiles[appData.currentProfile] || appData.profiles['Personal'];
}

function calculateStats(profile) {
    const transactions = profile.transactions || [];
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome + totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
    
    const categoryExpenses = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });
    
    return {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
        categoryExpenses
    };
}

function calculateCategoryStats(profile) {
    const categoryStats = {};
    const transactions = profile.transactions || [];
    transactions.filter(t => t.amount < 0).forEach(t => {
        categoryStats[t.category] = (categoryStats[t.category] || 0) + Math.abs(t.amount);
    });
    return categoryStats;
}

function calculateMonthlyStats(profile) {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const transactions = profile.transactions || [];
    const currentMonthTransactions = transactions.filter(t => 
        new Date(t.date) >= currentMonth
    );
    const lastMonthTransactions = transactions.filter(t => 
        new Date(t.date) >= lastMonth && new Date(t.date) < currentMonth
    );
    
    const currentMonthNet = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const lastMonthNet = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyChange = lastMonthNet !== 0 ? ((currentMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100 : 0;
    
    const allIncome = transactions.filter(t => t.amount > 0);
    const allExpenses = transactions.filter(t => t.amount < 0);
    
    const avgIncome = allIncome.length > 0 ? allIncome.reduce((sum, t) => sum + t.amount, 0) / allIncome.length : 0;
    const avgExpenses = allExpenses.length > 0 ? allExpenses.reduce((sum, t) => sum + t.amount, 0) / allExpenses.length : 0;
    
    return {
        currentMonth: { net: currentMonthNet },
        monthlyChange,
        avgIncome,
        avgExpenses,
        expenseChange: 0
    };
}

function formatCurrency(amount) {
    const profile = getCurrentProfile();
    const symbol = profile.currency;
    return symbol + Math.abs(amount).toFixed(2);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function filterTransactions() {
    const profile = getCurrentProfile();
    const searchTerm = document.getElementById('searchTransactions')?.value.toLowerCase() || '';
    const filterCategory = document.getElementById('filterCategory')?.value || '';
    const filterType = document.getElementById('filterType')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'date';
    
    let filteredTransactions = (profile.transactions || []).filter(transaction => {
        const matchesSearch = !searchTerm || 
            (transaction.description && transaction.description.toLowerCase().includes(searchTerm)) ||
            transaction.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !filterCategory || transaction.category === filterCategory;
        const matchesType = !filterType || transaction.type === filterType;
        
        return matchesSearch && matchesCategory && matchesType;
    });
    
    // Sort transactions
    filteredTransactions.sort((a, b) => {
        switch(sortBy) {
            case 'amount':
                return Math.abs(b.amount) - Math.abs(a.amount);
            case 'category':
                return a.category.localeCompare(b.category);
            case 'date':
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    const tbody = document.getElementById('transactionsTableBody');
    if (tbody) {
        tbody.innerHTML = filteredTransactions.map(transaction => `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description || '-'}</td>
                <td class="${transaction.amount > 0 ? 'text-success' : 'text-danger'} fw-semibold">
                    ${transaction.amount > 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                </td>
                <td>
                    <span class="badge ${transaction.type === 'Income' ? 'bg-success' : 'bg-danger'}">
                        ${transaction.type}
                    </span>
                </td>
                <td>
                    <div class="transaction-actions">
                        <button class="action-btn btn-delete" onclick="deleteTransaction(${transaction.id})" 
                                title="Delete transaction">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function deleteTransaction(id) {
    const deleteMessage = document.getElementById('deleteMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (deleteMessage) {
        deleteMessage.textContent = 'Are you sure you want to delete this transaction?';
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const profile = getCurrentProfile();
            profile.transactions = profile.transactions.filter(t => t.id !== id);
            
            if (confirmDeleteModal) {
                confirmDeleteModal.hide();
            }
            
            loadSection(currentSection);
            showToast('Transaction deleted successfully!', 'success');
        };
    }
    
    if (confirmDeleteModal) {
        confirmDeleteModal.show();
    } else {
        const modalEl = document.getElementById('confirmDeleteModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
}

function exportTransactions() {
    const profile = getCurrentProfile();
    const transactions = profile.transactions || [];
    const csv = [
        ['Date', 'Category', 'Description', 'Amount', 'Type'],
        ...transactions.map(t => [
            t.date,
            t.category,
            t.description,
            t.amount,
            t.type
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Transactions exported successfully!', 'success');
}

// Mobile Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar) sidebar.classList.toggle('show');
    if (overlay) overlay.classList.toggle('show');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}

function setupResponsive() {
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 992) {
                closeSidebar();
            }
        }, 250);
    });
}

// Toast Functions
function showToast(message, type = 'success') {
    const toastEl = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    const messageEl = document.getElementById(type === 'success' ? 'successMessage' : 'errorMessage');
    
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Additional Functions
function addCategory() {
    const input = document.getElementById('newCategoryInput');
    if (!input) return;
    
    const category = input.value.trim();
    
    if (category && !appData.categories.includes(category)) {
        appData.categories.push(category);
        input.value = '';
        loadSettings();
        showToast('Category added successfully!', 'success');
    }
}

function removeCategory(category) {
    const index = appData.categories.indexOf(category);
    if (index > -1 && category !== 'Other') {
        appData.categories.splice(index, 1);
        loadSettings();
        showToast('Category removed successfully!', 'success');
    }
}

function confirmDeleteProfile(profileName) {
    const deleteMessage = document.getElementById('deleteMessage');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (deleteMessage) {
        deleteMessage.textContent = `Are you sure you want to delete the "${profileName}" profile? This action cannot be undone.`;
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            delete appData.profiles[profileName];
            
            // Switch to Personal if current profile was deleted
            if (appData.currentProfile === profileName) {
                switchProfile('Personal');
            }
            
            if (confirmDeleteModal) {
                confirmDeleteModal.hide();
            }
            
            loadSettings();
            showToast('Profile deleted successfully!', 'success');
        };
    }
    
    if (confirmDeleteModal) {
        confirmDeleteModal.show();
    } else {
        const modalEl = document.getElementById('confirmDeleteModal');
        if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
        }
    }
}

// Global function assignments for onclick handlers
window.handleNavigation = handleNavigation;
window.switchProfile = switchProfile;
window.openAddExpenseModal = openAddExpenseModal;
window.saveTransaction = saveTransaction;
window.openProfileModal = openProfileModal;
window.saveProfile = saveProfile;
window.filterTransactions = filterTransactions;
window.deleteTransaction = deleteTransaction;
window.exportTransactions = exportTransactions;
window.addCategory = addCategory;
window.removeCategory = removeCategory;
window.confirmDeleteProfile = confirmDeleteProfile;
window.loadSection = loadSection;
window.showToast = showToast;