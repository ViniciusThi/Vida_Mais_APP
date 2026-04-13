import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import logoVidaMais from '../../assets/Logo_Vidamais.png';

export default function FaceLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
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
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const captureAndLogin = async () => {
    if (!videoRef.current || !canvasRef.current || loading) return;
    setError(null);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setLoading(true);
    try {
      const response = await authService.faceLogin(base64);
      stopCamera();
      setAuth(response.token, response.user);
      toast.success(`Bem-vindo, ${response.user.nome}!`);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Rosto não reconhecido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <img src={logoVidaMais} alt="Logo Vida Mais" className="h-24 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Login pelo Rosto</h1>
          <p className="text-gray-600 mt-2 text-lg">Posicione seu rosto no centro e clique em capturar</p>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-black mb-4" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {/* Moldura oval guia */}
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={captureAndLogin}
          disabled={loading || !cameraReady}
          className="btn-primary w-full text-xl py-4 mb-4"
        >
          {loading ? 'Reconhecendo...' : '📷 Capturar e Entrar'}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold text-lg">
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
