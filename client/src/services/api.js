import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const createPresentation = async (title) => {
  const userId = localStorage.getItem('userId');
  const res = await axios.post(`${API_URL}/api/presentations`, { title, owner: userId });
  return res.data;
};

export const joinPresentation = async (id) => {
  const userId = localStorage.getItem('userId');
  const res = await axios.post(
    `${API_URL}/api/presentations/${id}/participants`,
    { userId }
  )
  return res.data;
};

export const getUserPresentations = async () => {
  const userId = localStorage.getItem('userId');
  const res = await axios.get(`${API_URL}/api/presentations/user/${userId}`);
  return res.data;
};

export const loginUser = async (nickname) => {
  const res = await axios.post(`${API_URL}/api/users/login`, { nickname });
  return res.data;
};

