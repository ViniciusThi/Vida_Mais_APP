import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { professorService } from '../../services/api';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { useFontSize } from '../../contexts/FontSizeContext';

const { width } = Dimensions.get('window');

export default function CriarQuestionarioScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { fontScale } = useFontSize();
  
  // Modo: 'TEMPLATE' ou 'MANUAL'
  const [modo, setModo] = useState<'TEMPLATE' | 'MANUAL'>('TEMPLATE');
  const [templateSelecionado, setTemplateSelecionado] = useState<any>(null);
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear().toString());
  const [visibilidade, setVisibilidade] = useState('GLOBAL');
  const [turmaId, setTurmaId] = useState('');
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [showPerguntaForm, setShowPerguntaForm] = useState(false);
  
  // Form de pergunta manual
  const [enunciado, setEnunciado] = useState('');
  const [tipo, setTipo] = useState('TEXTO');
  const [opcoes, setOpcoes] = useState('');

  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: professorService.getTemplates
  });

  const { data: turmas } = useQuery({
    queryKey: ['minhas-turmas'],
    queryFn: professorService.getMinhasTurmas
  });

  // Criar do template (questionário padrão)
  const criarDeTemplateMutation = useMutation({
    mutationFn: (dados: any) => professorService.criarDeTemplate(dados),
    onSuccess: () => {
      Alert.alert('Sucesso!', 'Questionário criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      queryClient.invalidateQueries({ queryKey: ['meus-questionarios'] });
      queryClient.invalidateQueries({ queryKey: ['questionarios-padrao'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar questionário');
    }
  });

  // Criar manual (modo tradicional)
  const criarManualMutation = useMutation({
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

  const handleSelecionarTemplate = (template: any) => {
    setTemplateSelecionado(template);
    setTitulo(`${template.nome} ${new Date().getFullYear()}`);
    setDescricao(template.descricao);
  };

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

    if (modo === 'TEMPLATE') {
      if (!templateSelecionado) {
        Alert.alert('Atenção', 'Selecione um template');
        return;
      }

      if (!ano || isNaN(Number(ano))) {
        Alert.alert('Atenção', 'Informe um ano válido');
        return;
      }

      criarDeTemplateMutation.mutate({
        templateId: templateSelecionado.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        ano: Number(ano),
        visibilidade: visibilidade as 'GLOBAL' | 'TURMA',
        turmaId: visibilidade === 'TURMA' ? turmaId : undefined
      });
    } else {
      // Modo manual
      if (perguntas.length === 0) {
        Alert.alert('Atenção', 'Adicione pelo menos uma pergunta');
        return;
      }

      criarManualMutation.mutate({
        titulo,
        descricao,
        visibilidade,
        turmaId: visibilidade === 'TURMA' ? turmaId : undefined
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Seletor de Modo */}
            <View style={styles.modoContainer}>
              <TouchableOpacity
                style={[styles.modoButton, modo === 'TEMPLATE' && styles.modoButtonActive]}
                onPress={() => {
                  setModo('TEMPLATE');
                  setPerguntas([]);
                }}
              >
                <Text style={[styles.modoButtonText, modo === 'TEMPLATE' && styles.modoButtonTextActive]}>
                  📝 Usar Template
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modoButton, modo === 'MANUAL' && styles.modoButtonActive]}
                onPress={() => {
                  setModo('MANUAL');
                  setTemplateSelecionado(null);
                }}
              >
                <Text style={[styles.modoButtonText, modo === 'MANUAL' && styles.modoButtonTextActive]}>
                  ✏️ Criar do Zero
                </Text>
              </TouchableOpacity>
            </View>

            {/* Templates */}
            {modo === 'TEMPLATE' && (
              <>
                <Text style={styles.sectionTitle}>Escolha um Template</Text>
                {loadingTemplates ? (
                  <Text style={styles.loadingText}>Carregando templates...</Text>
                ) : (
                  templates?.templates?.map((template: any) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.templateCard,
                        templateSelecionado?.id === template.id && styles.templateCardSelected
                      ]}
                      onPress={() => handleSelecionarTemplate(template)}
                    >
                      <View style={styles.templateIcon}>
                        <Text style={styles.templateIconText}>📝</Text>
                      </View>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateTitle}>{template.nome}</Text>
                        <Text style={styles.templateDescription}>{template.descricao}</Text>
                        <Text style={styles.templateMeta}>
                          {template.totalPerguntas} perguntas pré-configuradas
                        </Text>
                      </View>
                      {templateSelecionado?.id === template.id && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Informações do Questionário</Text>

            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pesquisa de Satisfação 2025"
              value={titulo}
              onChangeText={setTitulo}
              returnKeyType="next"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva o objetivo..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
              returnKeyType="next"
            />

            {modo === 'TEMPLATE' && (
              <>
                <Text style={styles.label}>Ano *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025"
                  value={ano}
                  onChangeText={setAno}
                  keyboardType="numeric"
                  maxLength={4}
                  returnKeyType="next"
                />
              </>
            )}

            <Text style={styles.label}>Visibilidade *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={visibilidade}
                onValueChange={setVisibilidade}
              >
                <Picker.Item label="🌍 Global (todos os associados)" value="GLOBAL" />
                <Picker.Item label="🎓 Turma Específica" value="TURMA" />
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

            {/* Modo Manual - Perguntas */}
            {modo === 'MANUAL' && (
              <>
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
                        <Picker.Item label="Escala (1-10)" value="ESCALA" />
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
              </>
            )}

            {/* Botão Criar */}
            {((modo === 'TEMPLATE' && templateSelecionado) || (modo === 'MANUAL' && perguntas.length > 0)) && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleSubmit}
                disabled={criarDeTemplateMutation.isPending || criarManualMutation.isPending}
              >
                <Text style={styles.createButtonText}>
                  {criarDeTemplateMutation.isPending || criarManualMutation.isPending 
                    ? '⏳ Criando...' 
                    : '✓ Criar Questionário'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  modoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  modoButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  modoButtonActive: {
    borderColor: '#075D94',
    backgroundColor: '#EBF5FF'
  },
  modoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  },
  modoButtonTextActive: {
    color: '#075D94'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  templateCardSelected: {
    borderColor: '#075D94',
    backgroundColor: '#EBF5FF'
  },
  templateIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  templateIconText: {
    fontSize: 24
  },
  templateContent: {
    flex: 1
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  templateDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4
  },
  templateMeta: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  checkMark: {
    fontSize: 28,
    color: '#075D94',
    fontWeight: 'bold'
  },
  divider: {
    height: 2,
    backgroundColor: '#E5E7EB',
    marginVertical: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151'
  },
  input: {
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF'
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF'
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
    backgroundColor: '#075D94',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addPerguntaText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  perguntaForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#075D94'
  },
  submitPerguntaButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  perguntaCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#075D94'
  },
  perguntaNumero: {
    fontSize: 12,
    fontWeight: '600',
    color: '#075D94',
    marginBottom: 8
  },
  perguntaEnunciado: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  perguntaTipo: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12
  },
  removeButton: {
    alignSelf: 'flex-start',
    padding: 8
  },
  removeButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600'
  },
  createButton: {
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 20
  }
});
