/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Code2, Shapes, MonitorPlay, Image as ImageIcon, Check, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TIPAGEM E DADOS ---
type Part = {
  id: string;
  name: string;
  type: 'quad' | 'line';
  code: string;
  points?: string;
  x1?: number; y1?: number; x2?: number; y2?: number;
  color: string;
  labelPos: { x: number; y: number };
};

const chairParts: Part[] = [
  { id: 'backrest', name: 'Encosto', type: 'quad', code: '  quad(130, 60, 270, 60, 265, 180, 135, 180);', points: '130,60 270,60 265,180 135,180', color: '#ef476f', labelPos: { x: 200, y: 120 } },
  { id: 'backrest-bar', name: 'Barra', type: 'quad', code: '  quad(135, 180, 265, 180, 260, 210, 140, 210);', points: '135,180 265,180 260,210 140,210', color: '#ffd166', labelPos: { x: 200, y: 195 } },
  { id: 'seat', name: 'Assento', type: 'quad', code: '  quad(140, 210, 260, 210, 300, 270, 100, 270);', points: '140,210 260,210 300,270 100,270', color: '#06d6a0', labelPos: { x: 200, y: 245 } },
  { id: 'leg-bl', name: 'Perna TE', type: 'line', code: '  line(140, 210, 140, 330);', x1: 140, y1: 210, x2: 140, y2: 330, color: '#118ab2', labelPos: { x: 120, y: 300 } },
  { id: 'leg-br', name: 'Perna TD', type: 'line', code: '  line(260, 210, 260, 330);', x1: 260, y1: 210, x2: 260, y2: 330, color: '#118ab2', labelPos: { x: 280, y: 300 } },
  { id: 'leg-fl', name: 'Perna FE', type: 'line', code: '  line(100, 270, 100, 370);', x1: 100, y1: 270, x2: 100, y2: 370, color: '#073b4c', labelPos: { x: 75, y: 340 } },
  { id: 'leg-fr', name: 'Perna FD', type: 'line', code: '  line(300, 270, 300, 370);', x1: 300, y1: 270, x2: 300, y2: 370, color: '#073b4c', labelPos: { x: 325, y: 340 } }
];

const p5CodeLines = [
  "function setup() {", "  createCanvas(400, 400);", "  strokeWeight(4);", "  noFill();", "}", "",
  "function draw() {", "  background(255);", "", "  // Encosto",
  "  quad(130, 60, 270, 60, 265, 180, 135, 180);", "  quad(135, 180, 265, 180, 260, 210, 140, 210);", "",
  "  // Assento", "  quad(140, 210, 260, 210, 300, 270, 100, 270);", "",
  "  // Pernas Traseiras", "  line(140, 210, 140, 330);", "  line(260, 210, 260, 330);", "",
  "  // Pernas Frontais", "  line(100, 270, 100, 370);", "  line(300, 270, 300, 370);", "}"
];

