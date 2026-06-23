import React, { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, Trophy, RefreshCw, Construction, Play, Settings, ShieldCheck, Activity, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 10;
const BRICK_ROWS = 4;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 100;

interface Brick {
  x: number;
  y: number;
  status: number;
}

export default function MaintenanceScreen() {
  const [showGame, setShowGame] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WON'>('IDLE');
  const [highScore, setHighScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [maintenanceInfo, setMaintenanceInfo] = useState<{ startTime: Date | null, duration: number }>({ startTime: null, duration: 15 });
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Fetch maintenance settings
  useEffect(() => {
    const fetchMaintenanceSettings = async () => {
      try {
        const [startTimeRes, durationRes] = await Promise.all([
          apiRequest('GET', '/api/settings/maintenance_start_time'),
          apiRequest('GET', '/api/settings/maintenance_duration')
        ]);

        const startTimeData = await startTimeRes.json();
        const durationData = await durationRes.json();

        if (startTimeData?.value && durationData?.value) {
          setMaintenanceInfo({
            startTime: new Date(startTimeData.value),
            duration: parseInt(durationData.value)
          });
        }
      } catch (error) {
        console.error('Error fetching maintenance info:', error);
      }
    };

    fetchMaintenanceSettings();
  }, []);

  // Update progress every second
  useEffect(() => {
    if (!maintenanceInfo.startTime) return;

    const interval = setInterval(() => {
      const start = maintenanceInfo.startTime!.getTime();
      const now = new Date().getTime();
      const durationMs = maintenanceInfo.duration * 60 * 1000;
      const elapsed = now - start;
      const calculatedProgress = Math.min((elapsed / durationMs) * 100, 99.9);

      setProgress(calculatedProgress > 0 ? calculatedProgress : 0);

      // Calculate time remaining
      const remainingMs = Math.max(durationMs - elapsed, 0);
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);

      if (remainingMs > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s restantes`);
      } else {
        setTimeRemaining("Finalizando próximamente...");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [maintenanceInfo]);

  // Game references
  const paddleX = useRef(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const ballPos = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 });
  const ballVel = useRef({ x: 4, y: -4 });
  const bricks = useRef<Brick[]>([]);

  // Secret shortcut: 7 clicks on the main icon
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setShowGame(!showGame);
      setClickCount(0);
    }
  };

  const initBricks = useCallback(() => {
    const b: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS;
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        b.push({
          x: c * (brickWidth + BRICK_PADDING) + BRICK_PADDING,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1
        });
      }
    }
    bricks.current = b;
  }, []);

  const startGame = () => {
    initBricks();
    ballPos.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
    ballVel.current = { x: (Math.random() - 0.5) * 8, y: -5 };
    setScore(0);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (!showGame || gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Bricks - Using JASANA primary gradient colors
      const brickWidth = (CANVAS_WIDTH - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS;
      let activeBricks = 0;
      bricks.current.forEach((b) => {
        if (b.status === 1) {
          activeBricks++;
          const gradient = ctx.createLinearGradient(b.x, b.y, b.x, b.y + BRICK_HEIGHT);
          gradient.addColorStop(0, '#8b5cf6'); // Purple accent
          gradient.addColorStop(1, '#6366f1'); // Indigo primary
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, brickWidth, BRICK_HEIGHT, 4);
          ctx.fill();
        }
      });

      if (activeBricks === 0) {
        setGameState('WON');
        if (score > highScore) setHighScore(score);
        return;
      }

      // Draw Paddle - Success Green
      ctx.fillStyle = '#10b981';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.beginPath();
      ctx.roundRect(paddleX.current, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ballPos.current.x, ballPos.current.y, BALL_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Physics
      ballPos.current.x += ballVel.current.x;
      ballPos.current.y += ballVel.current.y;

      if (ballPos.current.x + BALL_SIZE > CANVAS_WIDTH || ballPos.current.x - BALL_SIZE < 0) ballVel.current.x *= -1;
      if (ballPos.current.y - BALL_SIZE < 0) ballVel.current.y *= -1;

      if (
        ballPos.current.y + BALL_SIZE > CANVAS_HEIGHT - PADDLE_HEIGHT - 10 &&
        ballPos.current.x > paddleX.current &&
        ballPos.current.x < paddleX.current + PADDLE_WIDTH
      ) {
        ballVel.current.y = -Math.abs(ballVel.current.y);
        const diff = ballPos.current.x - (paddleX.current + PADDLE_WIDTH / 2);
        ballVel.current.x = diff * 0.15;
      }

      bricks.current.forEach((b) => {
        if (b.status === 1) {
          if (
            ballPos.current.x > b.x &&
            ballPos.current.x < b.x + brickWidth &&
            ballPos.current.y > b.y &&
            ballPos.current.y < b.y + BRICK_HEIGHT
          ) {
            ballVel.current.y *= -1;
            b.status = 0;
            setScore(s => s + 10);
          }
        }
      });

      if (ballPos.current.y + BALL_SIZE > CANVAS_HEIGHT) {
        setGameState('WON');
        if (score > highScore) setHighScore(score);
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [showGame, gameState, score, highScore]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = (clientX - rect.left) * scaleX;
    paddleX.current = Math.min(Math.max(x - PADDLE_WIDTH / 2, 0), CANVAS_WIDTH - PADDLE_WIDTH);
  };

  return (
    <div className="maintenance-root">
      {/* Background Decorative Elements */}
      <div className="bg-blob blob-primary"></div>
      <div className="bg-blob blob-accent"></div>

      <div className="main-container">
        {!showGame ? (
          /* STANDARD PROFESSIONAL VIEW */
          <div className="card-professional animate-fade-in-slide">
            <div className="icon-wrapper" onClick={handleLogoClick}>
              <div className="icon-circle">
                <Construction className="main-icon text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="spinning-border"></div>
            </div>

            <h1 className="title-text">Mantenimiento de Sistema</h1>
            <p className="description-text">
              Estamos añadiendo algunas mejoras a <strong>EasyTrack - JASANA</strong> para brindarte una mejor experiencia.
              Volveremos a estar en línea pronto.
            </p>

            <div className="status-grid">
              <div className="status-item">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                <span>Optimización</span>
              </div>
              <div className="status-item">
                <Activity className="w-5 h-5 text-blue-500 mb-2" />
                <span>Mejoras</span>
              </div>
              <div className="status-item">
                <Settings className="w-5 h-5 text-purple-500 mb-2" />
                <span>Ajustes</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-info flex justify-between mb-2">
                <div className="progress-label font-bold">Progreso de optimización</div>
                <div className="progress-percentage text-indigo-500 font-mono">{Math.floor(progress)}%</div>
              </div>
              <div className="progress-bar mb-2">
                <div className="progress-fill animate-shimmer" style={{ width: `${progress}%` }}></div>
              </div>
              {timeRemaining && (
                <div className="time-remaining flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>

            <div className="footer-professional">
              <div className="loading-dots text-gray-400">Gracias por tu paciencia</div>
            </div>
          </div>
        ) : (
          /* HIDDEN GAME VIEW */
          <div className="card-game animate-pop-in">
            <div className="game-header">
              <div className="game-score">
                <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                <span>REORD: {highScore}</span>
              </div>
              <div className="game-title">CYBER REPAIR</div>
              <button className="close-btn" onClick={() => setShowGame(false)}>×</button>
            </div>

            {gameState !== 'PLAYING' && (
              <div className="game-menu">
                <h2 className="text-2xl font-bold mb-4">
                  {gameState === 'WON' ? 'FASE COMPLETADA' : 'MODO DEPURACIÓN'}
                </h2>
                {gameState === 'WON' && <p className="mb-6">Puntos: {score}</p>}
                <button className="start-game-btn" onClick={startGame}>
                  {gameState === 'WON' ? 'VOLVER A INTENTAR' : 'REPARAR CÓDIGO'}
                </button>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
              className={`game-canvas ${gameState === 'PLAYING' ? 'active' : ''}`}
            />

            <div className="game-hud">
              <span>SCORE: {score}</span>
              <span className="opacity-50">Desliza para mover</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .maintenance-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background);
          color: var(--foreground);
          overflow: hidden;
          position: relative;
        }

        /* Background Decor */
        .bg-blob {
          position: absolute;
          filter: blur(80px);
          border-radius: 50%;
          opacity: 0.15;
          z-index: 1;
        }
        .blob-primary {
          width: 600px;
          height: 600px;
          background: var(--jasana-primary);
          top: -100px;
          left: -100px;
        }
        .blob-accent {
          width: 500px;
          height: 500px;
          background: var(--jasana-accent);
          bottom: -100px;
          right: -100px;
        }

        .main-container {
          position: relative;
          z-index: 10;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 20px;
        }

        /* Card Professional Style */
        .card-professional {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 60px 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .icon-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 30px;
          cursor: pointer;
        }

        .icon-circle {
          width: 100%;
          height: 100%;
          background: var(--secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .main-icon {
          width: 48px;
          height: 48px;
        }

        .spinning-border {
          position: absolute;
          inset: -5px;
          border: 3px solid transparent;
          border-top-color: var(--jasana-primary);
          border-radius: 50%;
          animation: spin 3s linear infinite;
          z-index: 1;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .title-text {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--foreground);
        }

        .description-text {
          color: var(--muted-foreground);
          line-height: 1.6;
          margin-bottom: 40px;
          font-size: 1.05rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 40px;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted-foreground);
          padding: 15px;
          background: var(--secondary);
          border-radius: 12px;
        }

        .progress-container {
          text-align: left;
          margin-bottom: 40px;
        }

        .progress-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--muted-foreground);
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 8px;
          background: var(--secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 65%;
          background: var(--jasana-gradient-primary);
        }

        /* Game Styles (Hashed/Hidden) */
        .card-game {
          background: #0f1419;
          border: 1px solid #374151;
          border-radius: 24px;
          padding: 20px;
          max-width: 840px;
          width: 100%;
          color: white;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px 20px;
          border-bottom: 1px solid #374151;
          margin-bottom: 20px;
        }

        .game-title {
          font-weight: 900;
          letter-spacing: 4px;
          color: #8b5cf6;
        }

        .close-btn {
          font-size: 1.5rem;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .game-canvas {
          background: #050505;
          border-radius: 16px;
          width: 100%;
          height: auto;
          cursor: none;
        }

        .game-menu {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          background: rgba(15, 20, 25, 0.9);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          z-index: 20;
          border: 1px solid #374151;
        }

        .start-game-btn {
          background: var(--jasana-primary);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .start-game-btn:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .game-hud {
          display: flex;
          justify-content: space-between;
          padding: 15px 20px 5px;
          font-size: 0.8rem;
          color: #9ca3af;
          font-family: monospace;
        }

        @keyframes pop-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 600px) {
          .card-professional { padding: 40px 20px; }
          .status-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
