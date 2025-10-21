import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SuccessScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Obrigado!</Text>
      <Text style={styles.message}>
        Suas respostas foram enviadas com sucesso.
      </Text>
      <Text style={styles.submessage}>
        Sua opinião é muito importante para nós!
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Voltar ao Início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  emoji: {
    fontSize: 100,
    marginBottom: 24
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  message: {
    fontSize: 24,
    color: '#e0f2fe',
    textAlign: 'center',
    marginBottom: 8
  },
  submessage: {
    fontSize: 20,
    color: '#bae6fd',
    textAlign: 'center',
    marginBottom: 48
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 12
  },
  buttonText: {
    color: '#0284c7',
    fontSize: 22,
    fontWeight: 'bold'
  }
});

