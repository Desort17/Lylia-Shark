import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, Unlock, Gift, Sparkles, Music, Music2, Play, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// Stages of the experience
enum ExperienceStage {
  SCENE_1_GLOW = 'glow_entrance',
  SCENE_2_DOOR = 'door_opening',
  SCENE_3_POEM = 'poem_reveal',
  SCENE_4_ANIMATION = 'proposal_animation',
  SCENE_5_MARRY = 'marry_question',
  SCENE_6_HEART_BOX = 'heart_box',
  SCENE_7_QUOTES = 'deep_quotes',
  SCENE_8_FINALE = 'finale'
}

export default function App() {
  const [stage, setStage] = useState<ExperienceStage>(ExperienceStage.SCENE_1_GLOW);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Custom images
  const [sharkImg, setSharkImg] = useState<string | null>(localStorage.getItem('shark_img'));
  const [lyliaImg, setLyliaImg] = useState<string | null>(localStorage.getItem('lylia_img'));

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Global sound unlock on first click
  useEffect(() => {
    const unlockSound = () => {
      if (audioRef.current && !isPlaying) {
        toggleMusic(true);
        window.removeEventListener('click', unlockSound);
        window.removeEventListener('touchstart', unlockSound);
      }
    };
    window.addEventListener('click', unlockSound);
    window.addEventListener('touchstart', unlockSound);
    return () => {
      window.removeEventListener('click', unlockSound);
      window.removeEventListener('touchstart', unlockSound);
    };
  }, [isPlaying]);

  // Background audio - Emotional Romantic Piano
  useEffect(() => {
    const audio = new Audio();
    audio.src = 'https://www.chosic.com/wp-content/uploads/2021/04/Beautiful-Piano.mp3';
    audio.loop = true;
    audio.volume = 0.4;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggleMusic = (force?: boolean) => {
    if (!audioRef.current) return;

    const playAudio = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Audio playback delayed until interaction:", err);
        setIsPlaying(false);
      }
    };

    if (force === true) {
      playAudio();
    } else if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio();
    }
  };

  const fireFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  return (
    <div className="min-h-screen romantic-gradient overflow-hidden flex flex-col items-center justify-center relative font-sans select-none">
      {/* Music Control */}
      <button 
        onClick={() => toggleMusic()}
        className="fixed top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all border border-white/20"
      >
        {isPlaying ? <Music className="text-white w-6 h-6" /> : <Music2 className="text-white/50 w-6 h-6" />}
      </button>

      <AnimatePresence mode="wait">
        {stage === ExperienceStage.SCENE_1_GLOW && (
          <Scene1Glow 
            onNext={() => { setStage(ExperienceStage.SCENE_2_DOOR); toggleMusic(true); }} 
            sharkImg={sharkImg}
            lyliaImg={lyliaImg}
            setSharkImg={setSharkImg}
            setLyliaImg={setLyliaImg}
          />
        )}
        
        {stage === ExperienceStage.SCENE_2_DOOR && (
          <Scene2Door onFinish={() => setStage(ExperienceStage.SCENE_3_POEM)} />
        )}

        {stage === ExperienceStage.SCENE_3_POEM && (
          <Scene3Poem onNext={() => setStage(ExperienceStage.SCENE_4_ANIMATION)} />
        )}

        {stage === ExperienceStage.SCENE_4_ANIMATION && (
          <Scene4Animation 
            onFinish={() => setStage(ExperienceStage.SCENE_5_MARRY)} 
            sharkImg={sharkImg}
            lyliaImg={lyliaImg}
          />
        )}

        {stage === ExperienceStage.SCENE_5_MARRY && (
          <Scene5Marry onYes={() => { 
            fireFireworks();
            setTimeout(() => setStage(ExperienceStage.SCENE_6_HEART_BOX), 6000); 
          }} />
        )}

        {stage === ExperienceStage.SCENE_6_HEART_BOX && (
          <Scene6HeartBox onOpen={() => setStage(ExperienceStage.SCENE_7_QUOTES)} />
        )}

        {stage === ExperienceStage.SCENE_7_QUOTES && (
          <Scene7Quotes onFinish={() => {
            fireFireworks();
            setStage(ExperienceStage.SCENE_8_FINALE);
          }} />
        )}

        {stage === ExperienceStage.SCENE_8_FINALE && (
          <Scene8Finale />
        )}
      </AnimatePresence>

      <FloatingDecorations />
    </div>
  );
}

