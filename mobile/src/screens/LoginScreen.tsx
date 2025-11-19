import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { authService, setAuthToken } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const [emailOuTelefone, setEmailOuTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!emailOuTelefone || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(emailOuTelefone, senha);
      setAuthToken(response.token);
      await setAuth(response.token, response.user);
    } catch (error: any) {
      Alert.alert(
        'Não foi possível entrar',
        error.response?.data?.error || 'Verifique seu email/telefone e senha',
        [{ text: 'Tentar novamente', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo_VidaMais.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.subtitle}>Pesquisa de Satisfação</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Login do Associado</Text>
          <Text style={styles.hint}>Email ou Telefone</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email ou telefone"
            placeholderTextColor="#9CA3AF"
            value={emailOuTelefone}
            onChangeText={setEmailOuTelefone}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Campo de email ou telefone"
            accessibilityHint="Digite seu email cadastrado ou número de telefone"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#9CA3AF"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            accessibilityLabel="Campo de senha"
            accessibilityHint="Digite sua senha de acesso"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.7}
            accessibilityLabel="Botão de login"
            accessibilityHint="Toque para fazer login"
          >
            <Text style={styles.buttonText}>
              {loading ? 'ENTRANDO...' : '✓ ENTRAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Cadastro' as never)}
            accessibilityLabel="Ir para cadastro"
            accessibilityHint="Toque para criar uma nova conta"
          >
            <Text style={styles.linkText}>Não tem cadastro? Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075D94' // Azul Vida Mais
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.05
  },
  logoContainer: {
    width: Math.min(width * 0.6, 240),
    height: Math.min(width * 0.6, 240),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  logo: {
    width: '100%',
    height: '100%'
  },
  subtitle: {
    fontSize: Math.min(width * 0.065, 28),
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    flexShrink: 1,
    alignSelf: 'center'
  },
  formContainer: {
    width: '100%',
    maxWidth: 500
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: width * 0.06,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  label: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: '700',
    marginBottom: 10,
    color: '#1F2937',
    flexShrink: 1
  },
  hint: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  input: {
    fontSize: Math.min(width * 0.05, 22),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    minHeight: 60
  },
  button: {
    backgroundColor: '#FF7E00', // Laranja Vida Mais
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.06, 26),
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    flexShrink: 1
  },
  linkButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center'
  },
  linkText: {
    fontSize: Math.min(width * 0.045, 20),
    color: '#075D94',
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});

