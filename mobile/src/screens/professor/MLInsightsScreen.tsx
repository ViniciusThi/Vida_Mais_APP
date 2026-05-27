import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { professorService, adminService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ML_URL } from '../../config/api';
import axios from 'axios';

async function getToken() {
  return import('../../stores/authStore').then(m => m.useAuthStore.getState().token);
}

export default function MLInsightsScreen() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const { user } = useAuthStore();

  const { data: turmas, isLoading: loadingTurmas } = useQuery({
    queryKey: ['turmas-ml', user?.role],
    queryFn: async () => {
      if (user?.role === 'ADMIN') {
        return adminService.getTurmas();
      } else {
        return professorService.getMinhasTurmas();
      }
    },
    enabled: !!user
  });

  const { data: overview, isLoading: loadingOverview, isError: overviewError, refetch: refetchOverview } = useQuery({
    queryKey: ['ml-overview'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    retry: false
  });

  const { data: modelsStatus, refetch: refetchModels } = useQuery({
    queryKey: ['ml-models-status'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/models/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    retry: false
  });

  const { data: turmaAnalytics, refetch: refetchTurmaAnalytics } = useQuery({
    queryKey: ['ml-turma-analytics', selectedTurmaId],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/analytics/turma/${selectedTurmaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!selectedTurmaId,
    retry: false
  });

  const { data: engagement, refetch: refetchEngagement } = useQuery({
    queryKey: ['ml-engagement', selectedTurmaId],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/patterns/engagement`, {
        params: { turmaId: selectedTurmaId },
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!selectedTurmaId,
    retry: false
  });

  const { data: evasaoData, isLoading: loadingEvasao, isError: evasaoError, refetch: refetchEvasao } = useQuery({
    queryKey: ['ml-evasao', selectedTurmaId],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.post(
        `${ML_URL}/predict/evasao`,
        { turmaId: selectedTurmaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!selectedTurmaId,
    retry: false
  });

  useEffect(() => {
    if (overviewError) {
      Alert.alert(
        'Serviço Indisponível',
        'Não foi possível carregar os dados de análise. Verifique sua conexão com a internet.'
      );
    }
  }, [overviewError]);

  useEffect(() => {
    if (evasaoError) {
      Alert.alert(
        'Erro na Análise',
        'Não foi possível carregar a predição de abandono para este grupo. Tente novamente.'
      );
    }
  }, [evasaoError]);

  const handleRefresh = useCallback(() => {
    refetchOverview();
    refetchModels();
    if (selectedTurmaId) {
      refetchEvasao();
      refetchTurmaAnalytics();
      refetchEngagement();
    }
  }, [selectedTurmaId, refetchOverview, refetchModels, refetchEvasao, refetchTurmaAnalytics, refetchEngagement]);

  const isRefreshing = useMemo(() => loadingOverview || loadingEvasao, [loadingOverview, loadingEvasao]);

  if (loadingTurmas) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  const riskFactorsAndRecs = evasaoData ? (() => {
    const atRisk = evasaoData.predictions?.filter((p: any) => p.nivelRisco === 'alto' || p.nivelRisco === 'medio') ?? [];
    const total = evasaoData.predictions?.length || 1;
    const pctAlto = Math.round((evasaoData.alunosRiscoAlto / total) * 100);
    const pctMedio = Math.round((evasaoData.alunosRiscoMedio / total) * 100);
    const fatoresCount: Record<string, number> = {};
    atRisk.forEach((p: any) => p.fatores?.forEach((f: string) => { fatoresCount[f] = (fatoresCount[f] || 0) + 1; }));
    const topFatores = Object.entries(fatoresCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const recomendacoes: string[] = [];
    if (pctAlto > 20) recomendacoes.push('Intensificar contato com o grupo nas próximas semanas.');
    if (fatoresCount['Baixa frequência de respostas'] > 0) recomendacoes.push('Reforçar a importância de responder os check-ins semanais.');
    if (fatoresCount['Nota média baixa'] > 0 || fatoresCount['Satisfação abaixo da média'] > 0) recomendacoes.push('Revisar as atividades oferecidas — satisfação do grupo está abaixo do esperado.');
    if (pctMedio + pctAlto < 30) recomendacoes.push('Grupo com perfil saudável — manter a programação atual.');
    return { topFatores, recomendacoes, total };
  })() : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🤖</Text>
          <Text style={styles.title}>Insights Preditivos</Text>
          <Text style={styles.subtitle}>Análise com Machine Learning</Text>
        </View>

        {/* Status dos Modelos */}
        {modelsStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Status dos Modelos</Text>
            <View style={styles.modelsGrid}>
              <View style={styles.modelCard}>
                <Text style={styles.modelLabel}>Modelo de Evasão</Text>
                <Text style={styles.modelValue}>{modelsStatus.evasaoModel ?? '—'}</Text>
              </View>
              <View style={styles.modelCard}>
                <Text style={styles.modelLabel}>Modelo de Bem-Estar</Text>
                <Text style={styles.modelValue}>{modelsStatus.desempenhoModel ?? '—'}</Text>
              </View>
              <View style={[styles.modelCard, { flex: 2 }]}>
                <Text style={styles.modelLabel}>Última Atualização</Text>
                <Text style={styles.modelValue}>
                  {modelsStatus.lastUpdate && modelsStatus.lastUpdate !== 'nunca' && modelsStatus.lastUpdate !== 'desconhecido'
                    ? new Date(modelsStatus.lastUpdate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Nunca treinado'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Overview Cards */}
        {overview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Visão Geral</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.statValue}>{overview.totalAlunos}</Text>
                <Text style={styles.statLabel}>Total de Participantes</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.statValue, { color: '#16A34A' }]}>
                  {overview.alunosAtivos}
                </Text>
                <Text style={styles.statLabel}>Participantes Ativos</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.statValue, { color: '#CA8A04' }]}>
                  {overview.taxaEngajamento}%
                </Text>
                <Text style={styles.statLabel}>Engajamento</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
                <Text style={[styles.statValue, { color: '#9333EA' }]}>
                  {overview.mediaNotasGeral}
                </Text>
                <Text style={styles.statLabel}>Índice Bem-Estar</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FFF7ED', flex: 2 }]}>
                <Text style={[styles.statValue, { color: '#EA580C' }]}>
                  {overview.totalQuestionarios}
                </Text>
                <Text style={styles.statLabel}>Questionários</Text>
              </View>
            </View>
          </View>
        )}

        {/* Seletor de Turma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Análise por Grupo</Text>
          <Text style={styles.instruction}>Selecione um grupo para ver análises:</Text>
          <View style={styles.turmasGrid}>
            {turmas?.map((turma: any) => (
              <TouchableOpacity
                key={turma.id}
                style={[
                  styles.turmaCard,
                  selectedTurmaId === turma.id && styles.turmaCardSelected
                ]}
                onPress={() => setSelectedTurmaId(turma.id)}
              >
                <Text style={[
                  styles.turmaName,
                  selectedTurmaId === turma.id && styles.turmaNameSelected
                ]}>
                  {turma.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Análise do Grupo */}
        {selectedTurmaId && turmaAnalytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Análise do Grupo</Text>
            <View style={styles.groupStatsRow}>
              <View style={styles.groupStatItem}>
                <Text style={styles.groupStatValue}>{turmaAnalytics.totalAlunos}</Text>
                <Text style={styles.groupStatLabel}>Total</Text>
              </View>
              <View style={styles.groupStatItem}>
                <Text style={[styles.groupStatValue, { color: '#16A34A' }]}>{turmaAnalytics.alunosAtivos}</Text>
                <Text style={styles.groupStatLabel}>Ativos</Text>
              </View>
              <View style={styles.groupStatItem}>
                <Text style={[styles.groupStatValue, { color: '#0284C7' }]}>{turmaAnalytics.taxaEngajamento}%</Text>
                <Text style={styles.groupStatLabel}>Engajamento</Text>
              </View>
            </View>

            {turmaAnalytics.distribuicaoNotas && (
              <>
                <Text style={styles.subSectionTitle}>Distribuição de Bem-Estar</Text>
                <View style={styles.wellbeingGrid}>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#16A34A' }]}>
                      {turmaAnalytics.distribuicaoNotas.excelente}
                    </Text>
                    <Text style={[styles.wellbeingLabel, { color: '#15803D' }]}>Excelente{'\n'}(8–10)</Text>
                  </View>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#2563EB' }]}>
                      {turmaAnalytics.distribuicaoNotas.bom}
                    </Text>
                    <Text style={[styles.wellbeingLabel, { color: '#1D4ED8' }]}>Bom{'\n'}(6–8)</Text>
                  </View>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#FEFCE8', borderColor: '#FDE68A' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#CA8A04' }]}>
                      {turmaAnalytics.distribuicaoNotas.regular}
                    </Text>
                    <Text style={[styles.wellbeingLabel, { color: '#A16207' }]}>Regular{'\n'}(4–6)</Text>
                  </View>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#DC2626' }]}>
                      {turmaAnalytics.distribuicaoNotas.baixo}
                    </Text>
                    <Text style={[styles.wellbeingLabel, { color: '#B91C1C' }]}>Baixo{'\n'}({'<'}4)</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Predição de Evasão */}
        {selectedTurmaId && evasaoData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Risco de Abandono das Atividades</Text>
            {evasaoData.metodo === 'heuristica' && (
              <Text style={styles.heuristicaNote}>(usando heurística — treine os modelos para ML)</Text>
            )}

            {/* Resumo de risco */}
            <View style={styles.riskSummary}>
              <View style={styles.riskItem}>
                <View style={[styles.riskBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.riskNumber, { color: '#DC2626' }]}>
                    {evasaoData.alunosRiscoAlto}
                  </Text>
                </View>
                <Text style={styles.riskLabel}>Alto Risco</Text>
              </View>
              <View style={styles.riskItem}>
                <View style={[styles.riskBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.riskNumber, { color: '#CA8A04' }]}>
                    {evasaoData.alunosRiscoMedio}
                  </Text>
                </View>
                <Text style={styles.riskLabel}>Médio Risco</Text>
              </View>
              <View style={styles.riskItem}>
                <View style={[styles.riskBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.riskNumber, { color: '#16A34A' }]}>
                    {evasaoData.alunosRiscoBaixo}
                  </Text>
                </View>
                <Text style={styles.riskLabel}>Baixo Risco</Text>
              </View>
            </View>

            {/* Fatores consolidados */}
            {riskFactorsAndRecs && (
              <>
                {riskFactorsAndRecs.topFatores.length > 0 && (
                  <View style={styles.factorsCard}>
                    <Text style={styles.factorsTitle}>Principais fatores de risco no grupo:</Text>
                    {riskFactorsAndRecs.topFatores.map(([fator, count]) => (
                      <View key={fator} style={styles.factorRow}>
                        <Text style={styles.factorText}>• {fator}</Text>
                        <Text style={styles.factorPct}>
                          {Math.round((count / riskFactorsAndRecs.total) * 100)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {riskFactorsAndRecs.recomendacoes.length > 0 && (
                  <View style={styles.recommendationsCard}>
                    <Text style={styles.recommendationsTitle}>💡 Recomendações para o coordenador:</Text>
                    {riskFactorsAndRecs.recomendacoes.map((rec, i) => (
                      <Text key={i} style={styles.recommendationItem}>→ {rec}</Text>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Lista individual de alunos em risco */}
            <Text style={styles.subSectionTitle}>🎯 Participantes que Precisam de Atenção:</Text>
            {evasaoData.predictions
              ?.filter((p: any) => p.nivelRisco === 'alto' || p.nivelRisco === 'medio')
              .slice(0, 10)
              .map((pred: any) => (
                <View
                  key={pred.alunoId}
                  style={[
                    styles.alunoCard,
                    pred.nivelRisco === 'alto' ? styles.alunoCardAlto : styles.alunoCardMedio
                  ]}
                >
                  <View style={styles.alunoHeader}>
                    <Text style={styles.alunoNome}>{pred.alunoNome}</Text>
                    <View style={[
                      styles.riscoBadge,
                      pred.nivelRisco === 'alto' ? styles.riscoBadgeAlto : styles.riscoBadgeMedio
                    ]}>
                      <Text style={styles.riscoBadgeText}>
                        {pred.nivelRisco === 'alto' ? 'ALTO' : 'MÉDIO'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.riscoPercentual}>
                    Risco de abandono: {pred.riscoEvasao}%
                  </Text>
                  {pred.nivelRisco === 'alto' && (
                    <Text style={[styles.fator, { color: '#DC2626', fontWeight: '600', marginBottom: 4 }]}>
                      📞 Entre em contato com este participante
                    </Text>
                  )}
                  <View style={styles.fatores}>
                    {pred.fatores?.map((fator: string, idx: number) => (
                      <Text key={idx} style={styles.fator}>• {fator}</Text>
                    ))}
                  </View>
                </View>
              ))}

            {evasaoData.metodo === 'heuristica' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 Usando análise heurística. Para análises mais precisas com ML,
                  acumule dados de pelo menos 30 participantes e treine os modelos no painel web.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Padrões de Engajamento */}
        {selectedTurmaId && engagement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Padrões de Engajamento</Text>
            <View style={styles.engagementRow}>
              <View style={[styles.engagementCard, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.engagementValue, { color: '#16A34A' }]}>
                  {engagement.altoEngajamento?.total ?? 0}
                </Text>
                <Text style={styles.engagementLabel}>Alto</Text>
                <Text style={styles.engagementPct}>
                  {engagement.altoEngajamento?.percentual ?? 0}%
                </Text>
              </View>
              <View style={[styles.engagementCard, { backgroundColor: '#FEFCE8' }]}>
                <Text style={[styles.engagementValue, { color: '#CA8A04' }]}>
                  {engagement.medioEngajamento?.total ?? 0}
                </Text>
                <Text style={styles.engagementLabel}>Médio</Text>
                <Text style={styles.engagementPct}>
                  {engagement.medioEngajamento?.percentual ?? 0}%
                </Text>
              </View>
              <View style={[styles.engagementCard, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.engagementValue, { color: '#DC2626' }]}>
                  {engagement.baixoEngajamento?.total ?? 0}
                </Text>
                <Text style={styles.engagementLabel}>Baixo</Text>
                <Text style={styles.engagementPct}>
                  {engagement.baixoEngajamento?.percentual ?? 0}%
                </Text>
              </View>
            </View>

            {engagement.insights && engagement.insights.length > 0 && (
              <View style={styles.insightsCard}>
                <Text style={styles.insightsTitle}>💡 Insights:</Text>
                {engagement.insights.map((insight: string, idx: number) => (
                  <Text key={idx} style={styles.insightItem}>{insight}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Empty state */}
        {!selectedTurmaId && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>Selecione um Grupo</Text>
            <Text style={styles.emptyText}>
              Escolha um grupo acima para ver análises preditivas e identificar
              participantes que precisam de atenção especial.
            </Text>
          </View>
        )}

        {/* Erro ao carregar */}
        {overviewError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Serviço ML Indisponível</Text>
            <Text style={styles.errorText}>
              O serviço de Machine Learning não está respondendo.
              Verifique se a porta 5000 está aberta no servidor.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  loading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
    color: '#6B7280'
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 3,
    borderColor: '#9333EA'
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12
  },
  heuristicaNote: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -10,
    marginBottom: 12
  },
  instruction: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12
  },
  // Status dos modelos
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  modelCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  modelLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4
  },
  modelValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    textTransform: 'capitalize'
  },
  // Visão Geral
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0284C7',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center'
  },
  // Seletor de turma
  turmasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  turmaCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  turmaCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#EFF6FF'
  },
  turmaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center'
  },
  turmaNameSelected: {
    color: '#0284C7'
  },
  // Análise do grupo
  groupStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around'
  },
  groupStatItem: {
    alignItems: 'center'
  },
  groupStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827'
  },
  groupStatLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  wellbeingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  wellbeingCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center'
  },
  wellbeingValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4
  },
  wellbeingLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16
  },
  // Risco de abandono
  riskSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12
  },
  riskItem: {
    alignItems: 'center'
  },
  riskBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  riskNumber: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  riskLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  // Fatores consolidados
  factorsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12
  },
  factorsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  factorText: {
    fontSize: 14,
    color: '#374151',
    flex: 1
  },
  factorPct: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8
  },
  // Recomendações
  recommendationsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginBottom: 16
  },
  recommendationsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8
  },
  recommendationItem: {
    fontSize: 14,
    color: '#1D4ED8',
    marginBottom: 6,
    lineHeight: 20
  },
  // Alunos em risco (lista individual)
  alunoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2
  },
  alunoCardAlto: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5'
  },
  alunoCardMedio: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE047'
  },
  alunoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  alunoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1
  },
  riscoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  riscoBadgeAlto: {
    backgroundColor: '#DC2626'
  },
  riscoBadgeMedio: {
    backgroundColor: '#F59E0B'
  },
  riscoBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  riscoPercentual: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  fatores: {
    gap: 4
  },
  fator: {
    fontSize: 14,
    color: '#6B7280'
  },
  // Padrões de engajamento
  engagementRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  engagementCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center'
  },
  engagementValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2
  },
  engagementLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600'
  },
  engagementPct: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  insightsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8
  },
  insightItem: {
    fontSize: 14,
    color: '#1D4ED8',
    marginBottom: 6,
    lineHeight: 20
  },
  // Empty / Error states
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24
  },
  errorBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FCA5A5'
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 24
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
    marginTop: 16
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20
  }
});
