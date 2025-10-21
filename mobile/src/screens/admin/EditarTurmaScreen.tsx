import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function EditarTurmaScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { turmaId } = route.params;
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('');

  // Buscar dados da turma COM alunos
  const { data: turma, isLoading } = useQuery({
    queryKey: ['turma', turmaId],
    queryFn: async () => {
      const turmaData = await adminService.getTurma(turmaId);
      if (turmaData) {
        setNome(turmaData.nome);
        setAno(turmaData.ano.toString());
      }
      return turmaData;
    }
  });

  // Buscar todos os alunos (para adicionar)
  const { data: todosAlunos, isLoading: isLoadingAlunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
  });

  // Alunos disponíveis para adicionar (que não estão na turma)
  const alunosDisponiveis = todosAlunos?.filter((aluno: any) => {
    if (!turma?.alunos || turma.alunos.length === 0) return true;
    // Verifica tanto alunoId quanto aluno.id para compatibilidade
    return !turma.alunos.some((at: any) => 
      at.alunoId === aluno.id || at.aluno?.id === aluno.id
    );
  }) || [];

  // Debug: log dos dados
  console.log('📊 EditarTurmaScreen DEBUG:');
  console.log('- Total alunos:', todosAlunos?.length || 0);
  console.log('- Alunos na turma:', turma?.alunos?.length || 0);
  console.log('- Alunos disponíveis:', alunosDisponiveis.length);

  // Mutation para adicionar aluno na turma
  const addAlunoMutation = useMutation({
    mutationFn: (alunoId: string) => adminService.vincularAluno(alunoId, turmaId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno adicionado à turma!');
      queryClient.invalidateQueries({ queryKey: ['turma', turmaId] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      setSelectedAluno('');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao adicionar aluno');
    }
  });

  // Mutation para remover aluno da turma
  const removeAlunoMutation = useMutation({
    mutationFn: (alunoTurmaId: string) => adminService.desvincularAluno(alunoTurmaId),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno removido da turma!');
      queryClient.invalidateQueries({ queryKey: ['turma', turmaId] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', 'Erro ao remover aluno da turma');
    }
  });


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
          <Text style={styles.sectionTitle}>➕ Adicionar Aluno à Turma</Text>
          <View style={styles.addCard}>
            {isLoadingAlunos ? (
              <Text style={styles.loadingText}>Carregando alunos...</Text>
            ) : alunosDisponiveis.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>✅ Todos os alunos já estão nesta turma!</Text>
              </View>
            ) : (
              <ScrollView style={styles.alunosListContainer} nestedScrollEnabled>
                <Text style={styles.helperText}>Toque no aluno para adicioná-lo:</Text>
                {alunosDisponiveis.map((aluno: any) => (
                  <TouchableOpacity
                    key={aluno.id}
                    style={styles.alunoSelectCard}
                    onPress={() => {
                      Alert.alert(
                        'Confirmar',
                        `Adicionar ${aluno.nome} a esta turma?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Adicionar', 
                            onPress: () => addAlunoMutation.mutate(aluno.id)
                          }
                        ]
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.alunoSelectIcon}>
                      <Text style={styles.alunoSelectIconText}>👤</Text>
                    </View>
                    <View style={styles.alunoSelectInfo}>
                      <Text style={styles.alunoSelectNome}>{aluno.nome}</Text>
                      <Text style={styles.alunoSelectEmail}>{aluno.email}</Text>
                    </View>
                    <View style={styles.addIconBox}>
                      <Text style={styles.addIcon}>➕</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20
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
  emptyBox: {
    backgroundColor: '#ECFDF5',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7ABA43',
    borderStyle: 'dashed'
  },
  emptyText: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#7ABA43',
    textAlign: 'center',
    fontWeight: '600'
  },
  helperText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic'
  },
  alunosListContainer: {
    maxHeight: 400
  },
  alunoSelectCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7ABA43',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  alunoSelectIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  alunoSelectIconText: {
    fontSize: 24
  },
  alunoSelectInfo: {
    flex: 1
  },
  alunoSelectNome: {
    fontSize: Math.min(width * 0.042, 18),
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 4
  },
  alunoSelectEmail: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#6b7280'
  },
  addIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7ABA43',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addIcon: {
    fontSize: 20,
    color: '#fff'
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

