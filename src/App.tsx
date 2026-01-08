
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { useEffect } from 'react';
import { getMyInfo } from './services/api';

function App() {
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await getMyInfo();
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('accessToken');
          window.location.reload();
        }
      }
    };

    checkToken();
  }, []);

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
