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
    backgroundColor: '#f9fafb'
  },
  content: {
    padding: 20
  },
  loading: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 100
  },
  progress: {
    marginBottom: 24
  },
  progressText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284c7'
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20
  },
  speakerButton: {
    alignSelf: 'flex-end',
    marginBottom: 16
  },
  speakerIcon: {
    fontSize: 32
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 36
  },
  required: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 24
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  escalaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  escalaButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  escalaButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  escalaText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280'
  },
  escalaTextActive: {
    color: '#fff'
  },
  booleanContainer: {
    gap: 16
  },
  booleanButton: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center'
  },
  booleanButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  booleanText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  opcoesContainer: {
    gap: 12
  },
  opcaoButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  opcaoButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  opcaoText: {
    fontSize: 20,
    color: '#111827',
    textAlign: 'center'
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  navButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center'
  },
  navButtonDisabled: {
    opacity: 0.3
  },
  navButtonPrimary: {
    backgroundColor: '#0284c7'
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  navButtonTextPrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  }
});

