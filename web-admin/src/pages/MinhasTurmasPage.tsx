import { useQuery } from '@tanstack/react-query';
import { questionarioService } from '../services/questionarioService';
import { Users, GraduationCap, Mail, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Aluno {
  id: string;
  aluno: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
}

interface Turma {
  id: string;
  nome: string;
  ano: number;
  alunos?: Aluno[];
  _count?: {
    alunos: number;
  };
}

export default function MinhasTurmasPage() {
  const [expandedTurmas, setExpandedTurmas] = useState<Set<string>>(new Set());

  const { data: turmas, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['minhas-turmas-detalhadas'],
    queryFn: async () => {
      const turmasList = await questionarioService.getMinhasTurmas();
      // Buscar detalhes de cada turma com alunos
      const detalhadas = await Promise.all(
        turmasList.map(async (turma: Turma) => {
          try {
            const alunos = await questionarioService.getAlunosDaTurma(turma.id);
            return { ...turma, alunos };
          } catch (error) {
            console.error('Erro ao buscar alunos da turma:', error);
            return { ...turma, alunos: [] };
          }
        })
      );
      return detalhadas as Turma[];
    }
  });

  const toggleExpand = (turmaId: string) => {
    setExpandedTurmas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(turmaId)) {
        newSet.delete(turmaId);
      } else {
        newSet.add(turmaId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (turmas) {
      setExpandedTurmas(new Set(turmas.map(t => t.id)));
    }
  };

  const collapseAll = () => {
    setExpandedTurmas(new Set());
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Meus Grupos
          </h1>
          <p className="text-gray-600 mt-2">Visualização dos grupos e participantes vinculados</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="btn-secondary text-sm"
          >
            Expandir Todas
          </button>
          <button
            onClick={collapseAll}
            className="btn-secondary text-sm"
          >
            Recolher Todas
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de Turmas */}
      {!turmas || turmas.length === 0 ? (
        <div className="text-center py-16 card">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum grupo encontrado
          </h3>
          <p className="text-gray-600">
            Você ainda não tem grupos vinculados. Entre em contato com o administrador.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card bg-blue-50 border-l-4 border-blue-600">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-blue-700">Total de Grupos</p>
                  <p className="text-2xl font-bold text-blue-900">{turmas.length}</p>
                </div>
              </div>
            </div>
            <div className="card bg-green-50 border-l-4 border-green-600">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-green-700">Total de Participantes</p>
                  <p className="text-2xl font-bold text-green-900">
                    {turmas.reduce((acc, t) => acc + (t.alunos?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="card bg-orange-50 border-l-4 border-orange-600">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-orange-600" size={24} />
                <div>
                  <p className="text-sm text-orange-700">Média por Grupo</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {turmas.length > 0 
                      ? Math.round(turmas.reduce((acc, t) => acc + (t.alunos?.length || 0), 0) / turmas.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Turmas */}
          {turmas.map((turma) => {
            const isExpanded = expandedTurmas.has(turma.id);
            
            return (
              <div key={turma.id} className="card border-l-4 border-blue-600 overflow-hidden">
                {/* Header da Turma */}
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 transition-colors"
                  onClick={() => toggleExpand(turma.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{turma.nome}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                          Ano {turma.ano}
                        </span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <GraduationCap size={16} />
                          {turma.alunos?.length || 0} participantes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="text-gray-500" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-500" size={24} />
                    )}
                  </div>
                </div>

                {/* Lista de Alunos (expandível) */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <GraduationCap size={18} />
                      Participantes do Grupo
                    </h4>
                    
                    {!turma.alunos || turma.alunos.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Nenhum participante vinculado a este grupo</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {turma.alunos.map((alunoTurma) => (
                          <div 
                            key={alunoTurma.id} 
                            className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-green-700 font-semibold">
                                  {alunoTurma.aluno.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {alunoTurma.aluno.nome}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
                                  <Mail size={14} />
                                  {alunoTurma.aluno.email}
                                </p>
                                {alunoTurma.aluno.telefone && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    📱 {alunoTurma.aluno.telefone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 card bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <p className="font-semibold text-blue-900">Informação</p>
            <p className="text-blue-800 mt-1">
              Esta é uma visualização dos grupos e participantes vinculados a você.
              Para adicionar, remover ou editar grupos e participantes, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

