# Vida Mais APP - Complete Technical Documentation

## Project Overview
Vida Mais is a comprehensive educational platform with AI-powered analytics, facial recognition login, and questionnaire management. The monorepo contains a Node.js/Express backend, React web admin interface, React Native mobile app, and Python ML service.

---

## 1. BACKEND API ROUTES

### Authentication Routes (/auth)
- **POST /auth/login** - User login with email/phone and password
- **POST /auth/cadastro** - Public registration for associates (age 60+)

### Face Recognition Routes (/face)
- **POST /face/login** - Facial recognition login (students only)
- **POST /face/registrar** - Register/update facial recognition (authenticated students)
- **DELETE /face/registrar** - Delete registered facial profile

### Admin Routes (/admin) - Admin only
- **POST /admin/professores** - Create professor
- **PUT /admin/professores/:id** - Update professor
- **DELETE /admin/professores/:id** - Delete professor
- **GET /admin/professores** - List all professors
- **POST /admin/alunos** - Create student
- **PUT /admin/alunos/:id** - Update student
- **DELETE /admin/alunos/:id** - Delete student
- **GET /admin/alunos** - List all students
- **POST /admin/alunos/importar** - Import students from CSV
- **POST /admin/turmas** - Create class
- **PUT /admin/turmas/:id** - Update class
- **DELETE /admin/turmas/:id** - Delete class
- **GET /admin/turmas** - List all classes
- **POST /admin/turmas/:id/alunos** - Add students to class
- **DELETE /admin/turmas/:id/alunos/:alunoId** - Remove student from class

### Professor Routes (/prof) - Professors & Admins
**Classes:**
- **GET /prof/minhas-turmas** - Get professor's classes with student/questionnaire counts
- **GET /prof/turmas/:id/alunos** - Get students in a class

**Questionnaires:**
- **POST /prof/questionarios** - Create questionnaire (global or class-specific)
- **PUT /prof/questionarios/:id** - Update questionnaire
- **DELETE /prof/questionarios/:id** - Delete questionnaire
- **GET /prof/questionarios** - List professor's questionnaires
- **GET /prof/questionarios/:id** - Get questionnaire details with questions
- **POST /prof/questionarios/:id/perguntas** - Add question to questionnaire
- **PUT /prof/questionarios/:id/perguntas/:perguntaId** - Update question
- **DELETE /prof/questionarios/:id/perguntas/:perguntaId** - Delete question

**Reports & Export:**
- **GET /prof/relatorios/turma/:turmaId** - Get class report with response statistics
- **GET /prof/relatorios/aluno/:alunoId** - Get student report with performance metrics
- **GET /prof/respostas/export** - Export responses to Excel

### Student Routes (/aluno) - Students only
- **GET /aluno/questionarios-ativos** - List active questionnaires (filtered by time period and visibility)
- **GET /aluno/questionarios/:id** - Get questionnaire with questions
- **POST /aluno/questionarios/:id/responder** - Submit responses to questionnaire
- **GET /aluno/minhas-respostas** - View student's submitted responses

### ML Routes (/ml)
- **GET /ml/analytics/overview** - Get overall analytics metrics
- **GET /ml/analytics/turma/:id** - Get class-specific analytics
- **GET /ml/analytics/aluno/:id** - Get student-specific analytics
- **POST /ml/predict/evasao** - Predict class dropout risk
- **POST /ml/predict/desempenho** - Predict student performance trend
- **GET /ml/patterns/engagement** - Identify engagement patterns
- **GET /ml/patterns/responses** - Analyze response patterns
- **POST /ml/train/models** - Retrain ML models (Admin/Professor)
- **GET /ml/models/status** - Get ML model status
- **GET /ml/health** - ML service health check

---

## 2. AWS SERVICES USED

### AWS Rekognition
- **Collection ID**: vida-mais-faces
- **Region**: sa-east-1 (São Paulo)
- **Purpose**: Facial recognition for student login authentication
- **Operations**:
  - IndexFace: Register student facial profile
  - SearchFace: Authenticate via facial recognition
  - DeleteFace: Remove registered facial profile
- **Package**: @aws-sdk/client-rekognition (v3.1025.0)
- **Configuration**:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_REGION
  - AWS_REKOGNITION_COLLECTION_ID

---

## 3. TECHNOLOGY STACK & DEPENDENCIES

### Backend (Node.js/TypeScript)
- Node.js 20-slim (Docker)
- Express 4.18.2
- Prisma 5.20.0
- TypeScript 5.3.3
- JWT (jsonwebtoken 9.0.2)
- Bcrypt 5.1.1
- Zod 3.22.4
- Axios 1.6.5
- ExcelJS 4.4.0
- fast-csv 5.0.1
- Helmet 7.1.0
- CORS 2.8.5
- @aws-sdk/client-rekognition 3.1025.0

