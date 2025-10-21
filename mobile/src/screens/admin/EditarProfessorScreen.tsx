import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { adminService } from '../../services/api';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function EditarProfessorScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { professorId } = route.params;
  const queryClient = useQueryClient();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Buscar dados do professor
  const { data: professores, isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: adminService.getProfessores
  });

  const professor = professores?.find((p: any) => p.id === professorId);

  useEffect(() => {
    if (professor) {
      setNome(professor.nome);
      setEmail(professor.email);
    }
  }, [professor]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateProfessor(professorId, data),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Professor atualizado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      queryClient.invalidateQueries({ queryKey: ['professores'] });
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao atualizar professor');
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

  if (isLoading || !professor) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.formTitle}>✏️ Editar Professor</Text>

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

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Informações</Text>
          <Text style={styles.infoText}>• O email é usado para login</Text>
          <Text style={styles.infoText}>• Altere a senha apenas se necessário</Text>
          <Text style={styles.infoText}>• Professor: {professor._count?.turmasProfessor || 0} turmas</Text>
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
  }
});

