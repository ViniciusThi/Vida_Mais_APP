import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { alunoService } from '../services/alunoService';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResponderQuestionarioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [respostas, setRespostas] = useState<Record<string, any>>({});

  const { data: questionario, isLoading } = useQuery({
    queryKey: ['questionario', id],
    queryFn: () => alunoService.getQuestionario(id!)
  });

  const { data: turmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: alunoService.getMinhasTurmas
  });

  const enviarMutation = useMutation({
    mutationFn: alunoService.enviarRespostas,
    onSuccess: () => {
      toast.success('✅ Questionário respondido com sucesso!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao enviar respostas');
    }
  });

  const handleResposta = (perguntaId: string, tipo: string, valor: any) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: { tipo, valor }
    }));
  };

  const handleSubmit = () => {
    if (!questionario || !turmas || turmas.length === 0) return;

    const perguntas = questionario.perguntas;
    const obrigatorias = perguntas.filter((p: any) => p.obrigatoria);
    const respondidas = Object.keys(respostas);

    const faltantes = obrigatorias.filter((p: any) => !respondidas.includes(p.id));

    if (faltantes.length > 0) {
      toast.error(`Por favor, responda todas as perguntas obrigatórias`);
      return;
    }

    const payload = {
      questionarioId: id!,
      turmaId: turmas[0].id,
      respostas: Object.entries(respostas).map(([perguntaId, resp]) => {
        const resposta: any = { perguntaId };
        
        switch (resp.tipo) {
          case 'TEXTO':
            resposta.valorTexto = resp.valor;
            break;
          case 'ESCALA':
            resposta.valorNum = Number(resp.valor);
            break;
          case 'BOOLEAN':
            resposta.valorBool = resp.valor === 'true';
            break;
          case 'UNICA':
          case 'MULTIPLA':
            resposta.valorOpcao = resp.valor;
            break;
        }
        
        return resposta;
      })
    };

    enviarMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Carregando questionário...</p>
      </div>
    );
  }

  if (!questionario) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg">Questionário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6">
        <ArrowLeft size={20} className="inline mr-2" />
        Voltar
      </button>

      <div className="card mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {questionario.titulo}
        </h1>
        {questionario.descricao && (
          <p className="text-gray-600">{questionario.descricao}</p>
        )}
        <p className="text-sm text-gray-500 mt-4">
          {questionario._count?.perguntas || questionario.perguntas?.length || 0} perguntas
        </p>
      </div>

      <div className="space-y-6">
        {questionario.perguntas?.map((pergunta: any, index: number) => {
          const opcoes = pergunta.opcoesJson 
            ? (typeof pergunta.opcoesJson === 'string' 
                ? JSON.parse(pergunta.opcoesJson) 
                : pergunta.opcoesJson)
            : [];

          return (
            <div key={pergunta.id} className="card">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {pergunta.enunciado}
                    {pergunta.obrigatoria && <span className="text-red-600 ml-1">*</span>}
                  </h3>

                  {pergunta.tipo === 'TEXTO' && (
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Digite sua resposta..."
                      value={respostas[pergunta.id]?.valor || ''}
                      onChange={(e) => handleResposta(pergunta.id, 'TEXTO', e.target.value)}
                    />
                  )}

                  {pergunta.tipo === 'ESCALA' && (
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        className="w-full"
                        value={respostas[pergunta.id]?.valor || 5}
                        onChange={(e) => handleResposta(pergunta.id, 'ESCALA', e.target.value)}
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>0</span>
                        <span className="font-bold text-lg text-primary-600">
                          {respostas[pergunta.id]?.valor || 5}
                        </span>
                        <span>10</span>
                      </div>
                    </div>
                  )}

                  {pergunta.tipo === 'BOOLEAN' && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`pergunta-${pergunta.id}`}
                          value="true"
                          checked={respostas[pergunta.id]?.valor === 'true'}
                          onChange={(e) => handleResposta(pergunta.id, 'BOOLEAN', e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>Sim</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name={`pergunta-${pergunta.id}`}
                          value="false"
                          checked={respostas[pergunta.id]?.valor === 'false'}
                          onChange={(e) => handleResposta(pergunta.id, 'BOOLEAN', e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  )}

                  {(pergunta.tipo === 'UNICA' || pergunta.tipo === 'MULTIPLA') && opcoes.length > 0 && (
                    <div className="space-y-2">
                      {opcoes.map((opcao: string) => (
                        <label key={opcao} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name={`pergunta-${pergunta.id}`}
                            value={opcao}
                            checked={respostas[pergunta.id]?.valor === opcao}
                            onChange={(e) => handleResposta(pergunta.id, pergunta.tipo, e.target.value)}
                            className="w-4 h-4"
                          />
                          <span>{opcao}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 card bg-primary-50 border-2 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Pronto para enviar?</h3>
            <p className="text-sm text-gray-600">
              Revise suas respostas antes de enviar
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={enviarMutation.isPending}
            className="btn-primary"
          >
            {enviarMutation.isPending ? 'Enviando...' : 'Enviar Respostas'}
            <CheckCircle2 size={20} className="inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

