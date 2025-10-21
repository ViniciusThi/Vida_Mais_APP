import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { alunoService } from '../services/api';
import { useState } from 'react';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Menu baseado no role
  const renderMenu = () => {
    if (user?.role === 'ADMIN') {
      return <AdminMenu navigation={navigation} />;
    } else if (user?.role === 'PROF') {
      return <ProfessorMenu navigation={navigation} />;
    } else {
      return <AlunoMenu navigation={navigation} />;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.nome}! 👋</Text>
        <Text style={styles.subtitle}>
          {user?.role === 'ADMIN' ? 'Administrador Geral' : 
           user?.role === 'PROF' ? 'Professor' : 'Aluno'}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderMenu()}
      </View>
    </ScrollView>
  );
}

// Menu do Admin
function AdminMenu({ navigation }: any) {
  const menuItems = [
    { title: '👨‍🏫 Professores', subtitle: 'Gerenciar professores', screen: 'Professores', icon: '👨‍🏫' },
    { title: '👥 Alunos', subtitle: 'Gerenciar alunos', screen: 'Alunos', icon: '👥' },
    { title: '🎓 Turmas', subtitle: 'Gerenciar turmas', screen: 'Turmas', icon: '🎓' },
    { title: '📋 Questionários', subtitle: 'Criar questionários globais', screen: 'MeusQuestionarios', icon: '📋' },
  ];

  return (
    <>
      <Text style={styles.sectionTitle}>Menu Administrativo</Text>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.menuCard}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

// Menu do Professor
function ProfessorMenu({ navigation }: any) {
  const menuItems = [
    { title: '📋 Meus Questionários', subtitle: 'Ver e criar questionários', screen: 'MeusQuestionarios', icon: '📋' },
    { title: '➕ Criar Questionário', subtitle: 'Novo questionário', screen: 'CriarQuestionario', icon: '➕' },
    { title: '🎓 Minhas Turmas', subtitle: 'Ver suas turmas', screen: 'Turmas', icon: '🎓' },
  ];

  return (
    <>
      <Text style={styles.sectionTitle}>Menu do Professor</Text>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.menuCard}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

// Menu do Aluno
function AlunoMenu({ navigation }: any) {
  const { data: turmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: alunoService.getMinhasTurmas
  });

  const { data: questionarios, isLoading } = useQuery({
    queryKey: ['questionarios-ativos'],
    queryFn: () => alunoService.getQuestionariosAtivos()
  });

  const pendentes = questionarios?.filter((q: any) => !q.respondido) || [];
  const respondidos = questionarios?.filter((q: any) => q.respondido) || [];

  return (
    <>
      <Text style={styles.sectionTitle}>
        {turmas?.length > 0 
          ? `Turma: ${turmas.map((t: any) => t.nome).join(', ')}`
          : 'Questionários Disponíveis'
        }
      </Text>

      {isLoading && <Text style={styles.emptyText}>Carregando...</Text>}

      {pendentes.length > 0 && (
        <>
          <Text style={styles.subtitle2}>📋 Questionários Pendentes</Text>
          {pendentes.map((item: any) => (
            <TouchableOpacity
              key={item.id}
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
          ))}
        </>
      )}

      {pendentes.length === 0 && !isLoading && (
        <Text style={styles.emptyText}>
          Nenhum questionário pendente no momento.
        </Text>
      )}

      {respondidos.length > 0 && (
        <>
          <Text style={[styles.subtitle2, { marginTop: 32 }]}>✅ Já Respondidos</Text>
          {respondidos.map((item: any) => (
            <View key={item.id} style={[styles.card, styles.cardDone]}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDoneText}>Obrigado pela participação!</Text>
            </View>
          ))}
        </>
      )}
    </>
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
  subtitle2: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 16
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
  content: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  menuIcon: {
    fontSize: 48,
    marginRight: 20
  },
  menuContent: {
    flex: 1
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  menuSubtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  menuArrow: {
    fontSize: 36,
    color: '#9ca3af'
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
    marginTop: 32,
    marginBottom: 32
  }
});

