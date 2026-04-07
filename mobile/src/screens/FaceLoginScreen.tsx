import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { authService, setAuthToken } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { captureAndResize } from '../utils/captureAndResize';

const { width, height } = Dimensions.get('window');

export default function FaceLoginScreen() {
  const navigation = useNavigation<any>();
  const { setAuth } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (loading) return;
    setErro(null);
    setLoading(true);
    try {
      const base64 = await captureAndResize(cameraRef);
      const response = await authService.loginComRosto(base64);
      setAuthToken(response.token);
      await setAuth(response.token, response.user);
      // Navegação automática — App.tsx redireciona ao detectar token
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.error ||
        error?.message ||
        'Erro ao reconhecer o rosto. Tente novamente.';
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

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
          Precisamos acessar a câmera para identificar seu rosto.
        </Text>
        <TouchableOpacity style={styles.permissaoBotao} onPress={requestPermission}>
          <Text style={styles.permissaoBotaoTexto}>PERMITIR CÂMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.voltarLink} onPress={() => navigation.goBack()}>
          <Text style={styles.voltarLinkTexto}>Voltar</Text>
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
        <TouchableOpacity style={styles.voltarBotao} onPress={() => navigation.goBack()}>
          <Text style={styles.voltarBotaoTexto}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.instrucaoTitulo}>Login pelo Rosto</Text>
        <Text style={styles.instrucaoSubtitulo}>Posicione seu rosto no centro e toque em capturar</Text>
      </View>

      {/* Moldura oval para guiar o usuário */}
      <View style={styles.molduraContainer} pointerEvents="none">
        <View style={styles.molduraOval} />
      </View>

      {/* Mensagem de erro */}
      {erro && (
        <View style={styles.erroCard}>
          <Text style={styles.erroTexto}>{erro}</Text>
          <Text style={styles.erroSubtexto}>Tente novamente com boa iluminação</Text>
        </View>
      )}

      {/* Botão de captura */}
      <View style={styles.overlayRodape}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7E00" />
            <Text style={styles.loadingTexto}>Reconhecendo rosto...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.capturaBotao}
            onPress={handleCapture}
            activeOpacity={0.8}
            accessibilityLabel="Capturar foto para login"
            accessibilityHint="Toque para tirar uma selfie e entrar com reconhecimento facial"
          >
            <Text style={styles.capturaBotaoIcone}>📷</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.rodapeTexto}>Olhe diretamente para a câmera</Text>
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
  voltarBotao: {
    marginBottom: 12,
  },
  voltarBotaoTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
    fontSize: Math.min(width * 0.045, 18),
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
    borderColor: '#FF7E00',
    marginTop: -40, // ajuste visual para centralizar melhor
  },
  erroCard: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 220,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#DC2626',
    alignItems: 'center',
  },
  erroTexto: {
    color: '#DC2626',
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  erroSubtexto: {
    color: '#6B7280',
    fontSize: Math.min(width * 0.038, 15),
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
    backgroundColor: '#FF7E00',
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
  // Permissão negada
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
  voltarLink: {
    paddingVertical: 16,
  },
  voltarLinkTexto: {
    color: '#075D94',
    fontSize: Math.min(width * 0.048, 20),
    fontWeight: '600',
  },
});