const partToLineIndex: Record<string, number> = {
  'backrest': 10, 'backrest-bar': 11, 'seat': 14, 'leg-bl': 17, 'leg-br': 18, 'leg-fl': 21, 'leg-fr': 22
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [scene, setScene] = useState(1);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Curva de animação profissional (Artsy vibe)
  const transitions = { duration: 1, ease: [0.6, 0.01, -0.05, 0.95] };

  useEffect(() => {
    let timer: any;
    if (scene === 4 && isPlaying) {
      timer = setInterval(() => {
        setStep(s => {
          if (s >= chairParts.length + 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [scene, isPlaying]);

  useEffect(() => {
    if (scene === 4) { setStep(0); setIsPlaying(true); } 
    else { setIsPlaying(false); }
    setIsMenuOpen(false); // Fecha menu ao trocar cena
  }, [scene]);

  const activeLineIndex = scene === 4 && step > 0 && step <= chairParts.length ? partToLineIndex[chairParts[step - 1].id] : -1;
  const completedLineIndices = scene === 4 ? chairParts.slice(0, Math.max(0, step - 1)).map(p => partToLineIndex[p.id]) : [];
  const currentMaxLineIndex = scene === 4 ? (step === 0 ? 8 : (step > chairParts.length ? p5CodeLines.length - 1 : partToLineIndex[chairParts[step - 1].id])) : p5CodeLines.length - 1;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f5f5f0] text-neutral-900 font-sans overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white border-b border-neutral-200 p-4 flex justify-between items-center z-50">
        <h1 className="text-lg font-serif font-bold italic">Visto.Lab</h1>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR (Responsive) */}
      <nav className={`
        fixed md:relative inset-0 md:inset-auto z-40 bg-white md:bg-transparent
        w-full md:w-80 border-r border-neutral-200 p-6 flex flex-col gap-2 
        transition-transform duration-500 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 mt-10 md:mt-4">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitions}
            className="text-2xl font-bold font-serif tracking-tight text-neutral-800"
          >
            A Cadeira de Código
          </motion.h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed italic">
            "A forma segue o algoritmo."
          </p>
        </div>
        
        <NavButton scene={1} current={scene} setScene={setScene} icon={<ImageIcon size={18} />} text="1. Representação" />
        <NavButton scene={2} current={scene} setScene={setScene} icon={<Shapes size={18} />} text="2. Geometria" />
        <NavButton scene={3} current={scene} setScene={setScene} icon={<Code2 size={18} />} text="3. Código" />
        <NavButton scene={4} current={scene} setScene={setScene} icon={<MonitorPlay size={18} />} text="4. Montagem ao vivo" />

        <div className="mt-auto pt-8 border-t border-neutral-100 hidden md:block">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Tutorial de Arte Digital</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col md:flex-row items-center justify-center p-4 md:p-8 overflow-y-auto md:overflow-hidden gap-6">
        
        {/* CANVAS CONTAINER */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transitions}
          className="relative bg-white shadow-2xl rounded-sm border border-neutral-200 w-full max-w-[400px] aspect-square md:w-[450px] md:h-[450px] flex-shrink-0"
        >
          <div className="absolute top-0 left-0 right-0 h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-3 justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">P5.JS Output</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-neutral-200"></div>
                <div className="w-2 h-2 rounded-full bg-neutral-200"></div>
            </div>
          </div>

          <svg viewBox="0 0 400 400" className="w-full h-full p-8 mt-2">
            <AnimatePresence>
              {scene === 2 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <line x1={0} y1={i * 50} x2={400} y2={i * 50} stroke="#f0f0f0" strokeWidth="1" />
                      <line x1={i * 50} y1={0} x2={i * 50} y2={400} stroke="#f0f0f0" strokeWidth="1" />
                    </React.Fragment>
                  ))}
                </motion.g>
              )}
            </AnimatePresence>

            {chairParts.map((part, index) => {
              const isVisible = scene !== 4 || index < step;
              if (!isVisible) return null;
              const isGeometry = scene === 2;
              const strokeColor = isGeometry ? part.color : '#171717';
              const fillColor = isGeometry ? `${part.color}22` : 'transparent';

              return (
                <g key={part.id}>
                  {part.type === 'quad' ? (
                    <motion.polygon 
                      points={part.points} 
                      stroke={strokeColor}
                      strokeWidth={4}
                      fill={fillColor}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                    />
                  ) : (
                    <motion.line 
                      x1={part.x1} y1={part.y1} x2={part.x2} y2={part.y2}
                      stroke={strokeColor}
                      strokeWidth={4}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                    />
                  )}
                  <AnimatePresence>
                    {isGeometry && (
                      <motion.text
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        x={part.labelPos.x} y={part.labelPos.y}
                        textAnchor="middle" fill={part.color}
                        className="text-[9px] font-bold font-mono tracking-widest"
                      >
                        {part.type.toUpperCase()}
                      </motion.text>
                    )}
                  </AnimatePresence>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* CODE PANEL (Responsive) */}
        <AnimatePresence>
          {(scene === 3 || scene === 4) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={transitions}
              className="w-full max-w-[400px] md:w-[450px] h-[350px] md:h-[450px] bg-[#1e1e1e] rounded-sm shadow-2xl flex flex-col border border-neutral-800"
            >
              <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center border-b border-black/50">
                <span className="text-neutral-400 text-[10px] font-mono uppercase tracking-widest">Editor de Código</span>
                {scene === 4 && (
                  <div className="flex gap-4">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="text-neutral-400 hover:text-white transition-colors">
                      {isPlaying ? <Pause size={14}/> : <Play size={14}/>}
                    </button>
                    <button onClick={() => { setStep(0); setIsPlaying(true); }} className="text-neutral-400 hover:text-white transition-colors">
                      <RotateCcw size={14}/>
                    </button>
                  </div>
                )}
              </div>
              <div ref={codeContainerRef} className="p-6 overflow-y-auto font-mono text-[12px] leading-relaxed flex-1 custom-scrollbar scroll-smooth">
                {p5CodeLines.map((line, i) => {
                  if (scene === 4 && i > currentMaxLineIndex) return null;
                  return <CodeLine key={i} line={line} index={i} active={i === activeLineIndex} completed={completedLineIndices.includes(i)} />;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUBCOMPONENTE BOTÃO NAVEGAÇÃO ---
function NavButton({ scene, current, setScene, icon, text }: { scene: number, current: number, setScene: (s: number) => void, icon: React.ReactNode, text: string }) {
  const isActive = scene === current;
  return (
    <button
      onClick={() => setScene(scene)}
      className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-500 ${
        isActive ? 'bg-neutral-900 text-white translate-x-2' : 'text-neutral-500 hover:text-neutral-800'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-neutral-300'}>{icon}</span>
      <span className="text-[11px] uppercase tracking-widest font-bold">{text}</span>
    </button>
  );
}

// --- SUBCOMPONENTE LINHA DE CÓDIGO ---
function CodeLine({ line, index, active, completed }: { line: string, index: number, active: boolean, completed: boolean }) {
  const highlighted = line
    .replace(/(function|setup|draw)/g, '<span class="text-[#c586c0]">$1</span>')
    .replace(/(createCanvas|strokeWeight|noFill|background|quad|line)/g, '<span class="text-[#dcdcaa]">$1</span>')
    .replace(/(\d+)/g, '<span class="text-[#b5cea8]">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="text-[#6a9955]">$1</span>');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
      className={`flex items-start mb-0.5 ${active ? 'bg-neutral-800 border-l-2 border-white' : 'border-l-2 border-transparent'}`}
    >
      <span className="w-8 text-neutral-600 text-[10px] pt-0.5">{index + 1}</span>
      <span className="flex-1 whitespace-pre text-[#d4d4d4]" dangerouslySetInnerHTML={{ __html: highlighted }} />
      {completed && <Check size={12} className="text-green-500 mt-1 ml-2" />}
    </motion.div>
  );
}
