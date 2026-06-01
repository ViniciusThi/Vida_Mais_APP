import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { professorService, adminService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { ML_URL } from '../../config/api';
import axios from 'axios';

function getToken() {
  return Promise.resolve(useAuthStore.getState().token);
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <View style={pbStyles.track}>
      <View style={[pbStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 }
});

export default function MLInsightsScreen() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const { user } = useAuthStore();

  const { data: health } = useQuery({
    queryKey: ['ml-health'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/health`, { headers: { Authorization: `Bearer ${token}` } });
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
      const { data } = await axios.get(`${ML_URL}/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    retry: false
  });

  const { data: modelsStatus, refetch: refetchModels } = useQuery({
    queryKey: ['ml-models-status'],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/models/status`, { headers: { Authorization: `Bearer ${token}` } });
      return data;
    },
    retry: false
  });

  const { data: turmaAnalytics, refetch: refetchTurmaAnalytics } = useQuery({
    queryKey: ['ml-turma-analytics', selectedTurmaId],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await axios.get(`${ML_URL}/analytics/turma/${selectedTurmaId}`, { headers: { Authorization: `Bearer ${token}` } });
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
      Alert.alert('Erro na Análise', 'Não foi possível carregar a predição de abandono. Tente novamente.');
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
    return <View style={s.centerScreen}><Text style={s.loadingText}>Carregando...</Text></View>;
  }

  if (health !== undefined && !isMLAvailable) {
    return (
      <View style={s.offlineScreen}>
        <Text style={s.offlineEmoji}>⚠️</Text>
        <Text style={s.offlineTitle}>Serviço ML Indisponível</Text>
        <Text style={s.offlineBody}>O serviço de Machine Learning não está rodando. Inicie o serviço Python.</Text>
        <View style={s.offlineCode}><Text style={s.offlineCodeText}>cd ml-service && python app.py</Text></View>
      </View>
    );
  }

  // Calcular fatores e recomendações a partir dos dados de evasão
  const riskAnalysis = evasaoData ? (() => {
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

  const wellbeingTotal = turmaAnalytics?.distribuicaoNotas
    ? (turmaAnalytics.distribuicaoNotas.excelente + turmaAnalytics.distribuicaoNotas.bom +
       turmaAnalytics.distribuicaoNotas.regular + turmaAnalytics.distribuicaoNotas.baixo) || 1
    : 1;

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerEmoji}>🧠</Text>
        <Text style={s.headerTitle}>Análise Preditiva & Insights</Text>
        <Text style={s.headerSub}>Machine Learning para bem-estar e engajamento</Text>
        <View style={s.mlPill}><Text style={s.mlPillText}>✅  ML Online</Text></View>
      </View>

      {/* ── Status dos Modelos ── */}
      {modelsStatus && (
        <View style={s.card}>
          <Text style={s.cardTitle}>⚙️  Status dos Modelos</Text>
          {[
            { label: 'Modelo de Evasão', value: modelsStatus.evasaoModel ?? '—' },
            { label: 'Modelo de Bem-Estar', value: modelsStatus.desempenhoModel ?? '—' },
            {
              label: 'Última Atualização',
              value: modelsStatus.lastUpdate && modelsStatus.lastUpdate !== 'nunca' && modelsStatus.lastUpdate !== 'desconhecido'
                ? new Date(modelsStatus.lastUpdate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Nunca treinado'
            }
          ].map((item, i, arr) => (
            <View key={item.label} style={[s.modelRow, i < arr.length - 1 && s.modelRowBorder]}>
              <Text style={s.modelLabel}>{item.label}</Text>
              <Text style={s.modelValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Visão Geral — 4 KPIs 2×2 ── */}
      {overview && (
        <>
          <Text style={s.sectionTitle}>📊  Visão Geral</Text>
          <View style={s.kpiGrid}>
            {[
              { label: 'Total de Participantes', value: overview.totalAlunos,       color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Taxa de Engajamento',    value: `${overview.taxaEngajamento}%`, color: '#16A34A', bg: '#F0FDF4' },
              { label: 'Índice de Bem-Estar',    value: overview.mediaNotasGeral,   color: '#9333EA', bg: '#F3E8FF' },
              { label: 'Questionários',           value: overview.totalQuestionarios, color: '#EA580C', bg: '#FFF7ED' },
            ].map(kpi => (
              <View key={kpi.label} style={[s.kpiCard, { backgroundColor: kpi.bg }]}>
                <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                <Text style={s.kpiLabel}>{kpi.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* ── Seletor de Turma ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🎯  Selecione um Grupo</Text>
        <View style={s.turmaList}>
          {turmas?.map((turma: any) => {
            const selected = selectedTurmaId === turma.id;
            return (
              <TouchableOpacity
                key={turma.id}
                style={[s.turmaRow, selected && s.turmaRowOn]}
                onPress={() => setSelectedTurmaId(turma.id)}
                activeOpacity={0.7}
              >
                <View style={[s.radio, selected && s.radioOn]}>
                  {selected && <View style={s.radioDot} />}
                </View>
                <Text style={[s.turmaText, selected && s.turmaTextOn]}>{turma.nome}</Text>
                {selected && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Análise do Grupo ── */}
      {selectedTurmaId && turmaAnalytics && (
        <View style={s.card}>
          <Text style={s.cardTitle}>📈  Análise do Grupo</Text>

          {[
            { label: 'Total de Participantes', value: turmaAnalytics.totalAlunos,      color: '#111827' },
            { label: 'Participantes Ativos',   value: turmaAnalytics.alunosAtivos,     color: '#16A34A' },
            { label: 'Taxa de Engajamento',    value: `${turmaAnalytics.taxaEngajamento}%`, color: '#2563EB' },
          ].map((stat, i, arr) => (
            <View key={stat.label} style={[s.statRow, i < arr.length - 1 && s.statRowBorder]}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}

          {turmaAnalytics.distribuicaoNotas && (
            <>
              <Text style={[s.cardTitle, { marginTop: 20, marginBottom: 12 }]}>Distribuição de Bem-Estar</Text>
              {[
                { label: 'Excelente (8–10)', value: turmaAnalytics.distribuicaoNotas.excelente, color: '#16A34A' },
                { label: 'Bom (6–8)',        value: turmaAnalytics.distribuicaoNotas.bom,       color: '#2563EB' },
                { label: 'Regular (4–6)',    value: turmaAnalytics.distribuicaoNotas.regular,    color: '#CA8A04' },
                { label: 'Baixo (<4)',       value: turmaAnalytics.distribuicaoNotas.baixo,      color: '#DC2626' },
              ].map(item => (
                <View key={item.label} style={s.barRow}>
                  <Text style={s.barLabel}>{item.label}</Text>
                  <View style={s.barTrackRow}>
                    <ProgressBar value={item.value} total={wellbeingTotal} color={item.color} />
                    <Text style={[s.barCount, { color: item.color }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* ── Risco de Abandono ── */}
      {selectedTurmaId && evasaoData && (
        <View style={s.card}>
          <Text style={s.cardTitle}>⚠️  Risco de Abandono das Atividades</Text>
          {evasaoData.metodo === 'heuristica' && (
            <Text style={s.heuristicNote}>Usando análise heurística — treine os modelos para ML mais preciso.</Text>
          )}

          {[
            { label: 'Risco Alto',  value: evasaoData.alunosRiscoAlto,  color: '#DC2626', border: '#FECACA', bg: '#FEF2F2' },
            { label: 'Risco Médio', value: evasaoData.alunosRiscoMedio, color: '#CA8A04', border: '#FDE68A', bg: '#FEFCE8' },
            { label: 'Risco Baixo', value: evasaoData.alunosRiscoBaixo, color: '#16A34A', border: '#BBF7D0', bg: '#F0FDF4' },
          ].map(r => (
            <View key={r.label} style={[s.riskRow, { backgroundColor: r.bg, borderLeftColor: r.color }]}>
              <Text style={[s.riskValue, { color: r.color }]}>{r.value}</Text>
              <Text style={[s.riskLabel, { color: r.color }]}>{r.label}</Text>
            </View>
          ))}

          {riskAnalysis && riskAnalysis.topFatores.length > 0 && (
            <View style={s.factorsBox}>
              <Text style={s.factorsTitle}>Principais fatores de risco no grupo:</Text>
              <View style={s.chipsRow}>
                {riskAnalysis.topFatores.map(([fator, count]) => (
                  <View key={fator} style={s.chip}>
                    <Text style={s.chipText}>{fator}</Text>
                    <Text style={s.chipPct}> · {Math.round((count / riskAnalysis.total) * 100)}%</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {riskAnalysis && riskAnalysis.recomendacoes.length > 0 && (
            <View style={s.recsBox}>
              <Text style={s.recsTitle}>💡  Recomendações para o coordenador:</Text>
              {riskAnalysis.recomendacoes.map((rec, i) => (
                <Text key={i} style={s.recItem}>→  {rec}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Padrões de Engajamento ── */}
      {selectedTurmaId && engagement && (
        <View style={s.card}>
          <Text style={s.cardTitle}>🔥  Padrões de Engajamento</Text>

          {[
            { label: 'Alto Engajamento',  data: engagement.altoEngajamento,  color: '#16A34A' },
            { label: 'Médio Engajamento', data: engagement.medioEngajamento, color: '#CA8A04' },
            { label: 'Baixo Engajamento', data: engagement.baixoEngajamento, color: '#DC2626' },
          ].map(item => (
            <View key={item.label} style={s.engRow}>
              <View style={s.engHeader}>
                <Text style={s.engLabel}>{item.label}</Text>
                <Text style={[s.engValue, { color: item.color }]}>
                  {item.data?.total ?? 0}
                  <Text style={s.engPct}>  {item.data?.percentual ?? 0}%</Text>
                </Text>
              </View>
              <ProgressBar value={item.data?.total ?? 0} total={(engagement.altoEngajamento?.total ?? 0) + (engagement.medioEngajamento?.total ?? 0) + (engagement.baixoEngajamento?.total ?? 0) || 1} color={item.color} />
            </View>
          ))}

          {engagement.insights && engagement.insights.length > 0 && (
            <View style={s.insightsBox}>
              <Text style={s.insightsTitle}>💡  Insights:</Text>
              {engagement.insights.map((insight: string, idx: number) => (
                <Text key={idx} style={s.insightItem}>→  {insight}</Text>
              ))}
            </View>
          )}
        </View>
      )}

    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16, paddingBottom: 48 },
  centerScreen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#6B7280' },

  // Offline
  offlineScreen: { flex: 1, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center', padding: 32 },
  offlineEmoji: { fontSize: 52, marginBottom: 16 },
  offlineTitle: { fontSize: 22, fontWeight: 'bold', color: '#92400E', marginBottom: 8, textAlign: 'center' },
  offlineBody: { fontSize: 16, color: '#B45309', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  offlineCode: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  offlineCodeText: { fontFamily: 'monospace', fontSize: 13, color: '#92400E' },

  // Header
  header: {
    alignItems: 'center', backgroundColor: '#F3E8FF',
    borderRadius: 16, padding: 24, marginBottom: 16,
    borderWidth: 2, borderColor: '#D8B4FE'
  },
  headerEmoji: { fontSize: 52, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#581C87', textAlign: 'center', marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#7C3AED', textAlign: 'center', marginBottom: 12 },
  mlPill: { backgroundColor: '#DCFCE7', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
  mlPillText: { fontSize: 14, fontWeight: '700', color: '#15803D' },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 14 },

  // Seção título solto
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10 },

  // Status dos modelos
  modelRow: { paddingVertical: 12 },
  modelRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modelLabel: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  modelValue: { fontSize: 16, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },

  // KPI 2×2
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  kpiCard: { width: '47.5%', borderRadius: 14, padding: 18, alignItems: 'center' },
  kpiValue: { fontSize: 34, fontWeight: 'bold', marginBottom: 4 },
  kpiLabel: { fontSize: 13, color: '#6B7280', textAlign: 'center' },

  // Seletor de turma
  turmaList: { gap: 10 },
  turmaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: 64, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB'
  },
  turmaRowOn: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#9CA3AF', justifyContent: 'center', alignItems: 'center' },
  radioOn: { borderColor: '#2563EB' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
  turmaText: { flex: 1, fontSize: 16, color: '#374151', fontWeight: '500' },
  turmaTextOn: { color: '#1D4ED8', fontWeight: '700' },
  checkmark: { fontSize: 20, color: '#2563EB', fontWeight: 'bold' },

  // Análise do grupo — stats
  statRow: { paddingVertical: 14 },
  statRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  statLabel: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold' },

  // Barras de progresso — bem-estar
  barRow: { marginBottom: 12 },
  barLabel: { fontSize: 14, color: '#374151', fontWeight: '500', marginBottom: 6 },
  barTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barCount: { fontSize: 16, fontWeight: '700', width: 30, textAlign: 'right' },

  // Risco
  riskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 12, padding: 16, marginBottom: 10,
    borderLeftWidth: 5
  },
  riskValue: { fontSize: 32, fontWeight: 'bold', width: 42 },
  riskLabel: { fontSize: 15, fontWeight: '700' },

  // Fatores chips
  factorsBox: { marginTop: 8, marginBottom: 8 },
  factorsTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', backgroundColor: '#F3F4F6',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6
  },
  chipText: { fontSize: 13, color: '#374151' },
  chipPct: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

  // Recomendações
  recsBox: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginTop: 4 },
  recsTitle: { fontSize: 15, fontWeight: '700', color: '#1E40AF', marginBottom: 8 },
  recItem: { fontSize: 15, color: '#1D4ED8', marginBottom: 6, lineHeight: 22 },
  heuristicNote: { fontSize: 13, color: '#6B7280', marginBottom: 14, fontStyle: 'italic' },

  // Engajamento
  engRow: { marginBottom: 16 },
  engHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  engLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  engValue: { fontSize: 22, fontWeight: 'bold' },
  engPct: { fontSize: 13, color: '#6B7280', fontWeight: 'normal' },

  // Insights
  insightsBox: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginTop: 8 },
  insightsTitle: { fontSize: 15, fontWeight: '700', color: '#1E40AF', marginBottom: 8 },
  insightItem: { fontSize: 15, color: '#1D4ED8', marginBottom: 6, lineHeight: 22 },
});
