import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function EditarAlunoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { alunoId } = route.params;
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('');

  // Buscar dados do aluno
  const { data: alunos, isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
  });

  // Buscar todas as turmas
  const { data: turmas } = useQuery({
    queryKey: ['turmas'],
    queryFn: adminService.getTurmas
  });

  const aluno = alunos?.find((a: any) => a.id === alunoId);

  useEffect(() => {
    if (aluno) {
      setNome(aluno.nome);
      setEmail(aluno.email);
    }
  }, [aluno]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateAluno(alunoId, data),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao atualizar aluno');
    }
  });

  const addTurmaMutation = useMutation({
    mutationFn: (turmaId: string) => adminService.vincularAluno(alunoId, turmaId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno adicionado à turma!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setSelectedTurma('');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao adicionar à turma');
    }
  });

  const removeTurmaMutation = useMutation({
    mutationFn: (alunoTurmaId: string) => adminService.desvincularAluno(alunoTurmaId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno removido da turma!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', 'Erro ao remover da turma');
    }
  });

  const handleSubmit = () => {
    if (!nome || !email) {
      Alert.alert('Atenção', 'Preencha nome e email');
      return;
    }

    const data: any = { nome, email };
    if (senha) {
      data.senha = senha;
    }

    updateMutation.mutate(data);
  };

  const handleAddTurma = () => {
    if (!selectedTurma) {
      Alert.alert('Atenção', 'Selecione uma turma');
      return;
    }
    addTurmaMutation.mutate(selectedTurma);
  };

  const handleRemoveTurma = (alunoTurmaId: string, turmaNome: string) => {
    Alert.alert(
      'Confirmar Remoção',
      `Deseja remover o aluno de ${turmaNome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeTurmaMutation.mutate(alunoTurmaId) }
      ]
    );
  };

  if (isLoading || !aluno) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  // Turmas que o aluno já está
  const turmasDoAluno = aluno.alunoTurmas || [];
  
  // Turmas disponíveis para adicionar (que o aluno não está)
  const turmasDisponiveis = turmas?.filter((turma: any) =>
    !turmasDoAluno.some((at: any) => at.turmaId === turma.id)
  ) || [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>✏️ Editar Aluno</Text>

          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo"
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Nova Senha (opcional)</Text>
          <Text style={styles.hint}>Deixe em branco para manter a senha atual</Text>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="••••••"
            secureTextEntry
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={updateMutation.isPending}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>
                {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gerenciar Turmas */}
        <View style={styles.turmasCard}>
          <Text style={styles.turmasTitle}>📚 Gerenciar Turmas</Text>
          
          {/* Adicionar a uma turma */}
          <Text style={styles.label}>Adicionar a uma turma:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTurma}
              onValueChange={setSelectedTurma}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma turma..." value="" />
              {turmasDisponiveis.map((turma: any) => (
                <Picker.Item key={turma.id} label={`${turma.nome} (${turma.ano})`} value={turma.id} />
              ))}
            </Picker>
          </View>
          
          <TouchableOpacity
            style={styles.addTurmaButton}
            onPress={handleAddTurma}
            disabled={!selectedTurma}
            activeOpacity={0.7}
          >
            <Text style={styles.addTurmaButtonText}>➕ Adicionar à Turma</Text>
          </TouchableOpacity>

          {/* Turmas atuais */}
          <View style={styles.divider} />
          <Text style={styles.label}>Turmas atuais ({turmasDoAluno.length}):</Text>
          
          {turmasDoAluno.length === 0 ? (
            <Text style={styles.noTurmas}>Aluno não está em nenhuma turma</Text>
          ) : (
            turmasDoAluno.map((at: any) => (
              <View key={at.id} style={styles.turmaItem}>
                <View style={styles.turmaInfo}>
                  <Text style={styles.turmaNome}>{at.turma.nome}</Text>
                  <Text style={styles.turmaAno}>Ano {at.turma.ano}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeTurmaButton}
                  onPress={() => handleRemoveTurma(at.id, at.turma.nome)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeTurmaButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Informações</Text>
          <Text style={styles.infoText}>• O email é usado para login</Text>
          <Text style={styles.infoText}>• Altere a senha apenas se necessário</Text>
          <Text style={styles.infoText}>• Gerencie as turmas do aluno acima</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  content: {
    padding: 16
  },
  loading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
    color: '#6b7280'
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#075D94'
  },
  formTitle: {
    fontSize: Math.min(width * 0.06, 26),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 24
  },
  label: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151'
  },
  hint: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#9ca3af',
    marginBottom: 8
  },
  input: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: Math.min(width * 0.04, 18),
    marginBottom: 20,
    backgroundColor: '#fff',
    minHeight: 60
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    minHeight: 60
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#7ABA43',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60
  },
  submitButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold'
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#075D94'
  },
  infoTitle: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 12
  },
  infoText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24
  },
  turmasCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#7ABA43'
  },
  turmasTitle: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: 'bold',
    color: '#7ABA43',
    marginBottom: 20
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden'
  },
  picker: {
    height: 60,
    fontSize: 18
  },
  addTurmaButton: {
    backgroundColor: '#7ABA43',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60
  },
  addTurmaButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold'
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginVertical: 20
  },
  noTurmas: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#9ca3af',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 8
  },
  turmaItem: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#7ABA43'
  },
  turmaInfo: {
    flex: 1
  },
  turmaNome: {
    fontSize: Math.min(width * 0.04, 18),
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  turmaAno: {
    fontSize: Math.min(width * 0.035, 16),
    color: '#6b7280'
  },
  removeTurmaButton: {
    backgroundColor: '#FEE2E2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626'
  },
  removeTurmaButtonText: {
    fontSize: 24
  }
});

