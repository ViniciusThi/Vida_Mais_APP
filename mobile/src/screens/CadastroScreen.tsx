import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService, setAuthToken } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const { width, height } = Dimensions.get('window');

export default function CadastroScreen() {
  const navigation = useNavigation<any>();
  const { setAuth, setNeedsFaceSetup } = useAuthStore();
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [deficiencia, setDeficiencia] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const buscarCep = async (valor: string) => {
    const limpo = valor.replace(/\D/g, '');
    setCep(valor);
    if (limpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const dados = await response.json();
      if (!dados.erro) {
        setLogradouro(`${dados.logradouro}, ${dados.bairro} - ${dados.localidade}/${dados.uf}`);
      }
    } catch {
      // silencioso — campo permanece editável
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCadastro = async () => {
    if (!nome || !idade || !email || !telefone || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    const idadeNum = parseInt(idade);
    if (isNaN(idadeNum) || idadeNum < 60) {
      Alert.alert('Atenção', 'A idade mínima é 60 anos', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    setLoading(true);
    try {
      await authService.cadastro({
        nome,
        idade: idadeNum,
        email,
        telefone,
        deficiencia: deficiencia || undefined,
        cep: cep.replace(/\D/g, '') || undefined,
        logradouro: logradouro || undefined,
        senha
      });

      const loginResponse = await authService.login(email, senha);
      setAuthToken(loginResponse.token);
      setNeedsFaceSetup(true);
      await setAuth(loginResponse.token, loginResponse.user);
    } catch (error: any) {
      Alert.alert(
        'Erro no cadastro',
        error.response?.data?.error || 'Não foi possível realizar o cadastro. Tente novamente.',
        [{ text: 'OK', style: 'default' }]
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
            source={require('../assets/Logo_Vidamais.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.subtitle}>Cadastro de Associado</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome completo"
            placeholderTextColor="#9CA3AF"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            accessibilityLabel="Campo de nome completo"
          />

          <Text style={styles.label}>Idade *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua idade"
            placeholderTextColor="#9CA3AF"
            value={idade}
            onChangeText={setIdade}
            keyboardType="numeric"
            accessibilityLabel="Campo de idade"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Campo de email"
          />

          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu telefone"
            placeholderTextColor="#9CA3AF"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            accessibilityLabel="Campo de telefone"
          />

          <Text style={styles.label}>Deficiência (opcional)</Text>
          <Text style={styles.hint}>Ex: auditiva, visual, etc.</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite se possui alguma deficiência"
            placeholderTextColor="#9CA3AF"
            value={deficiencia}
            onChangeText={setDeficiencia}
            accessibilityLabel="Campo de deficiência"
          />

          <Text style={styles.label}>CEP (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="00000-000"
            placeholderTextColor="#9CA3AF"
            value={cep}
            onChangeText={buscarCep}
            keyboardType="numeric"
            accessibilityLabel="Campo de CEP"
          />

          <Text style={styles.label}>Endereço (opcional)</Text>
          <Text style={styles.hint}>
            {buscandoCep ? 'Buscando endereço...' : 'Preenchido automaticamente pelo CEP'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Logradouro, bairro - cidade/UF"
            placeholderTextColor="#9CA3AF"
            value={logradouro}
            onChangeText={setLogradouro}
            accessibilityLabel="Campo de endereço"
          />

          <Text style={styles.label}>Senha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha (mínimo 6 caracteres)"
            placeholderTextColor="#9CA3AF"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            accessibilityLabel="Campo de senha"
          />

          <Text style={styles.label}>Confirmar Senha *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a senha novamente"
            placeholderTextColor="#9CA3AF"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            accessibilityLabel="Campo de confirmação de senha"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loading}
            activeOpacity={0.7}
            accessibilityLabel="Botão de cadastro"
          >
            <Text style={styles.buttonText}>
              {loading ? 'CADASTRANDO...' : '✓ CADASTRAR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar para login"
          >
            <Text style={styles.linkText}>Já tem cadastro? Fazer login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#075D94'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.03
  },
  logoContainer: {
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.5, 200),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: Math.min(width * 0.06, 26),
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5
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
    fontSize: Math.min(width * 0.05, 22),
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
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
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    minHeight: 60
  },
  button: {
    backgroundColor: '#FF7E00',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    marginTop: 8,
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
