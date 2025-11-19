import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alunoService } from '../services/alunoService';
import { ClipboardList, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useFontSize } from '../contexts/FontSizeContext';

interface Questionario {
  id: string;
  titulo: string;
  descricao: string;
  periodoInicio: string | null;
  periodoFim: string | null;
  respondido: boolean;
  turma?: {
    id: string;
    nome: string;
  };
  _count: {
    perguntas: number;
  };
}

export default function MeusQuestionariosAlunoPage() {
  const navigate = useNavigate();
  const { scale } = useFontSize();
  
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarQuestionarios();
  }, []);

  const carregarQuestionarios = async () => {
    try {
      setLoading(true);
      const data = await alunoService.getQuestionariosAtivos();
      setQuestionarios(data);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = (id: string) => {
    navigate(`/responder-questionario/${id}`);
  };

  const formatarData = (data: string | null) => {
    if (!data) return null;
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ fontSize: `${16 * scale}px` }} className="text-gray-600">
            Carregando questionários...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 style={{ fontSize: `${28 * scale}px` }} className="font-bold text-gray-900 mb-2">
          Questionários Disponíveis
        </h1>
        <p style={{ fontSize: `${16 * scale}px` }} className="text-gray-600">
          Responda aos questionários ativos para contribuir com o Vida Mais
        </p>
      </div>

      {questionarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
          <p style={{ fontSize: `${18 * scale}px` }} className="text-gray-600 mb-2">
            Nenhum questionário disponível no momento
          </p>
          <p style={{ fontSize: `${14 * scale}px` }} className="text-gray-500">
            Novos questionários aparecerão aqui quando forem criados
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questionarios.map((questionario) => (
            <div
              key={questionario.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                questionario.respondido ? 'border-2 border-green-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 style={{ fontSize: `${20 * scale}px` }} className="font-bold text-gray-900 mb-2">
                      {questionario.titulo}
                    </h3>
                    {questionario.descricao && (
                      <p style={{ fontSize: `${14 * scale}px` }} className="text-gray-600 mb-3">
                        {questionario.descricao}
                      </p>
                    )}
                  </div>
                  {questionario.respondido && (
                    <CheckCircle className="text-green-500 flex-shrink-0 ml-2" size={24} />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <ClipboardList size={16} className="mr-2" />
                    <span style={{ fontSize: `${14 * scale}px` }}>
                      {questionario._count.perguntas} {questionario._count.perguntas === 1 ? 'pergunta' : 'perguntas'}
                    </span>
                  </div>

                  {questionario.turma && (
                    <div className="flex items-center text-gray-600">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Turma: {questionario.turma.nome}
                      </span>
                    </div>
                  )}

                  {(questionario.periodoInicio || questionario.periodoFim) && (
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span style={{ fontSize: `${13 * scale}px` }}>
                        {questionario.periodoInicio && `${formatarData(questionario.periodoInicio)}`}
                        {questionario.periodoInicio && questionario.periodoFim && ' até '}
                        {questionario.periodoFim && `${formatarData(questionario.periodoFim)}`}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleResponder(questionario.id)}
                  disabled={questionario.respondido}
                  style={{ fontSize: `${16 * scale}px` }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    questionario.respondido
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {questionario.respondido ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle size={18} className="mr-2" />
                      Já Respondido
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Clock size={18} className="mr-2" />
                      Responder Agora
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

