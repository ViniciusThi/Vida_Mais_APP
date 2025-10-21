import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { adminService } from '../services/adminService';
import { questionarioService } from '../services/questionarioService';
import { Users, GraduationCap, UsersRound, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: professores } = useQuery({
    queryKey: ['professores'],
    queryFn: adminService.getProfessores,
    enabled: user?.role === 'ADMIN'
  });

  const { data: alunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos,
    enabled: user?.role === 'ADMIN'
  });

  const { data: turmas } = useQuery({
    queryKey: ['turmas'],
    queryFn: user?.role === 'ADMIN' ? adminService.getTurmas : questionarioService.getMinhasTurmas
  });

  const { data: questionarios } = useQuery({
    queryKey: ['questionarios'],
    queryFn: questionarioService.getQuestionarios
  });

  const stats = [
    {
      label: 'Professores',
      value: professores?.length || 0,
      icon: GraduationCap,
      color: 'bg-blue-500',
      show: user?.role === 'ADMIN'
    },
    {
      label: 'Alunos',
      value: alunos?.length || 0,
      icon: Users,
      color: 'bg-green-500',
      show: user?.role === 'ADMIN'
    },
    {
      label: 'Turmas',
      value: turmas?.length || 0,
      icon: UsersRound,
      color: 'bg-purple-500',
      show: true
    },
    {
      label: 'Questionários',
      value: questionarios?.length || 0,
      icon: FileText,
      color: 'bg-orange-500',
      show: true
    }
  ].filter(stat => stat.show);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Bem-vindo, {user?.nome}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Questionários Recentes
        </h2>
        {questionarios && questionarios.length > 0 ? (
          <div className="space-y-3">
            {questionarios.slice(0, 5).map((q: any) => (
              <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{q.titulo}</p>
                  <p className="text-sm text-gray-600">
                    {q.turma?.nome || 'Global'} · {q._count.respostas} respostas
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  q.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {q.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhum questionário criado ainda.</p>
        )}
      </div>
    </div>
  );
}