// --- SCENE 1: GLOW ENTRANCE ---
function Scene1Glow({ 
  onNext, 
  sharkImg,
  lyliaImg,
  setSharkImg,
  setLyliaImg
}: { 
  onNext: () => void, 
  sharkImg: string | null, 
  lyliaImg: string | null,
  setSharkImg: (s: string | null) => void,
  setLyliaImg: (s: string | null) => void
}) {
  const sharkInputRef = useRef<HTMLInputElement>(null);
  const lyliaInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'shark' | 'lylia') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'shark') {
          setSharkImg(result);
          localStorage.setItem('shark_img', result);
        } else {
          setLyliaImg(result);
          localStorage.setItem('lylia_img', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center z-10 px-4 py-8 flex flex-col min-h-screen justify-between w-full max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start w-full pt-4 md:pt-12 px-4 gap-8 md:gap-0">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 p-5 md:p-8 rounded-3xl max-w-sm text-center md:text-left shadow-xl">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-rose-300 mb-3 font-semibold">
            The Legend of Shark & Lylia
          </p>
          <p className="italic font-romantic text-lg md:text-2xl leading-relaxed text-rose-50 font-light">"Whatever our souls are made of, yours and mine are the same."</p>
          <div className="w-12 h-px bg-white/20 my-4 mx-auto md:mx-0" />
          <p className="text-right text-[10px] md:text-xs opacity-60 uppercase tracking-widest">— A Story Written in the Stars</p>
        </div>
        <div className="text-center md:text-right">
          <h2 className="text-5xl md:text-8xl font-script text-rose-200 mb-2 drop-shadow-[0_0_15px_rgba(255,192,203,0.5)]">Happy Birthday, Lylia</h2>
          <p className="text-rose-100/60 tracking-[0.4em] uppercase text-[10px] md:text-sm font-sans">Every moment with you is a masterpiece</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-12">
          {/* Shark Upload */}
          <div className="flex flex-col items-center gap-6">
             <div 
               onClick={() => sharkInputRef.current?.click()}
               className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 border-white/40 overflow-hidden cursor-pointer hover:border-white transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] relative group"
             >
               {sharkImg ? (
                 <img src={sharkImg} className="w-full h-full object-cover" alt="Shark" />
               ) : (
                 <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40">
                   <Sparkles className="w-12 h-12 md:w-20 md:h-20" />
                 </div>
               )}
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs md:text-sm text-white font-bold uppercase tracking-widest transition-opacity text-center px-4">
                 Upload Your Photo (Shark)
               </div>
             </div>
             <p className="text-sm md:text-lg uppercase tracking-[0.3em] text-white font-bold font-sans drop-shadow-sm">Shark</p>
             <input type="file" ref={sharkInputRef} onChange={(e) => handleImageUpload(e, 'shark')} className="hidden" accept="image/*" />
          </div>

          <Heart className="w-12 h-12 md:w-24 md:h-24 text-rose-600 self-center animate-pulse fill-rose-600/20" />

          {/* Lylia Upload */}
          <div className="flex flex-col items-center gap-6">
             <div 
               onClick={() => lyliaInputRef.current?.click()}
               className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 border-rose-400/40 overflow-hidden cursor-pointer hover:border-rose-400 transition-all shadow-[0_0_50px_rgba(225,29,72,0.1)] relative group"
             >
               {lyliaImg ? (
                 <img src={lyliaImg} className="w-full h-full object-cover" alt="Lylia" />
               ) : (
                 <div className="w-full h-full bg-rose-900/20 flex items-center justify-center text-rose-300/40">
                   <Sparkles className="w-12 h-12 md:w-20 md:h-20" />
                 </div>
               )}
               <div className="absolute inset-0 bg-rose-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs md:text-sm text-white font-bold uppercase tracking-widest transition-opacity text-center px-4">
                 Upload Her Photo (Lylia)
               </div>
             </div>
             <p className="text-sm md:text-lg uppercase tracking-[0.3em] text-rose-300 font-bold font-sans drop-shadow-sm">Lylia</p>
             <input type="file" ref={lyliaInputRef} onChange={(e) => handleImageUpload(e, 'lylia')} className="hidden" accept="image/*" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative text-center px-4"
        >
          <h1 className="text-4xl md:text-[8rem] font-script text-white mb-4 text-glow leading-tight font-bold drop-shadow-2xl">
            Shark & Lylia
          </h1>
          <p className="font-romantic text-2xl md:text-5xl text-rose-200 italic opacity-90 drop-shadow-lg">A Love Written in the Stars</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.08, boxShadow: "0 0 50px rgba(225,29,72,0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="px-10 py-5 md:px-16 md:py-6 bg-rose-600 text-white rounded-full font-bold shadow-2xl transition-all flex items-center gap-4 mx-auto border border-rose-400 mt-6 md:mt-12 text-xl md:text-2xl"
        >
          Enter Experience <Sparkles className="w-6 h-6 text-rose-100" />
        </motion.button>
      </div>

      <div className="grid grid-cols-4 w-full max-w-2xl mx-auto opacity-20 pb-8">
        <span className="text-3xl md:text-5xl text-center animate-float">🌹</span>
        <span className="text-3xl md:text-5xl text-center animate-float delay-700">🌹</span>
        <span className="text-3xl md:text-5xl text-center animate-float delay-1000">🌹</span>
        <span className="text-3xl md:text-5xl text-center animate-float delay-1300">🌹</span>
      </div>
    </motion.div>
  );
}

