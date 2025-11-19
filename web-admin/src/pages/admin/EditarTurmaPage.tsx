import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';

export default function EditarTurmaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: turma, isLoading } = useQuery({
    queryKey: ['turma', id],
    queryFn: () => adminService.getTurma(id!),
    enabled: !!id
  });

  const { data: todosAlunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
  });

  const alunosDisponiveis = todosAlunos?.filter((aluno: any) => {
    if (!turma?.alunos || turma.alunos.length === 0) return true;
    return !turma.alunos.some((at: any) => 
      at.alunoId === aluno.id || at.aluno?.id === aluno.id
    );
  }) || [];

  const vincularMutation = useMutation({
    mutationFn: (alunoId: string) => adminService.vincularAluno(alunoId, id!),
    onSuccess: () => {
      toast.success('Aluno adicionado à turma!');
      queryClient.invalidateQueries({ queryKey: ['turma', id] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao adicionar aluno');
    }
  });

  const desvincularMutation = useMutation({
    mutationFn: (vinculoId: string) => adminService.desvincularAluno(vinculoId),
    onSuccess: () => {
      toast.success('Aluno removido da turma!');
      queryClient.invalidateQueries({ queryKey: ['turma', id] });
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: () => {
      toast.error('Erro ao remover aluno da turma');
    }
  });

  const handleVincular = (alunoId: string, nomeAluno: string) => {
    if (window.confirm(`Adicionar ${nomeAluno} a esta turma?`)) {
      vincularMutation.mutate(alunoId);
    }
  };

  const handleDesvincular = (vinculoId: string, nomeAluno: string) => {
    if (window.confirm(`Remover ${nomeAluno} desta turma?`)) {
      desvincularMutation.mutate(vinculoId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Turma não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6 inline-flex items-center gap-2">
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Turma</h1>
        <p className="text-gray-600">Adicione ou remova alunos desta turma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Turma */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Users size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{turma.nome}</h2>
                <p className="text-blue-100">Ano {turma.ano}</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 space-y-2">
              <div>
                <p className="text-blue-100 text-sm">Professor</p>
                <p className="font-semibold">{turma.professor?.nome || '-'}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total de Alunos</p>
                <p className="font-semibold text-2xl">{turma.alunos?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alunos na Turma */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={24} className="text-blue-600" />
              Alunos na Turma ({turma.alunos?.length || 0})
            </h3>

            {turma.alunos?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhum aluno nesta turma ainda</p>
                <p className="text-sm text-gray-500 mt-2">Adicione alunos abaixo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {turma.alunos?.map((alunoTurma: any) => (
                  <div
                    key={alunoTurma.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {alunoTurma.aluno.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{alunoTurma.aluno.nome}</p>
                        <p className="text-sm text-gray-500">{alunoTurma.aluno.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDesvincular(alunoTurma.id, alunoTurma.aluno.nome)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover da turma"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adicionar Alunos */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={24} className="text-green-600" />
              Adicionar Alunos
            </h3>

            {alunosDisponiveis.length === 0 ? (
              <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold">✅ Todos os alunos já estão nesta turma!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {alunosDisponiveis.map((aluno: any) => (
                  <button
                    key={aluno.id}
                    onClick={() => handleVincular(aluno.id, aluno.nome)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors">
                        {aluno.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{aluno.nome}</p>
                        <p className="text-sm text-gray-500">{aluno.email}</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-600 p-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                      <Plus size={20} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

