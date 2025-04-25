import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // In a real app, this would make an API call
      // For this demo, we'll simulate a successful login
      setTimeout(() => {
        // Mock successful login
        if (email === 'demo@example.com' && password === 'password123') {
          // Store token in localStorage
          localStorage.setItem('token', 'mock-jwt-token');
          // Redirect to dashboard
          navigate('/');
        } else {
          setError('Invalid credentials');
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Sign In</h1>
      <p className="lead">
        Sign in to your account to access your personalized cognitive training
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-block" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="form-hint">
          <p>
            For demo purposes, use:
            <br />
            Email: demo@example.com
            <br />
            Password: password123
          </p>
        </div>
      </div>

      <p className="mt-3">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login; 