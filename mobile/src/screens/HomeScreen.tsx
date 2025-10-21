import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { alunoService } from '../services/api';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();

  const { data: turmas, refetch: refetchTurmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: alunoService.getMinhasTurmas
  });

  const { data: questionarios, isLoading, refetch } = useQuery({
    queryKey: ['questionarios-ativos'],
    queryFn: () => alunoService.getQuestionariosAtivos()
  });

  const handleLogout = async () => {
    await logout();
  };

  const pendentes = questionarios?.filter((q: any) => !q.respondido) || [];
  const respondidos = questionarios?.filter((q: any) => q.respondido) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.nome}! 👋</Text>
        <Text style={styles.subtitle}>
          {turmas?.length > 0 
            ? `Turma: ${turmas.map((t: any) => t.nome).join(', ')}`
            : 'Nenhuma turma vinculada'
          }
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={pendentes}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListHeaderComponent={() => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Questionários Pendentes</Text>
            {pendentes.length === 0 && (
              <Text style={styles.emptyText}>
                Nenhum questionário pendente no momento.
              </Text>
            )}
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Questionario', { id: item.id, turmaId: turmas?.[0]?.id })}
          >
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            {item.descricao && (
              <Text style={styles.cardDescription}>{item.descricao}</Text>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.cardMeta}>
                {item._count.perguntas} perguntas
              </Text>
              <Text style={styles.cardBadge}>Responder →</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          respondidos.length > 0 ? (
            <View style={[styles.section, { marginTop: 32 }]}>
              <Text style={styles.sectionTitle}>✅ Já Respondidos</Text>
              {respondidos.map((item: any) => (
                <View key={item.id} style={[styles.card, styles.cardDone]}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardDoneText}>Obrigado pela participação!</Text>
                </View>
              ))}
            </View>
          ) : null
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280'
  },
  logoutButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600'
  },
  list: {
    padding: 16
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 24,
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
  cardDone: {
    borderColor: '#d1fae5',
    backgroundColor: '#f0fdf4'
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  cardDescription: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardMeta: {
    fontSize: 16,
    color: '#9ca3af'
  },
  cardBadge: {
    fontSize: 18,
    color: '#0284c7',
    fontWeight: '600'
  },
  cardDoneText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600'
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 32
  }
});

