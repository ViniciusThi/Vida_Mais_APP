import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { alunoService } from '../services/api';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.nome}!</Text>
        <Text style={styles.subtitle}>
          {user?.role === 'ADMIN' ? '👨‍💼 Administrador' : 
           user?.role === 'PROF' ? '👨‍🏫 Professor' : '👤 Aluno'}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderMenu()}
      </ScrollView>
    </View>
  );
}

function AdminMenu({ navigation }: any) {
  const menuItems = [
    { title: 'Professores', subtitle: 'Gerenciar professores', screen: 'Professores', icon: '👨‍🏫', color: '#075D94' },
    { title: 'Alunos', subtitle: 'Gerenciar alunos', screen: 'Alunos', icon: '👥', color: '#FF7E00' },
    { title: 'Turmas', subtitle: 'Gerenciar turmas', screen: 'Turmas', icon: '🎓', color: '#7ABA43' },
    { title: 'Questionários', subtitle: 'Criar questionários', screen: 'MeusQuestionarios', icon: '📋', color: '#075D94' },
  ];

  return (
    <View style={styles.menuContainer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.menuCard, { borderLeftColor: item.color, borderLeftWidth: 6 }]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ProfessorMenu({ navigation }: any) {
  const menuItems = [
    { title: 'Meus Questionários', subtitle: 'Ver questionários', screen: 'MeusQuestionarios', icon: '📋', color: '#075D94' },
    { title: 'Criar Questionário', subtitle: 'Novo questionário', screen: 'CriarQuestionario', icon: '➕', color: '#FF7E00' },
    { title: 'Minhas Turmas', subtitle: 'Ver turmas', screen: 'Turmas', icon: '🎓', color: '#7ABA43' },
  ];

  return (
    <View style={styles.menuContainer}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.menuCard, { borderLeftColor: item.color, borderLeftWidth: 6 }]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

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
    <View style={styles.menuContainer}>
      {turmas && turmas.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            🎓 {turmas.map((t: any) => t.nome).join(', ')}
          </Text>
        </View>
      )}

      {isLoading && <Text style={styles.loadingText}>Carregando...</Text>}

      {pendentes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>📋 Questionários Disponíveis</Text>
          {pendentes.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.questionCard}
              onPress={() => navigation.navigate('Questionario', { id: item.id, turmaId: turmas?.[0]?.id })}
              activeOpacity={0.7}
            >
              <Text style={styles.questionTitle}>{item.titulo}</Text>
              {item.descricao && (
                <Text style={styles.questionDescription}>{item.descricao}</Text>
              )}
              <View style={styles.questionFooter}>
                <Text style={styles.questionMeta}>
                  {item._count?.perguntas || 0} perguntas
                </Text>
                <View style={styles.answerButton}>
                  <Text style={styles.answerButtonText}>RESPONDER ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {pendentes.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyText}>
            Nenhum questionário pendente no momento
          </Text>
        </View>
      )}

      {respondidos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>✅ Já Respondidos</Text>
          {respondidos.map((item: any) => (
            <View key={item.id} style={styles.doneCard}>
              <Text style={styles.doneTitle}>{item.titulo}</Text>
              <Text style={styles.doneText}>Obrigado pela participação!</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: '#075D94', // Azul Vida Mais
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: '#FF7E00' // Laranja Vida Mais
  },
  greeting: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  subtitle: {
    fontSize: Math.min(width * 0.055, 22),
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 16
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#FF7E00'
  },
  logoutText: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#DC2626',
    fontWeight: '700'
  },
  content: {
    flex: 1
  },
  menuContainer: {
    padding: width * 0.04
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 16,
    marginTop: 8
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: isTablet ? 100 : 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  menuIcon: {
    fontSize: isTablet ? 56 : 48,
    marginRight: width * 0.04,
    width: isTablet ? 70 : 60,
    textAlign: 'center'
  },
  menuTextContainer: {
    flex: 1
  },
  menuTitle: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  menuSubtitle: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#6B7280'
  },
  menuArrow: {
    fontSize: isTablet ? 48 : 40,
    fontWeight: 'bold',
    marginLeft: 8
  },
  infoCard: {
    backgroundColor: '#E6F3FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#075D94'
  },
  infoText: {
    fontSize: Math.min(width * 0.045, 20),
    color: '#075D94',
    fontWeight: '600',
    textAlign: 'center'
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FF7E00', // Laranja
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  questionTitle: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 30
  },
  questionDescription: {
    fontSize: Math.min(width * 0.042, 18),
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 24
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  questionMeta: {
    fontSize: Math.min(width * 0.038, 16),
    color: '#9CA3AF'
  },
  answerButton: {
    backgroundColor: '#FF7E00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.04, 18),
    fontWeight: '700'
  },
  doneCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#7ABA43', // Verde
    minHeight: 90
  },
  doneTitle: {
    fontSize: Math.min(width * 0.05, 22),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  doneText: {
    fontSize: Math.min(width * 0.042, 18),
    color: '#5E8E2E',
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: height * 0.1,
    paddingHorizontal: width * 0.1
  },
  emptyIcon: {
    fontSize: width * 0.2,
    marginBottom: 20,
    opacity: 0.3
  },
  emptyText: {
    fontSize: Math.min(width * 0.05, 22),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 30
  },
  loadingText: {
    fontSize: Math.min(width * 0.05, 22),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40
  }
});
