import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { professorService } from '../../services/api';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function RelatorioScreen() {
  const route = useRoute<any>();
  const { id } = route.params;

  const { data: relatorio, isLoading, refetch } = useQuery({
    queryKey: ['relatorio', id],
    queryFn: () => professorService.getRelatorio(id)
  });

  const handleExport = async (formato: 'xlsx' | 'csv') => {
    try {
      Alert.alert(
        'Exportar Relatório',
        `Deseja baixar o relatório em ${formato.toUpperCase()}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Baixar',
            onPress: async () => {
              try {
                // Exibir loading
                Alert.alert('Aguarde', 'Preparando arquivo para download...');

                // Fazer download do backend
                const blob = await professorService.exportar(id, formato);
                
                // Criar nome do arquivo
                const fileName = `relatorio-${id}-${Date.now()}.${formato}`;
                const fileUri = `${FileSystem.documentDirectory}${fileName}`;

                // Converter blob para base64 (necessário para React Native)
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                  const base64data = reader.result as string;
                  const base64 = base64data.split(',')[1]; // Remove o prefixo data:...

                  // Salvar arquivo
                  await FileSystem.writeAsStringAsync(fileUri, base64, {
                    encoding: FileSystem.EncodingType.Base64
                  });

                  // Verificar se o arquivo pode ser compartilhado
                  const canShare = await Sharing.isAvailableAsync();
                  
                  if (canShare) {
                    // Compartilhar/Salvar arquivo
                    await Sharing.shareAsync(fileUri, {
                      mimeType: formato === 'xlsx' 
                        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        : 'text/csv',
                      dialogTitle: 'Salvar Relatório',
                      UTI: formato === 'xlsx' ? 'org.openxmlformats.spreadsheetml.sheet' : 'public.comma-separated-values-text'
                    });

                    Alert.alert(
                      'Sucesso! 🎉', 
                      `Relatório exportado com sucesso!\n\nVocê pode abrir o arquivo com:\n• Excel\n• Google Sheets\n• Outros apps compatíveis`,
                      [{ text: 'OK' }]
                    );
                  } else {
                    Alert.alert(
                      'Download Concluído',
                      `Arquivo salvo em:\n${fileUri}\n\nAcesse através do gerenciador de arquivos do seu dispositivo.`,
                      [{ text: 'OK' }]
                    );
                  }
                };

                reader.onerror = () => {
                  throw new Error('Erro ao processar arquivo');
                };
              } catch (err) {
                console.error('Erro ao exportar:', err);
                Alert.alert(
                  'Erro',
                  'Não foi possível exportar o relatório. Tente novamente ou use o painel web.'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível exportar');
    }
  };

  if (isLoading || !relatorio) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando relatório...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{relatorio.questionario.titulo}</Text>
          <Text style={styles.subtitle}>
            {relatorio.totalRespondentes} respondentes
          </Text>
          
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('xlsx')}
              activeOpacity={0.7}
            >
              <Text style={styles.exportButtonText}>📊 Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExport('csv')}
              activeOpacity={0.7}
            >
              <Text style={styles.exportButtonText}>📄 CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {relatorio.relatorio.map((item: any, index: number) => (
          <View key={item.pergunta.id} style={styles.card}>
            <Text style={styles.perguntaNumero}>Pergunta {index + 1}</Text>
            <Text style={styles.perguntaTexto}>{item.pergunta.enunciado}</Text>
            <Text style={styles.respostasCount}>
              {item.totalRespostas} respostas
            </Text>

            {/* Escala */}
            {item.agregacao.media !== undefined && (
              <View style={styles.estatisticas}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Média</Text>
                  <Text style={styles.statValue}>
                    {item.agregacao.media.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Mín</Text>
                  <Text style={styles.statValue}>{item.agregacao.min}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Máx</Text>
                  <Text style={styles.statValue}>{item.agregacao.max}</Text>
                </View>
              </View>
            )}

            {/* Sim/Não */}
            {item.agregacao.sim !== undefined && (
              <View style={styles.estatisticas}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Sim</Text>
                  <Text style={[styles.statValue, { color: '#10b981' }]}>
                    {item.agregacao.sim}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Não</Text>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>
                    {item.agregacao.nao}
                  </Text>
                </View>
              </View>
            )}

            {/* Distribuição (Múltipla/Única) */}
            {item.agregacao.distribuicao && (
              <View style={styles.distribuicao}>
                {Object.entries(item.agregacao.distribuicao).map(([opcao, count]: [string, any]) => (
                  <View key={opcao} style={styles.opcaoRow}>
                    <Text style={styles.opcaoLabel}>{opcao}</Text>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { width: `${(count / item.totalRespostas) * 100}%` }
                        ]} 
                      />
                      <Text style={styles.opcaoCount}>{count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Respostas de Texto */}
            {item.agregacao.respostas && (
              <View style={styles.respostasTexto}>
                {item.agregacao.respostas.slice(0, 5).map((r: any, i: number) => (
                  <View key={i} style={styles.respostaTextoCard}>
                    <Text style={styles.respostaAutor}>{r.aluno}</Text>
                    <Text style={styles.respostaTexto}>{r.texto}</Text>
                  </View>
                ))}
                {item.agregacao.respostas.length > 5 && (
                  <Text style={styles.maisRespostas}>
                    + {item.agregacao.respostas.length - 5} respostas...
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
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
  loading: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
    color: '#6b7280'
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#075D94'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#075D94',
    marginBottom: 8,
    lineHeight: 32
  },
  subtitle: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 20
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#FF7E00',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  perguntaNumero: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284c7',
    marginBottom: 8
  },
  perguntaTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12
  },
  respostasCount: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16
  },
  estatisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12
  },
  stat: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0284c7'
  },
  distribuicao: {
    gap: 12
  },
  opcaoRow: {
    marginBottom: 12
  },
  opcaoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  bar: {
    height: 32,
    backgroundColor: '#0284c7',
    borderRadius: 4,
    minWidth: 40
  },
  opcaoCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  respostasTexto: {
    gap: 12
  },
  respostaTextoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12
  },
  respostaAutor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4
  },
  respostaTexto: {
    fontSize: 16,
    color: '#111827'
  },
  maisRespostas: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827'
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
    fontSize: 24,
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
    alignSelf: 'flex-start'
  },
  removeButtonText: {
    fontSize: 14,
    color: '#ef4444'
  },
  createButton: {
    backgroundColor: '#10b981',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40
  },
  createButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  divider: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginVertical: 24
  }
});

