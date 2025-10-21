import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSizes, spacing, buttonSizes, borderRadius } from '../theme/colors';

export default function SuccessScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.verde,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.neutral.branco,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    shadowColor: colors.shadow.forte,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  emoji: {
    fontSize: 100
  },
  title: {
    fontSize: fontSizes.xxl + 12,
    fontWeight: 'bold',
    color: colors.neutral.branco,
    marginBottom: spacing.xl,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  message: {
    fontSize: fontSizes.lg,
    color: colors.neutral.branco,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
    fontWeight: '600'
  },
  submessage: {
    fontSize: fontSizes.md,
    color: colors.primary.verdeMuitoClaro,
    textAlign: 'center',
    marginBottom: spacing.xxxl + 24,
    lineHeight: 32,
    paddingHorizontal: spacing.lg
  },
  button: {
    backgroundColor: colors.neutral.branco,
    paddingHorizontal: spacing.xxxl + 8,
    paddingVertical: spacing.xl + 8,
    borderRadius: borderRadius.large,
    minHeight: buttonSizes.large + 10,
    minWidth: 280,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow.forte,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.primary.verdeEscuro
  },
  buttonText: {
    color: colors.primary.verde,
    fontSize: fontSizes.buttonLarge,
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
});


