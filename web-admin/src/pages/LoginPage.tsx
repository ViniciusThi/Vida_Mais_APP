import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { LogIn } from 'lucide-react';
import logoVidaMais from '../assets/Logo_VidaMais.png';

interface LoginForm {
  emailOuTelefone: string;
  senha: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login({
        emailOuTelefone: data.emailOuTelefone,
        senha: data.senha
      });
      setAuth(response.token, response.user);
      toast.success(`Bem-vindo, ${response.user.nome}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={logoVidaMais} 
              alt="Logo Vida Mais" 
              className="h-24 w-auto object-contain"
              onError={(e) => {
                // Fallback se a logo não carregar
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-lg">
              <span className="text-4xl font-bold text-white">V+</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vida Mais</h1>
          <p className="text-gray-600 mt-2">Centro do Idoso</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email ou Telefone
            </label>
            <input
              {...register('emailOuTelefone', { 
                required: 'Email ou telefone é obrigatório'
              })}
              type="text"
              className="input"
              placeholder="seu@email.com ou (11) 99999-9999"
            />
            {errors.emailOuTelefone && (
              <p className="mt-1 text-sm text-red-600">{errors.emailOuTelefone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              {...register('senha', { 
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter no mínimo 6 caracteres'
                }
              })}
              type="password"
              className="input"
              placeholder="••••••"
            />
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Novo associado?{' '}
            <Link to="/cadastro" className="text-primary-600 hover:text-primary-700 font-medium">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

