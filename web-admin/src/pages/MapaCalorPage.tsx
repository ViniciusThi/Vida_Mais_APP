import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { adminService } from '../services/adminService';
import 'leaflet/dist/leaflet.css';

interface GeoPoint {
  cep: string;
  logradouro: string;
  lat: number;
  lng: number;
  count: number;
}

async function geocodeCep(cep: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=BR&format=json&limit=1`,
      { headers: { 'User-Agent': 'VidaMaisApp/1.0' } }
    );
    const data = await r.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch { /* silencioso */ }
  return null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function MapaCalorPage() {
  const { data: alunos, isLoading } = useQuery({
    queryKey: ['alunos-mapa'],
    queryFn: adminService.getAlunos,
  });

  const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [geocodingTotal, setGeocodingTotal] = useState(0);

  useEffect(() => {
    if (!alunos) return;

    const comCep = alunos.filter((a: any) => a.cep);
    if (comCep.length === 0) return;

    // Agrupar por CEP
    const grouped: Record<string, { logradouro: string; count: number }> = {};
    for (const a of comCep) {
      const cep = a.cep.replace(/\D/g, '');
      if (!grouped[cep]) {
        grouped[cep] = { logradouro: a.logradouro || cep, count: 0 };
      }
      grouped[cep].count++;
    }

    const ceps = Object.keys(grouped);
    setGeocodingTotal(ceps.length);
    setGeocodingProgress(0);
    setGeoPoints([]);

    let cancelled = false;
    (async () => {
      const points: GeoPoint[] = [];
      for (let i = 0; i < ceps.length; i++) {
        if (cancelled) break;
        const cep = ceps[i];
        const geo = await geocodeCep(cep);
        if (geo) {
          points.push({ cep, logradouro: grouped[cep].logradouro, count: grouped[cep].count, ...geo });
          setGeoPoints([...points]);
        }
        setGeocodingProgress(i + 1);
        if (i < ceps.length - 1) await sleep(1100); // Nominatim: 1 req/s
      }
    })();

    return () => { cancelled = true; };
  }, [alunos]);

  const semCep = alunos && alunos.filter((a: any) => a.cep).length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Distribuição</h1>
        <p className="text-gray-600 mt-1">Concentração geográfica dos participantes por CEP cadastrado</p>
      </div>

      {isLoading && (
        <div className="card flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-4" />
          <span className="text-gray-600">Carregando participantes...</span>
        </div>
      )}

      {semCep && !isLoading && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum participante com CEP cadastrado ainda.</p>
          <p className="text-gray-400 text-sm mt-2">Os participantes precisam informar o CEP durante o cadastro.</p>
        </div>
      )}

      {geocodingTotal > 0 && geocodingProgress < geocodingTotal && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span className="text-blue-700 text-sm">
            Geocodificando endereços... {geocodingProgress}/{geocodingTotal} CEPs
          </span>
        </div>
      )}

      {geoPoints.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-sm text-gray-500">Participantes com localização</p>
              <p className="text-3xl font-bold text-blue-600">
                {geoPoints.reduce((s, p) => s + p.count, 0)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">CEPs únicos</p>
              <p className="text-3xl font-bold text-green-600">{geoPoints.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-500">CEP com mais participantes</p>
              <p className="text-xl font-bold text-gray-800">
                {[...geoPoints].sort((a, b) => b.count - a.count)[0]?.cep}
              </p>
            </div>
          </div>

          <div className="card p-0 overflow-hidden rounded-xl">
            <MapContainer
              center={[-22.5, -47.0]}
              zoom={8}
              style={{ height: 520, width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {geoPoints.map((p) => (
                <CircleMarker
                  key={p.cep}
                  center={[p.lat, p.lng]}
                  radius={Math.min(8 + p.count * 3, 30)}
                  pathOptions={{ color: '#075D94', fillColor: '#FF7E00', fillOpacity: 0.7, weight: 2 }}
                >
                  <Popup>
                    <strong>{p.cep}</strong><br />
                    {p.logradouro}<br />
                    <span className="font-bold">{p.count} participante{p.count !== 1 ? 's' : ''}</span>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  );
}
