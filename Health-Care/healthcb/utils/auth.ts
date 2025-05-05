import axios from 'axios';
import { getCsrfToken } from './csrf';

interface LoginCredentials {
    username: string;
    password: string;
}

interface LoginResponse {
    data: {
        status: string;
        message: string;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    }
}

async function login(credentials: LoginCredentials) {
    try {
        const response = await axios.post<LoginResponse>(
            '/api/login/',
            credentials,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                withCredentials: true,
            }
        );
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
        throw error;
    }
}

async function logout() {
    try {
        await axios.post(
            '/api/logout/',
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
                withCredentials: true,
            }
        );
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Logout failed');
        }
        throw error;
    }
}

export { login, logout };