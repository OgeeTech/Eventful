const API_URL = 'http://localhost:5000/api';

// --- Auth Functions ---

async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.json();
}

// Helper to get Token
function getToken() {
    return localStorage.getItem('token');
}

// Helper to logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// Check if user is logged in
function checkAuth() {
    if (!getToken()) {
        window.location.href = 'login.html';
    }
}