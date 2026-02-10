// Authentication utility functions
const API_BASE_URL = 'http://localhost:8080/api';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Get user info
function getUserInfo() {
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');
    return { email: userEmail, fullName: userFullName };
}

// Save auth info
function saveAuthInfo(token, email, fullName) {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userFullName', fullName);
}

// Clear auth info
function clearAuthInfo() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    clearAuthInfo();
    window.location.href = '/login.html';
}

// Setup logout button
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Display user greeting
if (document.getElementById('userGreeting')) {
    const userInfo = getUserInfo();
    if (userInfo.fullName) {
        document.getElementById('userGreeting').textContent = `Hello, ${userInfo.fullName}`;
    }
}

// Fetch with authentication
async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            clearAuthInfo();
            window.location.href = '/login.html';
            return null;
        }

        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        setTimeout(() => {
            errorElement.classList.remove('show');
        }, 5000);
    }
}

// Show success message (you can create a success message element in HTML if needed)
function showSuccess(message) {
    alert(message);
}
