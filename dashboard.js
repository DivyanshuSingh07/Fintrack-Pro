const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

if (!currentUser) {
    window.location.href = "index.html";
}
const CURRENT_USER_KEY = "currentUser";

/* ==========================================
            LOCAL STORAGE KEYS
========================================== */

const TRANSACTION_KEY = "fintrack_transactions";
const PROFILE_KEY = "fintrack_profile";
const THEME_KEY = "fintrack_theme";
const SESSION_KEY = "fintrack_session";

/* ==========================================
            APPLICATION STATE
========================================== */

let transactions = [];
let currency = "₹";
let currentFilter = "all";
let financeChart = null;

/* ==========================================
            LOAD APPLICATION
========================================== */

window.addEventListener("DOMContentLoaded", () => {

    checkSession();

    showWelcomeUser();

    loadProfile();

    loadTheme();

    loadTransactions();

    initializeModal();

    initializeForm();

    refreshUI();

});

/* ==========================================
            SESSION
========================================== */

function checkSession() {

    const session = localStorage.getItem(SESSION_KEY);

    if (!session) {

        localStorage.setItem(SESSION_KEY, "loggedIn");

    }

}

function logout() {

    if (!confirm("Logout?"))
        return;

    localStorage.removeItem(CURRENT_USER_KEY);

    window.location.href = "index.html";

}



function showWelcomeUser() {

    const welcome = document.getElementById("welcomeUser");

    if (!welcome) return;

    welcome.innerHTML = `

        <small>

            Welcome,

            <strong>${currentUser.name}</strong>

            👋

        </small>

    `;

}
/* ==========================================
            LOAD / SAVE TRANSACTIONS
========================================== */

function loadTransactions() {

    const allTransactions = JSON.parse(

        localStorage.getItem(TRANSACTION_KEY)

    ) || [];

    transactions = allTransactions.filter(

        transaction =>

            transaction.userId === currentUser.id

    );

}

function saveTransactions() {

    const allTransactions = JSON.parse(

        localStorage.getItem(TRANSACTION_KEY)

    ) || [];

    const otherUsers = allTransactions.filter(

        transaction =>

            transaction.userId !== currentUser.id

    );

    const updatedTransactions = [

        ...otherUsers,

        ...transactions

    ];

    localStorage.setItem(

        TRANSACTION_KEY,

        JSON.stringify(updatedTransactions)

    );

}

/* ==========================================
            PROFILE
========================================== */

function loadProfile() {

    const profile = JSON.parse(

        localStorage.getItem(PROFILE_KEY)

    );

    if (!profile)
        return;

    if (profile.name) {

        document.getElementById("username").value = profile.name;

    }

    if (profile.currency) {

        currency = profile.currency;

        document.getElementById("currency").value = currency;

    }

}

function saveProfile() {

    const updatedName = document
        .getElementById("username")
        .value
        .trim();

    // Update current user
    currentUser.name = updatedName;

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    // Update users array
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map(user =>
        user.id === currentUser.id
            ? { ...user, name: updatedName }
            : user
    );

    localStorage.setItem(
        "users",
        JSON.stringify(updatedUsers)
    );

    // Refresh welcome message
    showWelcomeUser();

    showToast("Profile updated successfully!");
}

/* ==========================================
            CURRENCY
========================================== */

function changeCurrency() {

    currency =

        document.getElementById("currency").value;

    saveProfile();

    refreshUI();

}

function formatCurrency(amount) {

    return currency + Number(amount).toLocaleString();

}

/* ==========================================
            MODAL
========================================== */

const modal = document.getElementById("transactionModal");

function initializeModal() {

    document

        .getElementById("openModalBtn")

        .addEventListener("click", openModal);

    window.onclick = function (event) {

        if (event.target === modal) {

            closeModal();

        }

    };

}

function openModal() {

    modal.style.display = "flex";

}

function closeModal() {

    modal.style.display = "none";

    document

        .getElementById("transactionForm")

        .reset();

}

/* ==========================================
            NAVIGATION
========================================== */

function showPage(pageId, element) {

    document

        .querySelectorAll(".page")

        .forEach(page => {

            page.classList.remove("active-page");

        });

    document

        .getElementById(pageId)

        .classList.add("active-page");

    document

        .querySelectorAll(".nav-links a")

        .forEach(link => {

            link.classList.remove("active");

        });

    element.classList.add("active");

}

/* ==========================================
            FILTERS
========================================== */

function setFilter(type, button) {

    currentFilter = type;

    document

        .querySelectorAll(".filter-btn")

        .forEach(btn =>

            btn.classList.remove("active-filter")

        );

    button.classList.add("active-filter");

    renderTable();

}




/* ==========================================
            FORM
========================================== */

function initializeForm() {

    document

        .getElementById("transactionForm")

        .addEventListener("submit", function (e) {

            e.preventDefault();

            addTransaction();

        });

}

/* ==========================================
            ADD TRANSACTION
========================================== */