// --- COMPONENT: BALLOONS ---
function Balloons() {
  const [balloons, setBalloons] = useState<any[]>([]);
  useEffect(() => {
    setBalloons(Array.from({ length: 15 }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {balloons.map((_, i) => (
        <motion.div
          key={i}
          initial={{ bottom: -100, x: `${Math.random() * 100}%`, scale: Math.random() * 0.5 + 0.8, opacity: 0 }}
          animate={{ bottom: '120%', x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], opacity: [0, 0.8, 0.8, 0] }}
          transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: Math.random() * 10 }}
          className="absolute"
        >
          <div className={`w-12 h-16 rounded-full flex items-center justify-center shadow-lg relative ${['bg-rose-400', 'bg-rose-200', 'bg-white/80', 'bg-rose-600/70'][i % 4]}`}>
            <div className="w-0.5 h-20 bg-white/30 absolute top-full left-1/2 -ml-px" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- SCENE 2: ROYAL DOOR OPENING ---
function Scene2Door({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-40 bg-black flex overflow-hidden" style={{ perspective: '2000px' }}>
      <FlowerRain />
      <Balloons />
      
      {/* Royal Door Frame Decoration */}
      <div className="absolute inset-0 border-[30px] border-yellow-700/20 pointer-events-none z-50 pointer-events-none" />

      {/* Left Door */}
      <motion.div 
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -120 }}
        transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
        className="w-1/2 h-full bg-gradient-to-l from-rose-950 to-rose-900 border-r-8 border-yellow-500/50 origin-left relative flex items-center justify-end shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/vintage-wallpaper.png')] opacity-20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
            <div className="p-10 rounded-full border-8 border-yellow-500/30 flex items-center justify-center bg-rose-900/40 backdrop-blur-sm">
              <Lock className="w-24 h-24 text-yellow-500/60 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            </div>
            <div className="flex gap-4">
               <span className="text-5xl">🌸</span>
               <span className="text-5xl">❤️</span>
               <span className="text-5xl">🌸</span>
            </div>
        </div>
      </motion.div>

      {/* Right Door */}
      <motion.div 
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 120 }}
        transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
        className="w-1/2 h-full bg-gradient-to-r from-rose-950 to-rose-900 border-l-8 border-yellow-500/50 origin-right relative flex items-center justify-start shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/vintage-wallpaper.png')] opacity-20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-12">
            <div className="p-10 rounded-full border-8 border-yellow-500/30 flex items-center justify-center bg-rose-900/40 backdrop-blur-sm">
              <Unlock className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_25px_rgba(234,179,8,0.8)]" />
            </div>
            <div className="flex gap-4">
               <span className="text-5xl">🎈</span>
               <span className="text-5xl">❤️</span>
               <span className="text-5xl">🎈</span>
            </div>
        </div>
      </motion.div>

      {/* Center Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 2 }}
        transition={{ duration: 2, delay: 2.5 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-64 h-64 bg-white/40 rounded-full blur-[120px] animate-pulse" />
      </motion.div>
    </div>
  );
}

// --- COMPONENT: FLOWER RAIN ---
function FlowerRain() {
  const [flowers, setFlowers] = useState<any[]>([]);

  useEffect(() => {
    // Generate static flowers once on client
    setFlowers(Array.from({ length: 25 }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {flowers.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -50, 
            left: `${Math.random() * 100}%`, 
            opacity: 0,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            top: '110%', 
            left: `${(Math.random() * 100)}%`,
            opacity: [0, 0.6, 0.6, 0],
            rotate: 360,
          }}
          transition={{ 
            duration: Math.random() * 15 + 15, 
            repeat: Infinity, 
            delay: Math.random() * 20,
            ease: "linear"
          }}
          className="absolute text-rose-200/30"
        >
          <div className="text-2xl">✿</div>
        </motion.div>
      ))}
    </div>
  );
}

// --- SCENE 3: POEM REVEAL (NO VOICE NOTE) ---
function Scene3Poem({ onNext }: { onNext: () => void }) {
  const poem = [
    "I’m not even gonna dress this up too much—",
    "you just… happened to me, and now everything hits different.",
    "You walked in quiet, no warning sign,",
    "now somehow your heartbeat feels synced with mine.",
    "You turned my chaos into something clean,",
    "made real what I thought was just a dream.",
    "Lowkey, I don’t wanna do this life solo,",
    "I want your hand in mine—fast lane or slow-mo.",
    "So here’s me, no script, no pretend—",
    "I don’t just want you now, I want you ‘til the end.",
    "So tell me…",
    "will you be mine, for real this time?"
  ];

  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < poem.length) {
      const timer = setTimeout(() => setVisibleLines(v => v + 1), 2500);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, poem.length]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container max-w-4xl px-4 py-8 z-10 flex flex-col items-center w-full relative"
    >
      <FlowerRain />
      
      <div className="glass-card p-6 md:p-16 mb-8 w-full overflow-y-auto max-h-[60vh] md:max-h-[70vh] scrollbar-hide border-rose-500/20 shadow-[0_0_40px_rgba(255,77,109,0.1)] relative z-10 bg-black/30 backdrop-blur-md">
        <div className="flex flex-col gap-4 md:gap-5 text-center">
          {poem.map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={idx < visibleLines ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ duration: 1.2 }}
              className={`text-xl md:text-4xl font-romantic text-rose-50 leading-relaxed tracking-wider ${idx === poem.length - 1 ? 'text-rose-400 font-script font-bold text-3xl md:text-5xl mt-6 md:mt-8 italic drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]' : ''}`}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {visibleLines >= poem.length && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="px-8 py-4 md:px-12 md:py-5 bg-rose-600 text-white rounded-full font-bold text-xl md:text-2xl shadow-2xl animate-pulse flex items-center gap-3 relative z-20 border border-rose-400"
          >
            I have something to ask... <Heart className="fill-white w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- SCENE 4: ANIMATION (SHARK & LYLIA) ---
function Scene4Animation({ onFinish, sharkImg, lyliaImg }: { onFinish: () => void, sharkImg: string | null, lyliaImg: string | null }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 9000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center z-10 w-full px-4 overflow-hidden"
    >
      <div className="relative h-72 md:h-[500px] w-full flex items-center justify-center">
        {/* Shark Silhouette */}
        <motion.div 
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: -100, md: -180, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-125 group-hover:bg-white/50 transition-all" />
            <img 
              src={sharkImg || "input_file_1.png"} 
              alt="Shark"
              className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 border-white/60 object-cover shadow-[0_0_60px_rgba(255,255,255,0.3)] relative z-10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&q=80&w=300&h=300";
              }}
            />
          </div>
          <p className="mt-4 text-white font-bold tracking-[0.2em] md:tracking-[0.4em] text-lg md:text-3xl font-serif uppercase drop-shadow-lg text-glow">Shark</p>
        </motion.div>

        {/* ULTRA ENHANCED Floating Ring */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.6], opacity: 1, y: [0, -30, 0] }}
          transition={{ 
            scale: { delay: 4, duration: 1.5, type: "spring", damping: 10 },
            opacity: { delay: 4, duration: 1 },
            y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
          }}
          className="mx-2 md:mx-6 relative z-50"
        >
          {/* Main Gold Circle */}
          <div className="w-24 h-24 md:w-52 md:h-52 rounded-full border-8 md:border-[20px] border-yellow-400 shadow-[0_0_100px_rgba(250,204,21,1),inset_0_0_50px_rgba(250,204,21,0.5)] flex items-center justify-center bg-gradient-to-tr from-yellow-600/40 via-yellow-400/20 to-yellow-500/10 backdrop-blur-md">
            {/* The Diamond / Stone */}
            <div className="w-12 h-12 md:w-28 md:h-28 bg-white rotate-45 shadow-[0_0_60px_white,0_0_120px_rgba(255,255,255,0.4)] animate-pulse relative overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-100 to-white opacity-80" />
               <div className="absolute inset-0 bg-cyan-300 blur-xl opacity-40 animate-pulse" />
            </div>
          </div>

          {/* Halo Effects */}
          <div className="absolute inset-0 -z-10 rounded-full border border-yellow-300/30 scale-125 animate-ping" />
          <div className="absolute inset-0 -z-10 rounded-full border border-yellow-300/20 scale-150 animate-pulse" />

          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }, 
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } 
            }}
            className="absolute -top-12 -right-12"
          >
            <Sparkles className="text-yellow-200 w-16 h-16 md:w-28 md:h-28 filter drop-shadow-[0_0_20px_rgba(253,224,71,0.9)]" />
          </motion.div>
        </motion.div>

        {/* Lylia Silhouette */}
        <motion.div 
          initial={{ x: 400, opacity: 0, rotate: 5 }}
          animate={{ x: 100, md: 180, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-2xl scale-125 group-hover:bg-rose-500/50 transition-all" />
            <img 
              src={lyliaImg || "input_file_0.png"} 
              alt="Lylia"
              className="w-32 h-32 md:w-56 md:h-56 rounded-full border-4 border-rose-300/60 object-cover shadow-[0_0_60px_rgba(225,29,72,0.3)] relative z-10"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300";
              }}
            />
          </div>
          <p className="mt-4 text-rose-200 font-bold tracking-[0.2em] md:tracking-[0.4em] text-lg md:text-3xl font-serif uppercase drop-shadow-lg text-glow">Lylia</p>
        </motion.div>
      </div>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 6.5 }}
        className="text-white/80 font-script text-3xl md:text-6xl mt-12 md:mt-24 animate-pulse text-glow"
      >
        Two souls, one destiny...
      </motion.p>
    </motion.div>
  );
}

