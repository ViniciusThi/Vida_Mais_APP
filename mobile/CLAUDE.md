# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                            # Expo dev server
npm run android                      # Build/run on Android
npm run ios                          # Build/run on iOS
npm run test                         # Jest (jest-expo preset)
npm run test -- path/to/file.test.ts # Run a single test file
npm run test:watch                   # Watch mode
npm run test:coverage                # Coverage report
```

## Architecture

### API Configuration (`src/config/api.ts`)
`API_URL` points to the AWS backend (`http://54.233.110.183/api`). For local development, change this to your machine's LAN IP (e.g. `http://192.168.x.x/api`) — `localhost` won't work from a physical device or emulator.

### Entry Point & Navigation (`App.tsx`)
Single `NativeStackNavigator` with token-gated routing — unauthenticated users see `Login / Cadastro / FaceLogin`; authenticated users see all role-specific screens. Auth state is loaded from `SecureStore` on startup via `useAuthStore().loadToken()`.

### State Management
- **Zustand** (`src/stores/authStore.ts`) — auth token + user, persisted in `expo-secure-store` (`token` and `user` keys).
- **TanStack Query** — server data fetching/caching; `QueryClient` is created once in `App.tsx`.
- **FontSizeContext** (`src/contexts/FontSizeContext.tsx`) — user font-scale preference (4 levels: `pequeno / normal / grande / muito-grande`), persisted via `AsyncStorage`.

### API Layer (`src/services/api.ts`)
Single axios instance pointed at `src/config/api.ts` (`API_URL`). Bearer token injected globally via `setAuthToken()`. Services are organized by role:
- `authService` — login, cadastro, face login/register/remove/status
- `adminService` — professors, alunos, turmas CRUD
- `professorService` — questionários, perguntas, relatórios, templates, export
- `alunoService` — active questionnaires, submit responses

### Screens by Role
| Role | Screens |
|------|---------|
| Unauthenticated | `LoginScreen`, `CadastroScreen`, `FaceLoginScreen` |
| ALUNO | `HomeScreen`, `QuestionarioScreen`, `RevisarRespostasScreen`, `SuccessScreen` |
| ADMIN | `ProfessoresScreen`, `AlunosScreen`, `TurmasScreen`, `EditarTurmaScreen`, `EditarProfessorScreen`, `EditarAlunoScreen` |
| PROF | `MeusQuestionariosScreen`, `CriarQuestionarioScreen`, `RelatorioScreen`, `MinhasTurmasScreen`, `MLInsightsScreen` |
| All (auth) | `CadastrarRostoScreen` (facial registration) |

### Theme System (`src/theme/colors.ts`)
Exports design tokens used across all screens — always import from here instead of hardcoding values:
- `colors` — brand palette (laranja `#FF7E00`, azul `#075D94`, verde `#7ABA43`) + neutral + feedback
- `fontSizes` — min `xs: 18`, body `md: 24`, titles up to `xxl: 36`
- `spacing` — padding/margin scale; `questionGap: 60` between survey questions
- `buttonSizes` — min height `small: 60`, standard `medium: 70`, primary `large: 80`
- `borderRadius` — scale from `small: 8` to `round: 999`

Note: `#7ABA43` (verde) has only 2.3:1 contrast on white — use it as a background with dark text only.

### Face Auth Utility (`src/utils/captureAndResize.ts`)
`captureAndResize(cameraRef)` — captures a photo, resizes to 640px wide, and returns **raw base64 without the `data:image/jpeg;base64,` prefix**. This is what the backend's AWS Rekognition integration expects. Do not add the data URI prefix.

### Accessibility Constraints
- `Text` and `TextInput` have `maxFontSizeMultiplier: 1.3` set globally in `App.tsx` — do not override per-component.
- Touch targets must be ≥ 60×60px; base font sizes ≥ 20px.
- TTS via `expo-speech`; camera via `expo-camera` (face auth).

### Tests (`src/__tests__/`)
Tests mirror `src/` structure. Use `@testing-library/react-native` for screen tests and plain Jest for store tests.
