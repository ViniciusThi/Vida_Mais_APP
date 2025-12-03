import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { FontSizeProvider } from './contexts/FontSizeContext';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProfessoresPage from './pages/admin/ProfessoresPage';
import AlunosPage from './pages/admin/AlunosPage';
import TurmasPage from './pages/admin/TurmasPage';
import QuestionariosPage from './pages/QuestionariosPage';
import CriarQuestionarioPage from './pages/CriarQuestionarioPage';
import EditarQuestionarioPage from './pages/EditarQuestionarioPage';
import RelatorioPage from './pages/RelatorioPage';
import ResponderQuestionarioPage from './pages/ResponderQuestionarioPage';
import MeusQuestionariosAlunoPage from './pages/MeusQuestionariosAlunoPage';
import EditarTurmaPage from './pages/admin/EditarTurmaPage';
import MLDashboardPage from './pages/MLDashboardPage';

function App() {
  const { token, user } = useAuthStore();

  if (!token) {
    return (
      <FontSizeProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </FontSizeProvider>
    );
  }

  return (
    <FontSizeProvider>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          
          {/* Rotas de Admin */}
          {user?.role === 'ADMIN' && (
            <>
              <Route path="/admin/professores" element={<ProfessoresPage />} />
              <Route path="/admin/alunos" element={<AlunosPage />} />
              <Route path="/admin/turmas" element={<TurmasPage />} />
              <Route path="/admin/turmas/:id/editar" element={<EditarTurmaPage />} />
            </>
          )}
          
          {/* Rotas de Questionários (Prof + Admin) */}
          {(user?.role === 'ADMIN' || user?.role === 'PROF') && (
            <>
              <Route path="/questionarios" element={<QuestionariosPage />} />
              <Route path="/questionarios/novo" element={<CriarQuestionarioPage />} />
              <Route path="/questionarios/:id/editar" element={<EditarQuestionarioPage />} />
              <Route path="/questionarios/:id/relatorio" element={<RelatorioPage />} />
              <Route path="/ml-insights" element={<MLDashboardPage />} />
            </>
          )}
          
          {/* Rotas de Aluno */}
          {user?.role === 'ALUNO' && (
            <>
              <Route path="/meus-questionarios" element={<MeusQuestionariosAlunoPage />} />
              <Route path="/responder-questionario/:id" element={<ResponderQuestionarioPage />} />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </FontSizeProvider>
  );
}

export default App;
