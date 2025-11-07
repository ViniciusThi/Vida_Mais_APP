import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { alunoService } from '../services/api';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

export default function QuestionarioScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id, turmaId } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, any>>({});

  const { data: questionario, isLoading } = useQuery({
    queryKey: ['questionario', id],
    queryFn: () => alunoService.getQuestionario(id)
  });

  const enviarMutation = useMutation({
    mutationFn: alunoService.enviarRespostas,
    onSuccess: () => {
      navigation.replace('Success');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao enviar respostas');
    }
  });

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

  const falar = () => {
    try {
      // Para perguntas de múltipla escolha, ler também as opções
      let textoParaLer = pergunta.enunciado;
      
      if (['UNICA', 'MULTIPLA'].includes(pergunta.tipo) && pergunta.opcoes && pergunta.opcoes.length > 0) {
        textoParaLer += '. Opções: ' + pergunta.opcoes.join('. ');
      }
      
      Speech.speak(textoParaLer, { 
        language: 'pt-BR', 
        rate: 0.7, // Mais lento para idosos
        pitch: 1.0,
        volume: 1.0
      });
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      Alert.alert('Erro', 'Não foi possível reproduzir o áudio. Verifique as configurações do dispositivo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Pergunta {currentIndex + 1} de {perguntas.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${((currentIndex + 1) / perguntas.length) * 100}%` }]} 
          />
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.scrollContainer}>
        <View style={styles.questionCard}>
          {/* Speaker Button */}
          <TouchableOpacity onPress={falar} style={styles.speakerButton} activeOpacity={0.7}>
            <Text style={styles.speakerIcon}>🔊</Text>
            <Text style={styles.speakerText}>Ouvir</Text>
          </TouchableOpacity>
          
          <Text style={styles.question}>{pergunta.enunciado}</Text>
          {pergunta.obrigatoria && (
            <Text style={styles.required}>* Pergunta obrigatória</Text>
          )}

          {/* TEXTO */}
          {pergunta.tipo === 'TEXTO' && (
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Digite sua resposta aqui..."
              placeholderTextColor="#9CA3AF"
              value={respostas[pergunta.id]?.valor || ''}
              onChangeText={(text) => handleResposta(text, 'TEXTO')}
            />
          )}

          {/* ESCALA */}
          {pergunta.tipo === 'ESCALA' && (
            <View style={styles.escalaContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.escalaButton,
                    respostas[pergunta.id]?.valor === num && styles.escalaButtonActive
                  ]}
                  onPress={() => handleResposta(num, 'ESCALA')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.escalaText,
                    respostas[pergunta.id]?.valor === num && styles.escalaTextActive
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
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
                <Text style={styles.booleanIcon}>✓</Text>
                <Text style={styles.booleanText}>SIM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  respostas[pergunta.id]?.valor === false && styles.booleanButtonActive
                ]}
                onPress={() => handleResposta(false, 'BOOLEAN')}
                activeOpacity={0.7}
              >
                <Text style={styles.booleanIcon}>✗</Text>
                <Text style={styles.booleanText}>NÃO</Text>
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
                    respostas[pergunta.id]?.valor === opcao && styles.opcaoTextActive
                  ]}>
                    {opcao}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handleAnterior}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
            ← ANTERIOR
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleProxima}
          activeOpacity={0.7}
        >
          <Text style={styles.navButtonTextPrimary}>
            {currentIndex === perguntas.length - 1 ? '✓ ENVIAR' : 'PRÓXIMA →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    flex: 1,
    padding: width * 0.04,
    justifyContent: 'flex-start'
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
    elevation: 5,
    flexShrink: 1,
    maxHeight: '100%'
  },
  speakerButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#CC6500'
  },
  question: {
    fontSize: Math.min(width * 0.08, 36),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 14,
    lineHeight: 44
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: isTablet ? 16 : 8,
    flexShrink: 1
  },
  escalaButton: {
    width: isTablet ? 90 : Math.min(width * 0.16, 70),
    height: isTablet ? 90 : Math.min(width * 0.16, 70),
    borderRadius: isTablet ? 45 : Math.min(width * 0.08, 35),
    borderWidth: 3,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  escalaButtonActive: {
    backgroundColor: '#7ABA43', // Verde
    borderColor: '#7ABA43'
  },
  escalaText: {
    fontSize: Math.min(width * 0.09, 36),
    fontWeight: 'bold',
    color: '#6B7280'
  },
  escalaTextActive: {
    color: '#FFFFFF'
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
  navButtonDisabled: {
    opacity: 0.4
  },
  navButtonText: {
    fontSize: Math.min(width * 0.058, 24),
    fontWeight: 'bold',
    color: '#1F2937'
  },
  navButtonTextDisabled: {
    color: '#9CA3AF'
  },
  navButtonTextPrimary: {
    fontSize: Math.min(width * 0.058, 24),
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});
