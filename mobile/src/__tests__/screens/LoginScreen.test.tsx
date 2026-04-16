// Mocks necessários para React Native + Expo
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), reset: jest.fn() }),
}));

jest.mock('../../services/api', () => ({
  authService: { login: jest.fn() },
  setAuthToken: jest.fn(),
}));

jest.mock('../../stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    const state = { setAuth: jest.fn() };
    return selector ? selector(state) : state;
  },
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../screens/LoginScreen';
import { authService, setAuthToken } from '../../services/api';

const mockLogin = authService.login as jest.Mock;
const mockSetAuthToken = setAuthToken as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('LoginScreen', () => {
  it('deve renderizar campos de email e senha', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    expect(getByPlaceholderText('Digite seu email ou telefone')).toBeTruthy();
    expect(getByPlaceholderText('Digite sua senha')).toBeTruthy();
  });

  it('deve renderizar botão de login', () => {
    const { getByLabelText } = render(<LoginScreen />);
    // Usa accessibilityLabel para evitar ambiguidade com "ENTRAR COM ROSTO"
    expect(getByLabelText('Botão de login')).toBeTruthy();
  });

  it('deve mostrar alerta quando campos estão vazios', () => {
    const { getByLabelText } = render(<LoginScreen />);
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

    fireEvent.press(getByLabelText('Botão de login'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Atenção',
      'Por favor, preencha todos os campos',
      expect.any(Array)
    );
  });

  it('deve chamar authService.login com credenciais corretas', async () => {
    mockLogin.mockResolvedValue({
      token: 'jwt-token',
      user: { id: 'u-1', nome: 'Maria', email: 'maria@test.com', role: 'ALUNO' },
    });

    const { getByPlaceholderText, getByLabelText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Digite seu email ou telefone'), 'maria@test.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByLabelText('Botão de login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('maria@test.com', 'senha123');
    });
  });

  it('deve chamar setAuthToken após login bem-sucedido', async () => {
    mockLogin.mockResolvedValue({
      token: 'jwt-token',
      user: { id: 'u-1', nome: 'Maria', email: 'maria@test.com', role: 'ALUNO' },
    });

    const { getByPlaceholderText, getByLabelText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Digite seu email ou telefone'), 'maria@test.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByLabelText('Botão de login'));

    await waitFor(() => {
      expect(mockSetAuthToken).toHaveBeenCalledWith('jwt-token');
    });
  });

  it('deve mostrar alerta de erro quando login falha', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { error: 'Credenciais inválidas' } }
    });

    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

    const { getByPlaceholderText, getByLabelText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Digite seu email ou telefone'), 'errado@test.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senhaerrada');
    fireEvent.press(getByLabelText('Botão de login'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Não foi possível entrar',
        'Credenciais inválidas',
        expect.any(Array)
      );
    });
  });

  it('deve exibir mensagem de fallback quando resposta de erro sem detalhe', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));

    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');

    const { getByPlaceholderText, getByLabelText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Digite seu email ou telefone'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Digite sua senha'), 'senha123');
    fireEvent.press(getByLabelText('Botão de login'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Não foi possível entrar',
        'Verifique seu email/telefone e senha',
        expect.any(Array)
      );
    });
  });

  it('deve ter campos com acessibilityLabel', () => {
    const { getByLabelText } = render(<LoginScreen />);
    expect(getByLabelText('Campo de email ou telefone')).toBeTruthy();
  });
});