// --- SCENE 5: MARRY QUESTION + RUNAWAY NO ---
function Scene5Marry({ onYes }: { onYes: () => void }) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [hasClickedYes, setHasClickedYes] = useState(false);

  const moveNo = () => {
    setNoPos({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 450
    });
  };

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center z-10 p-6 md:p-10 w-[95vw] md:w-[600px] aspect-square flex flex-col items-center justify-center glass-card border-white/20 shadow-[0_0_80px_rgba(225,29,72,0.2)]"
    >
      <h2 className="text-4xl md:text-7xl font-serif text-white mb-6 md:mb-10 text-glow leading-tight font-bold italic">
        Will You Marry Me?
      </h2>
      <p className="text-rose-200 text-base md:text-lg mb-8 md:mb-12 leading-relaxed max-w-xs md:max-w-sm italic opacity-80">
        "I've built this world just for us. Shall we spend forever together?"
      </p>

      {!hasClickedYes ? (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 relative min-h-[100px] w-full">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#f43f5e' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setHasClickedYes(true); onYes(); }}
            className="px-10 py-3 md:px-12 md:py-4 bg-rose-600 text-white rounded-full font-bold text-xl md:text-2xl shadow-lg border border-rose-400 z-20 w-full md:w-auto"
          >
            YES, FOREVER
          </motion.button>

          <motion.button
            animate={{ x: noPos.x, y: noPos.y }}
            onMouseEnter={moveNo}
            className="px-8 py-3 md:px-10 md:py-4 bg-white/10 text-white rounded-full font-bold text-lg md:text-xl backdrop-blur-md border border-white/10 cursor-not-allowed w-full md:w-auto"
          >
            Maybe?
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="text-white text-4xl md:text-5xl font-script italic flex flex-col items-center gap-6"
        >
          <div className="flex gap-4">
             <Heart className="w-12 h-12 md:w-16 md:h-16 text-rose-500 fill-rose-500 animate-bounce" />
          </div>
          You made Shark the luckiest man in the world!
        </motion.div>
      )}
    </motion.div>
  );
}

