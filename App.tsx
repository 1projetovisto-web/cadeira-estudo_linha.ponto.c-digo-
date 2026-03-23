/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Code2, Shapes, MonitorPlay, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Part = {
  id: string;
  name: string;
  type: 'quad' | 'line';
  code: string;
  points?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  color: string;
  labelPos: { x: number; y: number };
};

const chairParts: Part[] = [
  {
    id: 'backrest',
    name: 'Encosto',
    type: 'quad',
    code: '  quad(130, 60, 270, 60, 265, 180, 135, 180);',
    points: '130,60 270,60 265,180 135,180',
    color: '#ef476f',
    labelPos: { x: 200, y: 120 }
  },
  {
    id: 'backrest-bar',
    name: 'Barra',
    type: 'quad',
    code: '  quad(135, 180, 265, 180, 260, 210, 140, 210);',
    points: '135,180 265,180 260,210 140,210',
    color: '#ffd166',
    labelPos: { x: 200, y: 195 }
  },
  {
    id: 'seat',
    name: 'Assento',
    type: 'quad',
    code: '  quad(140, 210, 260, 210, 300, 270, 100, 270);',
    points: '140,210 260,210 300,270 100,270',
    color: '#06d6a0',
    labelPos: { x: 200, y: 245 }
  },
  {
    id: 'leg-bl',
    name: 'Perna TE',
    type: 'line',
    code: '  line(140, 210, 140, 330);',
    x1: 140, y1: 210, x2: 140, y2: 330,
    color: '#118ab2',
    labelPos: { x: 120, y: 300 }
  },
  {
    id: 'leg-br',
    name: 'Perna TD',
    type: 'line',
    code: '  line(260, 210, 260, 330);',
    x1: 260, y1: 210, x2: 260, y2: 330,
    color: '#118ab2',
    labelPos: { x: 280, y: 300 }
  },
  {
    id: 'leg-fl',
    name: 'Perna FE',
    type: 'line',
    code: '  line(100, 270, 100, 370);',
    x1: 100, y1: 270, x2: 100, y2: 370,
    color: '#073b4c',
    labelPos: { x: 75, y: 340 }
  },
  {
    id: 'leg-fr',
    name: 'Perna FD',
    type: 'line',
    code: '  line(300, 270, 300, 370);',
    x1: 300, y1: 270, x2: 300, y2: 370,
    color: '#073b4c',
    labelPos: { x: 325, y: 340 }
  }
];

const p5CodeLines = [
  "function setup() {",
  "  createCanvas(400, 400);",
  "  strokeWeight(4);",
  "  noFill();",
  "}",
  "",
  "function draw() {",
  "  background(255);",
  "",
  "  // Encosto",
  "  quad(130, 60, 270, 60, 265, 180, 135, 180);",
  "  quad(135, 180, 265, 180, 260, 210, 140, 210);",
  "",
  "  // Assento",
  "  quad(140, 210, 260, 210, 300, 270, 100, 270);",
  "",
  "  // Pernas Traseiras",
  "  line(140, 210, 140, 330);",
  "  line(260, 210, 260, 330);",
  "",
  "  // Pernas Frontais",
  "  line(100, 270, 100, 370);",
  "  line(300, 270, 300, 370);",
  "}"
];

const partToLineIndex: Record<string, number> = {
  'backrest': 10,
  'backrest-bar': 11,
  'seat': 14,
  'leg-bl': 17,
  'leg-br': 18,
  'leg-fl': 21,
  'leg-fr': 22
};

