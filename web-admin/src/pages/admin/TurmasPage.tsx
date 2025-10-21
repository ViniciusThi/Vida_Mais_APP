import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { Plus, X } from 'lucide-react';

export default function TurmasPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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

  const onSubmit = (data: any) => {
    createMutation.mutate({ ...data, ano: parseInt(data.ano) });
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Turmas</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas?.map((turma: any) => (
          <div key={turma.id} className="card">
            <h3 className="text-lg font-bold mb-2">{turma.nome}</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Professor:</strong> {turma.professor.nome}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Ano:</strong> {turma.ano}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Alunos:</strong> {turma._count.alunos}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nova Turma</h2>
              <button onClick={() => setShowModal(false)}>
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
                Criar Turma
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

