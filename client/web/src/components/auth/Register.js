import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('密码不匹配');
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would make an API call
      // For this demo, we'll simulate a successful registration
      setTimeout(() => {
        // Mock successful registration
        // Store token in localStorage
        localStorage.setItem('token', 'mock-jwt-token');
        // Redirect to dashboard
        navigate('/');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('注册失败。请重试。');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>注册</h1>
      <p className="lead">
        创建您的账户以访问个性化认知训练
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">电子邮箱</label>
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
            <label htmlFor="password">密码</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-block" 
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
      </div>

      <p className="mt-3">
        已有账户？ <Link to="/login">登录</Link>
      </p>
    </div>
  );
};

export default Register; 