import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { mlService } from '../services/mlService';
import { adminService } from '../services/adminService';
import { questionarioService } from '../services/questionarioService';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Users,
  Target,
  Activity,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MLDashboardPage() {
  const [selectedTurma, setSelectedTurma] = useState<string>('');
  const { user } = useAuthStore();

  // Queries
  const { data: health } = useQuery({
    queryKey: ['ml-health'],
    queryFn: mlService.checkHealth,
    refetchInterval: 30000 // Verificar a cada 30s
  });

  const { data: overview } = useQuery({
    queryKey: ['ml-overview'],
    queryFn: mlService.getOverview
  });

  // Usa endpoint diferente baseado no role do usuário
  const { data: turmas } = useQuery({
    queryKey: ['turmas-ml', user?.role],
    queryFn: async () => {
      if (user?.role === 'ADMIN') {
        return adminService.getTurmas();
      } else {
        // Professor usa /prof/minhas-turmas
        return questionarioService.getMinhasTurmas();
      }
    },
    enabled: !!user
  });

  const { data: turmaAnalytics } = useQuery({
    queryKey: ['turma-analytics', selectedTurma],
    queryFn: () => mlService.getTurmaAnalytics(selectedTurma),
    enabled: !!selectedTurma
  });

  const { data: evasaoData } = useQuery({
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
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success(`✅ Modelos treinados com sucesso! (${data.totalAlunos} participantes)`);
      } else {
        toast.warning(`⚠️ ${data.message || 'Não foi possível treinar os modelos'}`, {
          description: data.totalAlunos !== undefined 
            ? `Participantes atuais: ${data.totalAlunos} | Mínimo: ${data.minimoNecessario || 5}`
            : undefined
        });
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao treinar modelos', {
        description: error?.message || 'Verifique se o serviço ML está rodando'
      });
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
            Machine Learning aplicado para acompanhar o bem-estar e engajamento dos participantes
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
            <p className="text-sm text-gray-600">Modelo de Bem-Estar</p>
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
                <p className="text-sm text-gray-600">Total de Participantes</p>
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
                <p className="text-sm text-gray-600">Índice de Bem-Estar</p>
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
          Selecione um grupo para análise detalhada:
        </label>
        <select
          value={selectedTurma}
          onChange={(e) => setSelectedTurma(e.target.value)}
          className="input w-full md:w-96"
        >
          <option value="">Selecione um grupo...</option>
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
            Análise do Grupo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total de Participantes</p>
              <p className="text-3xl font-bold text-gray-900">{turmaAnalytics.totalAlunos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Participantes Ativos</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribuição de Bem-Estar</h3>
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

              {/* Gráfico de rosca */}
              <div className="mt-6 flex justify-center">
                <div style={{ maxWidth: 280 }}>
                  <Doughnut
                    data={{
                      labels: ['Excelente (8-10)', 'Bom (6-8)', 'Regular (4-6)', 'Baixo (<4)'],
                      datasets: [{
                        data: [
                          turmaAnalytics.distribuicaoNotas.excelente,
                          turmaAnalytics.distribuicaoNotas.bom,
                          turmaAnalytics.distribuicaoNotas.regular,
                          turmaAnalytics.distribuicaoNotas.baixo,
                        ],
                        backgroundColor: ['#16a34a', '#2563eb', '#ca8a04', '#dc2626'],
                        borderWidth: 2,
                      }],
                    }}
                    options={{
                      plugins: {
                        legend: { position: 'bottom' },
                        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} participantes` } },
                      },
                    }}
                  />
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
            Análise de Risco de Abandono das Atividades
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

          {/* Fatores de risco consolidados do grupo */}
          {(() => {
            const atRisk = evasaoData.predictions.filter((p: any) => p.nivelRisco === 'alto' || p.nivelRisco === 'medio');
            const total = evasaoData.predictions.length || 1;
            const pctAlto = Math.round((evasaoData.alunosRiscoAlto / total) * 100);
            const pctMedio = Math.round((evasaoData.alunosRiscoMedio / total) * 100);
            const fatoresCount: Record<string, number> = {};
            atRisk.forEach((p: any) => p.fatores?.forEach((f: string) => { fatoresCount[f] = (fatoresCount[f] || 0) + 1; }));
            const topFatores = Object.entries(fatoresCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const recomendacoes = [];
            if (pctAlto > 20) recomendacoes.push('Intensificar contato com o grupo nas próximas semanas.');
            if (fatoresCount['Baixa frequência de respostas'] > 0) recomendacoes.push('Reforçar a importância de responder os check-ins semanais.');
            if (fatoresCount['Nota média baixa'] > 0 || fatoresCount['Satisfação abaixo da média'] > 0) recomendacoes.push('Revisar as atividades oferecidas — satisfação do grupo está abaixo do esperado.');
            if (pctMedio + pctAlto < 30) recomendacoes.push('Grupo com perfil saudável — manter a programação atual.');
            return (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Principais fatores de risco identificados no grupo:</h3>
                  {topFatores.length > 0 ? (
                    <ul className="space-y-2">
                      {topFatores.map(([fator, count]) => (
                        <li key={fator} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">• {fator}</span>
                          <span className="text-gray-500 font-medium">{Math.round((count / total) * 100)}% do grupo</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum fator de risco significativo identificado.</p>
                  )}
                </div>
                {recomendacoes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Recomendações para o coordenador:</h3>
                    <ul className="space-y-1">
                      {recomendacoes.map((rec, i) => <li key={i} className="text-sm text-blue-800">→ {rec}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
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
                {engagement.altoEngajamento?.percentual || 0}% dos participantes
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">Médio Engajamento</p>
              <p className="text-2xl font-bold text-yellow-600">
                {engagement.medioEngajamento?.total || 0}
              </p>
              <p className="text-sm text-gray-600">
                {engagement.medioEngajamento?.percentual || 0}% dos participantes
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-700">Baixo Engajamento</p>
              <p className="text-2xl font-bold text-red-600">
                {engagement.baixoEngajamento?.total || 0}
              </p>
              <p className="text-sm text-gray-600">
                {engagement.baixoEngajamento?.percentual || 0}% dos participantes
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

