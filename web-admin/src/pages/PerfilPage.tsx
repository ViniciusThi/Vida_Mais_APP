import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

export default function PerfilPage() {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [faceRegistrada, setFaceRegistrada] = useState<boolean | null>(null);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authService.statusRosto().then((r) => setFaceRegistrada(r.faceRegistrada));
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
      setCameraAberta(true);
    } catch {
      toast.error('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraAberta(false);
    setCameraReady(false);
  };

  const handleCadastrar = async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setLoading(true);
    try {
      await authService.cadastrarRosto(base64);
      stopCamera();
      setFaceRegistrada(true);
      toast.success('Rosto cadastrado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar rosto.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async () => {
    if (!window.confirm('Deseja remover o cadastro facial?')) return;
    setLoading(true);
    try {
      await authService.removerRosto();
      setFaceRegistrada(false);
      toast.success('Cadastro facial removido.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao remover rosto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
      <p className="text-gray-600 mb-8">
        <span className="font-medium">{user?.nome}</span> · {user?.email}
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Reconhecimento Facial</h2>

        {faceRegistrada === null && (
          <p className="text-gray-500 text-sm">Verificando status...</p>
        )}

        {faceRegistrada === false && !cameraAberta && (
          <>
            <p className="text-gray-600 mb-4 text-sm">
              Nenhum rosto cadastrado. Cadastre para poder fazer login sem senha.
            </p>
            <button onClick={startCamera} className="btn-primary w-full">
              📷 Abrir Câmera e Cadastrar Rosto
            </button>
          </>
        )}

        {faceRegistrada === false && cameraAberta && (
          <>
            <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="border-4 border-orange-400 rounded-full"
                  style={{ width: 160, height: 200 }}
                />
              </div>
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <p className="text-white text-sm">Iniciando câmera...</p>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-gray-500 text-xs text-center mb-3">
              Posicione seu rosto dentro do oval e clique em capturar
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCadastrar}
                disabled={loading || !cameraReady}
                className="btn-primary flex-1"
              >
                {loading ? 'Cadastrando...' : '✓ Capturar e Cadastrar'}
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {faceRegistrada === true && (
          <>
            <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-2xl">✅</span>
              <p className="text-green-800 font-medium text-sm">Rosto cadastrado — você pode fazer login facial.</p>
            </div>
            <button
              onClick={handleRemover}
              disabled={loading}
              className="w-full py-2 px-4 border-2 border-red-400 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors text-sm"
            >
              {loading ? 'Removendo...' : 'Remover Cadastro Facial'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
