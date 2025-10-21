import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { alunoService } from '../services/api';
import { useState } from 'react';
import { colors, fontSizes, spacing, borderRadius } from '../theme/colors';

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
    backgroundColor: colors.neutral.fundoApp
  },
  header: {
    backgroundColor: colors.primary.azul,
    padding: spacing.xl + 8,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary.laranja
  },
  greeting: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.neutral.branco,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.primary.azulMuitoClaro,
    fontWeight: '500'
  },
  subtitle2: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.neutral.preto,
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  logoutButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral.branco,
    borderRadius: borderRadius.medium,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: colors.primary.laranjaClaro
  },
  logoutText: {
    fontSize: fontSizes.sm,
    color: colors.feedback.erro,
    fontWeight: '700'
  },
  content: {
    padding: spacing.xl
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.primary.azul,
    marginBottom: spacing.xl
  },
  menuCard: {
    backgroundColor: colors.neutral.branco,
    borderRadius: borderRadius.large,
    padding: spacing.xl + 8,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary.azulClaro,
    shadowColor: colors.shadow.media,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 100
  },
  menuIcon: {
    fontSize: 56,
    marginRight: spacing.xl
  },
  menuContent: {
    flex: 1
  },
  menuTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.primary.azul,
    marginBottom: spacing.xs
  },
  menuSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.neutral.cinzaMedio,
    lineHeight: 24
  },
  menuArrow: {
    fontSize: 40,
    color: colors.primary.laranja,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: colors.neutral.branco,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.primary.laranjaClaro,
    minHeight: 120
  },
  cardDone: {
    borderColor: colors.primary.verde,
    backgroundColor: colors.primary.verdeMuitoClaro
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.neutral.preto,
    marginBottom: spacing.sm,
    lineHeight: 32
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    color: colors.neutral.cinzaEscuro,
    marginBottom: spacing.md,
    lineHeight: 26
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm
  },
  cardMeta: {
    fontSize: fontSizes.xs,
    color: colors.neutral.cinzaMedio
  },
  cardBadge: {
    fontSize: fontSizes.sm,
    color: colors.primary.laranja,
    fontWeight: '700'
  },
  cardDoneText: {
    fontSize: fontSizes.sm,
    color: colors.primary.verdeEscuro,
    fontWeight: '700'
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.neutral.cinzaMedio,
    textAlign: 'center',
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxxl,
    lineHeight: 32
  }
});

