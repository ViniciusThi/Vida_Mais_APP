import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { authService, setAuthToken } from '../services/api';
import { colors, fontSizes, spacing, buttonSizes, borderRadius } from '../theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, senha);
      setAuthToken(response.token);
      await setAuth(response.token, response.user);
    } catch (error: any) {
      Alert.alert(
        'Não foi possível entrar',
        error.response?.data?.error || 'Verifique seu email e senha',
        [{ text: 'Tentar novamente', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* Quando adicionar a logo, descomente:
          <Image 
            source={require('../../assets/images/Logo_VidaMais.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          */}
          <Text style={styles.logoEmoji}>❤️</Text>
          <Text style={styles.title}>Vida Mais</Text>
          <Text style={styles.subtitle}>Pesquisa de Satisfação</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor={colors.neutral.cinzaMedio}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor={colors.neutral.cinzaMedio}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'ENTRAR'}
            </Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintTitle}>💡 Credenciais de teste</Text>
            <Text style={styles.hintText}>Aluno: aluno1@vidamais.com</Text>
            <Text style={styles.hintText}>Professor: prof1@vidamais.com</Text>
            <Text style={styles.hintText}>Admin: admin@vidamais.com</Text>
            <Text style={[styles.hintText, { marginTop: 8, fontWeight: '600' }]}>
              Senha para todos: aluno123 ou prof123 ou admin123
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.azul,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl + 20
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg
  },
  title: {
    fontSize: fontSizes.xxl + 4,
    fontWeight: 'bold',
    color: colors.neutral.branco,
    marginBottom: spacing.sm,
    letterSpacing: 0.5
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.primary.azulMuitoClaro,
    fontWeight: '500'
  },
  form: {
    backgroundColor: colors.neutral.branco,
    borderRadius: borderRadius.xlarge,
    padding: spacing.xxxl,
    shadowColor: colors.shadow.forte,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.neutral.preto
  },
  input: {
    fontSize: fontSizes.md,
    borderWidth: 3,
    borderColor: colors.neutral.cinzaClaro,
    borderRadius: borderRadius.medium,
    padding: spacing.lg + 4,
    marginBottom: spacing.xl + 4,
    backgroundColor: colors.neutral.branco,
    color: colors.neutral.preto
  },
  button: {
    backgroundColor: colors.primary.laranja,
    borderRadius: borderRadius.medium,
    padding: spacing.xl + 4,
    alignItems: 'center',
    minHeight: buttonSizes.large,
    justifyContent: 'center',
    shadowColor: colors.shadow.media,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: colors.neutral.branco,
    fontSize: fontSizes.buttonLarge,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  hint: {
    marginTop: spacing.xl + 8,
    padding: spacing.lg,
    backgroundColor: colors.primary.azulMuitoClaro,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.primary.azulClaro
  },
  hintTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary.azul,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  hintText: {
    fontSize: fontSizes.xs,
    color: colors.primary.azulEscuro,
    textAlign: 'center',
    lineHeight: 24
  }
});

