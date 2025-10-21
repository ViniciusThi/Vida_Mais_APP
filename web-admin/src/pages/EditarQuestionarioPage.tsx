import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { questionarioService } from '../services/questionarioService';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function EditarQuestionarioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPerguntaModal, setShowPerguntaModal] = useState(false);
  
  const { register, handleSubmit, reset, watch } = useForm();
  const tipoPergunta = watch('tipo');

  const { data: questionario } = useQuery({
    queryKey: ['questionario', id],
    queryFn: () => questionarioService.getQuestionario(id!)
  });

  const createPerguntaMutation = useMutation({
    mutationFn: questionarioService.createPergunta,
    onSuccess: () => {
      toast.success('Pergunta adicionada!');
      queryClient.invalidateQueries({ queryKey: ['questionario', id] });
      setShowPerguntaModal(false);
      reset();
    }
  });

  const deletePerguntaMutation = useMutation({
    mutationFn: questionarioService.deletePergunta,
    onSuccess: () => {
      toast.success('Pergunta removida!');
      queryClient.invalidateQueries({ queryKey: ['questionario', id] });
    }
  });

  const onSubmitPergunta = (data: any) => {
    const opcoes = data.opcoes ? data.opcoes.split(',').map((o: string) => o.trim()) : undefined;
    
    createPerguntaMutation.mutate({
      questionarioId: id,
      ordem: (questionario?.perguntas?.length || 0) + 1,
      tipo: data.tipo,
      enunciado: data.enunciado,
      obrigatoria: data.obrigatoria === 'true',
      opcoes
    });
  };

  if (!questionario) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={() => navigate('/questionarios')} className="btn-secondary mb-6">
        <ArrowLeft size={20} className="inline mr-2" />
        Voltar
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{questionario.titulo}</h1>

      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Perguntas</h2>
          <button onClick={() => setShowPerguntaModal(true)} className="btn-primary">
            <Plus size={20} className="inline mr-2" />
            Adicionar Pergunta
          </button>
        </div>

        {questionario.perguntas?.length > 0 ? (
          <div className="space-y-3">
            {questionario.perguntas.map((p: any, idx: number) => (
              <div key={p.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {idx + 1}. {p.enunciado}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tipo: {p.tipo} {p.obrigatoria && '· Obrigatória'}
                  </p>
                </div>
                <button
                  onClick={() => deletePerguntaMutation.mutate(p.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhuma pergunta adicionada ainda.</p>
        )}
      </div>

      {/* Modal Adicionar Pergunta */}
      {showPerguntaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Nova Pergunta</h2>
            
            <form onSubmit={handleSubmit(onSubmitPergunta)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enunciado</label>
                <textarea
                  {...register('enunciado', { required: true })}
                  className="input"
                  rows={2}
                  placeholder="Digite a pergunta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select {...register('tipo', { required: true })} className="input">
                  <option value="TEXTO">Texto livre</option>
                  <option value="UNICA">Escolha única</option>
                  <option value="MULTIPLA">Múltipla escolha</option>
                  <option value="ESCALA">Escala (1-5)</option>
                  <option value="BOOLEAN">Sim/Não</option>
                </select>
              </div>

              {['UNICA', 'MULTIPLA'].includes(tipoPergunta) && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Opções (separadas por vírgula)
                  </label>
                  <input
                    {...register('opcoes', { required: true })}
                    className="input"
                    placeholder="Ótimo, Bom, Regular, Ruim"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Obrigatória?</label>
                <select {...register('obrigatoria')} className="input" defaultValue="true">
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPerguntaModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

