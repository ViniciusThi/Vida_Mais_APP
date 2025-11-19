import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';

export default function TurmasPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const { data: turmas, isLoading } = useQuery({
    queryKey: ['turmas'],
    queryFn: adminService.getTurmas
  });

  const { data: professores } = useQuery({
    queryKey: ['professores'],
    queryFn: adminService.getProfessores
  });

  const createMutation = useMutation({
    mutationFn: adminService.createTurma,
    onSuccess: () => {
      toast.success('Turma criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setShowModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar turma');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => adminService.updateTurma(id, data),
    onSuccess: () => {
      toast.success('Turma atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setShowModal(false);
      setEditando(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar turma');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteTurma,
    onSuccess: () => {
      toast.success('Turma excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir turma');
    }
  });

  const handleEditar = (turma: any) => {
    setEditando(turma);
    setValue('nome', turma.nome);
    setValue('ano', turma.ano);
    setValue('professorId', turma.professorId);
    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setEditando(null);
    reset();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: any) => {
    if (editando) {
      updateMutation.mutate({ id: editando.id, ...data, ano: parseInt(data.ano) });
    } else {
      createMutation.mutate({ ...data, ano: parseInt(data.ano) });
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Turmas</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {turmas?.map((turma: any) => (
          <div key={turma.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <h3 className="text-lg font-bold">{turma.nome}</h3>
              <p className="text-blue-100 text-sm">Ano {turma.ano}</p>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-semibold">👨‍🏫</span>
                  <span>{turma.professor.nome}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-blue-600" />
                  <span className="font-semibold text-gray-900">{turma._count.alunos} alunos</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/turmas/${turma.id}/editar`)}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Gerenciar Alunos"
                >
                  <Users size={16} />
                  <span className="text-sm">Gerenciar</span>
                </button>
                <button
                  onClick={() => handleEditar(turma)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleExcluir(turma.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">{editando ? 'Editar Turma' : 'Nova Turma'}</h2>
              <button onClick={handleFecharModal} className="flex-shrink-0">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input {...register('nome', { required: true })} className="input" />
                {errors.nome && <span className="text-red-600 text-sm">Obrigatório</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ano</label>
                <input {...register('ano', { required: true })} type="number" className="input" defaultValue={2025} />
                {errors.ano && <span className="text-red-600 text-sm">Obrigatório</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Professor</label>
                <select {...register('professorId', { required: true })} className="input">
                  <option value="">Selecione...</option>
                  {professores?.map((prof: any) => (
                    <option key={prof.id} value={prof.id}>{prof.nome}</option>
                  ))}
                </select>
                {errors.professorId && <span className="text-red-600 text-sm">Obrigatório</span>}
              </div>
              
              <button type="submit" className="btn-primary w-full">
                {editando ? 'Atualizar Turma' : 'Criar Turma'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

