import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { alunoService } from '../services/alunoService';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';

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

  const validarRespostas = () => {
    if (!questionario || !turmas || turmas.length === 0) return false;

    const perguntas = questionario.perguntas;
    const obrigatorias = perguntas.filter((p: any) => p.obrigatoria);
    const respondidas = Object.keys(respostas);

    const faltantes = obrigatorias.filter((p: any) => !respondidas.includes(p.id));

    if (faltantes.length > 0) {
      toast.error(`Por favor, responda todas as perguntas obrigatórias`);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validarRespostas()) {
      return;
    }
    if (!questionario || !turmas || turmas.length === 0) return;

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

      {/* Barra de progresso */}
      <div className="card mb-6 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progresso</span>
          <span className="text-sm font-bold text-primary-600">
            {Object.keys(respostas).length} / {questionario.perguntas?.length || 0}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys(respostas).length / (questionario.perguntas?.length || 1)) * 100}%` 
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {questionario.perguntas?.map((pergunta: any, index: number) => {
          // Parse seguro das opções de múltipla escolha
          const opcoes = (() => {
            try {
              if (!pergunta.opcoesJson) {
                return [];
              }
              
              if (typeof pergunta.opcoesJson === 'string') {
                const parsed = JSON.parse(pergunta.opcoesJson);
                return Array.isArray(parsed) ? parsed : [];
              }
              
              return Array.isArray(pergunta.opcoesJson) ? pergunta.opcoesJson : [];
            } catch (error) {
              console.error('Erro ao fazer parse das opções:', error);
              return [];
            }
          })();

          const respondida = !!respostas[pergunta.id];

          return (
            <div 
              key={pergunta.id} 
              className={`card transition-all ${
                respondida ? 'border-l-4 border-l-green-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  respondida 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {respondida ? <CheckCircle2 size={18} /> : index + 1}
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
                        className="w-full accent-primary-500"
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
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        respostas[pergunta.id]?.valor === 'true' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name={`pergunta-${pergunta.id}`}
                          value="true"
                          checked={respostas[pergunta.id]?.valor === 'true'}
                          onChange={(e) => handleResposta(pergunta.id, 'BOOLEAN', e.target.value)}
                          className="sr-only"
                        />
                        <CheckCircle2 size={20} />
                        <span className="font-medium">Sim</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        respostas[pergunta.id]?.valor === 'false' 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name={`pergunta-${pergunta.id}`}
                          value="false"
                          checked={respostas[pergunta.id]?.valor === 'false'}
                          onChange={(e) => handleResposta(pergunta.id, 'BOOLEAN', e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-medium">Não</span>
                      </label>
                    </div>
                  )}

                  {(pergunta.tipo === 'UNICA' || pergunta.tipo === 'MULTIPLA') && opcoes.length > 0 && (
                    <div className="space-y-2">
                      {opcoes.map((opcao: string) => (
                        <label 
                          key={opcao} 
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            respostas[pergunta.id]?.valor === opcao
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`pergunta-${pergunta.id}`}
                            value={opcao}
                            checked={respostas[pergunta.id]?.valor === opcao}
                            onChange={(e) => handleResposta(pergunta.id, pergunta.tipo, e.target.value)}
                            className="w-4 h-4 accent-primary-500"
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

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={enviarMutation.isPending}
          className="btn-primary px-8 py-3 bg-green-600 hover:bg-green-700"
        >
          {enviarMutation.isPending ? (
            'Enviando...'
          ) : (
            <>
              <Send size={20} className="mr-2" />
              Enviar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
