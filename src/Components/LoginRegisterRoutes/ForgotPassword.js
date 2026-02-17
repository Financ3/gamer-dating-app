// ForgotPassword component
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BackButton from '../inAppRoutes/BackButton';
import './Registration/CSS/Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        try {
            await axios.post('/auth/request-reset', { email });
            setSubmitted(true);
        } catch (err) {
            console.error("Error requesting password reset:", err);
            setError("An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-view-wrapper-container">
            <div className="login-view-border">
                <BackButton />

                <div className="login-view-logo-container">
                    <img className="login-view-logo" src="logo_style_3.png" alt="Main OneUp Logo" />
                </div>

                {!submitted ? (
                    <div className="login-view-login-details-container">
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password?</h2>
                        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

                        <div className="login-view-login-details-email-container">
                            <p className="text-area">Email:</p>
                            <input
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="login-view-login-details-login-button-container">
                            <button
                                className="login-view-login-details-login-button"
                                onClick={handleSubmit}
                            >
                                Send Reset Link
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
                            <h2 style={{ color: '#4a90e2', marginBottom: '20px' }}>Check Your Email</h2>
                            <p style={{ marginBottom: '20px' }}>
                                If an account with that email exists, we've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                The link will expire in 1 hour.
                            </p>
                            <Link to="/login">
                                <button className="login-view-login-details-login-button">
                                    Return to Login
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
