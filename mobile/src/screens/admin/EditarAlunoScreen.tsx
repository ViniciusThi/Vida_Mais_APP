import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function EditarAlunoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { alunoId } = route.params;
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Buscar dados do aluno
  const { data: alunos, isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
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

  if (isLoading || !aluno) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  // Turmas que o aluno está
  const turmasDoAluno = aluno.alunoTurmas || [];

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

        {/* Turmas do Aluno */}
        <View style={styles.turmasCard}>
          <Text style={styles.turmasTitle}>📚 Turmas do Aluno</Text>
          
          <Text style={styles.infoText} style={{ marginBottom: 16 }}>
            Para adicionar ou remover o aluno de turmas, vá em <Text style={{ fontWeight: 'bold', color: '#075D94' }}>Turmas → Editar Turma</Text>
          </Text>
          
          {turmasDoAluno.length === 0 ? (
            <View style={styles.emptyTurmasBox}>
              <Text style={styles.noTurmas}>❌ Aluno não está em nenhuma turma</Text>
            </View>
          ) : (
            turmasDoAluno.map((at: any) => (
              <View key={at.id} style={styles.turmaItemReadonly}>
                <View style={styles.turmaIconBox}>
                  <Text style={styles.turmaIcon}>📚</Text>
                </View>
                <View style={styles.turmaInfo}>
                  <Text style={styles.turmaNome}>{at.turma.nome}</Text>
                  <Text style={styles.turmaAno}>Ano {at.turma.ano}</Text>
                  {at.turma.professor && (
                    <Text style={styles.turmaProfessor}>
                      Prof: {at.turma.professor.nome}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Informações</Text>
          <Text style={styles.infoText}>• O email é usado para login</Text>
          <Text style={styles.infoText}>• Altere a senha apenas se necessário</Text>
          <Text style={styles.infoText}>• Para gerenciar turmas, vá em Turmas → Editar</Text>
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
    color: '#075D94',
    marginBottom: 20
  },
  emptyTurmasBox: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderStyle: 'dashed'
  },
  noTurmas: {
    fontSize: Math.min(width * 0.04, 18),
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '600'
  },
  turmaItemReadonly: {
    backgroundColor: '#EFF6FF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#075D94'
  },
  turmaIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  turmaIcon: {
    fontSize: 24
  },
  turmaInfo: {
    flex: 1
  },
  turmaNome: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 4
  },
  turmaAno: {
    fontSize: Math.min(width * 0.038, 16),
    color: '#6b7280',
    marginBottom: 2
  },
  turmaProfessor: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#9ca3af',
    fontStyle: 'italic'
  }
});