function addTransaction() {

    const type =
        document.getElementById("type").value;

    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const date =
        document.getElementById("date").value;

    const category =
        document.getElementById("category").value;

    if (

        !type ||

        !description ||

        !amount ||

        !date ||

        !category

    ) {

        alert("Please fill all fields.");

        return;

    }

    const transaction = {

        id: Date.now(),

        userId: currentUser.id,

        type,

        description,

        amount,

        date,

        category

    };

    transactions.push(transaction);

    saveTransactions();

    closeModal();

    refreshUI();

}

/* ==========================================
            DELETE
========================================== */

function deleteTransaction(id) {

    if (!confirm("Delete transaction?"))
        return;

    transactions =

        transactions.filter(

            transaction =>

                transaction.id !== id

        );

    saveTransactions();

    refreshUI();

}

/* ==========================================
            CALCULATE TOTALS
========================================== */

function calculateTotals() {

    let income = 0;

    let expense = 0;

    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += transaction.amount;

        }

        else {

            expense += transaction.amount;

        }

    });

    return {

        income,

        expense,

        balance: income - expense,

        totalTransactions: transactions.length

    };

}

/* ==========================================
            UPDATE CARDS
========================================== */

function updateCards() {

    const totals = calculateTotals();

    document.getElementById("income").textContent =
        formatCurrency(totals.income);

    document.getElementById("expense").textContent =
        formatCurrency(totals.expense);

    document.getElementById("balance").textContent =
        formatCurrency(totals.balance);

    document.getElementById("transactionsCount").textContent =
        totals.totalTransactions;

}

/* ==========================================
            MASTER REFRESH
========================================== */

function refreshUI() {

    updateCards();

    renderTable();

    renderChart();

}



/* ==========================================
            RENDER TABLE
========================================== */

function renderTable() {

    const tbody = document.getElementById("transactionTable");

    tbody.innerHTML = "";

    let filteredTransactions = transactions;

    if (currentFilter === "income") {

        filteredTransactions = transactions.filter(
            transaction => transaction.type === "income"
        );

    }

    if (currentFilter === "expense") {

        filteredTransactions = transactions.filter(
            transaction => transaction.type === "expense"
        );

    }

    if (filteredTransactions.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:35px;">
                    No Transactions Found
                </td>
            </tr>
        `;

        return;

    }

    filteredTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(transaction => {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${transaction.date}</td>

                <td>${transaction.description}</td>

                <td>${transaction.category}</td>

                <td>${transaction.type}</td>

                <td class="${transaction.type === "income"
                    ? "income-text"
                    : "expense-text"}">

                    ${formatCurrency(transaction.amount)}

                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">

                        Delete

                    </button>

                </td>

            `;

            tbody.appendChild(row);

        });

}

/* ==========================================
            CHART
========================================== */

function renderChart() {

    const ctx = document
        .getElementById("financeChart")
        .getContext("2d");

    if (financeChart) {

        financeChart.destroy();

    }

    const labels = transactions.map(
        transaction => transaction.date
    );

    const incomeData = transactions.map(transaction =>
        transaction.type === "income"
            ? transaction.amount
            : 0
    );

    const expenseData = transactions.map(transaction =>
        transaction.type === "expense"
            ? transaction.amount
            : 0
    );

    financeChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [

                {

                    label: "Income",

                    data: incomeData,

                    backgroundColor: "#22c55e"

                },

                {

                    label: "Expense",

                    data: expenseData,

                    backgroundColor: "#ef4444"

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "top"

                }

            }

        }

    });

}


/* ==========================================
            DARK MODE
========================================== */

function loadTheme() {

    const theme = localStorage.getItem(THEME_KEY);

    if (theme === "dark") {

        document.body.classList.add("dark");

        document.getElementById("darkToggle").checked = true;

    }

}

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    const darkEnabled =
        document.body.classList.contains("dark");

    localStorage.setItem(

        THEME_KEY,

        darkEnabled ? "dark" : "light"

    );

}

/* ==========================================
            RESET DATA
========================================== */

function resetData() {

    const confirmed = confirm(

        "Delete ALL transactions and settings?"

    );

    if (!confirmed)
        return;

    localStorage.removeItem(TRANSACTION_KEY);

    localStorage.removeItem(PROFILE_KEY);

    localStorage.removeItem(THEME_KEY);

    transactions = [];

    currency = "₹";

    document.getElementById("username").value = "";

    document.getElementById("currency").value = "₹";

    document.body.classList.remove("dark");

    document.getElementById("darkToggle").checked = false;

    refreshUI();

    alert("All data has been reset.");

}

/* ==========================================
            OPTIONAL UTILITIES
========================================== */

function getGreeting() {

    const hour = new Date().getHours();

    if (hour < 12)
        return "Good Morning";

    if (hour < 17)
        return "Good Afternoon";

    return "Good Evening";

}

/* ==========================================
            INITIAL REFRESH
========================================== */

refreshUI();



