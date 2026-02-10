// Redirect if already logged in
if (isAuthenticated()) {
    window.location.href = '/index.html';
}

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate password match
    if (password !== confirmPassword) {
        showError('errorMessage', 'Passwords do not match');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        showError('errorMessage', 'Password must be at least 6 characters long');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            saveAuthInfo(data.token, data.email, data.fullName);
            window.location.href = '/index.html';
        } else {
            showError('errorMessage', data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('errorMessage', 'An error occurred. Please check your connection and try again.');
    }
});