export default function App() {
  const [scene, setScene] = useState(1);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
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
    if (scene === 4) {
      setStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [scene]);

  const activeLineIndex = scene === 4 && step > 0 && step <= chairParts.length 
    ? partToLineIndex[chairParts[step - 1].id] 
    : -1;
    
  const completedLineIndices = scene === 4 
    ? chairParts.slice(0, Math.max(0, step - 1)).map(p => partToLineIndex[p.id])
    : [];

  const currentMaxLineIndex = scene === 4 
    ? (step === 0 ? 8 : (step > chairParts.length ? p5CodeLines.length - 1 : partToLineIndex[chairParts[step - 1].id]))
    : p5CodeLines.length - 1;

  useEffect(() => {
    if (codeContainerRef.current) {
      const container = codeContainerRef.current;
      // Small delay to allow DOM to update before scrolling
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 10);
    }
  }, [currentMaxLineIndex]);

  return (
    <div className="flex h-screen bg-[#f5f5f0] text-neutral-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <nav className="w-72 bg-white border-r border-neutral-200 p-6 flex flex-col gap-2 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-8 mt-4">
          <h1 className="text-2xl font-bold font-serif tracking-tight text-neutral-800">A Cadeira de Código</h1>
          <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
            Do desenho à geometria, da geometria ao código p5.js.
          </p>
        </div>
        
        <NavButton scene={1} current={scene} setScene={setScene} icon={<ImageIcon size={18} />} text="1. Representação" />
        <NavButton scene={2} current={scene} setScene={setScene} icon={<Shapes size={18} />} text="2. Geometria" />
        <NavButton scene={3} current={scene} setScene={setScene} icon={<Code2 size={18} />} text="3. Código" />
        <NavButton scene={4} current={scene} setScene={setScene} icon={<MonitorPlay size={18} />} text="4. Montagem ao vivo" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
        <div className="flex items-center justify-center max-w-5xl w-full gap-8">
          
          {/* Canvas */}
          <motion.div
            layout
            className="relative bg-white shadow-xl rounded-sm border border-neutral-200 flex-shrink-0 overflow-hidden"
            style={{ width: 450, height: 450 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          >
            {/* p5.js canvas header simulation */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-3">
              <span className="text-xs font-mono text-neutral-400">canvas (400x400)</span>
            </div>

            <svg viewBox="0 0 400 400" className="w-full h-full mt-4">
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
                const isActive = scene === 4 && index === step - 1;
                
                const strokeColor = isGeometry ? part.color : '#171717';
                const fillColor = isGeometry ? `${part.color}22` : 'transparent';
                const strokeWidth = 4;

                return (
                  <g key={part.id}>
                    {part.type === 'quad' ? (
                      <motion.polygon 
                        points={part.points} 
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill={fillColor}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={scene === 4 ? { pathLength: 0, opacity: 0 } : false}
                        animate={{ pathLength: 1, opacity: 1, stroke: strokeColor, fill: fillColor, strokeWidth }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    ) : (
                      <motion.line 
                        x1={part.x1} y1={part.y1} x2={part.x2} y2={part.y2}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        initial={scene === 4 ? { pathLength: 0, opacity: 0 } : false}
                        animate={{ pathLength: 1, opacity: 1, stroke: strokeColor, strokeWidth }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    )}
                    
                    <AnimatePresence>
                      {isGeometry && (
                        <motion.text
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          x={part.labelPos.x}
                          y={part.labelPos.y}
                          textAnchor="middle"
                          fill={part.color}
                          className="text-[11px] font-bold font-mono tracking-widest"
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

          {/* Code Panel */}
          <AnimatePresence>
            {(scene === 3 || scene === 4) && (
              <motion.div
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 450 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                className="h-[450px] bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-neutral-800 flex-shrink-0"
              >
                <div className="bg-[#2d2d2d] px-4 py-3 flex justify-between items-center border-b border-black/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-neutral-400 text-xs font-mono ml-2">sketch.js</span>
                  </div>
                  {scene === 4 && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className="text-neutral-400 hover:text-white transition-colors"
                        title={isPlaying ? "Pausar" : "Continuar"}
                      >
                        {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
                      </button>
                      <button 
                        onClick={() => { setStep(0); setIsPlaying(true); }} 
                        className="text-neutral-400 hover:text-white transition-colors"
                        title="Reiniciar"
                      >
                        <RotateCcw size={16}/>
                      </button>
                    </div>
                  )}
                </div>
                <div ref={codeContainerRef} className="p-4 overflow-y-auto font-mono text-[13px] leading-relaxed flex-1 custom-scrollbar">
                  {p5CodeLines.map((line, i) => {
                    if (scene === 4 && i > currentMaxLineIndex) return null;
                    return (
                      <CodeLine 
                        key={i} 
                        line={line} 
                        index={i} 
                        active={i === activeLineIndex} 
                        completed={completedLineIndices.includes(i)} 
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

function NavButton({ scene, current, setScene, icon, text }: { scene: number, current: number, setScene: (s: number) => void, icon: React.ReactNode, text: string }) {
  const isActive = scene === current;
  return (
    <button
      onClick={() => setScene(scene)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
        isActive 
          ? 'bg-neutral-900 text-white shadow-md' 
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      <span className={isActive ? 'text-purple-400' : 'text-neutral-400'}>{icon}</span>
      <span className="font-medium text-sm">{text}</span>
    </button>
  );
}

function CodeLine({ line, index, active, completed }: { line: string, index: number, active: boolean, completed: boolean }) {
  const highlighted = line
    .replace(/(function|setup|draw)/g, '<span class="text-[#569cd6]">$1</span>')
    .replace(/(createCanvas|strokeWeight|noFill|background|quad|line)/g, '<span class="text-[#dcdcaa]">$1</span>')
    .replace(/(\d+)/g, '<span class="text-[#b5cea8]">$1</span>')
    .replace(/(\/\/.*)/g, '<span class="text-[#6a9955]">$1</span>');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center px-2 py-0.5 rounded transition-colors duration-300 ${
        active ? 'bg-[#3a3d41] border-l-2 border-[#c586c0]' : 'border-l-2 border-transparent hover:bg-[#2a2d2e]'
      }`}
    >
      <span className="w-6 text-[#858585] select-none text-right mr-4 text-xs">{index + 1}</span>
      <span className="flex-1 whitespace-pre text-[#d4d4d4]" dangerouslySetInnerHTML={{ __html: highlighted }} />
      {completed && (
        <motion.span 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-[#4ec9b0] ml-2"
        >
          <Check size={14} />
        </motion.span>
      )}
    </motion.div>
  );
}
