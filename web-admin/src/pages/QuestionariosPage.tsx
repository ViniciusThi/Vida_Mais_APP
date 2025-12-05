import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { questionarioService } from '../services/questionarioService';
import { Plus, BarChart3, Edit, Search, Filter, X, CheckCircle, XCircle, FileText } from 'lucide-react';

type FiltroStatus = 'todos' | 'com_respostas' | 'sem_respostas';
type FiltroAtivo = 'todos' | 'ativo' | 'inativo';

export default function QuestionariosPage() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroAtivo>('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { data: questionarios, isLoading } = useQuery({
    queryKey: ['questionarios'],
    queryFn: questionarioService.getQuestionarios
  });

  // Filtrar questionários
  const questionariosFiltrados = useMemo(() => {
    if (!questionarios) return [];

    return questionarios.filter((q: any) => {
      // Filtro por busca (título ou turma)
      const matchBusca = busca === '' || 
        q.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        (q.turma?.nome || '').toLowerCase().includes(busca.toLowerCase());

      // Filtro por status de respostas
      const temRespostas = (q._count?.respostas || 0) > 0;
      const matchStatus = 
        filtroStatus === 'todos' ||
        (filtroStatus === 'com_respostas' && temRespostas) ||
        (filtroStatus === 'sem_respostas' && !temRespostas);

      // Filtro por ativo/inativo
      const matchAtivo = 
        filtroAtivo === 'todos' ||
        (filtroAtivo === 'ativo' && q.ativo) ||
        (filtroAtivo === 'inativo' && !q.ativo);

      return matchBusca && matchStatus && matchAtivo;
    });
  }, [questionarios, busca, filtroStatus, filtroAtivo]);

  // Estatísticas para os filtros
  const estatisticas = useMemo(() => {
    if (!questionarios) return { total: 0, comRespostas: 0, semRespostas: 0, ativos: 0, inativos: 0 };

    return {
      total: questionarios.length,
      comRespostas: questionarios.filter((q: any) => (q._count?.respostas || 0) > 0).length,
      semRespostas: questionarios.filter((q: any) => (q._count?.respostas || 0) === 0).length,
      ativos: questionarios.filter((q: any) => q.ativo).length,
      inativos: questionarios.filter((q: any) => !q.ativo).length
    };
  }, [questionarios]);

  const limparFiltros = () => {
    setBusca('');
    setFiltroStatus('todos');
    setFiltroAtivo('todos');
  };

  const temFiltrosAtivos = busca !== '' || filtroStatus !== 'todos' || filtroAtivo !== 'todos';

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <span className="ml-3 text-gray-600">Carregando questionários...</span>
    </div>
  );

  return (
    <div>
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Questionários</h1>
        <Link to="/questionarios/novo" className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Novo Questionário
        </Link>
      </div>

      {/* Barra de busca e filtros */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de busca */}
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título ou turma..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input pl-10 w-full"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Botão de filtros */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`btn-secondary flex items-center gap-2 ${mostrarFiltros ? 'bg-primary-100' : ''}`}
          >
            <Filter size={20} />
            Filtros
            {temFiltrosAtivos && (
              <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                {[busca !== '', filtroStatus !== 'todos', filtroAtivo !== 'todos'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Painel de filtros expandido */}
        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por respostas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Status de Respostas
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroStatus('todos')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filtroStatus === 'todos'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos ({estatisticas.total})
                  </button>
                  <button
                    onClick={() => setFiltroStatus('com_respostas')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      filtroStatus === 'com_respostas'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <CheckCircle size={14} />
                    Com respostas ({estatisticas.comRespostas})
                  </button>
                  <button
                    onClick={() => setFiltroStatus('sem_respostas')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                      filtroStatus === 'sem_respostas'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    <XCircle size={14} />
                    Sem respostas ({estatisticas.semRespostas})
                  </button>
                </div>
              </div>

              {/* Filtro por ativo/inativo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Questionário
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFiltroAtivo('todos')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filtroAtivo === 'todos'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFiltroAtivo('ativo')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filtroAtivo === 'ativo'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    Ativos ({estatisticas.ativos})
                  </button>
                  <button
                    onClick={() => setFiltroAtivo('inativo')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filtroAtivo === 'inativo'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Inativos ({estatisticas.inativos})
                  </button>
                </div>
              </div>
            </div>

            {/* Botão limpar filtros */}
            {temFiltrosAtivos && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={limparFiltros}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                >
                  <X size={16} />
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Indicador de resultados */}
      {temFiltrosAtivos && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando <span className="font-bold">{questionariosFiltrados.length}</span> de{' '}
          <span className="font-bold">{questionarios?.length || 0}</span> questionários
        </div>
      )}

      {/* Grid de questionários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {questionariosFiltrados?.map((q: any) => (
          <div key={q.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start gap-3 mb-3">
              <h3 className="text-base sm:text-lg font-bold break-words flex-1 min-w-0">{q.titulo}</h3>
              <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                q.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {q.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
              {q.turma?.nome || 'Global'}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {q._count.perguntas} perguntas
              </span>
              <span className={`flex items-center gap-1 ${
                (q._count.respostas || 0) > 0 ? 'text-green-600 font-medium' : ''
              }`}>
                <CheckCircle size={14} />
                {q._count.respostas} respostas
              </span>
            </div>
            
            <div className="flex gap-2">
              <Link 
                to={`/questionarios/${q.id}/relatorio`} 
                className="btn-secondary flex-1 text-center text-sm"
              >
                <BarChart3 size={16} className="inline mr-1" />
                Relatório
              </Link>
              <Link 
                to={`/questionarios/${q.id}/editar`} 
                className="btn-secondary text-sm"
              >
                <Edit size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Mensagem quando não há resultados */}
      {questionariosFiltrados?.length === 0 && (
        <div className="card text-center py-12">
          {temFiltrosAtivos ? (
            <>
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-4">Nenhum questionário encontrado com os filtros aplicados.</p>
              <button onClick={limparFiltros} className="btn-secondary">
                Limpar Filtros
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4">Nenhum questionário criado ainda.</p>
              <Link to="/questionarios/novo" className="btn-primary">
                Criar Primeiro Questionário
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
