import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { questionarioService } from '../services/questionarioService';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

type Modo = 'TEMPLATE' | 'MANUAL';

export default function CriarQuestionarioPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>('TEMPLATE');
  const [templateSelecionado, setTemplateSelecionado] = useState<any>(null);
  
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: {
      visibilidade: 'GLOBAL',
      ano: new Date().getFullYear()
    }
  });
  const visibilidade = watch('visibilidade');

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: questionarioService.getTemplates
  });

  const { data: turmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: questionarioService.getMinhasTurmas
  });

  const criarDeTemplateMutation = useMutation({
    mutationFn: questionarioService.criarDeTemplate,
    onSuccess: () => {
      toast.success('Questionário criado com sucesso!');
      navigate('/questionarios');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar questionário');
    }
  });

  const criarManualMutation = useMutation({
    mutationFn: questionarioService.createQuestionario,
    onSuccess: (data) => {
      toast.success('Questionário criado! Agora adicione as perguntas.');
      navigate(`/questionarios/${data.id}/editar`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar questionário');
    }
  });

  const handleSelecionarTemplate = (template: any) => {
    setTemplateSelecionado(template);
    setValue('titulo', `${template.nome} ${new Date().getFullYear()}`);
    setValue('descricao', template.descricao);
  };

  const onSubmit = (data: any) => {
    if (modo === 'TEMPLATE') {
      if (!templateSelecionado) {
        toast.error('Selecione um template');
        return;
      }

      criarDeTemplateMutation.mutate({
        templateId: templateSelecionado.id,
        titulo: data.titulo,
        descricao: data.descricao,
        ano: Number(data.ano),
        visibilidade: data.visibilidade,
        turmaId: data.visibilidade === 'TURMA' ? data.turmaId : undefined
      });
    } else {
      criarManualMutation.mutate(data);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-secondary mb-4 sm:mb-6">
        <ArrowLeft size={20} className="inline mr-2" />
        Voltar
      </button>

      <div className="max-w-4xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          Novo Questionário
        </h1>

        {/* Seletor de Modo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setModo('TEMPLATE');
              setTemplateSelecionado(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              modo === 'TEMPLATE'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold">Usar Template</div>
            <div className="text-sm opacity-80">Perguntas pré-configuradas</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setModo('MANUAL');
              setTemplateSelecionado(null);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              modo === 'MANUAL'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-3xl mb-2">✏️</div>
            <div className="font-semibold">Criar do Zero</div>
            <div className="text-sm opacity-80">Adicionar perguntas manualmente</div>
          </button>
        </div>

        {/* Templates */}
        {modo === 'TEMPLATE' && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Escolha um Template</h2>
            {loadingTemplates ? (
              <p className="text-gray-600">Carregando templates...</p>
            ) : (
              <div className="space-y-3">
                {templates?.templates?.map((template: any) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelecionarTemplate(template)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-start gap-4 ${
                      templateSelecionado?.id === template.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                      📝
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{template.nome}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.descricao}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {template.totalPerguntas} perguntas pré-configuradas
                      </p>
                    </div>
                    {templateSelecionado?.id === template.id && (
                      <CheckCircle2 size={24} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <h2 className="text-xl font-bold">Informações do Questionário</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              {...register('titulo', { required: true })}
              className="input"
              placeholder="Ex: Pesquisa de Satisfação 2025"
            />
            {errors.titulo && <span className="text-red-600 text-sm">Campo obrigatório</span>}
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

          {modo === 'TEMPLATE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Ano *</label>
              <input
                {...register('ano', { required: true, valueAsNumber: true })}
                type="number"
                min="2020"
                max="2100"
                className="input"
                placeholder="2025"
              />
              {errors.ano && <span className="text-red-600 text-sm">Campo obrigatório</span>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Visibilidade *</label>
            <select {...register('visibilidade', { required: true })} className="input">
              <option value="GLOBAL">🌍 Global (todos os associados)</option>
              <option value="TURMA">🎓 Turma específica</option>
            </select>
          </div>

          {visibilidade === 'TURMA' && (
            <div>
              <label className="block text-sm font-medium mb-1">Turma *</label>
              <select {...register('turmaId', { required: true })} className="input">
                <option value="">Selecione uma turma...</option>
                {turmas?.map((turma: any) => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </select>
              {errors.turmaId && <span className="text-red-600 text-sm">Campo obrigatório</span>}
            </div>
          )}

          {modo === 'MANUAL' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Início (opcional)</label>
                <input {...register('periodoInicio')} type="datetime-local" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fim (opcional)</label>
                <input {...register('periodoFim')} type="datetime-local" className="input" />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full"
            disabled={criarDeTemplateMutation.isPending || criarManualMutation.isPending}
          >
            {criarDeTemplateMutation.isPending || criarManualMutation.isPending 
              ? '⏳ Criando...' 
              : '✓ Criar Questionário'}
          </button>

          {modo === 'MANUAL' && (
            <p className="text-sm text-gray-600 text-center">
              Após criar, você poderá adicionar perguntas na próxima tela
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
