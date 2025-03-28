import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import openEyeIcon from '../../../../../assets/icons/open-eye.svg';
import closedEyeIcon from '../../../../../assets/icons/closed-eye.svg';

function LoginForm({ setForm, form, setIsLoggedIn, setLoginResponse }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/clarion_users/login/', {
                email: form.email,
                password: form.password
            });

            setLoginResponse(response.data);
            setIsLoggedIn(true);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h1 className="text-2xl font-semibold mb-2">Login</h1>
            <p className="text-gray-600 mb-8">Enter the Login credentials to your M-Clarion account</p>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        placeholder="Enter email address"
                        className="w-full p-4 rounded-lg outline-button-pink border border-[#666]"
                        value={form.email}
                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="w-full p-4 rounded-lg outline-button-pink border border-[#666]"
                            value={form.password}
                            onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <img 
                                src={showPassword ? openEyeIcon : closedEyeIcon} 
                                alt={showPassword ? "Hide password" : "Show password"}
                                className="w-6 h-6"
                            />
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <Link to="/forgot-password" className="text-pink-600 hover:text-pink-700">
                        Forgot your password?
                    </Link>
                </div>

                <button
                    type="submit"
                    className="w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
