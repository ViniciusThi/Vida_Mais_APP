import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { alunoService } from '../services/api';
import * as Speech from 'expo-speech';
import { colors, fontSizes, spacing, buttonSizes, borderRadius } from '../theme/colors';

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
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
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
      Alert.alert('Atenção', 'Por favor, responda esta pergunta antes de continuar.');
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
    Speech.speak(pergunta.enunciado, { language: 'pt-BR', rate: 0.8 });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Pergunta {currentIndex + 1} de {perguntas.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex + 1) / perguntas.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.questionCard}>
          <TouchableOpacity onPress={falar} style={styles.speakerButton}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
          
          <Text style={styles.question}>{pergunta.enunciado}</Text>
          {pergunta.obrigatoria && (
            <Text style={styles.required}>* Obrigatória</Text>
          )}

          {/* TEXTO */}
          {pergunta.tipo === 'TEXTO' && (
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Digite sua resposta..."
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
              >
                <Text style={styles.booleanText}>✓ Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  respostas[pergunta.id]?.valor === false && styles.booleanButtonActive
                ]}
                onPress={() => handleResposta(false, 'BOOLEAN')}
              >
                <Text style={styles.booleanText}>✗ Não</Text>
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
                >
                  <Text style={styles.opcaoText}>{opcao}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handleAnterior}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>← Anterior</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleProxima}
        >
          <Text style={styles.navButtonTextPrimary}>
            {currentIndex === perguntas.length - 1 ? 'Enviar' : 'Próxima →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.fundoApp
  },
  content: {
    padding: spacing.xl
  },
  loading: {
    fontSize: fontSizes.lg,
    textAlign: 'center',
    marginTop: 100,
    color: colors.neutral.cinzaMedio
  },
  progress: {
    marginBottom: spacing.xl + 8
  },
  progressText: {
    fontSize: fontSizes.md,
    color: colors.primary.azul,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '700'
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.neutral.cinzaClaro,
    borderRadius: borderRadius.medium,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.verde
  },
  questionCard: {
    backgroundColor: colors.neutral.branco,
    borderRadius: borderRadius.xlarge,
    padding: spacing.xxxl,
    marginBottom: spacing.xl,
    borderWidth: 3,
    borderColor: colors.primary.azulClaro,
    shadowColor: colors.shadow.media,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5
  },
  speakerButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    backgroundColor: colors.primary.laranjaMuitoClaro,
    padding: spacing.md,
    borderRadius: borderRadius.round,
    minWidth: 60,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary.laranja
  },
  speakerIcon: {
    fontSize: 40
  },
  question: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.neutral.preto,
    marginBottom: spacing.md,
    lineHeight: 42
  },
  required: {
    fontSize: fontSizes.sm,
    color: colors.feedback.erro,
    marginBottom: spacing.xl,
    fontWeight: '600'
  },
  textInput: {
    borderWidth: 3,
    borderColor: colors.neutral.cinzaClaro,
    borderRadius: borderRadius.medium,
    padding: spacing.lg + 4,
    fontSize: fontSizes.md,
    minHeight: 140,
    textAlignVertical: 'top',
    color: colors.neutral.preto,
    backgroundColor: colors.neutral.branco
  },
  escalaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs
  },
  escalaButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: colors.neutral.cinzaClaro,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.branco
  },
  escalaButtonActive: {
    backgroundColor: colors.primary.verde,
    borderColor: colors.primary.verde
  },
  escalaText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.neutral.cinzaMedio
  },
  escalaTextActive: {
    color: colors.neutral.branco
  },
  booleanContainer: {
    gap: spacing.lg
  },
  booleanButton: {
    padding: spacing.xxxl,
    borderRadius: borderRadius.large,
    borderWidth: 4,
    borderColor: colors.neutral.cinzaClaro,
    alignItems: 'center',
    minHeight: buttonSizes.large + 20,
    backgroundColor: colors.neutral.branco
  },
  booleanButtonActive: {
    backgroundColor: colors.primary.verde,
    borderColor: colors.primary.verde
  },
  booleanText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.neutral.preto
  },
  opcoesContainer: {
    gap: spacing.lg
  },
  opcaoButton: {
    padding: spacing.xl + 4,
    borderRadius: borderRadius.large,
    borderWidth: 4,
    borderColor: colors.neutral.cinzaClaro,
    minHeight: buttonSizes.large,
    justifyContent: 'center',
    backgroundColor: colors.neutral.branco
  },
  opcaoButtonActive: {
    backgroundColor: colors.primary.laranja,
    borderColor: colors.primary.laranja
  },
  opcaoText: {
    fontSize: fontSizes.md,
    color: colors.neutral.preto,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 30
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.neutral.branco,
    borderTopWidth: 3,
    borderTopColor: colors.primary.azulClaro
  },
  navButton: {
    flex: 1,
    padding: spacing.xl + 4,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.neutral.cinzaMuitoClaro,
    alignItems: 'center',
    minHeight: buttonSizes.large,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral.cinzaClaro
  },
  navButtonDisabled: {
    opacity: 0.3
  },
  navButtonPrimary: {
    backgroundColor: colors.primary.laranja,
    borderColor: colors.primary.laranja
  },
  navButtonText: {
    fontSize: fontSizes.buttonMedium,
    fontWeight: 'bold',
    color: colors.neutral.preto
  },
  navButtonTextPrimary: {
    fontSize: fontSizes.buttonMedium,
    fontWeight: 'bold',
    color: colors.neutral.branco
  }
});