### Web Admin (React + Vite)
- React 18.2.0
- TypeScript 5.2.2
- Vite 6.4.1
- TailwindCSS 3.4.0
- React Router DOM 6.21.1
- @tanstack/react-query 5.17.9
- @tanstack/react-table 8.11.2
- Chart.js 4.4.1
- Zustand 4.4.7
- Axios 1.6.5

### Mobile (React Native/Expo)
- Expo 54.0.25
- React Native 0.81.5
- React 19.1.0
- expo-camera 17.0.10
- expo-secure-store 15.0.8
- @react-navigation/native 6.1.9
- @tanstack/react-query 5.17.9
- Zustand 4.4.7
- Axios 1.6.5

### ML Service (Python)
- Flask 3.0.0
- pandas 2.1.4
- numpy 1.26.2
- scikit-learn 1.3.2
- joblib 1.3.2
- PyMySQL 1.1.0

---

## 4. DATABASE SCHEMA (Prisma)

### Core Models

**User**: id, nome, email, telefone, senhaHash, role (ADMIN|PROF|ALUNO), idade, deficiencia, ativo, faceId, faceRegistrada

**Turma**: id, nome, ano, professorId, ativo

**AlunoTurma**: id, alunoId, turmaId (many-to-many)

**Questionario**: id, titulo, descricao, criadoPor, visibilidade (GLOBAL|TURMA), turmaId, ativo, padrao, ano, periodoInicio, periodoFim

**Pergunta**: id, questionarioId, ordem, tipo (TEXTO|MULTIPLA|UNICA|ESCALA|BOOLEAN), texto, obrigatoria, descricao

**Opcao**: id, perguntaId, valor, ordem

**Resposta**: id, perguntaId, alunoId, questionarioId, turmaId, valorTexto, valorOpcao, valorEscala

**Convite**: id, turmaId, email, codigoInvite, enviado

---

## 5. MOBILE SCREENS

### Authentication
- LoginScreen, FaceLoginScreen, CadastroScreen, CadastrarRostoScreen

### Core
- HomeScreen, SuccessScreen, QuestionarioScreen, RevisarRespostasScreen

### Admin (admin/*)
- AlunosScreen, EditarAlunoScreen, ProfessoresScreen, EditarProfessorScreen, TurmasScreen, EditarTurmaScreen

### Professor (professor/*)
- MinhasTurmasScreen, MeusQuestionariosScreen, CriarQuestionarioScreen, RelatorioScreen, MLInsightsScreen

---

## 6. ML SERVICE ENDPOINTS

- **GET /health** - Service health check
- **GET /models/status** - ML model status
- **GET /analytics/overview** - System-wide metrics
- **GET /analytics/turma/<turma_id>** - Class analytics
- **GET /analytics/aluno/<aluno_id>** - Student analytics
- **POST /predict/evasao** - Dropout risk prediction
- **POST /predict/desempenho** - Performance prediction
- **GET /patterns/engagement** - Engagement patterns
- **GET /patterns/responses** - Response patterns
- **POST /train/models** - Retrain models

---

## 7. ENVIRONMENT VARIABLES

### Backend
```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://vidamais:vidamais2025@db:3306/vida_mais
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://ml-service:5000
AWS_ACCESS_KEY_ID=<KEY>
AWS_SECRET_ACCESS_KEY=<SECRET>
AWS_REGION=sa-east-1
AWS_REKOGNITION_COLLECTION_ID=vida-mais-faces
```

### ML Service
```
DB_HOST=db
DB_PORT=3306
DB_USER=vidamais
DB_PASSWORD=vidamais2025
DB_NAME=vida_mais
PORT=5000
FLASK_DEBUG=0
```

---

## 8. DOCKER & INFRASTRUCTURE

Services in docker-compose.yml:
1. **MySQL 8.0** - Database with persistent volume
2. **ML Service** - Python Flask on port 5000
3. **Backend** - Node.js on port 3000 (3-stage build)
4. **Web Admin** - Nginx on port 80

Backend startup: `npx prisma generate && npx prisma db push && node dist/server.js`

---

## 9. KEY FEATURES

- Facial recognition authentication (AWS Rekognition)
- Role-based access control (ADMIN, PROF, ALUNO)
- Questionnaire management (global/class-specific)
- ML analytics (dropout prediction, performance trends)
- Excel/CSV import-export
- Time-based questionnaire activation

---

## 10. SECURITY

- JWT authentication (7-day expiry)
- Bcrypt password hashing
- Helmet.js security headers
- CORS protection
- Rate limiting
- Zod schema validation
- Secure token storage (mobile)

---

Generated: 2026-04-08
