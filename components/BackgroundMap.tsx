
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

    // Função auxiliar para determinar o zoom baseado na largura atual
    const getTargetZoom = () => {
       return window.innerWidth < 768 ? 15 : 17;
    };

    // Inicializa o mapa com o zoom correto para o momento
    const map = L.map(mapContainerRef.current, {
      center: CENTER_COORDS,
      zoom: getTargetZoom(),
      zoomControl: false,       // Remove controles de zoom (+/-)
      attributionControl: false, // Remove barra inferior
      dragging: false,           // Mapa estático (background)
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false
    });

    // Adiciona Tiles do CartoDB Positron (Limpo, Grayscale)
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

    // --- LÓGICA DE REDIMENSIONAMENTO ---
    // Monitora mudanças no tamanho da janela para ajustar o zoom dinamicamente
    const handleResize = () => {
      if (!map) return;
      const targetZoom = getTargetZoom();
      // Só aplica se o zoom for diferente para evitar processamento desnecessário
      if (map.getZoom() !== targetZoom) {
        map.setZoom(targetZoom);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full">
      <div 
        ref={mapContainerRef} 
        // Opacidade em 80% conforme solicitado anteriormente
        className="w-full h-full opacity-80 grayscale-[0%] contrast-[1.1]"
        style={{ background: '#F8F7F2' }}
      />
      {/* 
         Gradiente Overlay
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8F7F2]/60 via-[#F8F7F2]/10 to-[#F8F7F2]/60"></div>
    </div>
  );
};

export default BackgroundMap;
