import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useFontSize } from '../contexts/FontSizeContext';

const { width } = Dimensions.get('window');

export default function FontSizeControl() {
  const { fontSize, setFontSize } = useFontSize();

  const sizes = [
    { value: 'pequeno' as const, label: 'A-' },
    { value: 'normal' as const, label: 'A' },
    { value: 'grande' as const, label: 'A+' },
    { value: 'muito-grande' as const, label: 'A++' }
  ];

  const currentIndex = sizes.findIndex(s => s.value === fontSize);

  const increaseFontSize = () => {
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1].value);
    }
  };

  const decreaseFontSize = () => {
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1].value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tamanho da Fonte</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={decreaseFontSize}
          disabled={currentIndex === 0}
          style={[
            styles.button,
            currentIndex === 0 && styles.buttonDisabled
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.buttonText,
            currentIndex === 0 && styles.buttonTextDisabled
          ]}>
            -
          </Text>
        </TouchableOpacity>

        <View style={styles.sizeIndicator}>
          <Text style={styles.sizeText}>{sizes[currentIndex].label}</Text>
        </View>

        <TouchableOpacity
          onPress={increaseFontSize}
          disabled={currentIndex === sizes.length - 1}
          style={[
            styles.button,
            currentIndex === sizes.length - 1 && styles.buttonDisabled
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.buttonText,
            currentIndex === sizes.length - 1 && styles.buttonTextDisabled
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  label: {
    fontSize: Math.min(width * 0.045, 20),
    fontWeight: '700',
    color: '#075D94',
    marginBottom: 12,
    textAlign: 'center'
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  button: {
    backgroundColor: '#075D94',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold'
  },
  buttonTextDisabled: {
    color: '#9CA3AF'
  },
  sizeIndicator: {
    backgroundColor: '#E6F3FA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#075D94'
  },
  sizeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#075D94'
  }
});

