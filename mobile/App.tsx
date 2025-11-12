import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './src/stores/authStore';
import { FontSizeProvider } from './src/contexts/FontSizeContext';
import { useEffect, useState } from 'react';
import { Text, TextInput } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import QuestionarioScreen from './src/screens/QuestionarioScreen';
import SuccessScreen from './src/screens/SuccessScreen';

// Admin Screens
import ProfessoresScreen from './src/screens/admin/ProfessoresScreen';
import AlunosScreen from './src/screens/admin/AlunosScreen';
import TurmasScreen from './src/screens/admin/TurmasScreen';
import EditarTurmaScreen from './src/screens/admin/EditarTurmaScreen';
import EditarProfessorScreen from './src/screens/admin/EditarProfessorScreen';
import EditarAlunoScreen from './src/screens/admin/EditarAlunoScreen';

// Professor Screens
import MeusQuestionariosScreen from './src/screens/professor/MeusQuestionariosScreen';
import CriarQuestionarioScreen from './src/screens/professor/CriarQuestionarioScreen';
import RelatorioScreen from './src/screens/professor/RelatorioScreen';
import MinhasTurmasScreen from './src/screens/professor/MinhasTurmasScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// Configuração global para evitar quebra de layout com fontes muito grandes
Text.defaultProps = {
  ...(Text.defaultProps || {}),
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3
};

TextInput.defaultProps = {
  ...(TextInput.defaultProps || {}),
  allowFontScaling: true,
  maxFontSizeMultiplier: 1.3
};

export default function App() {
  const { token, loadToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return null; // Splash screen
  }

  return (
    <FontSizeProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#075D94' }, // Azul Vida Mais
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold', fontSize: 22 }
            }}
          >
            {!token ? (
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen} 
                  options={{ title: 'Vida Mais' }}
                />
                
                {/* Telas de Aluno */}
                <Stack.Screen 
                  name="Questionario" 
                  component={QuestionarioScreen} 
                  options={{ title: 'Responder Questionário' }}
                />
                <Stack.Screen 
                  name="Success" 
                  component={SuccessScreen} 
                  options={{ headerShown: false }}
                />
                
                {/* Telas de Admin */}
                <Stack.Screen 
                  name="Professores" 
                  component={ProfessoresScreen} 
                  options={{ title: 'Gerenciar Professores' }}
                />
                <Stack.Screen 
                  name="Alunos" 
                  component={AlunosScreen} 
                  options={{ title: 'Gerenciar Alunos' }}
                />
                <Stack.Screen 
                  name="Turmas" 
                  component={TurmasScreen} 
                  options={{ title: 'Gerenciar Turmas' }}
                />
                <Stack.Screen 
                  name="EditarTurma" 
                  component={EditarTurmaScreen} 
                  options={{ title: 'Editar Turma' }}
                />
                <Stack.Screen 
                  name="EditarProfessor" 
                  component={EditarProfessorScreen} 
                  options={{ title: 'Editar Professor' }}
                />
                <Stack.Screen 
                  name="EditarAluno" 
                  component={EditarAlunoScreen} 
                  options={{ title: 'Editar Aluno' }}
                />
                
                {/* Telas de Professor */}
                <Stack.Screen 
                  name="MeusQuestionarios" 
                  component={MeusQuestionariosScreen} 
                  options={{ title: 'Meus Questionários' }}
                />
                <Stack.Screen 
                  name="CriarQuestionario" 
                  component={CriarQuestionarioScreen} 
                  options={{ title: 'Criar Questionário' }}
                />
                <Stack.Screen 
                  name="Relatorio" 
                  component={RelatorioScreen} 
                  options={{ title: 'Relatório' }}
                />
                <Stack.Screen 
                  name="MinhasTurmas" 
                  component={MinhasTurmasScreen} 
                  options={{ title: 'Minhas Turmas' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </FontSizeProvider>
  );
}

