import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Dimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState } from 'react';

const { width } = Dimensions.get('window');

export default function AlunosScreen() {
  const navigation = useNavigation<any>();
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const queryClient = useQueryClient();

  const { data: alunos, isLoading, refetch } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
  });

  const createMutation = useMutation({
    mutationFn: adminService.createAluno,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      setShowForm(false);
      setNome('');
      setEmail('');
      setSenha('');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar aluno');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteAluno,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Aluno removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao remover aluno');
    }
  });

  const handleDelete = (id: string, nome: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente remover ${nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const handleSubmit = () => {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    createMutation.mutate({ nome, email, senha });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>
            {showForm ? '✕ Cancelar' : '➕ Novo Aluno'}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Novo Aluno</Text>
            
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Criar Aluno</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Alunos Cadastrados ({alunos?.length || 0})
        </Text>

        {alunos?.map((aluno: any) => (
          <View key={aluno.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{aluno.nome}</Text>
                <Text style={styles.cardEmail}>{aluno.email}</Text>
                <Text style={styles.cardMeta}>
                  {aluno.alunoTurmas?.map((at: any) => at.turma.nome).join(', ') || 'Sem turma'}
                </Text>
              </View>
              <View style={aluno.ativo ? styles.badgeActive : styles.badgeInactive}>
                <Text style={styles.badgeText}>
                  {aluno.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditarAluno', { alunoId: aluno.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(aluno.id, aluno.nome)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>🗑️ Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {alunos?.length === 0 && !isLoading && (
          <Text style={styles.emptyText}>
            Nenhum aluno cadastrado ainda.
          </Text>
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
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#0284c7'
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20
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
  submitButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#075D94'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: Math.min(width * 0.05, 22),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 6
  },
  cardEmail: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#6b7280',
    marginBottom: 8
  },
  cardMeta: {
    fontSize: Math.min(width * 0.038, 16),
    color: '#9ca3af'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  editButton: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#075D94',
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: Math.min(width * 0.042, 18),
    color: '#075D94',
    fontWeight: '700'
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DC2626',
    alignItems: 'center'
  },
  deleteButtonText: {
    fontSize: Math.min(width * 0.042, 18),
    color: '#DC2626',
    fontWeight: '700'
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeInactive: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669'
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40
  }
});

