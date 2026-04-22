import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useFontSize } from '../contexts/FontSizeContext';
import { alunoService, authService } from '../services/api';
import FontSizeControl from '../components/FontSizeControl';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { fontScale } = useFontSize();
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
      return <AdminMenu navigation={navigation} fontScale={fontScale} />;
    } else if (user?.role === 'PROF') {
      return <ProfessorMenu navigation={navigation} fontScale={fontScale} />;
    } else {
      return <AlunoMenu navigation={navigation} fontScale={fontScale} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { fontSize: Math.min(width * 0.06, 24) * fontScale }]}>
          Olá, {user?.nome}!
        </Text>
        <Text style={[styles.subtitle, { fontSize: Math.min(width * 0.045, 18) * fontScale }]}>
          {user?.role === 'ADMIN' ? '👨‍💼 Administrador' :
           user?.role === 'PROF' ? '👨‍🏫 Coordenador' : '👤 Participante'}
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={[styles.logoutText, { fontSize: Math.min(width * 0.04, 16) * fontScale }]}>
            SAIR
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.menuContainer}>
          <FontSizeControl />
          {renderMenu()}
        </View>
      </ScrollView>
    </View>
  );
}

function AdminMenu({ navigation, fontScale }: any) {
  const menuItems = [
    { title: 'Coordenadores', subtitle: 'Gerenciar coordenadores', screen: 'Professores', icon: '👨‍🏫', color: '#075D94' },
    { title: 'Participantes', subtitle: 'Gerenciar participantes', screen: 'Alunos', icon: '👥', color: '#FF7E00' },
    { title: 'Grupos', subtitle: 'Gerenciar grupos', screen: 'Turmas', icon: '🎓', color: '#7ABA43' },
    { title: 'Criar Questionário', subtitle: 'Templates ou manual', screen: 'CriarQuestionario', icon: '📝', color: '#9333EA' },
    { title: 'Questionários', subtitle: 'Gerenciar questionários', screen: 'MeusQuestionarios', icon: '📋', color: '#075D94' },
    { title: 'Insights Preditivos', subtitle: 'Machine Learning', screen: 'MLInsights', icon: '🤖', color: '#9333EA' },
  ];

  return (
    <>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.menuCard, { borderLeftColor: item.color, borderLeftWidth: 6 }]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { fontSize: Math.min(width * 0.055, 24) * fontScale }]}>
              {item.title}
            </Text>
            <Text style={[styles.menuSubtitle, { fontSize: Math.min(width * 0.04, 18) * fontScale }]}>
              {item.subtitle}
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

function ProfessorMenu({ navigation, fontScale }: any) {
  const menuItems = [
    { title: 'Meus Questionários', subtitle: 'Ver questionários', screen: 'MeusQuestionarios', icon: '📋', color: '#075D94' },
    { title: 'Criar Questionário', subtitle: 'Novo questionário', screen: 'CriarQuestionario', icon: '➕', color: '#FF7E00' },
    { title: 'Meus Grupos', subtitle: 'Ver participantes', screen: 'MinhasTurmas', icon: '📚', color: '#7ABA43' },
    { title: 'Insights Preditivos', subtitle: 'Machine Learning', screen: 'MLInsights', icon: '🤖', color: '#9333EA' },
  ];

  return (
    <>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.menuCard, { borderLeftColor: item.color, borderLeftWidth: 6 }]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>{item.icon}</Text>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { fontSize: Math.min(width * 0.055, 24) * fontScale }]}>
              {item.title}
            </Text>
            <Text style={[styles.menuSubtitle, { fontSize: Math.min(width * 0.04, 18) * fontScale }]}>
              {item.subtitle}
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: item.color }]}>›</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}

