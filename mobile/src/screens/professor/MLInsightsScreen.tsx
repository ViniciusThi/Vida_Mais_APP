import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
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

  const { data: health } = useQuery({
    queryKey: ['ml-health'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/health`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    retry: false,
    refetchInterval: 30000
  });

  const { data: turmas, isLoading: loadingTurmas } = useQuery({
    queryKey: ['turmas-ml', user?.role],
    queryFn: async () => {
      if (user?.role === 'ADMIN') return adminService.getTurmas();
      return professorService.getMinhasTurmas();
    },
    enabled: !!user
  });

  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
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

  useEffect(() => {
    if (evasaoError) {
      Alert.alert('Erro na Análise', 'Não foi possível carregar a predição de abandono para este grupo. Tente novamente.');
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

  const isMLAvailable = health?.status === 'connected';

  if (loadingTurmas) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  if (health !== undefined && !isMLAvailable) {
    return (
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineIcon}>⚠️</Text>
        <Text style={styles.offlineTitle}>Serviço de ML Indisponível</Text>
        <Text style={styles.offlineText}>
          O serviço de Machine Learning não está rodando. Por favor, inicie o serviço Python.
        </Text>
        <View style={styles.offlineCode}>
          <Text style={styles.offlineCodeText}>cd ml-service && python app.py</Text>
        </View>
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
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>🧠 Análise Preditiva & Insights</Text>
            <Text style={styles.subtitle}>
              Machine Learning aplicado para acompanhar o bem-estar e engajamento dos participantes
            </Text>
          </View>
          <View style={styles.mlBadge}>
            <Text style={styles.mlBadgeText}>✅ ML Online</Text>
          </View>
        </View>

        {/* Status dos Modelos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Status dos Modelos</Text>
          <View style={styles.modelsGrid}>
            <View style={styles.modelItem}>
              <Text style={styles.modelLabel}>Modelo de Evasão</Text>
              <Text style={styles.modelValue}>{modelsStatus?.evasaoModel ?? 'Carregando...'}</Text>
            </View>
            <View style={styles.modelItem}>
              <Text style={styles.modelLabel}>Modelo de Bem-Estar</Text>
              <Text style={styles.modelValue}>{modelsStatus?.desempenhoModel ?? 'Carregando...'}</Text>
            </View>
            <View style={[styles.modelItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.modelLabel}>Última Atualização</Text>
              <Text style={styles.modelValue}>
                {modelsStatus?.lastUpdate && modelsStatus.lastUpdate !== 'nunca' && modelsStatus.lastUpdate !== 'desconhecido'
                  ? new Date(modelsStatus.lastUpdate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Nunca treinado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Visão Geral — 4 KPIs */}
        {overview && (
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.kpiIconText}>👥</Text>
              </View>
              <View>
                <Text style={styles.kpiLabel}>Total de Participantes</Text>
                <Text style={styles.kpiValue}>{overview.totalAlunos}</Text>
              </View>
            </View>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.kpiIconText}>📊</Text>
              </View>
              <View>
                <Text style={styles.kpiLabel}>Taxa de Engajamento</Text>
                <Text style={[styles.kpiValue, { color: '#16A34A' }]}>{overview.taxaEngajamento}%</Text>
              </View>
            </View>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#F3E8FF' }]}>
                <Text style={styles.kpiIconText}>📈</Text>
              </View>
              <View>
                <Text style={styles.kpiLabel}>Índice de Bem-Estar</Text>
                <Text style={[styles.kpiValue, { color: '#9333EA' }]}>{overview.mediaNotasGeral}</Text>
              </View>
            </View>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: '#FFEDD5' }]}>
                <Text style={styles.kpiIconText}>🎯</Text>
              </View>
              <View>
                <Text style={styles.kpiLabel}>Questionários</Text>
                <Text style={[styles.kpiValue, { color: '#EA580C' }]}>{overview.totalQuestionarios}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Seletor de Turma */}
        <View style={styles.card}>
          <Text style={styles.pickerLabel}>Selecione um grupo para análise detalhada:</Text>
          <View style={styles.turmaList}>
            {turmas?.map((turma: any) => {
              const selected = selectedTurmaId === turma.id;
              return (
                <TouchableOpacity
                  key={turma.id}
                  style={[styles.turmaRow, selected && styles.turmaRowSelected]}
                  onPress={() => setSelectedTurmaId(turma.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.turmaRadio, selected && styles.turmaRadioSelected]}>
                    {selected && <View style={styles.turmaRadioDot} />}
                  </View>
                  <Text style={[styles.turmaRowText, selected && styles.turmaRowTextSelected]}>
                    {turma.nome}
                  </Text>
                  {selected && <Text style={styles.turmaCheckmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Análise do Grupo */}
        {selectedTurmaId && turmaAnalytics && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Análise do Grupo</Text>
            <View style={styles.groupStatsRow}>
              <View style={styles.groupStat}>
                <Text style={styles.groupStatValue}>{turmaAnalytics.totalAlunos}</Text>
                <Text style={styles.groupStatLabel}>Total de Participantes</Text>
              </View>
              <View style={styles.groupStat}>
                <Text style={[styles.groupStatValue, { color: '#16A34A' }]}>{turmaAnalytics.alunosAtivos}</Text>
                <Text style={styles.groupStatLabel}>Participantes Ativos</Text>
              </View>
              <View style={styles.groupStat}>
                <Text style={[styles.groupStatValue, { color: '#2563EB' }]}>{turmaAnalytics.taxaEngajamento}%</Text>
                <Text style={styles.groupStatLabel}>Taxa de Engajamento</Text>
              </View>
            </View>

            {turmaAnalytics.distribuicaoNotas && (
              <>
                <Text style={styles.subTitle}>Distribuição de Bem-Estar</Text>
                <View style={styles.wellbeingGrid}>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#16A34A' }]}>{turmaAnalytics.distribuicaoNotas.excelente}</Text>
                    <Text style={[styles.wellbeingLabel, { color: '#15803D' }]}>Excelente (8-10)</Text>
                  </View>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#2563EB' }]}>{turmaAnalytics.distribuicaoNotas.bom}</Text>
                    <Text style={[styles.wellbeingLabel, { color: '#1D4ED8' }]}>Bom (6-8)</Text>
                  </View>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#FEFCE8', borderColor: '#FDE68A' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#CA8A04' }]}>{turmaAnalytics.distribuicaoNotas.regular}</Text>
                    <Text style={[styles.wellbeingLabel, { color: '#A16207' }]}>Regular (4-6)</Text>
                  </View>
                  <View style={[styles.wellbeingCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <Text style={[styles.wellbeingValue, { color: '#DC2626' }]}>{turmaAnalytics.distribuicaoNotas.baixo}</Text>
                    <Text style={[styles.wellbeingLabel, { color: '#B91C1C' }]}>{'Baixo (<4)'}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* Análise de Risco de Abandono */}
        {selectedTurmaId && evasaoData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              ⚠️ Análise de Risco de Abandono das Atividades
              {evasaoData.metodo === 'heuristica' && (
                <Text style={styles.heuristicNote}>{' '}(usando heurística - treine os modelos para ML)</Text>
              )}
            </Text>

            <View style={styles.riskCards}>
              <View style={[styles.riskCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={[styles.riskValue, { color: '#DC2626' }]}>{evasaoData.alunosRiscoAlto}</Text>
                <Text style={[styles.riskLabel, { color: '#991B1B' }]}>Risco Alto</Text>
              </View>
              <View style={[styles.riskCard, { backgroundColor: '#FEFCE8', borderColor: '#FDE68A' }]}>
                <Text style={[styles.riskValue, { color: '#CA8A04' }]}>{evasaoData.alunosRiscoMedio}</Text>
                <Text style={[styles.riskLabel, { color: '#A16207' }]}>Risco Médio</Text>
              </View>
              <View style={[styles.riskCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                <Text style={[styles.riskValue, { color: '#16A34A' }]}>{evasaoData.alunosRiscoBaixo}</Text>
                <Text style={[styles.riskLabel, { color: '#15803D' }]}>Risco Baixo</Text>
              </View>
            </View>

            {riskFactorsAndRecs && (
              <>
                {riskFactorsAndRecs.topFatores.length > 0 && (
                  <View style={styles.factorsBox}>
                    <Text style={styles.factorsTitle}>Principais fatores de risco identificados no grupo:</Text>
                    {riskFactorsAndRecs.topFatores.map(([fator, count]) => (
                      <View key={fator} style={styles.factorRow}>
                        <Text style={styles.factorText}>• {fator}</Text>
                        <Text style={styles.factorPct}>
                          {Math.round((count / riskFactorsAndRecs.total) * 100)}% do grupo
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {riskFactorsAndRecs.recomendacoes.length > 0 && (
                  <View style={styles.recsBox}>
                    <Text style={styles.recsTitle}>💡 Recomendações para o coordenador:</Text>
                    {riskFactorsAndRecs.recomendacoes.map((rec, i) => (
                      <Text key={i} style={styles.recItem}>→ {rec}</Text>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Padrões de Engajamento */}
        {selectedTurmaId && engagement && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Padrões de Engajamento</Text>
            <View style={styles.engagementRow}>
              <View style={[styles.engagementCard, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.engagementValue, { color: '#16A34A' }]}>{engagement.altoEngajamento?.total ?? 0}</Text>
                <Text style={styles.engagementLabel}>Alto Engajamento</Text>
                <Text style={styles.engagementPct}>{engagement.altoEngajamento?.percentual ?? 0}% dos participantes</Text>
              </View>
              <View style={[styles.engagementCard, { backgroundColor: '#FEFCE8' }]}>
                <Text style={[styles.engagementValue, { color: '#CA8A04' }]}>{engagement.medioEngajamento?.total ?? 0}</Text>
                <Text style={styles.engagementLabel}>Médio Engajamento</Text>
                <Text style={styles.engagementPct}>{engagement.medioEngajamento?.percentual ?? 0}% dos participantes</Text>
              </View>
              <View style={[styles.engagementCard, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.engagementValue, { color: '#DC2626' }]}>{engagement.baixoEngajamento?.total ?? 0}</Text>
                <Text style={styles.engagementLabel}>Baixo Engajamento</Text>
                <Text style={styles.engagementPct}>{engagement.baixoEngajamento?.percentual ?? 0}% dos participantes</Text>
              </View>
            </View>

            {engagement.insights && engagement.insights.length > 0 && (
              <View style={styles.insightsBox}>
                <Text style={styles.insightsTitle}>💡 Insights:</Text>
                {engagement.insights.map((insight: string, idx: number) => (
                  <Text key={idx} style={styles.insightItem}>{insight}</Text>
                ))}
              </View>
            )}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16, paddingBottom: 40 },
  loading: { fontSize: 20, textAlign: 'center', marginTop: 100, color: '#6B7280' },

  // Offline
  offlineContainer: {
    flex: 1, backgroundColor: '#FFFBEB',
    justifyContent: 'center', alignItems: 'center', padding: 32
  },
  offlineIcon: { fontSize: 56, marginBottom: 16 },
  offlineTitle: { fontSize: 22, fontWeight: 'bold', color: '#92400E', marginBottom: 8, textAlign: 'center' },
  offlineText: { fontSize: 15, color: '#B45309', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  offlineCode: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  offlineCodeText: { fontFamily: 'monospace', fontSize: 13, color: '#92400E' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2
  },
  headerLeft: { flex: 1, marginRight: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  mlBadge: { backgroundColor: '#DCFCE7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  mlBadgeText: { fontSize: 12, fontWeight: '600', color: '#15803D' },

  // Card genérico
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 14 },
  subTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 10 },

  // Status dos modelos
  modelsGrid: { gap: 0 },
  modelItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modelLabel: { fontSize: 13, color: '#6B7280' },
  modelValue: { fontSize: 15, fontWeight: 'bold', color: '#111827', textTransform: 'capitalize', marginTop: 2 },

  // KPIs
  kpiGrid: { gap: 10, marginBottom: 14 },
  kpiCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2
  },
  kpiIcon: { width: 48, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  kpiIconText: { fontSize: 22 },
  kpiLabel: { fontSize: 13, color: '#6B7280' },
  kpiValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },

  // Seletor de turma
  pickerLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 10 },
  turmaList: { gap: 8 },
  turmaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 60, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 10,
    backgroundColor: '#F9FAFB'
  },
  turmaRowSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  turmaRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center'
  },
  turmaRadioSelected: { borderColor: '#2563EB' },
  turmaRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB' },
  turmaRowText: { flex: 1, fontSize: 16, color: '#374151', fontWeight: '500' },
  turmaRowTextSelected: { color: '#1D4ED8', fontWeight: '700' },
  turmaCheckmark: { fontSize: 18, color: '#2563EB', fontWeight: 'bold' },

  // Análise do grupo
  groupStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  groupStat: { flex: 1, alignItems: 'center' },
  groupStatValue: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  groupStatLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 2 },

  // Distribuição bem-estar
  wellbeingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wellbeingCard: { flex: 1, minWidth: '45%', padding: 12, borderRadius: 10, borderWidth: 1 },
  wellbeingValue: { fontSize: 26, fontWeight: 'bold', marginBottom: 2 },
  wellbeingLabel: { fontSize: 12 },

  // Risco
  riskCards: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  riskCard: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  riskValue: { fontSize: 26, fontWeight: 'bold' },
  riskLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  heuristicNote: { fontSize: 12, color: '#6B7280', fontWeight: 'normal' },

  // Fatores
  factorsBox: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, padding: 12, marginBottom: 10
  },
  factorsTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  factorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  factorText: { fontSize: 13, color: '#374151', flex: 1 },
  factorPct: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 8 },

  // Recomendações
  recsBox: {
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE',
    borderRadius: 10, padding: 12
  },
  recsTitle: { fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 6 },
  recItem: { fontSize: 13, color: '#1D4ED8', marginBottom: 5, lineHeight: 18 },

  // Engajamento
  engagementRow: { gap: 8 },
  engagementCard: { borderRadius: 10, padding: 12 },
  engagementValue: { fontSize: 26, fontWeight: 'bold', marginBottom: 2 },
  engagementLabel: { fontSize: 13, color: '#374151', fontWeight: '600' },
  engagementPct: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Insights
  insightsBox: {
    backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE',
    borderRadius: 10, padding: 12, marginTop: 10
  },
  insightsTitle: { fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 6 },
  insightItem: { fontSize: 13, color: '#1D4ED8', marginBottom: 5, lineHeight: 18 },
});
