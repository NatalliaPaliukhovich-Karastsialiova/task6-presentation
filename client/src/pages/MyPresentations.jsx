import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoader } from '../context/LoaderContext';
import { getUserPresentations} from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreatePresentationModal from '../components/CreatePresentationModal';
import JoinPresentationModal from '../components/JoinPresentationModal';
import { toast } from 'react-toastify';

export default function MyPresentations() {
  const [presentations, setPresentations] = useState([]);
  const nickname = localStorage.getItem('nickname');
  const navigate = useNavigate();
  const { setLoading } = useLoader();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getUserPresentations();
        setPresentations(res);
      } catch (err) {
        toast.error(err.message || 'Failed to load presentations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nickname');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar navbar-light px-4 shadow-sm" style={{backgroundColor: 'gray'}}>
        <span className="navbar-brand h1">PresentShare</span>
        <div className="d-flex align-items-center">
          <span className="h5 me-3">Hello, {nickname}</span>
          <button className="btn btn-outline-light btn-lg" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="m-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Your Presentations</h3>
          <div className="d-flex align-items-center mb-3">
            <CreatePresentationModal
              onCreated={(newPresentation) => {
              setPresentations((prev) => [...prev, newPresentation]);
            }} />
            <JoinPresentationModal onCreated={(newPresentation) => {
              setPresentations((prev) => [...prev, newPresentation]);
            }} />
          </div>
        </div>

        <table className="table table-hover align-middle shadow-sm">
          <thead className="table-light">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Owner</th>
              <th scope="col" className='w-25'>Modified at</th>
              <th scope="col" className='w-25'>Created at</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {presentations.map((p) => (
              <tr key={p._id} onClick={() => navigate(`/presentation/${p._id}`)} style={{ cursor: 'pointer' }}>
                <td className="fw-semibold">{p.title}</td>
                <td>{p.owner}</td>
                <td className='w-25'>{new Date(p.updatedAt).toLocaleString()}</td>
                <td className='w-25'>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
