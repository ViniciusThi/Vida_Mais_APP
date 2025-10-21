import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { professorService } from '../../services/api';

export default function MeusQuestionariosScreen() {
  const navigation = useNavigation<any>();

  const { data: questionarios, isLoading, refetch } = useQuery({
    queryKey: ['meus-questionarios'],
    queryFn: professorService.getQuestionarios
  });

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CriarQuestionario')}
        >
          <Text style={styles.addButtonText}>➕ Novo Questionário</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Meus Questionários ({questionarios?.length || 0})
        </Text>

        {questionarios?.map((q: any) => (
          <View key={q.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{q.titulo}</Text>
              <View style={q.ativo ? styles.badgeActive : styles.badgeInactive}>
                <Text style={styles.badgeText}>
                  {q.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
            
            {q.descricao && (
              <Text style={styles.cardDescription}>{q.descricao}</Text>
            )}
            
            <Text style={styles.cardMeta}>
              {q.turma?.nome || 'Global'} · {q._count?.perguntas || 0} perguntas · {q._count?.respostas || 0} respostas
            </Text>

            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => navigation.navigate('Relatorio', { id: q.id })}
            >
              <Text style={styles.reportButtonText}>📊 Ver Relatório</Text>
            </TouchableOpacity>
          </View>
        ))}

        {questionarios?.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum questionário criado ainda.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CriarQuestionario')}
            >
              <Text style={styles.emptyButtonText}>Criar Primeiro Questionário</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    padding: 20
  },
  addButton: {
    backgroundColor: '#0284c7',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8
  },
  cardDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12
  },
  cardMeta: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeInactive: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669'
  },
  reportButton: {
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  reportButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0284c7'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24
  },
  emptyButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

