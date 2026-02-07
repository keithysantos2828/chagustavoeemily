
import React, { useState, useRef, useEffect } from 'react';
import { IconMusic, IconMusicOff } from './Icons';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // URL de uma música Lofi/Acústica sem copyright (Royalty Free)
  // Fonte: Pixabay (Relaxing Acoustic Guitar)
  const AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=relaxing-mountains-141205.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; // Começa volume baixo
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Auto-play prevented", e));
    }
    setIsPlaying(!isPlaying);
    
    // Feedback tátil
    if (navigator.vibrate) navigator.vibrate(20);
  };

  return (
    <div className="fixed top-4 right-4 z-[90]">
      <audio ref={audioRef} src={AUDIO_URL} loop />
      <button
        onClick={togglePlay}
        className={`
          relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center 
          shadow-lg backdrop-blur-sm transition-all duration-500 border
          ${isPlaying 
            ? 'bg-[#B07D62]/80 text-white border-[#B07D62]/20 animate-pulse-slow' 
            : 'bg-white/40 text-[#52796F] border-white/20'
          }
        `}
        title={isPlaying ? "Pausar Música" : "Tocar Música"}
      >
        {isPlaying ? (
          <>
            <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20"></div>
            <IconMusic className="w-5 h-5 md:w-6 md:h-6" />
          </>
        ) : (
          <IconMusicOff className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
