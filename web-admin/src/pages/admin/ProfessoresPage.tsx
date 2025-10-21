import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { Plus, X } from 'lucide-react';

export default function ProfessoresPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} className="inline mr-2" />
          Novo Professor
        </button>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Nome</th>
              <th className="text-left py-3">Email</th>
              <th className="text-left py-3">Turmas</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {professores?.map((prof: any) => (
              <tr key={prof.id} className="border-b last:border-0">
                <td className="py-3">{prof.nome}</td>
                <td className="py-3">{prof.email}</td>
                <td className="py-3">{prof._count.turmasProfessor}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    prof.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prof.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Novo Professor</h2>
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
                Criar Professor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

