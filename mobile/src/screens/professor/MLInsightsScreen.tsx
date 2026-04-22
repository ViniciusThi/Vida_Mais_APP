import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { professorService, adminService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import axios from 'axios';

const ML_BASE_URL = 'http://54.233.110.183:3000/ml';

export default function MLInsightsScreen() {
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');
  const { user } = useAuthStore();

  // Buscar turmas - usa endpoint diferente baseado no role
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

  // Buscar overview
  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['ml-overview'],
    queryFn: async () => {
      const token = await import('../../stores/authStore').then(m => m.useAuthStore.getState().token);
      const { data } = await axios.get(`${ML_BASE_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    retry: false
  });

  // Buscar predição de evasão
  const { data: evasaoData, isLoading: loadingEvasao, refetch: refetchEvasao } = useQuery({
    queryKey: ['ml-evasao', selectedTurmaId],
    queryFn: async () => {
      const token = await import('../../stores/authStore').then(m => m.useAuthStore.getState().token);
      const { data } = await axios.post(
        `${ML_BASE_URL}/predict/evasao`,
        { turmaId: selectedTurmaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    enabled: !!selectedTurmaId,
    retry: false
  });

  const handleRefresh = useCallback(() => {
    refetchOverview();
    if (selectedTurmaId) refetchEvasao();
  }, [selectedTurmaId, refetchOverview, refetchEvasao]);

  const isRefreshing = useMemo(() => loadingOverview || loadingEvasao, [loadingOverview, loadingEvasao]);

  if (loadingTurmas) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

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

        {/* Predição de Evasão */}
        {selectedTurmaId && evasaoData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Risco de Abandono das Atividades</Text>
            
            {/* Resumo */}
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

            {/* Lista de Alunos em Risco */}
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

        {/* Instruções se não houver turma selecionada */}
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
        {!overview && !loadingOverview && (
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
  instruction: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12
  },
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
  riskSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
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

