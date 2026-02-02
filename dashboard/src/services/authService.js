const BASE_URL = import.meta.env.VITE_AUTH_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/auth';

const getHeaders = () => {
    const savedUser = localStorage.getItem('velora_admin_user');
    const token = savedUser ? JSON.parse(savedUser).token : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const authService = {
    updatePassword: async (currentPassword, newPassword, confirmPassword) => {
        const response = await fetch(`${BASE_URL}/update-password`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update password');
        }
        return response.json();
    }
};
