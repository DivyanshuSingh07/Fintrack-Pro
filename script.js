/* ==========================================
            LOCAL STORAGE KEYS
========================================== */

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

/* ==========================================
        AUTO LOGIN IF SESSION EXISTS
========================================== */

const loggedUser = JSON.parse(
    localStorage.getItem(CURRENT_USER_KEY)
);

if (loggedUser) {

    window.location.href = "dashboard.html";

}

/* ==========================================
            FORM SWITCHING
========================================== */

function showRegister() {

    document.getElementById("loginBox").style.display = "none";

    document.getElementById("registerBox").style.display = "block";

}

function showLogin() {

    document.getElementById("registerBox").style.display = "none";

    document.getElementById("loginBox").style.display = "block";

}

/* ==========================================
            PASSWORD TOGGLE
========================================== */

function togglePassword(inputId, icon) {

    const input = document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";

        icon.textContent = "🙈";

    }

    else {

        input.type = "password";

        icon.textContent = "👁";

    }

}

/* ==========================================
            EMAIL VALIDATION
========================================== */

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

/* ==========================================
        PASSWORD STRENGTH
========================================== */

const passwordInput = document.getElementById("registerPassword");

const strengthFill = document.querySelector(".strength-bar div");

passwordInput.addEventListener("input", updateStrength);

function updateStrength() {

    const password = passwordInput.value;

    let score = 0;

    if (password.length >= 8)
        score++;

    if (/[A-Z]/.test(password))
        score++;

    if (/[0-9]/.test(password))
        score++;

    if (/[^A-Za-z0-9]/.test(password))
        score++;

    switch (score) {

        case 1:

            strengthFill.style.width = "25%";

            strengthFill.style.background = "#ef4444";

            break;

        case 2:

            strengthFill.style.width = "50%";

            strengthFill.style.background = "#f59e0b";

            break;

        case 3:

            strengthFill.style.width = "75%";

            strengthFill.style.background = "#3b82f6";

            break;

        case 4:

            strengthFill.style.width = "100%";

            strengthFill.style.background = "#22c55e";

            break;

        default:

            strengthFill.style.width = "0";

    }

}

/* ==========================================
            REGISTER
========================================== */

function register() {

    const name = document.getElementById("registerName").value.trim();

    const email = document.getElementById("registerEmail").value.trim();

    const password = document.getElementById("registerPassword").value;

    const confirm = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirm) {

        alert("Please fill all fields.");

        return;

    }

    if (!validEmail(email)) {

        alert("Enter a valid email.");

        return;

    }

    if (password.length < 8) {

        alert("Password should be at least 8 characters.");

        return;

    }

    if (password !== confirm) {

        alert("Passwords do not match.");

        return;

    }

    const users = JSON.parse(

        localStorage.getItem(USERS_KEY)

    ) || [];

    const exists = users.find(

        user => user.email === email

    );

    if (exists) {

        alert("Email already registered.");

        return;

    }

    const user = {

        id: Date.now(),

        name,

        email,

        password,

        currency: "₹",

        theme: "light"

    };

    users.push(user);

    localStorage.setItem(

        USERS_KEY,

        JSON.stringify(users)

    );

    localStorage.setItem(

        CURRENT_USER_KEY,

        JSON.stringify(user)

    );

    alert("Registration Successful!");

    window.location.href = "dashboard.html";

}

/* ==========================================
            LOGIN
========================================== */

function login() {

    const email = document.getElementById("loginEmail").value.trim();

    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {

        alert("Enter email and password.");

        return;

    }

    const users = JSON.parse(

        localStorage.getItem(USERS_KEY)

    ) || [];

    const user = users.find(

        user =>

            user.email === email &&

            user.password === password

    );

    if (!user) {

        alert("Invalid email or password.");

        return;

    }

    localStorage.setItem(

        CURRENT_USER_KEY,

        JSON.stringify(user)

    );

    window.location.href = "dashboard.html";

}