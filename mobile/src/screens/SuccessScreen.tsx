import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function SuccessScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>✅</Text>
        </View>
        
        <Text style={styles.title}>Muito Obrigado!</Text>
        
        <Text style={styles.message}>
          Suas respostas foram enviadas com sucesso.
        </Text>
        
        <Text style={styles.submessage}>
          Sua opinião é muito importante para tornar a Vida Mais ainda melhor!
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>✓ VOLTAR AO INÍCIO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7ABA43' // Verde Vida Mais
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.05
  },
  iconContainer: {
    width: Math.min(width * 0.4, 180),
    height: Math.min(width * 0.4, 180),
    borderRadius: Math.min(width * 0.2, 90),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  emoji: {
    fontSize: Math.min(width * 0.25, 100)
  },
  title: {
    fontSize: Math.min(width * 0.12, 48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  message: {
    fontSize: Math.min(width * 0.06, 26),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
    fontWeight: '600',
    paddingHorizontal: width * 0.05
  },
  submessage: {
    fontSize: Math.min(width * 0.05, 22),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: height * 0.08,
    lineHeight: 30,
    opacity: 0.95,
    paddingHorizontal: width * 0.08
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 14,
    minHeight: 75,
    minWidth: width * 0.7,
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#5E8E2E' // Verde escuro
  },
  buttonText: {
    color: '#7ABA43', // Verde
    fontSize: Math.min(width * 0.055, 24),
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});
