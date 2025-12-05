import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { alunoService } from '../services/api';
import { useFontSize } from '../contexts/FontSizeContext';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function QuestionarioScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { id, turmaId, initialIndex, enviarDireto, respostasIniciais } = route.params || {};
  const { fontScale } = useFontSize();
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [respostas, setRespostas] = useState<Record<string, any>>(respostasIniciais || {});
  const [vozPtBr, setVozPtBr] = useState<string | null>(null);
  useEffect(() => {
    const configurarAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
      } catch (error) {
        console.error('Erro ao configurar modo de áudio:', error);
      }
    };

    const carregarVozes = async () => {
      try {
        const vozes = await Speech.getAvailableVoicesAsync();
        
        // 🇧🇷 PRIORIDADE 1: Buscar especificamente por pt-BR (Brasil)
        let voz = vozes.find((item) => {
          const idioma = item.language?.toLowerCase();
          return idioma?.startsWith('pt-br') || idioma?.includes('br');
        });

        // 🇵🇹 FALLBACK: Se não encontrar pt-BR, usa pt (Portugal)
        if (!voz) {
          voz = vozes.find((item) => {
            const idioma = item.language?.toLowerCase();
            return idioma?.startsWith('pt');
          });
        }

        if (voz) {
          setVozPtBr(voz.identifier);
          console.log('✅ Voz selecionada:', voz.identifier, voz.language);
        } else {
          console.warn('⚠️ Nenhuma voz em português encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar vozes disponíveis:', error);
      }
    };

    configurarAudio();
    carregarVozes();
  }, []);


  const { data: questionario, isLoading } = useQuery({
    queryKey: ['questionario', id],
    queryFn: () => alunoService.getQuestionario(id)
  });

  const enviarMutation = useMutation({
    mutationFn: alunoService.enviarRespostas,
    onSuccess: () => {
      // Invalida o cache para atualizar a lista de questionários na Home
      queryClient.invalidateQueries({ queryKey: ['questionarios-ativos'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-turmas'] });
      navigation.replace('Success');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao enviar respostas');
    }
  });

  // Se initialIndex foi passado, atualiza o índice quando o componente montar
  useEffect(() => {
    if (initialIndex !== undefined && initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  // Se enviarDireto for true, envia imediatamente
  useEffect(() => {
    if (enviarDireto && questionario && Object.keys(respostas).length > 0) {
      handleEnviar();
    }
  }, [enviarDireto, questionario, respostas]);

  if (isLoading || !questionario) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando questionário...</Text>
      </View>
    );
  }

  const perguntas = questionario.perguntas || [];
  const pergunta = perguntas[currentIndex];

  const handleResposta = (valor: any, tipo: string) => {
    setRespostas({
      ...respostas,
      [pergunta.id]: { perguntaId: pergunta.id, tipo, valor }
    });
  };

  const handleProxima = () => {
    if (pergunta.obrigatoria && !respostas[pergunta.id]) {
      Alert.alert('Atenção', 'Por favor, responda esta pergunta antes de continuar.', [
        { text: 'OK', style: 'default' }
      ]);
      return;
    }

    if (currentIndex < perguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleEnviar();
    }
  };

  const handleRevisar = () => {
    // Valida se todas as obrigatórias foram respondidas
    const obrigatorias = perguntas.filter((p: any) => p.obrigatoria);
    const respondidas = Object.keys(respostas);
    const faltantes = obrigatorias.filter((p: any) => !respondidas.includes(p.id));

    if (faltantes.length > 0) {
      Alert.alert(
        'Atenção',
        `Por favor, responda todas as perguntas obrigatórias antes de revisar.\n\nFaltam ${faltantes.length} pergunta(s) obrigatória(s).`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Navega para a tela de revisão
    navigation.navigate('RevisarRespostas', {
      questionario,
      respostas,
      id,
      turmaId
    });
  };

  const handleAnterior = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleEnviar = () => {
    const respostasArray = Object.values(respostas).map((r: any) => {
      const payload: any = { perguntaId: r.perguntaId };
      
      if (r.tipo === 'TEXTO') payload.valorTexto = r.valor;
      else if (r.tipo === 'ESCALA') payload.valorNum = r.valor;
      else if (r.tipo === 'BOOLEAN') payload.valorBool = r.valor;
      else if (['UNICA', 'MULTIPLA'].includes(r.tipo)) payload.valorOpcao = r.valor;
      
      return payload;
    });

    enviarMutation.mutate({
      questionarioId: id,
      turmaId,
      respostas: respostasArray
    });
  };

  const falar = async () => {
    try {
      // Para perguntas de múltipla escolha, ler também as opções
      let textoParaLer = pergunta.enunciado;
      
      if (['UNICA', 'MULTIPLA'].includes(pergunta.tipo) && pergunta.opcoes && pergunta.opcoes.length > 0) {
        textoParaLer += '. Opções: ' + pergunta.opcoes.join('. ');
      }

      const falando = await Speech.isSpeakingAsync();
      if (falando) {
        await Speech.stop();
      }

      const opcoesDeVoz: Speech.SpeechOptions = {
        language: vozPtBr ? 'pt-BR' : undefined,
        voice: vozPtBr ?? undefined,
        rate: 0.7, // Mais lento para idosos
        pitch: 1.0,
        volume: 1.0
      };

      Speech.speak(textoParaLer, opcoesDeVoz);
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio. Verifique as configurações do dispositivo.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { fontSize: Math.min(width * 0.06, 26) * fontScale }]}>
            Pergunta {currentIndex + 1} de {perguntas.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${((currentIndex + 1) / perguntas.length) * 100}%` }]} 
            />
          </View>
        </View>

        {/* Question Card with ScrollView */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.questionCard}>
            {/* Speaker Button */}
            <TouchableOpacity onPress={falar} style={styles.speakerButton} activeOpacity={0.7}>
              <Text style={styles.speakerIcon}>🔊</Text>
              <Text style={[styles.speakerText, { fontSize: Math.min(width * 0.055, 24) * fontScale }]}>
                Ouvir
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.question, { fontSize: Math.min(width * 0.08, 36) * fontScale }]}>
              {pergunta.enunciado}
            </Text>
            {pergunta.obrigatoria && (
              <Text style={[styles.required, { fontSize: Math.min(width * 0.052, 22) * fontScale }]}>
                * Pergunta obrigatória
              </Text>
            )}

            {/* TEXTO */}
            {pergunta.tipo === 'TEXTO' && (
              <TextInput
                style={[styles.textInput, { fontSize: Math.min(width * 0.058, 24) * fontScale }]}
                multiline
                numberOfLines={4}
                placeholder="Digite sua resposta aqui..."
                placeholderTextColor="#9CA3AF"
                value={respostas[pergunta.id]?.valor || ''}
                onChangeText={(text) => handleResposta(text, 'TEXTO')}
                onBlur={() => Keyboard.dismiss()}
                autoCorrect={true}
                autoCapitalize="sentences"
              />
            )}

            {/* ESCALA */}
            {pergunta.tipo === 'ESCALA' && (
              <View style={styles.escalaContainer}>
                <View style={styles.escalaSliderContainer}>
                  <Text style={[styles.escalaLabel, { fontSize: Math.min(width * 0.05, 20) * fontScale }]}>
                    Valor selecionado: <Text style={styles.escalaValue}>{respostas[pergunta.id]?.valor || 5}</Text>
                  </Text>
                  <Slider
                    style={styles.escalaSlider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={respostas[pergunta.id]?.valor || 5}
                    onValueChange={(value) => handleResposta(Math.round(value), 'ESCALA')}
                    minimumTrackTintColor="#7ABA43"
                    maximumTrackTintColor="#D1D5DB"
                    thumbTintColor="#FF7E00"
                  />
                  <View style={styles.escalaLabels}>
                    <Text style={[styles.escalaMinMax, { fontSize: Math.min(width * 0.04, 16) * fontScale }]}>0</Text>
                    <Text style={[styles.escalaMinMax, { fontSize: Math.min(width * 0.04, 16) * fontScale }]}>10</Text>
                  </View>
                </View>
              </View>
            )}

            {/* BOOLEAN */}
            {pergunta.tipo === 'BOOLEAN' && (
              <View style={styles.booleanContainer}>
                <TouchableOpacity
                  style={[
                    styles.booleanButton,
                    respostas[pergunta.id]?.valor === true && styles.booleanButtonActive
                  ]}
                  onPress={() => handleResposta(true, 'BOOLEAN')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.booleanIcon, { fontSize: Math.min(width * 0.08, 32) * fontScale }]}>
                    ✓
                  </Text>
                  <Text style={[styles.booleanText, { fontSize: Math.min(width * 0.075, 32) * fontScale }]}>
                    SIM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.booleanButton,
                    respostas[pergunta.id]?.valor === false && styles.booleanButtonActive
                  ]}
                  onPress={() => handleResposta(false, 'BOOLEAN')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.booleanIcon, { fontSize: Math.min(width * 0.08, 32) * fontScale }]}>
                    ✗
                  </Text>
                  <Text style={[styles.booleanText, { fontSize: Math.min(width * 0.075, 32) * fontScale }]}>
                    NÃO
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* UNICA / MULTIPLA */}
            {['UNICA', 'MULTIPLA'].includes(pergunta.tipo) && pergunta.opcoes && (
              <View style={styles.opcoesContainer}>
                {pergunta.opcoes.map((opcao: string) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.opcaoButton,
                      respostas[pergunta.id]?.valor === opcao && styles.opcaoButtonActive
                    ]}
                    onPress={() => handleResposta(opcao, pergunta.tipo)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.opcaoText,
                      { fontSize: Math.min(width * 0.06, 26) * fontScale },
                      respostas[pergunta.id]?.valor === opcao && styles.opcaoTextActive
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSecondary, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handleAnterior}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.navButtonText,
              { fontSize: Math.min(width * 0.058, 24) * fontScale },
              currentIndex === 0 && styles.navButtonTextDisabled
            ]}>
              ← ANTERIOR
            </Text>
          </TouchableOpacity>
          
          {currentIndex === perguntas.length - 1 ? (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRevisar]}
              onPress={handleRevisar}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonTextRevisar, { fontSize: Math.min(width * 0.058, 24) * fontScale }]}>
                📋 REVISAR
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonPrimary]}
              onPress={handleProxima}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonTextPrimary, { fontSize: Math.min(width * 0.058, 24) * fontScale }]}>
                PRÓXIMA →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    fontSize: Math.min(width * 0.065, 28),
    color: '#6B7280'
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    padding: width * 0.04,
    paddingBottom: 20
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.05,
    paddingVertical: 18,
    borderBottomWidth: 3,
    borderBottomColor: '#7ABA43' // Verde
  },
  progressText: {
    fontSize: Math.min(width * 0.06, 26),
    color: '#075D94', // Azul
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '700'
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7ABA43' // Verde
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: width * 0.05,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#075D94', // Azul
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5
  },
  speakerButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    backgroundColor: '#FFE5CC', // Laranja claro
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FF7E00', // Laranja
    minHeight: 70
  },
  speakerIcon: {
    fontSize: 36,
    marginRight: 10
  },
  speakerText: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: '700',
    color: '#CC6500',
    flexShrink: 1
  },
  question: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 14,
    lineHeight: 44,
    flexShrink: 1,
    flexWrap: 'wrap'
  },
  required: {
    fontSize: Math.min(width * 0.052, 22),
    color: '#DC2626',
    marginBottom: 20,
    fontWeight: '600'
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 20,
    fontSize: Math.min(width * 0.058, 24),
    minHeight: 120,
    maxHeight: 150,
    textAlignVertical: 'top',
    color: '#1F2937',
    backgroundColor: '#F9FAFB'
  },
  escalaContainer: {
    flexShrink: 1,
    marginTop: 8
  },
  escalaSliderContainer: {
    width: '100%'
  },
  escalaLabel: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center'
  },
  escalaValue: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: 'bold',
    color: '#FF7E00'
  },
  escalaSlider: {
    width: '100%',
    height: 50
  },
  escalaLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4
  },
  escalaMinMax: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6B7280',
    fontWeight: '500'
  },
  booleanContainer: {
    gap: 14,
    flexShrink: 1
  },
  booleanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    minHeight: 90,
    backgroundColor: '#FFFFFF'
  },
  booleanButtonActive: {
    backgroundColor: '#7ABA43', // Verde
    borderColor: '#7ABA43'
  },
  booleanIcon: {
    fontSize: Math.min(width * 0.08, 32),
    marginRight: 12,
    fontWeight: 'bold'
  },
  booleanText: {
    fontSize: Math.min(width * 0.075, 32),
    fontWeight: 'bold',
    color: '#1F2937'
  },
  opcoesContainer: {
    gap: 12,
    flexShrink: 1
  },
  opcaoButton: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    minHeight: 70,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  opcaoButtonActive: {
    backgroundColor: '#FF7E00', // Laranja
    borderColor: '#FF7E00'
  },
  opcaoText: {
    fontSize: Math.min(width * 0.06, 26),
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 32
  },
  opcaoTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: width * 0.04,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#075D94', // Azul
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  navButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70
  },
  navButtonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB'
  },
  navButtonPrimary: {
    backgroundColor: '#FF7E00', // Laranja
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  navButtonRevisar: {
    backgroundColor: '#075D94', // Azul
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  navButtonDisabled: {
    opacity: 0.4
  },
  navButtonText: {
    fontSize: Math.min(width * 0.058, 24),
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flexShrink: 1
  },
  navButtonTextDisabled: {
    color: '#9CA3AF'
  },
  navButtonTextPrimary: {
    fontSize: Math.min(width * 0.058, 24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1
  },
  navButtonTextRevisar: {
    fontSize: Math.min(width * 0.048, 20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1
  }
});
