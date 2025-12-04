import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { alunoService } from '../services/alunoService';
import { Users, GraduationCap, ClipboardList, FileQuestion, Plus, BarChart3, Brain } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: questionarios } = useQuery({
    queryKey: ['questionarios-ativos'],
    queryFn: alunoService.getQuestionariosAtivos,
    enabled: user?.role === 'ALUNO'
  });

  // Loading state
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboard navigate={navigate} />;
  }

  if (user.role === 'PROF') {
    return <ProfessorDashboard navigate={navigate} />;
  }

  if (user.role === 'ALUNO') {
    return <AlunoDashboard navigate={navigate} questionarios={questionarios || []} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <p className="text-gray-600">Role não reconhecido: {user.role}</p>
      </div>
    </div>
  );
}

function AdminDashboard({ navigate }: any) {
  const menuItems = [
    { title: 'Professores', subtitle: 'Gerenciar professores', path: '/admin/professores', icon: Users, borderColor: 'border-blue-600', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Alunos', subtitle: 'Gerenciar alunos', path: '/admin/alunos', icon: GraduationCap, borderColor: 'border-orange-600', bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
    { title: 'Turmas', subtitle: 'Gerenciar turmas', path: '/admin/turmas', icon: ClipboardList, borderColor: 'border-green-600', bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { title: 'Criar Questionário', subtitle: 'Templates ou manual', path: '/questionarios/novo', icon: Plus, borderColor: 'border-purple-600', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    { title: 'Questionários', subtitle: 'Gerenciar questionários', path: '/questionarios', icon: FileQuestion, borderColor: 'border-blue-600', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Insights Preditivos 🤖', subtitle: 'Machine Learning & Analytics', path: '/ml-insights', icon: Brain, borderColor: 'border-purple-600', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600 mt-2">Gerencie o sistema Vida Mais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`card hover:shadow-xl transition-all text-left border-l-4 ${item.borderColor}`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <item.icon className={item.iconColor} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfessorDashboard({ navigate }: any) {
  const menuItems = [
    { title: 'Meus Questionários', subtitle: 'Ver questionários criados', path: '/questionarios', icon: FileQuestion, borderColor: 'border-blue-600', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { title: 'Criar Questionário', subtitle: 'Templates ou manual', path: '/questionarios/novo', icon: Plus, borderColor: 'border-purple-600', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
    { title: 'Insights Preditivos 🤖', subtitle: 'Machine Learning & Analytics', path: '/ml-insights', icon: Brain, borderColor: 'border-purple-600', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel do Professor</h1>
        <p className="text-gray-600 mt-2">Crie e gerencie questionários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`card hover:shadow-xl transition-all text-left border-l-4 ${item.borderColor}`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <item.icon className={item.iconColor} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.subtitle}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AlunoDashboard({ navigate, questionarios }: any) {
  const pendentes = questionarios.filter((q: any) => !q.respondido);
  const respondidos = questionarios.filter((q: any) => q.respondido);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo!</h1>
          <p className="text-gray-600 mt-2">Questionários disponíveis para você</p>
        </div>
        <button
          onClick={() => navigate('/meus-questionarios')}
          className="btn-primary flex items-center gap-2"
        >
          <ClipboardList size={20} />
          Ver Todos
        </button>
      </div>

      {pendentes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Questionários Disponíveis</h2>
          <div className="space-y-4">
            {pendentes.map((q: any) => (
              <div key={q.id} className="card border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{q.titulo}</h3>
                    {q.descricao && (
                      <p className="text-gray-600 mt-1">{q.descricao}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {q._count?.perguntas || 0} perguntas
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/responder-questionario/${q.id}`)}
                    className="btn-primary ml-4"
                  >
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendentes.length === 0 && (
        <div className="text-center py-12 card">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tudo em dia!
          </h3>
          <p className="text-gray-600">
            Nenhum questionário pendente no momento
          </p>
        </div>
      )}

      {respondidos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">✅ Já Respondidos</h2>
          <div className="space-y-3">
            {respondidos.map((q: any) => (
              <div key={q.id} className="card bg-green-50 border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-900">{q.titulo}</h3>
                <p className="text-sm text-green-700 mt-1">Obrigado pela participação!</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
