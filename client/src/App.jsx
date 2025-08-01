import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import MyPresentations from './pages/MyPresentations';
import Presentation from './pages/Presentation';

export default function App() {

  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const location = useLocation();

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
  }, [location]);


  return (
    <div>
        <Routes>
          <Route path="/" element={<Navigate to={userId ? "/presentations" : "/login"} />} />
          <Route
            path="/login"
            element={userId ? <Navigate to="/presentations" /> : <Login />}
          />
          <Route
            path="/presentations"
            element={userId ? <MyPresentations /> : <Navigate to="/login" />}
          />
          <Route
            path="/presentation/:presentationId"
            element={userId ? <Presentation /> : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to={userId ? "/presentations" : "/login"} />} />
        </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
