// Configurações globais para o ambiente de testes
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Porta aleatória para evitar conflitos
process.env.JWT_SECRET = 'test-jwt-secret-key-for-jest-tests-only';
process.env.ML_SERVICE_URL = 'http://localhost:5000';
