import '@testing-library/jest-dom';

// Mock do window.location para testes de redirecionamento
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '' },
});
