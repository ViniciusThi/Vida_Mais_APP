import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { questionarioService } from '../services/questionarioService';
import { ArrowLeft } from 'lucide-react';

export default function CriarQuestionarioPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const visibilidade = watch('visibilidade');

  const { data: turmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: questionarioService.getMinhasTurmas
  });

  const createMutation = useMutation({
    mutationFn: questionarioService.createQuestionario,
    onSuccess: (data) => {
      toast.success('Questionário criado! Agora adicione as perguntas.');
      navigate(`/questionarios/${data.id}/editar`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar questionário');
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6">
        <ArrowLeft size={20} className="inline mr-2" />
        Voltar
      </button>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Novo Questionário</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              {...register('titulo', { required: true })}
              className="input"
              placeholder="Ex: Pesquisa de Satisfação 2025"
            />
            {errors.titulo && <span className="text-red-600 text-sm">Obrigatório</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
            <textarea
              {...register('descricao')}
              className="input"
              rows={3}
              placeholder="Descreva o objetivo do questionário..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibilidade</label>
            <select {...register('visibilidade', { required: true })} className="input">
              <option value="TURMA">Turma específica</option>
              <option value="GLOBAL">Global (todas as turmas)</option>
            </select>
          </div>

          {visibilidade === 'TURMA' && (
            <div>
              <label className="block text-sm font-medium mb-1">Turma</label>
              <select {...register('turmaId', { required: true })} className="input">
                <option value="">Selecione...</option>
                {turmas?.map((turma: any) => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </select>
              {errors.turmaId && <span className="text-red-600 text-sm">Obrigatório</span>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início (opcional)</label>
              <input {...register('periodoInicio')} type="datetime-local" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim (opcional)</label>
              <input {...register('periodoFim')} type="datetime-local" className="input" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            Criar Questionário
          </button>
        </form>
      </div>
    </div>
  );
}

