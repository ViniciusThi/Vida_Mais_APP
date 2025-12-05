import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

export default function CadastroPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const senha = watch('senha');

  const cadastroMutation = useMutation({
    mutationFn: authService.cadastro,
    onSuccess: () => {
      toast.success('Cadastro realizado com sucesso! Faça login.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Associado
          </h1>
          <p className="text-gray-600">
            Forms Tech - Sistema de Pesquisas
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              {...register('nome', { 
                required: 'Nome é obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              className="input"
              placeholder="Seu nome completo"
            />
            {errors.nome && (
              <p className="text-red-600 text-sm mt-1">{errors.nome.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idade *
            </label>
            <input
              {...register('idade', { 
                required: 'Idade é obrigatória',
                min: { value: 60, message: 'Idade mínima: 60 anos' }
              })}
              type="number"
              min="60"
              className="input"
              placeholder="Sua idade"
            />
            {errors.idade && (
              <p className="text-red-600 text-sm mt-1">{errors.idade.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="input"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone *
            </label>
            <input
              {...register('telefone', { 
                required: 'Telefone é obrigatório',
                minLength: { value: 10, message: 'Telefone inválido' }
              })}
              type="tel"
              className="input"
              placeholder="(11) 99999-9999"
            />
            {errors.telefone && (
              <p className="text-red-600 text-sm mt-1">{errors.telefone.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deficiência (opcional)
            </label>
            <input
              {...register('deficiencia')}
              className="input"
              placeholder="Ex: Auditiva, Visual, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              {...register('senha', { 
                required: 'Senha é obrigatória',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
              type="password"
              className="input"
              placeholder="Mínimo 6 caracteres"
            />
            {errors.senha && (
              <p className="text-red-600 text-sm mt-1">{errors.senha.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </label>
            <input
              {...register('confirmarSenha', { 
                required: 'Confirmação de senha é obrigatória',
                validate: (value) => value === senha || 'As senhas não coincidem'
              })}
              type="password"
              className="input"
              placeholder="Digite a senha novamente"
            />
            {errors.confirmarSenha && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmarSenha.message as string}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={cadastroMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {cadastroMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem cadastro?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