// --- SCENE 6: THE SECRET HEART BOX (NEW) ---
function Scene6HeartBox({ onOpen }: { onOpen: () => void }) {
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [isOpening, setIsOpening] = useState(false);

  const moveNo = () => {
    const maxX = window.innerWidth > 768 ? 300 : 150;
    const maxY = window.innerWidth > 768 ? 200 : 150;
    setNoPos({
      x: (Math.random() - 0.5) * maxX * 2,
      y: (Math.random() - 0.5) * maxY * 2
    });
  };

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(onOpen, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="z-10 text-center flex flex-col items-center px-4 w-full"
    >
      <motion.div 
        animate={isOpening ? { 
          scale: [1, 1.5, 0],
          rotate: [0, 20, -20, 0],
          opacity: [1, 1, 0]
        } : { 
          rotateY: [0, 15, -15, 0],
          y: [0, -15, 0]
        }}
        transition={{ 
          duration: isOpening ? 1.5 : 6, 
          repeat: isOpening ? 0 : Infinity,
          ease: "easeInOut"
        }}
        className="mb-8 md:mb-14 relative cursor-pointer"
        onClick={handleOpen}
      >
        <Gift className="w-32 h-32 md:w-56 md:h-56 text-rose-600 fill-rose-600/10 animate-float" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-10 h-10 md:w-16 md:h-16 text-white/50 animate-pulse" />
        </div>
        {isOpening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5], x: (i - 4) * 40, y: -100, opacity: [1, 0] }}
                transition={{ duration: 1 }}
                className="absolute"
              >
                <Heart className="text-rose-500 fill-rose-500 w-6 h-6" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <h2 className="text-2xl md:text-5xl font-serif text-white mb-8 md:mb-12 leading-tight max-w-2xl text-glow italic">
        Shark has one more secret for you...<br className="hidden md:block" />
        Do you wanna open your heart door?
      </h2>

      {!isOpening && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative min-h-[100px] md:min-h-[120px] w-full">
          <motion.button 
            whileHover={{ scale: 1.15, boxShadow: "0 0 40px rgba(225,29,72,0.6)" }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpen}
            className="px-10 py-4 md:px-16 md:py-6 bg-white text-rose-600 rounded-full font-bold text-xl md:text-3xl shadow-2xl z-20 w-full md:w-auto"
          >
            Yes, Open It!
          </motion.button>

          <motion.button
            animate={{ x: noPos.x, y: noPos.y }}
            onMouseEnter={moveNo}
            className="px-8 py-3 md:px-12 md:py-5 border-2 border-white/20 text-white/30 rounded-full font-bold text-lg md:text-2xl cursor-default w-full md:w-auto"
          >
            No...
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// --- SCENE 7: DEEP QUOTES ---
function Scene7Quotes({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const quotes = [
    { text: "Whatever our souls are made of, his and mine are the same.", author: "Emily Brontë" },
    { text: "It was the best thing that could have happened to him in his life, and he would never have to be alone again.", author: "Gabriel García Márquez" },
    { text: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.", author: "Maya Angelou" },
    { text: "You are the finest, loveliest, tenderest, and most beautiful person I have ever known and even that is an understatement.", author: "F. Scott Fitzgerald" },
    { text: "My heart is, and always will be, yours.", author: "Jane Austen" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < quotes.length - 1) setIndex(i => i + 1);
      else onFinish();
    }, 6000);
    return () => clearTimeout(timer);
  }, [index, quotes.length, onFinish]);

  return (
    <div className="p-4 md:p-8 text-center max-w-4xl z-10 min-h-[350px] md:min-h-[450px] flex items-center justify-center w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center glass-card bg-rose-950/20 p-8 md:p-16 rounded-[40px] border border-white/20 shadow-[0_0_100px_rgba(225,29,72,0.15)] w-full relative overflow-hidden"
        >
          {/* Decorative Hearts behind text */}
          <div className="absolute top-10 left-10 opacity-10 animate-pulse"><Heart className="w-12 h-12 text-rose-300" /></div>
          <div className="absolute bottom-10 right-10 opacity-10 animate-pulse delay-700"><Heart className="w-16 h-16 text-rose-300" /></div>

          <motion.p 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="text-2xl md:text-5xl font-serif text-white italic mb-10 leading-relaxed text-glow"
          >
            "{quotes[index].text}"
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl font-script text-rose-400 font-bold"
          >
            — {quotes[index].author}
          </motion.p>
          
          <div className="flex gap-2 md:gap-3 mt-12">
            {quotes.map((_, i) => (
              <motion.div 
                key={i} 
                animate={i === index ? { width: "40px", backgroundColor: "#f43f5e" } : { width: "10px", backgroundColor: "rgba(255,255,255,0.2)" }}
                className="h-1.5 rounded-full" 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


// --- SCENE 8: FINALE ---
function Scene8Finale() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center z-10 px-6 py-12 relative overflow-hidden"
    >
      <FlowerRain />
      <div className="relative mb-12">
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1], 
            rotate: [0, 8, -8, 0],
            filter: ["drop-shadow(0 0 20px #e11d48)", "drop-shadow(0 0 60px #e11d48)", "drop-shadow(0 0 20px #e11d48)"]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 5,
            ease: "easeInOut"
          }}
        >
          <Heart className="w-56 h-56 text-rose-600 mx-auto fill-rose-600/20" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
           <Sparkles className="text-rose-100 w-16 h-16 animate-ping" />
        </div>
      </div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-7xl md:text-9xl font-script text-rose-200 mb-8 drop-shadow-[0_0_20px_rgba(255,192,203,0.5)] z-10"
      >
        I Love You, Lylia
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-3xl md:text-5xl font-romantic text-rose-400 mb-16 font-bold z-10"
      >
        Forever yours, Your Shark 🦈❤️
      </motion.p>

      <div className="flex flex-wrap gap-6 justify-center">
        {['Eternity', 'Devotion', 'Passion', 'Destiny'].map((word, i) => (
          <motion.div
            key={word}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5 + (i * 0.2) }}
            className="px-8 py-5 glass-card border-white/20 flex flex-col items-center min-w-[150px]"
          >
            <Heart className="w-8 h-8 text-rose-500 mb-2 fill-rose-500/20" />
            <span className="text-xs uppercase font-bold tracking-[0.3em] text-rose-200/60">{word}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// --- SHARED AMBIENT BACKGROUND ---
function FloatingDecorations() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowSize.width === 0) return null;

  const items = Array.from({ length: 45 });
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * windowSize.width, 
            y: -100,
            opacity: 0,
            scale: Math.random() * 0.8 + 0.4
          }}
          animate={{ 
            y: windowSize.height + 100,
            opacity: [0, 0.6, 0.6, 0],
            rotate: 720,
            x: `calc(${Math.random() * 200 - 100}px + ${Math.random() * 100}vw)`
          }}
          transition={{ 
            duration: Math.random() * 25 + 15, 
            repeat: Infinity, 
            delay: Math.random() * 20,
            ease: "linear"
          }}
          className="absolute"
        >
          {i % 3 === 0 ? (
            <div className="text-4xl filter blur-[1px] drop-shadow-lg">🌹</div>
          ) : i % 3 === 1 ? (
             <div className="text-3xl filter blur-[0.5px] opacity-60 drop-shadow-md">🎈</div>
          ) : (
            <Heart className="text-rose-400/40 w-10 h-10 fill-rose-400/20 drop-shadow-sm" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
