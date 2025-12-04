import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mlService } from '../services/mlService';
import { adminService } from '../services/adminService';
import { toast } from 'sonner';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Target, 
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function MLDashboardPage() {
  const [selectedTurma, setSelectedTurma] = useState<string>('');

  // Queries
  const { data: health } = useQuery({
    queryKey: ['ml-health'],
    queryFn: mlService.checkHealth,
    refetchInterval: 30000 // Verificar a cada 30s
  });

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['ml-overview'],
    queryFn: mlService.getOverview
  });

  const { data: turmas } = useQuery({
    queryKey: ['turmas'],
    queryFn: adminService.getTurmas
  });

  const { data: turmaAnalytics, isLoading: loadingTurma } = useQuery({
    queryKey: ['turma-analytics', selectedTurma],
    queryFn: () => mlService.getTurmaAnalytics(selectedTurma),
    enabled: !!selectedTurma
  });

  const { data: evasaoData, isLoading: loadingEvasao } = useQuery({
    queryKey: ['evasao-prediction', selectedTurma],
    queryFn: () => mlService.predictEvasao(selectedTurma),
    enabled: !!selectedTurma
  });

  const { data: engagement } = useQuery({
    queryKey: ['engagement-patterns', selectedTurma],
    queryFn: () => mlService.getEngagementPatterns(selectedTurma),
    enabled: !!selectedTurma
  });

  const { data: modelsStatus } = useQuery({
    queryKey: ['models-status'],
    queryFn: mlService.getModelsStatus
  });

  // Mutations
  const trainMutation = useMutation({
    mutationFn: mlService.trainModels,
    onSuccess: () => {
      toast.success('Modelos treinados com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao treinar modelos');
    }
  });

  const isMLAvailable = health?.status === 'connected';

  if (!isMLAvailable) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            Serviço de ML Indisponível
          </h2>
          <p className="text-yellow-700 mb-4">
            O serviço de Machine Learning não está rodando. Por favor, inicie o serviço Python.
          </p>
          <code className="bg-yellow-100 px-4 py-2 rounded text-sm">
            cd ml-service && python app.py
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-purple-600" size={32} />
            Análise Preditiva & Insights
          </h1>
          <p className="text-gray-600 mt-1">
            Machine Learning aplicado para melhorar o engajamento dos alunos
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-medium text-green-900">ML Online</span>
          </div>
          <button
            onClick={() => trainMutation.mutate()}
            disabled={trainMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={18} className={trainMutation.isPending ? 'animate-spin' : ''} />
            {trainMutation.isPending ? 'Treinando...' : 'Retreinar Modelos'}
          </button>
        </div>
      </div>

      {/* Status dos Modelos */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Status dos Modelos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Modelo de Evasão</p>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {modelsStatus?.evasaoModel || 'Carregando...'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Modelo de Desempenho</p>
            <p className="text-lg font-bold text-gray-900 capitalize">
              {modelsStatus?.desempenhoModel || 'Carregando...'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Última Atualização</p>
            <p className="text-lg font-bold text-gray-900">
              {modelsStatus?.lastUpdate && 
               modelsStatus.lastUpdate !== 'nunca' && 
               modelsStatus.lastUpdate !== 'desconhecido' 
                ? new Date(modelsStatus.lastUpdate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Nunca treinado'}
            </p>
          </div>
        </div>
      </div>

      {/* Visão Geral */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalAlunos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Engajamento</p>
                <p className="text-2xl font-bold text-gray-900">{overview.taxaEngajamento}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Média de Notas</p>
                <p className="text-2xl font-bold text-gray-900">{overview.mediaNotasGeral}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Questionários</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalQuestionarios}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seletor de Turma */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione uma turma para análise detalhada:
        </label>
        <select
          value={selectedTurma}
          onChange={(e) => setSelectedTurma(e.target.value)}
          className="input w-full md:w-96"
        >
          <option value="">Selecione uma turma...</option>
          {turmas?.map((turma: any) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Analytics da Turma */}
      {selectedTurma && turmaAnalytics && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Análise da Turma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-3xl font-bold text-gray-900">{turmaAnalytics.totalAlunos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Alunos Ativos</p>
              <p className="text-3xl font-bold text-green-600">{turmaAnalytics.alunosAtivos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taxa de Engajamento</p>
              <p className="text-3xl font-bold text-blue-600">{turmaAnalytics.taxaEngajamento}%</p>
            </div>
          </div>

          {/* Distribuição de Notas */}
          {turmaAnalytics.distribuicaoNotas && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribuição de Notas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900">Excelente (8-10)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {turmaAnalytics.distribuicaoNotas.excelente}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">Bom (6-8)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {turmaAnalytics.distribuicaoNotas.bom}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900">Regular (4-6)</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {turmaAnalytics.distribuicaoNotas.regular}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-900">Baixo (&lt;4)</p>
                  <p className="text-2xl font-bold text-red-600">
                    {turmaAnalytics.distribuicaoNotas.baixo}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Predição de Evasão */}
      {selectedTurma && evasaoData && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            Análise de Risco de Evasão
            {evasaoData.metodo === 'heuristica' && (
              <span className="text-sm text-gray-500 font-normal">
                (usando heurística - treine os modelos para ML)
              </span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-900">Risco Alto</p>
              <p className="text-3xl font-bold text-red-600">{evasaoData.alunosRiscoAlto}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-900">Risco Médio</p>
              <p className="text-3xl font-bold text-yellow-600">{evasaoData.alunosRiscoMedio}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900">Risco Baixo</p>
              <p className="text-3xl font-bold text-green-600">{evasaoData.alunosRiscoBaixo}</p>
            </div>
          </div>

          {/* Lista de Alunos em Risco */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Alunos que Necessitam Atenção:</h3>
            {evasaoData.predictions
              .filter((p: any) => p.nivelRisco === 'alto' || p.nivelRisco === 'medio')
              .slice(0, 10)
              .map((pred: any) => (
                <div
                  key={pred.alunoId}
                  className={`p-4 rounded-lg border ${
                    pred.nivelRisco === 'alto'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{pred.alunoNome}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Risco: <span className="font-bold">{pred.riscoEvasao}%</span>
                      </p>
                      <ul className="mt-2 space-y-1">
                        {pred.fatores.map((fator: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">• {fator}</li>
                        ))}
                      </ul>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pred.nivelRisco === 'alto'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {pred.nivelRisco === 'alto' ? 'ALTO' : 'MÉDIO'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Padrões de Engajamento */}
      {selectedTurma && engagement && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Padrões de Engajamento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-700">Alto Engajamento</p>
              <p className="text-2xl font-bold text-green-600">
                {engagement.altoEngajamento?.total || 0}
              </p>
              <p className="text-sm text-gray-600">
                {engagement.altoEngajamento?.percentual || 0}% dos alunos
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">Médio Engajamento</p>
              <p className="text-2xl font-bold text-yellow-600">
                {engagement.medioEngajamento?.total || 0}
              </p>
              <p className="text-sm text-gray-600">
                {engagement.medioEngajamento?.percentual || 0}% dos alunos
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-700">Baixo Engajamento</p>
              <p className="text-2xl font-bold text-red-600">
                {engagement.baixoEngajamento?.total || 0}
              </p>
              <p className="text-sm text-gray-600">
                {engagement.baixoEngajamento?.percentual || 0}% dos alunos
              </p>
            </div>
          </div>

          {/* Insights */}
          {engagement.insights && engagement.insights.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Insights:</h3>
              <ul className="space-y-2">
                {engagement.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="text-blue-900">{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

