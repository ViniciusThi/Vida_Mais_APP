import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { questionarioService } from '../services/questionarioService';
import { ArrowLeft, Download } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatorioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: relatorio } = useQuery({
    queryKey: ['relatorio', id],
    queryFn: () => questionarioService.getRelatorio(id!)
  });

  const handleExport = async (formato: 'xlsx' | 'csv') => {
    try {
      const blob = await questionarioService.exportar(id!, formato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${id}.${formato}`;
      a.click();
      toast.success('Relatório exportado!');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  if (!relatorio) return <div>Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/questionarios')} className="btn-secondary">
          <ArrowLeft size={20} className="inline mr-2" />
          Voltar
        </button>
        <div className="flex gap-2">
          <button onClick={() => handleExport('xlsx')} className="btn-primary">
            <Download size={18} className="inline mr-2" />
            Excel
          </button>
          <button onClick={() => handleExport('csv')} className="btn-secondary">
            <Download size={18} className="inline mr-2" />
            CSV
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {relatorio.questionario.titulo}
      </h1>
      <p className="text-gray-600 mb-6">
        {relatorio.totalRespondentes} respondentes
      </p>

      <div className="space-y-6">
        {relatorio.relatorio.map((item: any, idx: number) => (
          <div key={item.pergunta.id} className="card">
            <h3 className="font-bold text-lg mb-4">
              {idx + 1}. {item.pergunta.enunciado}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {item.totalRespostas} respostas
            </p>

            {item.agregacao.distribuicao && (
              <Bar
                data={{
                  labels: Object.keys(item.agregacao.distribuicao),
                  datasets: [{
                    label: 'Respostas',
                    data: Object.values(item.agregacao.distribuicao),
                    backgroundColor: 'rgba(14, 165, 233, 0.5)',
                    borderColor: 'rgba(14, 165, 233, 1)',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            )}

            {item.agregacao.media !== undefined && (
              <div>
                <p><strong>Média:</strong> {item.agregacao.media.toFixed(2)}</p>
                <p><strong>Mín:</strong> {item.agregacao.min} | <strong>Máx:</strong> {item.agregacao.max}</p>
              </div>
            )}

            {item.agregacao.sim !== undefined && (
              <div className="flex gap-8">
                <div>
                  <p className="text-sm text-gray-600">Sim</p>
                  <p className="text-2xl font-bold text-green-600">{item.agregacao.sim}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Não</p>
                  <p className="text-2xl font-bold text-red-600">{item.agregacao.nao}</p>
                </div>
              </div>
            )}

            {item.agregacao.respostas && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {item.agregacao.respostas.map((r: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium">{r.aluno}</p>
                    <p className="text-sm text-gray-700">{r.texto}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

