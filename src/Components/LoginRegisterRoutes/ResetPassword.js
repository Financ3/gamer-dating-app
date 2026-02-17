// ResetPassword component
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useHistory, Link } from 'react-router-dom';
import BackButton from '../inAppRoutes/BackButton';
import './Registration/CSS/Login.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    const { token } = useParams();
    const history = useHistory();

    useEffect(() => {
        // Validate token when component mounts
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await axios.get(`/auth/validate-token/${token}`);
            if (response.data.valid) {
                setTokenValid(true);
            } else {
                setError(response.data.message);
                setTokenValid(false);
            }
        } catch (err) {
            console.error("Error validating token:", err);
            setError("Invalid or expired reset link");
            setTokenValid(false);
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async () => {
        setError("");

        // Validation
        if (!newPassword || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await axios.post('/auth/reset-password', {
                token,
                newPassword
            });

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                history.push('/login');
            }, 3000);
        } catch (err) {
            console.error("Error resetting password:", err);
            setError(err.response?.data || "An error occurred. Please try again.");
        }
    };

    // Show loading state while validating token
    if (validating) {
        return (
            <div className="login-view-wrapper-container">
                <div className="login-view-border">
                    <div className="login-view-logo-container">
                        <img className="login-view-logo" src="/logo_style_3.png" alt="Main OneUp Logo" />
                    </div>
                    <div className="login-view-login-details-container">
                        <p style={{ textAlign: 'center' }}>Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if token is invalid
    if (!tokenValid) {
        return (
            <div className="login-view-wrapper-container">
                <div className="login-view-border">
                    <BackButton />
                    <div className="login-view-logo-container">
                        <img className="login-view-logo" src="/logo_style_3.png" alt="Main OneUp Logo" />
                    </div>
                    <div className="login-view-login-details-container">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>Invalid Reset Link</h2>
                            <p style={{ marginBottom: '20px' }}>{error}</p>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                Reset links expire after 1 hour. Please request a new one.
                            </p>
                            <Link to="/forgot-password">
                                <button className="login-view-login-details-login-button">
                                    Request New Link
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-view-wrapper-container">
            <div className="login-view-border">
                <BackButton />

                <div className="login-view-logo-container">
                    <img className="login-view-logo" src="/logo_style_3.png" alt="Main OneUp Logo" />
                </div>

                {!success ? (
                    <div className="login-view-login-details-container">
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reset Your Password</h2>
                        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
                            Enter your new password below.
                        </p>

                        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                        <div className="login-view-login-details-password-container">
                            <p className="text-area">New Password:</p>
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="login-view-login-details-password-container">
                            <p className="text-area">Confirm Password:</p>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="login-view-login-details-login-button-container">
                            <button
                                className="login-view-login-details-login-button"
                                onClick={handleSubmit}
                            >
                                Reset Password
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/login" style={{ color: '#4a90e2', textDecoration: 'none' }}>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="login-view-login-details-container">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>Password Reset Successful!</h2>
                            <p style={{ marginBottom: '20px' }}>
                                Your password has been successfully reset.
                            </p>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                Redirecting to login page...
                            </p>
                            <Link to="/login">
                                <button className="login-view-login-details-login-button">
                                    Go to Login
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
