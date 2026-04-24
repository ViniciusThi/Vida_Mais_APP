import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <div className="text-8xl font-bold text-gray-200">404</div>
      <h1 className="text-2xl font-bold text-gray-700">Página não encontrada</h1>
      <p className="text-gray-500 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Voltar ao início
      </button>
    </div>
  );
}
