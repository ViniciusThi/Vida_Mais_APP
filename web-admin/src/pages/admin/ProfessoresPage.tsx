import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { Plus, X, Edit, Trash2 } from 'lucide-react';

export default function ProfessoresPage() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const { data: professores, isLoading } = useQuery({
    queryKey: ['professores'],
    queryFn: adminService.getProfessores
  });

  const createMutation = useMutation({
    mutationFn: adminService.createProfessor,
    onSuccess: () => {
      toast.success('Professor criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      setShowModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar professor');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => adminService.updateProfessor(id, data),
    onSuccess: () => {
      toast.success('Professor atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      setShowModal(false);
      setEditando(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar professor');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteProfessor,
    onSuccess: () => {
      toast.success('Professor excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['professores'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir professor');
    }
  });

  const handleEditar = (professor: any) => {
    setEditando(professor);
    setValue('nome', professor.nome);
    setValue('email', professor.email);
    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setEditando(null);
    reset();
  };

  const handleExcluir = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este professor?')) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: any) => {
    if (editando) {
      updateMutation.mutate({ id: editando.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Professores</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Novo Professor
        </button>
      </div>

      <div className="card">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm sm:text-base">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Nome</th>
                <th className="text-left py-3">Email</th>
                <th className="text-left py-3">Turmas</th>
                <th className="text-left py-3">Status</th>
                <th className="text-right py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {professores?.map((prof: any) => (
                <tr key={prof.id} className="border-b last:border-0">
                  <td className="py-3 break-words">{prof.nome}</td>
                  <td className="py-3 break-words">{prof.email}</td>
                  <td className="py-3">{prof._count.turmasProfessor}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      prof.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prof.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditar(prof)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleExcluir(prof.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden space-y-4">
          {professores?.map((prof: any) => (
            <div key={prof.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 break-words">{prof.nome}</p>
                  <p className="text-sm text-gray-600 break-words">{prof.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  prof.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {prof.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium uppercase text-gray-500">Turmas</p>
                <p className="text-sm text-gray-700 mt-1">
                  {prof._count.turmasProfessor}
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEditar(prof)}
                  className="flex-1 py-2 px-3 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleExcluir(prof.id)}
                  className="flex-1 py-2 px-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold">{editando ? 'Editar Professor' : 'Novo Professor'}</h2>
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
                <label className="block text-sm font-medium mb-1">Email</label>
                <input {...register('email', { required: true })} type="email" className="input" />
                {errors.email && <span className="text-red-600 text-sm">Obrigatório</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <input {...register('senha', { required: true, minLength: 6 })} type="password" className="input" />
                {errors.senha && <span className="text-red-600 text-sm">Mínimo 6 caracteres</span>}
              </div>
              
              <button type="submit" className="btn-primary w-full">
                {editando ? 'Atualizar Professor' : 'Criar Professor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

