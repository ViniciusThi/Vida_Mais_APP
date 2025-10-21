import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { questionarioService } from '../services/questionarioService';
import { Plus, BarChart3, Edit } from 'lucide-react';

export default function QuestionariosPage() {
  const { data: questionarios, isLoading } = useQuery({
    queryKey: ['questionarios'],
    queryFn: questionarioService.getQuestionarios
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Questionários</h1>
        <Link to="/questionarios/novo" className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Novo Questionário
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questionarios?.map((q: any) => (
          <div key={q.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold">{q.titulo}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                q.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {q.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {q.turma?.nome || 'Global'} · {q._count.perguntas} perguntas · {q._count.respostas} respostas
            </p>
            
            <div className="flex gap-2">
              <Link 
                to={`/questionarios/${q.id}/relatorio`} 
                className="btn-secondary flex-1 text-center text-sm"
              >
                <BarChart3 size={16} className="inline mr-1" />
                Relatório
              </Link>
              <Link 
                to={`/questionarios/${q.id}/editar`} 
                className="btn-secondary text-sm"
              >
                <Edit size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {questionarios?.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">Nenhum questionário criado ainda.</p>
          <Link to="/questionarios/novo" className="btn-primary">
            Criar Primeiro Questionário
          </Link>
        </div>
      )}
    </div>
  );
}

