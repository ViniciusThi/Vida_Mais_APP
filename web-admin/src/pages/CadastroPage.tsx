import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import logoVidaMais from '../../assets/Logo_Vidamais.png';

export default function CadastroPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const senha = watch('senha');

  const cadastroMutation = useMutation({
    mutationFn: authService.cadastro,
    onSuccess: () => {
      toast.success('Cadastro realizado com sucesso! Faça seu login.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar');
    }
  });

  const onSubmit = (data: any) => {
    cadastroMutation.mutate({
      nome: data.nome,
      idade: Number(data.idade),
      email: data.email,
      telefone: data.telefone,
      deficiencia: data.deficiencia || undefined,
      senha: data.senha
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoVidaMais} alt="Logo Vida Mais" className="h-24 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Associado
          </h1>
          <p className="text-gray-500 text-lg">
            Vida Mais — Sistema de Pesquisas
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Nome Completo *
            </label>
            <input
              {...register('nome', {
                required: 'Nome é obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              className="input text-lg py-4"
              placeholder="Seu nome completo"
            />
            {errors.nome && (
              <p className="text-red-600 text-base mt-1 font-medium">{errors.nome.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Idade *
            </label>
            <input
              {...register('idade', {
                required: 'Idade é obrigatória',
                min: { value: 60, message: 'Idade mínima: 60 anos' }
              })}
              type="number"
              min="60"
              className="input text-lg py-4"
              placeholder="Sua idade (mínimo 60 anos)"
            />
            {errors.idade && (
              <p className="text-red-600 text-base mt-1 font-medium">{errors.idade.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Email *
            </label>
            <input
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              type="email"
              className="input text-lg py-4"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-red-600 text-base mt-1 font-medium">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Telefone *
            </label>
            <input
              {...register('telefone', {
                required: 'Telefone é obrigatório',
                minLength: { value: 10, message: 'Telefone inválido' }
              })}
              type="tel"
              className="input text-lg py-4"
              placeholder="(11) 99999-9999"
            />
            {errors.telefone && (
              <p className="text-red-600 text-base mt-1 font-medium">{errors.telefone.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Deficiência <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <input
              {...register('deficiencia')}
              className="input text-lg py-4"
              placeholder="Ex: Auditiva, Visual, etc."
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Senha *
            </label>
            <input
              {...register('senha', {
                required: 'Senha é obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
              type="password"
              className="input text-lg py-4"
              placeholder="Mínimo 6 caracteres"
            />
            {errors.senha && (
              <p className="text-red-600 text-base mt-1 font-medium">{errors.senha.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-2">
              Confirmar Senha *
            </label>
            <input
              {...register('confirmarSenha', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) => value === senha || 'As senhas não coincidem'
              })}
              type="password"
              className="input text-lg py-4"
              placeholder="Digite a senha novamente"
            />
            {errors.confirmarSenha && (
              <p className="text-red-600 text-base mt-1 font-medium">{errors.confirmarSenha.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={cadastroMutation.isPending}
            className="btn-primary w-full text-xl py-4 mt-2"
          >
            {cadastroMutation.isPending ? 'Cadastrando...' : '✓ Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-lg">
            Já tem cadastro?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

