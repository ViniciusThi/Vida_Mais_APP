import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSize = 'pequeno' | 'normal' | 'grande' | 'muito-grande';

interface FontSizeContextType {
  fontSize: FontSize;
  fontScale: number;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const fontSizeMap = {
  'pequeno': 0.85,
  'normal': 1.0,
  'grande': 1.15,
  'muito-grande': 1.3
};

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [fontScale, setFontScale] = useState<number>(1.0);

  useEffect(() => {
    // Carregar preferência salva
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const saved = await AsyncStorage.getItem('app-font-size');
      if (saved && saved in fontSizeMap) {
        const size = saved as FontSize;
        setFontSizeState(size);
        setFontScale(fontSizeMap[size]);
      }
    } catch (error) {
      console.log('Erro ao carregar preferência de fonte:', error);
    }
  };

  const setFontSize = async (size: FontSize) => {
    try {
      setFontSizeState(size);
      setFontScale(fontSizeMap[size]);
      await AsyncStorage.setItem('app-font-size', size);
    } catch (error) {
      console.log('Erro ao salvar preferência de fonte:', error);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, fontScale, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within FontSizeProvider');
  }
  return context;
}

