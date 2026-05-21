import React, { useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Login = () => {
  const { user, loginWithToken, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await loginWithToken(tokenResponse.access_token);
        toast.success('Bem-vindo de volta!');
      } catch (error) {
        toast.error('Erro na autenticação');
      }
    },
    onError: () => toast.error('Falha no login com Google'),
    scope: 'openid profile email https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/calendar.events',
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6 selection:bg-[#0071e3]/20">
      <div className="max-w-sm w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center">
          <div className="transition-transform hover:scale-105 duration-500 flex justify-center">
            <img src={logo} alt="X-UNY Logo" className="w-80 h-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-[#0071e3]/20 transition-all duration-300 active:scale-[0.98]"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5 brightness-0 invert"
            />
            Entrar com Google
          </button>
        </div>

        <p className="text-[11px] text-center text-[#86868b] leading-relaxed max-w-[280px] mx-auto font-medium">
          Ao continuar, você concorda com nossos <a href="#" className="text-[#0071e3] hover:underline">Termos de Uso</a> e <a href="#" className="text-[#0071e3] hover:underline">Privacidade</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
