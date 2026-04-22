import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, RefreshControl, Dimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

export default function TurmasScreen() {
  const navigation = useNavigation<any>();
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [ano, setAno] = useState('2025');
  const [professorId, setProfessorId] = useState('');
  const queryClient = useQueryClient();

  const { data: turmas, isLoading, refetch } = useQuery({
    queryKey: ['turmas'],
    queryFn: adminService.getTurmas
  });

  const { data: professores } = useQuery({
    queryKey: ['professores'],
    queryFn: adminService.getProfessores
  });

  const createMutation = useMutation({
    mutationFn: adminService.createTurma,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Grupo criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setShowForm(false);
      setNome('');
      setAno('2025');
      setProfessorId('');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao criar grupo');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteTurma,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Grupo removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao remover grupo');
    }
  });

  const handleDelete = (id: string, nome: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente remover o grupo ${nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
      ]
    );
  };

  const handleSubmit = () => {
    if (!nome || !ano || !professorId) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    createMutation.mutate({ nome, ano: parseInt(ano), professorId });
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
            {showForm ? '✕ Cancelar' : '➕ Novo Grupo'}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Novo Grupo</Text>

            <Text style={styles.label}>Nome do Grupo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Yoga Manhã, Jogos Cognitivos"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>Ano</Text>
            <TextInput
              style={styles.input}
              placeholder="2025"
              value={ano}
              onChangeText={setAno}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Coordenador</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={professorId}
                onValueChange={(value) => setProfessorId(value)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione um coordenador..." value="" />
                {professores?.map((prof: any) => (
                  <Picker.Item key={prof.id} label={prof.nome} value={prof.id} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Criar Grupo</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Grupos Cadastrados ({turmas?.length || 0})
        </Text>

        {turmas?.map((turma: any) => (
          <View key={turma.id} style={styles.card}>
            <Text style={styles.cardTitle}>{turma.nome}</Text>
            <Text style={styles.cardSubtitle}>
              Coordenador: {turma.professor?.nome || '-'}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardMeta}>Ano: {turma.ano}</Text>
              <Text style={styles.cardMeta}>
                {turma._count?.alunos || 0} participantes
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditarTurma', { turmaId: turma.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.editButtonText}>✏️ Editar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(turma.id, turma.nome)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>🗑️ Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {turmas?.length === 0 && !isLoading && (
          <Text style={styles.emptyText}>
            Nenhum grupo cadastrado ainda.
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
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff'
  },
  picker: {
    fontSize: 18
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
  cardTitle: {
    fontSize: Math.min(width * 0.05, 22),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 8
  },
  cardSubtitle: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#6b7280',
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
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
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 40
  }
});

