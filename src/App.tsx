import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from './router';
import { useEffect, useState } from 'react';
import { getMyInfo } from './services/api';
import { setNavigator } from './utils/navigationService';

const AppNavigator = () => {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  return <AppRoutes />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await getMyInfo();
        } catch (error) {
          console.error('Token validation failed:', error);
        }
      }
    };

    checkToken().finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <div className="min-h-screen bg-gray-50">
        <AppNavigator />
      </div>
    </BrowserRouter>
  );
}

export default App;
