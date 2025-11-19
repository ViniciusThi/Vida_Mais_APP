import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Dimensions, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { professorService } from '../../services/api';
import { useFontSize } from '../../contexts/FontSizeContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function TemplatesScreen() {
  const navigation = useNavigation();
  const { fontScale } = useFontSize();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ano, setAno] = useState(new Date().getFullYear().toString());

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: professorService.getTemplates
  });

  const { data: questionariosPadrao } = useQuery({
    queryKey: ['questionarios-padrao'],
    queryFn: professorService.getQuestionariosPadrao
  });

  const criarMutation = useMutation({
    mutationFn: (dados: any) => professorService.criarDeTemplate(dados),
    onSuccess: () => {
      Alert.alert('Sucesso!', 'Questionário criado com sucesso!');
      setModalVisible(false);
      setTitulo('');
      setDescricao('');
      setAno(new Date().getFullYear().toString());
      navigation.navigate('MeusQuestionarios');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar questionário');
    }
  });

  const lancarMutation = useMutation({
    mutationFn: (id: string) => professorService.lancarQuestionarioPadrao(id),
    onSuccess: () => {
      Alert.alert('Sucesso!', 'Questionário lançado! Os associados já podem responder.');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao lançar questionário');
    }
  });

  const encerrarMutation = useMutation({
    mutationFn: (id: string) => professorService.encerrarQuestionarioPadrao(id),
    onSuccess: () => {
      Alert.alert('Sucesso!', 'Questionário encerrado com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao encerrar questionário');
    }
  });

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTitulo(`${template.nome} ${new Date().getFullYear()}`);
    setDescricao(template.descricao);
    setModalVisible(true);
  };

  const handleCriar = () => {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o título');
      return;
    }

    if (!ano || isNaN(Number(ano))) {
      Alert.alert('Atenção', 'Por favor, informe um ano válido');
      return;
    }

    criarMutation.mutate({
      templateId: selectedTemplate.id,
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      ano: Number(ano)
    });
  };

  const handleLancar = (id: string) => {
    Alert.alert(
      'Confirmar',
      'Deseja lançar este questionário? Os associados poderão começar a responder.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Lançar', onPress: () => lancarMutation.mutate(id) }
      ]
    );
  };

  const handleEncerrar = (id: string) => {
    Alert.alert(
      'Confirmar',
      'Deseja encerrar este questionário? Ninguém mais poderá responder.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Encerrar', onPress: () => encerrarMutation.mutate(id), style: 'destructive' }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { fontSize: 18 * fontScale }]}>Carregando templates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 24 * fontScale }]}>
            📝 Templates Disponíveis
          </Text>
          <Text style={[styles.sectionDescription, { fontSize: 16 * fontScale }]}>
            Escolha um template com perguntas pré-configuradas
          </Text>

          {templates?.templates?.map((template: any) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => handleSelectTemplate(template)}
              activeOpacity={0.7}
            >
              <View style={styles.templateIcon}>
                <Text style={styles.templateIconText}>📝</Text>
              </View>
              <View style={styles.templateContent}>
                <Text style={[styles.templateTitle, { fontSize: 20 * fontScale }]}>
                  {template.nome}
                </Text>
                <Text style={[styles.templateDescription, { fontSize: 14 * fontScale }]}>
                  {template.descricao}
                </Text>
                <Text style={[styles.templateMeta, { fontSize: 12 * fontScale }]}>
                  {template.totalPerguntas} perguntas
                </Text>
              </View>
              <Text style={styles.templateArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {questionariosPadrao && questionariosPadrao.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 24 * fontScale }]}>
              📋 Questionários Criados
            </Text>
            {questionariosPadrao.map((q: any) => (
              <View key={q.id} style={[styles.questionCard, q.ativo && styles.questionCardActive]}>
                <Text style={[styles.questionTitle, { fontSize: 18 * fontScale }]}>
                  {q.titulo}
                </Text>
                <Text style={[styles.questionMeta, { fontSize: 14 * fontScale }]}>
                  Ano: {q.ano} • {q._count.perguntas} perguntas • {q._count.respostas} respostas
                </Text>
                <View style={styles.questionStatus}>
                  <Text style={[
                    styles.statusBadge,
                    q.ativo ? styles.statusBadgeActive : styles.statusBadgeInactive,
                    { fontSize: 12 * fontScale }
                  ]}>
                    {q.ativo ? '🟢 ATIVO' : '⚫ INATIVO'}
                  </Text>
                  {!q.ativo ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleLancar(q.id)}
                      disabled={lancarMutation.isPending}
                    >
                      <Text style={[styles.actionButtonText, { fontSize: 14 * fontScale }]}>
                        LANÇAR
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonDanger]}
                      onPress={() => handleEncerrar(q.id)}
                      disabled={encerrarMutation.isPending}
                    >
                      <Text style={[styles.actionButtonText, { fontSize: 14 * fontScale }]}>
                        ENCERRAR
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <ScrollView 
                  contentContainerStyle={styles.modalScrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.modalContent}>
                    <Text style={[styles.modalTitle, { fontSize: 22 * fontScale }]}>
                      Criar Questionário
                    </Text>
                    
                    <Text style={[styles.label, { fontSize: 16 * fontScale }]}>
                      Título *
                    </Text>
                    <TextInput
                      style={[styles.input, { fontSize: 16 * fontScale }]}
                      value={titulo}
                      onChangeText={setTitulo}
                      placeholder="Ex: Pesquisa de Satisfação 2025"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="next"
                    />

                    <Text style={[styles.label, { fontSize: 16 * fontScale }]}>
                      Descrição (opcional)
                    </Text>
                    <TextInput
                      style={[styles.input, styles.textArea, { fontSize: 16 * fontScale }]}
                      value={descricao}
                      onChangeText={setDescricao}
                      placeholder="Descrição do questionário"
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                      returnKeyType="next"
                    />

                    <Text style={[styles.label, { fontSize: 16 * fontScale }]}>
                      Ano *
                    </Text>
                    <TextInput
                      style={[styles.input, { fontSize: 16 * fontScale }]}
                      value={ano}
                      onChangeText={setAno}
                      placeholder="2025"
                      keyboardType="numeric"
                      maxLength={4}
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonCancel]}
                        onPress={() => {
                          Keyboard.dismiss();
                          setModalVisible(false);
                        }}
                      >
                        <Text style={[styles.modalButtonText, { fontSize: 16 * fontScale }]}>
                          Cancelar
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalButtonConfirm]}
                        onPress={() => {
                          Keyboard.dismiss();
                          handleCriar();
                        }}
                        disabled={criarMutation.isPending}
                      >
                        <Text style={[styles.modalButtonTextConfirm, { fontSize: 16 * fontScale }]}>
                          {criarMutation.isPending ? 'Criando...' : 'Criar'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    flex: 1,
    padding: width * 0.04
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9333EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4
  },
  templateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  templateIconText: {
    fontSize: 32
  },
  templateContent: {
    flex: 1
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4
  },
  templateDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  templateMeta: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  templateArrow: {
    fontSize: 40,
    color: '#9333EA',
    fontWeight: 'bold'
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  questionCardActive: {
    borderColor: '#22C55E'
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  questionMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12
  },
  questionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
    color: '#065F46'
  },
  statusBadgeInactive: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280'
  },
  actionButton: {
    backgroundColor: '#075D94',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  actionButtonDanger: {
    backgroundColor: '#DC2626'
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
    maxWidth: 500
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  modalButtonConfirm: {
    backgroundColor: '#075D94'
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280'
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

