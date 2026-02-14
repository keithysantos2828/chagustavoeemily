
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Coordenadas aproximadas para Sede Campestre Sintracon, Colombo-PR
// Ajuste fino para centralizar esteticamente no fundo
const CENTER_COORDS: [number, number] = [-25.322896, -49.183748];

const BackgroundMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Evita re-inicializar

    // Inicializa o mapa
    const map = L.map(mapContainerRef.current, {
      center: CENTER_COORDS,
      zoom: 17, // Zoom 15: Ideal para ver o bairro e ruas de acesso sem perder contexto
      zoomControl: false,       // Remove controles de zoom (+/-)
      attributionControl: false, // Remove barra inferior (vamos por crédito discreto se necessário)
      dragging: false,           // Mapa estático (background)
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false
    });

    // Adiciona Tiles do CartoDB Positron (Limpo, Grayscale)
    // Opções: light_all (com labels suaves) ou light_nolabels (sem nada escrito)
    // Vamos usar light_all para dar contexto de ruas, mas é bem sutil.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(map);

    // Ícone Personalizado Minimalista
    const iconHtml = `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #B07D62;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 15px rgba(176,125,98,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker(CENTER_COORDS, { icon: customIcon }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
      <div 
        ref={mapContainerRef} 
        // Opacidade ajustada para 80% (opacity-80) conforme solicitado
        // Mantém contraste alto para as ruas aparecerem bem
        className="w-full h-full opacity-80 grayscale-[0%] contrast-[1.1]"
        style={{ background: '#F8F7F2' }}
      />
      {/* 
         Gradiente Overlay:
         Suaviza as bordas para o texto sobrepor com leitura fácil
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8F7F2]/60 via-[#F8F7F2]/10 to-[#F8F7F2]/60"></div>
    </div>
  );
};

export default BackgroundMap;
