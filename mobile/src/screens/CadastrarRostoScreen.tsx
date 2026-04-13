import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api';
import { captureAndResize } from '../utils/captureAndResize';
import { useAuthStore } from '../stores/authStore';

const { width } = Dimensions.get('window');

type Etapa = 'camera' | 'sucesso' | 'erro';

export default function CadastrarRostoScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { needsFaceSetup, setNeedsFaceSetup } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>('camera');
  const [erro, setErro] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handlePular = () => {
    if (needsFaceSetup) {
      setNeedsFaceSetup(false);
    } else {
      navigation.navigate('Home');
    }
  };

  const handleCapture = async () => {
    if (loading) return;
    setErro(null);
    setLoading(true);
    try {
      const base64 = await captureAndResize(cameraRef);
      await authService.cadastrarRosto(base64);
      // Invalidar cache do status para atualizar o menu
      await queryClient.invalidateQueries({ queryKey: ['face-status'] });
      setEtapa('sucesso');
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.error ||
        error?.message ||
        'Erro ao cadastrar rosto. Tente novamente.';
      setErro(mensagem);
      setEtapa('erro');
    } finally {
      setLoading(false);
    }
  };

  const handleTentarNovamente = () => {
    setErro(null);
    setEtapa('camera');
  };

  // Tela de sucesso
  if (etapa === 'sucesso') {
    return (
      <View style={styles.resultadoContainer}>
        <View style={styles.sucessoCard}>
          <Text style={styles.sucessoIcone}>✅</Text>
          <Text style={styles.sucessoTitulo}>Rosto Cadastrado!</Text>
          <Text style={styles.sucessoTexto}>
            Agora você pode entrar no aplicativo usando apenas o seu rosto, sem precisar digitar sua senha.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.irInicioBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.irInicioBtnTexto}>IR PARA O INÍCIO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Tela de erro (fora da câmera)
  if (etapa === 'erro') {
    return (
      <View style={styles.resultadoContainer}>
        <View style={styles.erroCardGrande}>
          <Text style={styles.erroIcone}>⚠️</Text>
          <Text style={styles.erroTituloGrande}>Não foi possível cadastrar</Text>
          <Text style={styles.erroTextoGrande}>{erro}</Text>
        </View>
        <TouchableOpacity
          style={styles.tentarNovamenteBotao}
          onPress={handleTentarNovamente}
          activeOpacity={0.8}
        >
          <Text style={styles.tentarNovamenteBotaoTexto}>TENTAR NOVAMENTE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.voltarLink} onPress={handlePular}>
          <Text style={styles.voltarLinkTexto}>Pular por agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Sem permissão ainda
  if (!permission) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#FF7E00" />
      </View>
    );
  }

  // Permissão negada
  if (!permission.granted) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.permissaoTitulo}>Câmera necessária</Text>
        <Text style={styles.permissaoTexto}>
          Precisamos acessar a câmera para fotografar seu rosto e cadastrá-lo no sistema.
        </Text>
        <TouchableOpacity style={styles.permissaoBotao} onPress={requestPermission}>
          <Text style={styles.permissaoBotaoTexto}>PERMITIR CÂMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.voltarLink} onPress={handlePular}>
          <Text style={styles.voltarLinkTexto}>Pular por agora</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Câmera frontal */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" />

      {/* Overlay superior */}
      <View style={styles.overlayTopo}>
        <Text style={styles.instrucaoTitulo}>Cadastrar Meu Rosto</Text>
        <Text style={styles.instrucaoSubtitulo}>
          Centralize o rosto na moldura e tire uma selfie nítida com boa iluminação
        </Text>
      </View>

      {/* Moldura oval */}
      <View style={styles.molduraContainer} pointerEvents="none">
        <View style={styles.molduraOval} />
      </View>

      {/* Erro inline (sem sair da câmera) */}
      {erro && etapa === 'camera' && (
        <View style={styles.erroInline}>
          <Text style={styles.erroInlineTexto}>{erro}</Text>
        </View>
      )}

      {/* Rodapé com botão de captura */}
      <View style={styles.overlayRodape}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7E00" />
            <Text style={styles.loadingTexto}>Cadastrando rosto...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.capturaBotao}
            onPress={handleCapture}
            activeOpacity={0.8}
            accessibilityLabel="Capturar foto para cadastro facial"
            accessibilityHint="Toque para tirar uma selfie e cadastrar seu rosto"
          >
            <Text style={styles.capturaBotaoIcone}>📷</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.rodapeTexto}>Olhe diretamente para a câmera</Text>
        <TouchableOpacity style={styles.pularLink} onPress={handlePular}>
          <Text style={styles.pularLinkTexto}>Pular por agora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  resultadoContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayTopo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  instrucaoTitulo: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  instrucaoSubtitulo: {
    color: '#E5E7EB',
    fontSize: Math.min(width * 0.042, 17),
    textAlign: 'center',
    lineHeight: 24,
  },
  molduraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  molduraOval: {
    width: 220,
    height: 280,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#7ABA43',
    marginTop: -40,
  },
  erroInline: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 220,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#DC2626',
  },
  erroInlineTexto: {
    color: '#DC2626',
    fontSize: Math.min(width * 0.042, 17),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlayRodape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
  },
  capturaBotao: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#7ABA43',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 12,
  },
  capturaBotaoIcone: {
    fontSize: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingTexto: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.045, 18),
    marginTop: 12,
  },
  rodapeTexto: {
    color: '#E5E7EB',
    fontSize: Math.min(width * 0.04, 16),
    textAlign: 'center',
  },
  // Sucesso
  sucessoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 32,
    borderWidth: 3,
    borderColor: '#7ABA43',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  sucessoIcone: {
    fontSize: 64,
    marginBottom: 16,
  },
  sucessoTitulo: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: 'bold',
    color: '#14532D',
    textAlign: 'center',
    marginBottom: 12,
  },
  sucessoTexto: {
    fontSize: Math.min(width * 0.048, 20),
    color: '#166534',
    textAlign: 'center',
    lineHeight: 28,
  },
  irInicioBtn: {
    backgroundColor: '#7ABA43',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 40,
    minHeight: 70,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  irInicioBtnTexto: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: 'bold',
  },
  // Erro grande
  erroCardGrande: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 32,
    borderWidth: 3,
    borderColor: '#DC2626',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  erroIcone: {
    fontSize: 64,
    marginBottom: 16,
  },
  erroTituloGrande: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: 'bold',
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 12,
  },
  erroTextoGrande: {
    fontSize: Math.min(width * 0.048, 20),
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 28,
  },
  tentarNovamenteBotao: {
    backgroundColor: '#FF7E00',
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 40,
    minHeight: 70,
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  tentarNovamenteBotaoTexto: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: 'bold',
  },
  voltarLink: {
    paddingVertical: 16,
  },
  voltarLinkTexto: {
    color: '#075D94',
    fontSize: Math.min(width * 0.048, 20),
    fontWeight: '600',
  },
  pularLink: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  pularLinkTexto: {
    color: '#E5E7EB',
    fontSize: Math.min(width * 0.042, 17),
    fontWeight: '500',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  // Permissão
  permissaoTitulo: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  permissaoTexto: {
    fontSize: Math.min(width * 0.048, 20),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  permissaoBotao: {
    backgroundColor: '#FF7E00',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 40,
    minHeight: 70,
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissaoBotaoTexto: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
