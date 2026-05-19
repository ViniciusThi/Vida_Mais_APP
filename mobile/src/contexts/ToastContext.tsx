import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import { colors, fontSizes, spacing, borderRadius } from '../theme/colors';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string, toastType: ToastType = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(msg);
      setType(toastType);
      setVisible(true);
      opacity.setValue(0);
      translateY.setValue(30);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 30, duration: 300, useNativeDriver: true }),
        ]).start(() => setVisible(false));
      }, 3500);
    },
    [opacity, translateY],
  );

  const bgColor: Record<ToastType, string> = {
    success: colors.feedback.sucesso,
    error: colors.feedback.erro,
    warning: colors.primary.laranja,
    info: colors.primary.azul,
  };

  const icon: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { backgroundColor: bgColor[type], opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.icon}>{icon[type]}</Text>
          <Text style={styles.text} numberOfLines={3}>
            {message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 52 : 36,
    left: 20,
    right: 20,
    borderRadius: borderRadius.large,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 22,
  },
  text: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
    fontWeight: '600',
    flex: 1,
    lineHeight: 26,
  },
});
