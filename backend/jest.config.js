/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  clearMocks: true,
  restoreMocks: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
      },
      // Desabilita type-checking no ts-jest: os mocks não satisfazem os tipos reais do @prisma/client
      // O type-check completo é feito pelo `tsc` separadamente
      diagnostics: false,
    }]
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/prisma/**',
    '!src/scripts/**',
    '!src/server.ts'
  ]
};
