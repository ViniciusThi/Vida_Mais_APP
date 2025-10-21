import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { professorService } from '../../services/api';

const { width } = Dimensions.get('window');

export default function MinhasTurmasScreen() {
  const { data: turmas, isLoading, refetch } = useQuery({
    queryKey: ['minhas-turmas-detalhadas'],
    queryFn: async () => {
      const turmasList = await professorService.getMinhasTurmas();
      // Buscar detalhes de cada turma com alunos
      const detalhadas = await Promise.all(
        turmasList.map(async (turma: any) => {
          try {
            const alunos = await professorService.getAlunosDaTurma(turma.id);
            return { ...turma, alunos };
          } catch (error) {
            console.error('Erro ao buscar alunos da turma:', error);
            return { ...turma, alunos: [] };
          }
        })
      );
      return detalhadas;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando turmas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>📚 Minhas Turmas</Text>
          <Text style={styles.headerSubtitle}>
            Visualização das turmas e alunos
          </Text>
        </View>

        {turmas?.length === 0 && (
          <Text style={styles.emptyText}>
            Você ainda não tem turmas cadastradas.
          </Text>
        )}

        {turmas?.map((turma: any) => (
          <View key={turma.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{turma.nome}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Ano {turma.ano}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {turma.alunos?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Alunos</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.alunosTitle}>👥 Alunos da Turma:</Text>

            {turma.alunos?.length === 0 ? (
              <Text style={styles.noAlunos}>Nenhum aluno nesta turma</Text>
            ) : (
              turma.alunos?.map((alunoTurma: any) => (
                <View key={alunoTurma.id} style={styles.alunoCard}>
                  <Text style={styles.alunoNome}>{alunoTurma.aluno.nome}</Text>
                  <Text style={styles.alunoEmail}>{alunoTurma.aluno.email}</Text>
                </View>
              ))
            )}
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            ℹ️ <Text style={styles.infoBold}>Atenção:</Text> Esta é uma visualização apenas.
            Para adicionar ou remover alunos, entre em contato com o administrador.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  content: {
    padding: 16
  },
  loading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
    color: '#6b7280'
  },
  headerCard: {
    backgroundColor: '#075D94',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  headerTitle: {
    fontSize: Math.min(width * 0.065, 28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#FFFFFF',
    opacity: 0.9
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#075D94'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: 'bold',
    color: '#075D94',
    flex: 1
  },
  badge: {
    backgroundColor: '#FF7E00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  badgeText: {
    color: '#fff',
    fontSize: Math.min(width * 0.035, 16),
    fontWeight: 'bold'
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  stat: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: 'bold',
    color: '#075D94'
  },
  statLabel: {
    fontSize: Math.min(width * 0.035, 16),
    color: '#6b7280'
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginVertical: 16
  },
  alunosTitle: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12
  },
  noAlunos: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8
  },
  alunoCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7ABA43'
  },
  alunoNome: {
    fontSize: Math.min(width * 0.04, 18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  alunoEmail: {
    fontSize: Math.min(width * 0.035, 16),
    color: '#6b7280'
  },
  emptyText: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#9ca3af',
    textAlign: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed'
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#075D94'
  },
  infoText: {
    fontSize: Math.min(width * 0.038, 16),
    color: '#374151',
    lineHeight: 24
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#075D94'
  }
});

