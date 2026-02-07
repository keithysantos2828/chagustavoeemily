
import React, { useState, useRef, useEffect } from 'react';
import { 
  IconMusic, IconForward, IconBackward, IconShuffle, IconArrowUp 
} from './Icons';

interface Track {
  title: string;
  artist: string;
  url: string;
}

// Playlist com fontes robustas (Mixkit/Pixabay CDNs)
const PLAYLIST: Track[] = [
  {
    title: "Relaxing Walk",
    artist: "Acoustic",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3"
  },
  {
    title: "Morning Coffee",
    artist: "Lofi Beats",
    url: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3"
  },
  {
    title: "Piano Moment",
    artist: "Classic",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_596f63c5a4.mp3"
  }
];

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [playerState, setPlayerState] = useState<'ready' | 'loading' | 'error'>('ready');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Lógica de Docking: Muda para Topo Esquerdo quando rola a página
  useEffect(() => {
    const handleScroll = () => {
      // 300px é o suficiente para passar o cabeçalho e chegar na lista
      setIsDocked(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && isPlaying && playerState !== 'error') {
      setPlayerState('loading');
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayerState('ready');
            setErrorCount(0);
          })
          .catch(error => {
            console.warn("Autoplay:", error);
            setPlayerState('ready');
          });
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setPlayerState('loading');
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setPlayerState('ready');
          setErrorCount(0);
        })
        .catch((err) => {
          console.error("Erro Play:", err);
          setIsPlaying(false);
          setPlayerState('ready');
        });
    }
  };

  const getNextIndex = () => {
    if (isShuffle) {
      let nextIndex = Math.floor(Math.random() * PLAYLIST.length);
      if (PLAYLIST.length > 1 && nextIndex === currentTrackIndex) {
        nextIndex = (nextIndex + 1) % PLAYLIST.length;
      }
      return nextIndex;
    }
    return (currentTrackIndex + 1) % PLAYLIST.length;
  };

  const nextTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setErrorCount(0);
    setPlayerState('ready');
    setCurrentTrackIndex(getNextIndex());
  };

  const prevTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setErrorCount(0);
    setPlayerState('ready');
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
  };

  const toggleShuffle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsShuffle(!isShuffle);
  };

  const handleAudioError = () => {
    if (errorCount >= 2) {
      setIsPlaying(false);
      setPlayerState('error');
      return;
    }
    setErrorCount(prev => prev + 1);
    setCurrentTrackIndex(getNextIndex());
  };

  const currentTrack = PLAYLIST[currentTrackIndex];

  return (
    <>
      <style>{`
        @keyframes equalizer {
          0% { height: 3px; }
          50% { height: 12px; }
          100% { height: 3px; }
        }
        .animate-eq {
          animation: equalizer 0.8s ease-in-out infinite;
        }
      `}</style>

      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={() => setCurrentTrackIndex(getNextIndex())}
        onError={handleAudioError}
        preload="none" 
      />

      {/* ============================================================
          ESTRATÉGIA DE DUAL-BUTTON
          Usamos dois botões distintos que aparecem/desaparecem
          para criar a ilusão de transformação perfeita entre contextos.
         ============================================================ */}

      {/* 1. HERO BUTTON (TOPO DIREITO) - Estilo Glass/Dark 
             Visível apenas quando NÃO está dockado
      */}
      <div 
        className={`fixed z-[900] top-4 right-4 transition-all duration-500 ease-out ${isDocked ? 'opacity-0 scale-50 pointer-events-none translate-y-[-20px]' : 'opacity-100 scale-100'}`}
      >
         <button 
           onClick={togglePlay}
           className="w-10 h-10 rounded-full bg-[#354F52]/10 backdrop-blur-md border border-[#354F52]/10 flex items-center justify-center text-[#354F52] hover:bg-[#354F52] hover:text-white transition-colors shadow-sm"
         >
            {isPlaying ? (
               <div className="flex gap-0.5 items-end h-3 justify-center">
                  <span className="w-0.5 bg-current rounded-full animate-eq" style={{ animationDelay: '0s' }}></span>
                  <span className="w-0.5 bg-current rounded-full animate-eq" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-0.5 bg-current rounded-full animate-eq" style={{ animationDelay: '0.4s' }}></span>
               </div>
            ) : <IconMusic className="w-5 h-5" />}
         </button>
      </div>


      {/* 2. DOCKED PILL (TOPO ESQUERDO) - Estilo Integrado 
             Visível apenas quando ESTÁ dockado.
             Ele ocupa o espaço reservado na GiftList (ml-14).
             Posição: top-[14px] left-4 para alinhar com a barra de busca.
             Z-Index 100 para ficar ACIMA do sticky header (z-50)
      */}
      <div 
        className={`fixed z-[100] top-[14px] left-4 transition-all duration-500 ease-out ${!isDocked ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0'}`}
      >
         <button 
           onClick={() => setIsExpanded(true)}
           className={`
             h-11 w-11 rounded-2xl flex items-center justify-center transition-all shadow-sm border
             ${isPlaying 
               ? 'bg-[#354F52] border-[#354F52] text-white' 
               : 'bg-white border-[#52796F]/10 text-[#52796F] hover:border-[#B07D62]/30'
             }
           `}
         >
            {playerState === 'loading' ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
               <div className="flex gap-0.5 items-end h-3 justify-center">
                  <span className="w-0.5 bg-white rounded-full animate-eq" style={{ animationDelay: '0s' }}></span>
                  <span className="w-0.5 bg-white rounded-full animate-eq" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-0.5 bg-white rounded-full animate-eq" style={{ animationDelay: '0.4s' }}></span>
               </div>
            ) : <IconMusic className="w-5 h-5" />}
         </button>
      </div>


      {/* 3. PLAYER EXPANDIDO (COMUM AOS DOIS ESTADOS)
             Sempre ancora no Topo Esquerdo quando expandido para consistência
      */}
      <div className={`
           fixed top-4 left-4 z-[1001]
           bg-[#354F52] border border-white/10
           rounded-2xl shadow-2xl
           text-white p-3 pr-4 pl-3
           flex items-center gap-3
           transition-all duration-500 origin-top-left
           ${isExpanded 
              ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' 
              : 'scale-75 opacity-0 -translate-y-4 pointer-events-none'
           }
      `}>
           <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center flex-shrink-0 text-[#B07D62]">
              {isPlaying ? (
                 <div className="flex gap-1 items-end h-4">
                   <span className="w-1 bg-[#B07D62] rounded-full animate-eq" style={{animationDelay:'0s'}}></span>
                   <span className="w-1 bg-[#B07D62] rounded-full animate-eq" style={{animationDelay:'0.2s'}}></span>
                   <span className="w-1 bg-[#B07D62] rounded-full animate-eq" style={{animationDelay:'0.4s'}}></span>
                 </div>
              ) : <IconMusic className="w-5 h-5 opacity-50" />}
           </div>

           <div className="w-32 overflow-hidden">
              <p className="text-[9px] text-[#84A98C] font-black uppercase tracking-widest">
                Tocando
              </p>
              <p className="text-xs font-bold truncate text-white/90">
                 {currentTrack.title}
              </p>
           </div>

           <div className="flex items-center gap-1">
              <button onClick={prevTrack} className="p-1.5 hover:text-[#B07D62] rounded-full hover:bg-white/5"><IconBackward className="w-4 h-4" /></button>
              <button onClick={togglePlay} className="p-1.5 hover:text-[#B07D62] rounded-full hover:bg-white/5">
                {isPlaying ? (
                  <div className="w-3 h-3 bg-white rounded-sm"></div> 
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button onClick={nextTrack} className="p-1.5 hover:text-[#B07D62] rounded-full hover:bg-white/5"><IconForward className="w-4 h-4" /></button>
           </div>

           <div className="pl-2 ml-1 border-l border-white/10 flex flex-col gap-1">
              <button onClick={toggleShuffle} className={`${isShuffle ? 'text-[#B07D62]' : 'text-white/30'} hover:text-white`}><IconShuffle className="w-3 h-3" /></button>
              <button onClick={() => setIsExpanded(false)} className="text-white/30 hover:text-white"><IconArrowUp className="w-3 h-3 rotate-180" /></button>
           </div>
      </div>
    </>
  );
};

export default MusicPlayer;
