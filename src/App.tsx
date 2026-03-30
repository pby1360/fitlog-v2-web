import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRoutes } from './router';
import { useEffect, useState } from 'react';
import { getMyInfo } from './services/api';
import { setNavigator } from './utils/navigationService';
import { ThemeProvider } from './contexts/ThemeContext';

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
    <ThemeProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppNavigator />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