function AlunoMenu({ navigation, fontScale }: any) {
  const { data: turmas, isLoading: turmasLoading } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: alunoService.getMinhasTurmas
  });

  const { data: faceStatus } = useQuery({
    queryKey: ['face-status'],
    queryFn: authService.statusRosto,
  });

  const semTurma = !turmasLoading && turmas !== undefined && turmas.length === 0;

  const { data: questionarios, isLoading } = useQuery({
    queryKey: ['questionarios-ativos'],
    queryFn: () => alunoService.getQuestionariosAtivos()
  });

  const pendentes = questionarios?.filter((q: any) => !q.respondido) || [];
  const respondidos = questionarios?.filter((q: any) => q.respondido) || [];

  return (
    <>
      {turmas && turmas.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={[styles.infoText, { fontSize: Math.min(width * 0.045, 20) * fontScale }]}>
            🎓 {turmas.map((t: any) => t.nome).join(', ')}
          </Text>
        </View>
      )}

      {semTurma && (
        <View style={styles.semTurmaCard}>
          <Text style={styles.semTurmaIcon}>⚠️</Text>
          <Text style={[styles.semTurmaText, { fontSize: Math.min(width * 0.05, 22) * fontScale }]}>
            Você não está vinculado a nenhum grupo
          </Text>
          <Text style={[styles.semTurmaSubtext, { fontSize: Math.min(width * 0.04, 18) * fontScale }]}>
            Fale com seu coordenador ou administrador para ser incluído em um grupo.
          </Text>
        </View>
      )}

      {isLoading && (
        <Text style={[styles.loadingText, { fontSize: Math.min(width * 0.05, 22) * fontScale }]}>
          Carregando...
        </Text>
      )}

      {pendentes.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { fontSize: Math.min(width * 0.065, 26) * fontScale }]}>
            📋 Questionários Disponíveis
          </Text>
          {pendentes.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.questionCard}
              onPress={() => navigation.navigate('Questionario', { id: item.id, turmaId: item.turma?.id || turmas?.[0]?.id })}
              activeOpacity={0.7}
            >
              <Text style={[styles.questionTitle, { fontSize: Math.min(width * 0.055, 24) * fontScale }]}>
                {item.titulo}
              </Text>
              {item.descricao && (
                <Text style={[styles.questionDescription, { fontSize: Math.min(width * 0.042, 18) * fontScale }]}>
                  {item.descricao}
                </Text>
              )}
              <View style={styles.questionFooter}>
                <Text style={[styles.questionMeta, { fontSize: Math.min(width * 0.038, 16) * fontScale }]}>
                  {item._count?.perguntas || 0} perguntas
                </Text>
                <View style={styles.answerButton}>
                  <Text style={[styles.answerButtonText, { fontSize: Math.min(width * 0.04, 18) * fontScale }]}>
                    RESPONDER ›
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {pendentes.length === 0 && !isLoading && !semTurma && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={[styles.emptyText, { fontSize: Math.min(width * 0.05, 22) * fontScale }]}>
            Nenhum questionário pendente no momento
          </Text>
        </View>
      )}

      {/* Menu de gestão facial */}
      <TouchableOpacity
        style={[styles.menuCard, { borderLeftColor: '#075D94', borderLeftWidth: 6, marginTop: 16 }]}
        onPress={() => navigation.navigate('CadastrarRosto')}
        activeOpacity={0.7}
      >
        <Text style={styles.menuIcon}>🪪</Text>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { fontSize: Math.min(width * 0.055, 24) * fontScale }]}>
            {faceStatus?.faceRegistrada ? 'Gerenciar Rosto' : 'Cadastrar Rosto'}
          </Text>
          <Text style={[styles.menuSubtitle, { fontSize: Math.min(width * 0.04, 18) * fontScale }]}>
            {faceStatus?.faceRegistrada ? 'Remover login facial' : 'Ativar login pelo rosto'}
          </Text>
        </View>
        <Text style={[styles.menuArrow, { color: '#075D94' }]}>›</Text>
      </TouchableOpacity>

      {respondidos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginTop: 32, fontSize: Math.min(width * 0.065, 26) * fontScale }]}>
            ✅ Já Respondidos
          </Text>
          {respondidos.map((item: any) => (
            <View key={item.id} style={styles.doneCard}>
              <Text style={[styles.doneTitle, { fontSize: Math.min(width * 0.05, 22) * fontScale }]}>
                {item.titulo}
              </Text>
              <Text style={[styles.doneText, { fontSize: Math.min(width * 0.042, 18) * fontScale }]}>
                Obrigado pela participação!
              </Text>
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
    backgroundColor: '#F9FAFB'
  },
  header: {
    backgroundColor: '#075D94', // Azul Vida Mais
    paddingHorizontal: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#FF7E00' // Laranja Vida Mais
  },
  greeting: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6
  },
  subtitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 12
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#FF7E00'
  },
  logoutText: {
    fontSize: Math.min(width * 0.04, 16),
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
  },
  semTurmaCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: width * 0.05,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#FF7E00',
    alignItems: 'center'
  },
  semTurmaIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  semTurmaText: {
    fontSize: Math.min(width * 0.05, 22),
    fontWeight: 'bold',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 8
  },
  semTurmaSubtext: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 24
  }
});
