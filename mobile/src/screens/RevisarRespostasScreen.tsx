import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { alunoService } from '../services/api';
import { useFontSize } from '../contexts/FontSizeContext';

const { width } = Dimensions.get('window');

export default function RevisarRespostasScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { fontScale } = useFontSize();
  
  const { questionario, respostas, id, turmaId } = route.params;

  const enviarMutation = useMutation({
    mutationFn: alunoService.enviarRespostas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questionarios-ativos'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-turmas'] });
      navigation.replace('Success');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao enviar respostas');
    }
  });

  const formatarResposta = (pergunta: any, resposta: any) => {
    if (!resposta) return <Text style={styles.naoRespondida}>Não respondida</Text>;

    switch (pergunta.tipo) {
      case 'BOOLEAN':
        return <Text style={styles.respostaTexto}>{resposta.valor === true || resposta.valor === 'true' ? 'Sim' : 'Não'}</Text>;
      case 'ESCALA':
        return <Text style={styles.respostaTexto}>{resposta.valor}/5</Text>;
      case 'TEXTO':
        return <Text style={styles.respostaTexto}>{resposta.valor}</Text>;
      case 'UNICA':
      case 'MULTIPLA':
        return <Text style={styles.respostaTexto}>{resposta.valor}</Text>;
      default:
        return <Text style={styles.respostaTexto}>{String(resposta.valor)}</Text>;
    }
  };

  const handleEditarPergunta = (perguntaIndex: number) => {
    // Navega de volta para a tela de questionário na pergunta específica, preservando as respostas
    navigation.navigate('Questionario', {
      id,
      turmaId,
      initialIndex: perguntaIndex,
      respostasIniciais: respostas
    });
  };

  const handleEnviar = () => {
    Alert.alert(
      'Confirmar Envio',
      'Deseja realmente enviar suas respostas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            // Prepara o payload das respostas
            const respostasArray = Object.values(respostas).map((r: any) => {
              const payload: any = { perguntaId: r.perguntaId };
              
              if (r.tipo === 'TEXTO') payload.valorTexto = r.valor;
              else if (r.tipo === 'ESCALA') payload.valorNum = r.valor;
              else if (r.tipo === 'BOOLEAN') payload.valorBool = r.valor;
              else if (['UNICA', 'MULTIPLA'].includes(r.tipo)) payload.valorOpcao = r.valor;
              
              return payload;
            });

            // Envia diretamente
            enviarMutation.mutate({
              questionarioId: id,
              turmaId,
              respostas: respostasArray
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: Math.min(width * 0.07, 30) * fontScale }]}>
          📋 Revisão das Respostas
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: Math.min(width * 0.045, 18) * fontScale }]}>
          {questionario.titulo}
        </Text>
      </View>

      {/* Resumo */}
      <View style={styles.resumoCard}>
        <Text style={[styles.resumoTitle, { fontSize: Math.min(width * 0.055, 22) * fontScale }]}>
          📊 Resumo
        </Text>
        <View style={styles.resumoRow}>
          <Text style={[styles.resumoLabel, { fontSize: Math.min(width * 0.042, 18) * fontScale }]}>
            Total: {questionario.perguntas?.length || 0}
          </Text>
          <Text style={[styles.resumoLabel, { fontSize: Math.min(width * 0.042, 18) * fontScale }]}>
            Respondidas: {Object.keys(respostas).length}
          </Text>
        </View>
      </View>

      {/* Lista de Perguntas e Respostas */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {questionario.perguntas?.map((pergunta: any, index: number) => {
          const resposta = respostas[pergunta.id];
          const respondida = !!resposta;

          return (
            <TouchableOpacity
              key={pergunta.id}
              style={[
                styles.perguntaCard,
                respondida && styles.perguntaCardRespondida
              ]}
              onPress={() => handleEditarPergunta(index)}
              activeOpacity={0.7}
            >
              <View style={styles.perguntaHeader}>
                <View style={[
                  styles.numeroBadge,
                  respondida && styles.numeroBadgeRespondida
                ]}>
                  <Text style={[
                    styles.numeroTexto,
                    { fontSize: Math.min(width * 0.045, 18) * fontScale },
                    respondida && styles.numeroTextoRespondida
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.perguntaContent}>
                  <Text style={[styles.perguntaEnunciado, { fontSize: Math.min(width * 0.055, 22) * fontScale }]}>
                    {pergunta.enunciado}
                    {pergunta.obrigatoria && <Text style={styles.obrigatoria}> *</Text>}
                  </Text>
                  <View style={styles.respostaContainer}>
                    {formatarResposta(pergunta, resposta)}
                  </View>
                </View>
              </View>
              <View style={styles.editarBadge}>
                <Text style={[styles.editarTexto, { fontSize: Math.min(width * 0.038, 16) * fontScale }]}>
                  Toque para editar →
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer com botão Enviar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.enviarButton, enviarMutation.isPending && styles.enviarButtonDisabled]}
          onPress={handleEnviar}
          disabled={enviarMutation.isPending}
          activeOpacity={0.7}
        >
          <Text style={[styles.enviarTexto, { fontSize: Math.min(width * 0.058, 24) * fontScale }]}>
            {enviarMutation.isPending ? 'ENVIANDO...' : '✓ ENVIAR RESPOSTAS'}
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.05,
    paddingVertical: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#075D94'
  },
  headerTitle: {
    fontSize: Math.min(width * 0.07, 30),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#6B7280'
  },
  resumoCard: {
    backgroundColor: '#FFFFFF',
    margin: width * 0.04,
    padding: width * 0.04,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7ABA43'
  },
  resumoTitle: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  resumoLabel: {
    fontSize: Math.min(width * 0.042, 18),
    color: '#6B7280',
    fontWeight: '600'
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    padding: width * 0.04,
    paddingBottom: 20
  },
  perguntaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  perguntaCardRespondida: {
    borderColor: '#7ABA43',
    borderLeftWidth: 6,
    borderLeftColor: '#7ABA43'
  },
  perguntaHeader: {
    flexDirection: 'row',
    gap: 12
  },
  numeroBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#075D94',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  },
  numeroBadgeRespondida: {
    backgroundColor: '#7ABA43'
  },
  numeroTexto: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  numeroTextoRespondida: {
    color: '#FFFFFF'
  },
  perguntaContent: {
    flex: 1
  },
  perguntaEnunciado: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 28
  },
  obrigatoria: {
    color: '#DC2626',
    fontWeight: 'bold'
  },
  respostaContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  respostaTexto: {
    fontSize: Math.min(width * 0.05, 20),
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 24
  },
  naoRespondida: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#9CA3AF',
    fontStyle: 'italic'
  },
  editarBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end'
  },
  editarTexto: {
    fontSize: Math.min(width * 0.038, 16),
    color: '#FF7E00',
    fontWeight: '600'
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: width * 0.04,
    borderTopWidth: 3,
    borderTopColor: '#075D94',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  enviarButton: {
    backgroundColor: '#7ABA43',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  enviarButtonDisabled: {
    opacity: 0.6
  },
  enviarTexto: {
    fontSize: Math.min(width * 0.058, 24),
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

