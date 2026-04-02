import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

interface FontSizeContextType {
  fontSize: FontSize;
  scale: number;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('app-font-size');
    return (saved as FontSize) || 'normal';
  });

  const scale =
    fontSize === 'small'
      ? 0.9
      : fontSize === 'large'
        ? 1.15
        : fontSize === 'xlarge'
          ? 1.3
          : 1;

  useEffect(() => {
    // Aplica o tamanho de fonte no elemento root
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, scale, setFontSize }}>
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

