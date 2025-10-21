import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { professorService } from '../../services/api';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function CriarQuestionarioScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [visibilidade, setVisibilidade] = useState('TURMA');
  const [turmaId, setTurmaId] = useState('');
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [showPerguntaForm, setShowPerguntaForm] = useState(false);
  
  // Form de pergunta
  const [enunciado, setEnunciado] = useState('');
  const [tipo, setTipo] = useState('TEXTO');
  const [opcoes, setOpcoes] = useState('');

  const { data: turmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: professorService.getMinhasTurmas
  });

  const createMutation = useMutation({
    mutationFn: professorService.createQuestionario,
    onSuccess: async (data) => {
      // Criar perguntas
      for (const pergunta of perguntas) {
        await professorService.createPergunta({
          questionarioId: data.id,
          ...pergunta
        });
      }
      
      Alert.alert('Sucesso', 'Questionário criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      queryClient.invalidateQueries({ queryKey: ['meus-questionarios'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar questionário');
    }
  });

  const handleAddPergunta = () => {
    if (!enunciado) {
      Alert.alert('Atenção', 'Digite o enunciado da pergunta');
      return;
    }

    const novaPergunta: any = {
      ordem: perguntas.length + 1,
      tipo,
      enunciado,
      obrigatoria: true
    };

    if (['UNICA', 'MULTIPLA'].includes(tipo)) {
      if (!opcoes) {
        Alert.alert('Atenção', 'Digite as opções separadas por vírgula');
        return;
      }
      novaPergunta.opcoes = opcoes.split(',').map(o => o.trim());
    }

    setPerguntas([...perguntas, novaPergunta]);
    setEnunciado('');
    setOpcoes('');
    setShowPerguntaForm(false);
    Alert.alert('Sucesso', 'Pergunta adicionada!');
  };

  const handleSubmit = () => {
    if (!titulo) {
      Alert.alert('Atenção', 'Digite o título do questionário');
      return;
    }

    if (visibilidade === 'TURMA' && !turmaId) {
      Alert.alert('Atenção', 'Selecione uma turma');
      return;
    }

    if (perguntas.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos uma pergunta');
      return;
    }

    createMutation.mutate({
      titulo,
      descricao,
      visibilidade,
      turmaId: visibilidade === 'TURMA' ? turmaId : undefined
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Informações do Questionário</Text>

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Pesquisa de Satisfação 2025"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva o objetivo..."
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Visibilidade *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={visibilidade}
            onValueChange={setVisibilidade}
          >
            <Picker.Item label="Turma Específica" value="TURMA" />
            <Picker.Item label="Global (todas)" value="GLOBAL" />
          </Picker>
        </View>

        {visibilidade === 'TURMA' && (
          <>
            <Text style={styles.label}>Turma *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={turmaId}
                onValueChange={setTurmaId}
              >
                <Picker.Item label="Selecione uma turma..." value="" />
                {turmas?.map((turma: any) => (
                  <Picker.Item key={turma.id} label={turma.nome} value={turma.id} />
                ))}
              </Picker>
            </View>
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.perguntasHeader}>
          <Text style={styles.sectionTitle}>
            Perguntas ({perguntas.length})
          </Text>
          <TouchableOpacity
            style={styles.addPerguntaButton}
            onPress={() => setShowPerguntaForm(!showPerguntaForm)}
          >
            <Text style={styles.addPerguntaText}>
              {showPerguntaForm ? '✕' : '➕'}
            </Text>
          </TouchableOpacity>
        </View>

        {showPerguntaForm && (
          <View style={styles.perguntaForm}>
            <Text style={styles.label}>Enunciado *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite a pergunta..."
              value={enunciado}
              onChangeText={setEnunciado}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.label}>Tipo *</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={tipo} onValueChange={setTipo}>
                <Picker.Item label="Texto livre" value="TEXTO" />
                <Picker.Item label="Escolha única" value="UNICA" />
                <Picker.Item label="Múltipla escolha" value="MULTIPLA" />
                <Picker.Item label="Escala (1-5)" value="ESCALA" />
                <Picker.Item label="Sim/Não" value="BOOLEAN" />
              </Picker>
            </View>

            {['UNICA', 'MULTIPLA'].includes(tipo) && (
              <>
                <Text style={styles.label}>Opções (separadas por vírgula) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ótimo, Bom, Regular, Ruim"
                  value={opcoes}
                  onChangeText={setOpcoes}
                />
              </>
            )}

            <TouchableOpacity
              style={styles.submitPerguntaButton}
              onPress={handleAddPergunta}
            >
              <Text style={styles.submitButtonText}>Adicionar Pergunta</Text>
            </TouchableOpacity>
          </View>
        )}

        {perguntas.map((p, index) => (
          <View key={index} style={styles.perguntaCard}>
            <Text style={styles.perguntaNumero}>Pergunta {index + 1}</Text>
            <Text style={styles.perguntaEnunciado}>{p.enunciado}</Text>
            <Text style={styles.perguntaTipo}>Tipo: {p.tipo}</Text>
            <TouchableOpacity
              onPress={() => setPerguntas(perguntas.filter((_, i) => i !== index))}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>🗑️ Remover</Text>
            </TouchableOpacity>
          </View>
        ))}

        {perguntas.length > 0 && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit}
          >
            <Text style={styles.createButtonText}>
              ✓ Criar Questionário
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151'
  },
  input: {
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginVertical: 24
  },
  perguntasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  addPerguntaButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addPerguntaText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold'
  },
  perguntaForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#0284c7'
  },
  submitPerguntaButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  perguntaCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7'
  },
  perguntaNumero: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
    marginBottom: 8
  },
  perguntaEnunciado: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  perguntaTipo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  removeButton: {
    alignSelf: 'flex-start',
    padding: 8
  },
  removeButtonText: {
    fontSize: 14,
    color: '#ef4444'
  },
  addButton: {
    backgroundColor: '#0284c7',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  createButton: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24
  },
  createButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24
  },
  emptyButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

