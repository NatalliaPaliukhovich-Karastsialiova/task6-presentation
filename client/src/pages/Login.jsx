import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

export default function Login() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return alert('Please enter a nickname');
    const res = await loginUser(nickname);
    localStorage.setItem('userId', res._id);
    localStorage.setItem('nickname', res.nickname);
    navigate('/presentations');
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center">
      <div className="text-center bg-white p-5 rounded-3 shadow-lg">
        <h1 className="fw-bold display-4 mb-3">PresentShare</h1>
        <p className="text-muted fs-5 mb-4">
          Enter your nickname to continue to your presentations.
        </p>
        <form onSubmit={handleLogin} className="d-flex flex-column align-items-center">
          <div className="mb-3 w-100" style={{ maxWidth: '300px' }}>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-lg px-4 w-100" style={{backgroundColor: 'gray', maxWidth: '300px'}}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
