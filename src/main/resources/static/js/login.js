// Redirect if already logged in
if (isAuthenticated()) {
    window.location.href = '/index.html';
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            saveAuthInfo(data.token, data.email, data.fullName);
            window.location.href = '/index.html';
        } else {
            showError('errorMessage', data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('errorMessage', 'An error occurred. Please check your connection and try again.');
    }
});
