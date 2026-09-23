import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Scale size={24} />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {isSubmitted 
              ? "We've sent you instructions" 
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {isSubmitted ? (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <CheckCircle2 size={64} color="var(--success-color)" style={{ margin: '0 auto 1rem' }} />
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary btn-block" style={{ display: 'inline-block' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Send Reset Link
            </button>
            
            <div className="auth-footer">
              Remember your password? <Link to="/login">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
