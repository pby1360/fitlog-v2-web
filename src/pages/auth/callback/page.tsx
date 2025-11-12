import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens (e.g., in localStorage)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect to the dashboard or home page
      navigate('/dashboard');
    } else {
      // Handle error case, maybe redirect to login page with an error message
      navigate('/'); // Or a login page
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Logging you in...</p>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
      </div>
    </div>
  );
}
