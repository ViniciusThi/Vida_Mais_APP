import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function EditarTurmaScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { turmaId } = route.params;
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');
  const [selectedAluno, setSelectedAluno] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Buscar dados da turma
  const { data: turma, isLoading } = useQuery({
    queryKey: ['turma', turmaId],
    queryFn: async () => {
      const turmas = await adminService.getTurmas();
      const found = turmas.find((t: any) => t.id === turmaId);
      if (found) {
        setNome(found.nome);
        setAno(found.ano.toString());
      }
      return found;
    }
  });

  // Buscar todos os alunos (para adicionar)
  const { data: todosAlunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
  });

  // Alunos disponíveis para adicionar (que não estão na turma)
  const alunosDisponiveis = todosAlunos?.filter((aluno: any) => 
    !turma?.alunos?.some((at: any) => at.alunoId === aluno.id)
  ) || [];

  // Mutation para adicionar aluno na turma
  const addAlunoMutation = useMutation({
    mutationFn: (alunoId: string) => adminService.vincularAluno(alunoId, turmaId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno adicionado à turma!');
      queryClient.invalidateQueries({ queryKey: ['turma', turmaId] });
      setSelectedAluno('');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao adicionar aluno');
    }
  });

  // Mutation para remover aluno da turma
  const removeAlunoMutation = useMutation({
    mutationFn: async (alunoTurmaId: string) => {
      const response = await fetch(`${require('../../config/api').API_URL}/admin/vincular-aluno/${alunoTurmaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await import('../../stores/authStore').then(m => m.useAuthStore.getState().token)}`
        }
      });
      if (!response.ok) throw new Error('Erro ao remover');
    },
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno removido da turma!');
      queryClient.invalidateQueries({ queryKey: ['turma', turmaId] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', 'Erro ao remover aluno da turma');
    }
  });

  const handleAddAluno = () => {
    if (!selectedAluno) {
      Alert.alert('Atenção', 'Selecione um aluno');
      return;
    }
    addAlunoMutation.mutate(selectedAluno);
  };

  const handleRemoveAluno = (alunoTurmaId: string, nomeAluno: string) => {
    Alert.alert(
      'Confirmar Remoção',
      `Deseja remover ${nomeAluno} desta turma?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeAlunoMutation.mutate(alunoTurmaId) }
      ]
    );
  };

  if (isLoading || !turma) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Informações da Turma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Informações da Turma</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome:</Text>
              <Text style={styles.infoValue}>{turma.nome}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ano:</Text>
              <Text style={styles.infoValue}>{turma.ano}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Professor:</Text>
              <Text style={styles.infoValue}>{turma.professor?.nome || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Adicionar Aluno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>➕ Adicionar Aluno</Text>
          <View style={styles.addCard}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAluno}
                onValueChange={setSelectedAluno}
                style={styles.picker}
              >
                <Picker.Item label="Selecione um aluno..." value="" />
                {alunosDisponiveis.map((aluno: any) => (
                  <Picker.Item key={aluno.id} label={aluno.nome} value={aluno.id} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAluno}
              disabled={!selectedAluno}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>Adicionar à Turma</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Alunos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            👥 Alunos na Turma ({turma.alunos?.length || 0})
          </Text>
          
          {turma.alunos?.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum aluno nesta turma ainda.</Text>
          ) : (
            turma.alunos?.map((alunoTurma: any) => (
              <View key={alunoTurma.id} style={styles.alunoCard}>
                <View style={styles.alunoInfo}>
                  <Text style={styles.alunoNome}>{alunoTurma.aluno.nome}</Text>
                  <Text style={styles.alunoEmail}>{alunoTurma.aluno.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveAluno(alunoTurma.id, alunoTurma.aluno.nome)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 16
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#075D94'
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  infoLabel: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    color: '#6b7280',
    width: 100
  },
  infoValue: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#111827',
    flex: 1
  },
  addCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: '#7ABA43'
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
  addButton: {
    backgroundColor: '#7ABA43',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60
  },
  addButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold'
  },
  alunoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#075D94'
  },
  alunoInfo: {
    flex: 1
  },
  alunoNome: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 4
  },
  alunoEmail: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280'
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DC2626'
  },
  removeButtonText: {
    fontSize: 24
  },
  emptyText: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#9ca3af',
    textAlign: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12
  }
});

