import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { Plus, X, Edit, Trash2, Users, Mail, Phone } from 'lucide-react';

export default function AlunosPage() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  const { data: alunos, isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: adminService.getAlunos
  });

  const createMutation = useMutation({
    mutationFn: adminService.createAluno,
    onSuccess: () => {
      toast.success('Aluno criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      setShowModal(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar aluno');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => adminService.updateAluno(id, data),
    onSuccess: () => {
      toast.success('Aluno atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      setShowModal(false);
      setEditando(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar aluno');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteAluno,
    onSuccess: () => {
      toast.success('Aluno excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao excluir aluno');
    }
  });

  const handleEditar = (aluno: any) => {
    setEditando(aluno);
    setValue('nome', aluno.nome);
    setValue('email', aluno.email);
    setShowModal(true);
  };

  const handleFecharModal = () => {
    setShowModal(false);
    setEditando(null);
    reset();
  };

  const handleExcluir = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Alunos</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Novo Aluno
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alunos?.map((aluno: any) => (
          <div key={aluno.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                  {aluno.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{aluno.nome}</h3>
                  <p className="text-green-100 text-sm truncate">{aluno.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-2 mb-4">
                {aluno.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-green-600" />
                    <span>{aluno.telefone}</span>
                  </div>
                )}
                
                {aluno.idade && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🎂</span>
                    <span>{aluno.idade} anos</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-blue-600" />
                  <span className="text-gray-600">
                    {aluno.alunoTurmas?.length > 0
                      ? aluno.alunoTurmas.map((at: any) => at.turma.nome).join(', ')
                      : 'Sem turma'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${aluno.ativo ? 'badge-success' : 'badge-danger'}`}>
                    {aluno.ativo ? '✓ Ativo' : '✗ Inativo'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditar(aluno)}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  <span className="text-sm">Editar</span>
                </button>
                <button
                  onClick={() => handleExcluir(aluno.id, aluno.nome)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-slideInRight">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{editando ? '✏️ Editar Aluno' : '➕ Novo Aluno'}</h2>
              <button onClick={handleFecharModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Nome Completo *</label>
                <input 
                  {...register('nome', { required: true })} 
                  className="input" 
                  placeholder="Digite o nome completo"
                />
                {errors.nome && <span className="text-red-600 text-sm">Campo obrigatório</span>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email *</label>
                <input 
                  {...register('email', { required: true })} 
                  type="email" 
                  className="input" 
                  placeholder="exemplo@email.com"
                />
                {errors.email && <span className="text-red-600 text-sm">Campo obrigatório</span>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Senha {editando && '(deixe em branco para não alterar)'}
                </label>
                <input 
                  {...register('senha', { required: !editando, minLength: 6 })} 
                  type="password" 
                  className="input" 
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.senha && <span className="text-red-600 text-sm">Mínimo 6 caracteres</span>}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={handleFecharModal} 
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editando ? 'Atualizar' : 'Criar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

