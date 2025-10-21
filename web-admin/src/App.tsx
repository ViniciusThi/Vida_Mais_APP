import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ProfessoresPage from './pages/admin/ProfessoresPage';
import AlunosPage from './pages/admin/AlunosPage';
import TurmasPage from './pages/admin/TurmasPage';
import QuestionariosPage from './pages/QuestionariosPage';
import CriarQuestionarioPage from './pages/CriarQuestionarioPage';
import EditarQuestionarioPage from './pages/EditarQuestionarioPage';
import RelatorioPage from './pages/RelatorioPage';

function App() {
  const { token } = useAuthStore();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/professores" element={<ProfessoresPage />} />
        <Route path="/admin/alunos" element={<AlunosPage />} />
        <Route path="/admin/turmas" element={<TurmasPage />} />
        
        {/* Questionários (Prof + Admin) */}
        <Route path="/questionarios" element={<QuestionariosPage />} />
        <Route path="/questionarios/novo" element={<CriarQuestionarioPage />} />
        <Route path="/questionarios/:id/editar" element={<EditarQuestionarioPage />} />
        <Route path="/questionarios/:id/relatorio" element={<RelatorioPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;

