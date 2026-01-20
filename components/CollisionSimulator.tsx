import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, RotateCcw, Zap, Settings, Info, Atom, Activity, Database, MousePointer2, Move3d, BookOpen, X, Thermometer, Radio } from 'lucide-react';

interface SimulationConfig {
    energy: number; // TeV
    bunchIntensity: number; // e11 protons
    crossingAngle: number; // microradians
    focusing: number; // Beta star (m)
}

interface SimStats {
    luminosity: number;
    collisions: number;
    higgsCandidates: number;
    temperature: number;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
}

interface Particle extends Point3D {
    vx: number;
    vy: number;
    vz: number;
    type: 'beam1' | 'beam2' | 'pion' | 'kaon' | 'muon' | 'higgs' | 'photon';
    life: number;
    maxLife: number;
    color: string;
    size: number;
    trail: Point3D[];
}

const PARTICLE_TYPES = {
    pion: { color: '#06b6d4', size: 1.5, life: 60, speed: 4 },   // Cyan
    kaon: { color: '#fbbf24', size: 2.5, life: 40, speed: 3 },   // Amber (Strange quark)
    muon: { color: '#a855f7', size: 1.2, life: 150, speed: 6 },  // Purple
    higgs: { color: '#f43f5e', size: 6.0, life: 15, speed: 1 },  // Rose (Massive)
    photon: { color: '#ffffff', size: 1.0, life: 100, speed: 7 }, // White
    beam: { color: '#ffffff', size: 2.0, life: 100, speed: 10 }
};

const InfoTooltip = ({ text, title }: { text: string, title?: string }) => (
    <div className="group relative inline-flex items-center cursor-help ml-2">
        <Info size={14} className="text-slate-500 hover:text-cyan-400 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-200 shadow-xl z-50 pointer-events-none text-center">
            {title && <div className="font-bold text-white mb-1 border-b border-slate-700 pb-1">{title}</div>}
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-600"></div>
        </div>
    </div>
);

const ScienceGuideModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Physics Simulation Manual</h2>
                        <p className="text-xs text-slate-400 font-mono">ATLAS DETECTOR • INTERACTION POINT 1</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                    
                    {/* Column 1: Accelerator Physics */}
                    <div className="p-6 space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Zap size={16} className="text-yellow-500"/> Accelerator Dynamics
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <h4 className="font-bold text-cyan-400 text-sm mb-1">Beam Energy (TeV)</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Kinetic energy of each proton. 1 TeV = 10<sup>12</sup> eV. 
                                    Higher energy (E) allows the creation of heavier particles (m) via E=mc². 
                                    The LHC accelerates protons to 99.999999% the speed of light.
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <h4 className="font-bold text-cyan-400 text-sm mb-1">Bunch Intensity</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Protons travel in discrete packets called "bunches". Each bunch contains roughly 1.15 × 10<sup>11</sup> protons.
                                    Higher intensity increases the collision pile-up (simultaneous collisions per crossing).
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <h4 className="font-bold text-cyan-400 text-sm mb-1">Beta Star (β*)</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    The "squeeze" factor at the interaction point. A lower β* value (e.g., 0.55m) means the magnetic lattice focuses the beam into a smaller cross-section, drastically increasing luminosity.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Detector & Telemetry */}
                    <div className="p-6 space-y-6">
                         <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity size={16} className="text-green-500"/> Real-time Telemetry
                        </h3>

                         <div className="space-y-5 text-sm text-slate-300">
                            <div>
                                <div className="font-bold text-white mb-1 flex items-center gap-2">
                                    <Radio size={14} className="text-slate-400" /> Luminosity
                                </div>
                                <p className="text-xs text-slate-400 mb-2">
                                    The rate of collisions, measured in Hz/nb (Inverse Nanobarns per second). It indicates how much data the experiment is collecting.
                                </p>
                            </div>

                             <div>
                                <div className="font-bold text-white mb-1 flex items-center gap-2">
                                    <Thermometer size={14} className="text-slate-400" /> Magnet Temperature
                                </div>
                                <p className="text-xs text-slate-400 mb-2">
                                    The LHC uses superfluid helium to cool Niobium-Titanium magnets to 1.9 Kelvin (-271.25°C). 
                                    If temp rises above 2.17K (Lambda point), the helium loses superfluidity, causing a "Quench".
                                </p>
                            </div>
                         </div>

                         <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                             <h4 className="font-bold text-indigo-300 text-xs uppercase mb-2">Goal: The Higgs Boson</h4>
                             <p className="text-xs text-indigo-100 leading-relaxed">
                                 The simulation tracks "Higgs Candidates". The Higgs boson decays almost instantly (1.56 × 10<sup>-22</sup> s). 
                                 Detectors look for its decay products. We simulate the <strong>"Golden Channel"</strong>: 
                                 <br/><br/>
                                 <code className="bg-indigo-950 px-1 py-0.5 rounded text-yellow-400">H → ZZ → 4μ</code>
                                 <br/><br/>
                                 A Higgs decaying into two Z bosons, which then decay into four muons.
                             </p>
                         </div>
                    </div>

                    {/* Column 3: Particle Legend */}
                    <div className="p-6 space-y-6 bg-slate-900/50">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Atom size={16} className="text-purple-500"/> Particle Legend
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="mt-1 w-3 h-3 rounded-full bg-[#f43f5e] shadow-[0_0_8px_#f43f5e] shrink-0 animate-pulse"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Higgs Boson (H)</div>
                                    <div className="text-xs text-slate-400">Massive, scalar boson. Short-lived. Decays into Muons in this sim.</div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 w-3 h-3 rounded-full bg-[#a855f7] shrink-0"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Muon (μ)</div>
                                    <div className="text-xs text-slate-400">Heavy electron. Penetrates deep into the detector. Key signature of heavy decays.</div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 w-3 h-3 rounded-full bg-[#fbbf24] shrink-0"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Kaon (K)</div>
                                    <div className="text-xs text-slate-400">Strange meson. decays into pions. Indicator of "flavor" physics.</div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="mt-1 w-3 h-3 rounded-full bg-[#06b6d4] shrink-0"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Pion (π)</div>
                                    <div className="text-xs text-slate-400">Lightest meson. The most common "debris" in high-energy collisions.</div>
                                </div>
                            </div>

                             <div className="flex gap-3">
                                <div className="mt-1 w-3 h-3 rounded-full border border-white bg-transparent shrink-0"></div>
                                <div>
                                    <div className="text-sm font-bold text-white">Proton Beam</div>
                                    <div className="text-xs text-slate-400">The colliding matter. Moving at 0.99999999c.</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Move3d size={14} />
                                <span>Drag canvas to rotate interaction point</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
                <button onClick={onClose} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20">
                    Acknowledge
                </button>
            </div>
        </div>
    </div>
);

const CollisionSimulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isRunningRef = useRef(false);
    const [runningState, setRunningState] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    
    // Camera / Interaction State
    const [rotation, setRotation] = useState({ x: 0.2, y: 0.5 }); // Initial angle
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });
    const rotationRef = useRef({ x: 0.2, y: 0.5 }); // Ref for animation loop to avoid stale closures

    const [config, setConfig] = useState<SimulationConfig>({
        energy: 6.5,
        bunchIntensity: 1.1,
        crossingAngle: 140,
        focusing: 0.55
    });

    const [stats, setStats] = useState<SimStats>({
        luminosity: 0,
        collisions: 0,
        higgsCandidates: 0,
        temperature: 1.9
    });

    const particles = useRef<Particle[]>([]);
    const animationFrameId = useRef<number>(0);

    // --- Interaction Handlers ---
    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const deltaX = (e.clientX - lastMouse.current.x) * 0.01;
        const deltaY = (e.clientY - lastMouse.current.y) * 0.01;
        
        rotationRef.current = {
            x: Math.max(-1, Math.min(1, rotationRef.current.x + deltaY)), // Limit vertical rotation
            y: rotationRef.current.y + deltaX
        };
        setRotation({...rotationRef.current}); // Trigger React re-render for UI if needed, primarily used ref
        lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const toggleSimulation = () => {
        const newState = !runningState;
        setRunningState(newState);
        isRunningRef.current = newState;
        if (newState) {
            setStats(prev => ({ ...prev, temperature: 1.9 + (config.energy / 10) }));
        }
    };

    const resetSimulation = () => {
        setRunningState(false);
        isRunningRef.current = false;
        particles.current = [];
        setStats({ luminosity: 0, collisions: 0, higgsCandidates: 0, temperature: 1.9 });
        rotationRef.current = { x: 0.2, y: 0.5 };
        setRotation({ x: 0.2, y: 0.5 });
    };

    // --- 3D Helper Functions ---
    const project3D = (x: number, y: number, z: number, width: number, height: number, rotX: number, rotY: number) => {
        // Rotate Y (Yaw)
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate X (Pitch)
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective Projection
        const fov = 400;
        const scale = fov / (fov + z2 + 400); // Offset z to move camera back
        const x2d = x1 * scale + width / 2;
        const y2d = y2 * scale + height / 2;

        return { x: x2d, y: y2d, scale, zIndex: z2 };
    };

    // Main Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const rx = rotationRef.current.x;
            const ry = rotationRef.current.y;

            // Clear & Background
            ctx.fillStyle = '#020617'; // Slate 950
            ctx.fillRect(0, 0, width, height);
            
            // Draw Detector Geometry (Wireframe Rings)
            ctx.lineWidth = 1;
            const rings = [-300, -200, -100, 0, 100, 200, 300];
            rings.forEach(zPos => {
                ctx.beginPath();
                const segments = 32;
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    const r = 100; // Detector Radius
                    const px = Math.cos(theta) * r;
                    const py = Math.sin(theta) * r;
                    
                    const p = project3D(px, py, zPos, width, height, rx, ry);
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                }
                ctx.strokeStyle = zPos === 0 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(148, 163, 184, 0.1)'; // Bright cyan center
                ctx.stroke();
            });

            // Draw Beam Line Axis
            const start = project3D(-400, 0, 0, width, height, rx, ry);
            const end = project3D(400, 0, 0, width, height, rx, ry);
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
            ctx.setLineDash([5, 5]);
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.setLineDash([]);

            if (isRunningRef.current) {
                // --- 1. Spawn Beam Particles (Moving along X axis) ---
                const spawnRate = 0.3 * config.bunchIntensity;
                if (Math.random() < spawnRate) {
                    // Beam 1 (Left to Right)
                    particles.current.push({
                        x: -400, y: (Math.random()-0.5)*2, z: (Math.random()-0.5)*2,
                        vx: 15 + (config.energy), vy: 0, vz: 0,
                        type: 'beam1', life: 100, maxLife: 100, color: '#06b6d4', size: 2, trail: []
                    });
                    // Beam 2 (Right to Left)
                    particles.current.push({
                        x: 400, y: (Math.random()-0.5)*2, z: (Math.random()-0.5)*2,
                        vx: -(15 + (config.energy)), vy: 0, vz: 0,
                        type: 'beam2', life: 100, maxLife: 100, color: '#f43f5e', size: 2, trail: []
                    });
                }

                // Update Stats
                setStats(prev => ({
                    ...prev,
                    luminosity: (config.bunchIntensity * config.energy) / (config.focusing * 0.1),
                    temperature: 1.9 + (Math.random() * 0.05)
                }));
            }

            // --- 2. Physics & Logic ---
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;
                p.life--;
                
                // Trail Logic
                if (p.life % 2 === 0) {
                    p.trail.push({x: p.x, y: p.y, z: p.z});
                    if (p.trail.length > 10) p.trail.shift();
                }

                // Decay Logic
                if (p.type === 'higgs' && p.life < 5) {
                    // Higgs Decay: H -> ZZ -> 4 leptons (muons)
                    const decayCount = 4;
                    for (let d = 0; d < decayCount; d++) {
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.random() * Math.PI;
                        const speed = PARTICLE_TYPES.muon.speed;
                        particles.current.push({
                            x: p.x, y: p.y, z: p.z,
                            vx: Math.sin(phi) * Math.cos(theta) * speed,
                            vy: Math.sin(phi) * Math.sin(theta) * speed,
                            vz: Math.cos(phi) * speed,
                            type: 'muon',
                            life: PARTICLE_TYPES.muon.life, maxLife: PARTICLE_TYPES.muon.life,
                            color: PARTICLE_TYPES.muon.color, size: PARTICLE_TYPES.muon.size, trail: []
                        });
                    }
                    p.life = 0; // Kill Higgs
                } else if (p.type === 'kaon' && p.life < 5) {
                    // Kaon Decay -> 2 Pions
                    for(let k=0; k<2; k++) {
                        const theta = Math.random() * Math.PI * 2;
                        const speed = PARTICLE_TYPES.pion.speed;
                        particles.current.push({
                            x: p.x, y: p.y, z: p.z,
                            vx: Math.cos(theta) * speed, vy: Math.sin(theta) * speed, vz: (Math.random()-0.5)*speed,
                            type: 'pion', life: 40, maxLife: 40, color: PARTICLE_TYPES.pion.color, size: 1.5, trail: []
                        });
                    }
                    p.life = 0;
                }

                // Collision Detection (Beam particles near center)
                if (isRunningRef.current && (p.type === 'beam1' || p.type === 'beam2')) {
                    if (Math.abs(p.x) < 10 && Math.random() < 0.2) {
                        setStats(s => ({ ...s, collisions: s.collisions + 1 }));
                        
                        // Spawn Debris
                        const debrisCount = 10 + Math.floor(config.energy * 3);
                        // Rare Higgs Event
                        const isHiggsEvent = Math.random() > 0.99;
                        if (isHiggsEvent) {
                             setStats(s => ({ ...s, higgsCandidates: s.higgsCandidates + 1 }));
                             // Spawn Higgs
                             particles.current.push({
                                x: 0, y: 0, z: 0,
                                vx: (Math.random()-0.5), vy: (Math.random()-0.5), vz: (Math.random()-0.5),
                                type: 'higgs', life: PARTICLE_TYPES.higgs.life, maxLife: PARTICLE_TYPES.higgs.life,
                                color: PARTICLE_TYPES.higgs.color, size: PARTICLE_TYPES.higgs.size, trail: []
                             });
                        }

                        for (let d = 0; d < debrisCount; d++) {
                            // Spherical distribution
                            const theta = Math.random() * Math.PI * 2;
                            const phi = Math.acos(2 * Math.random() - 1);
                            const speed = Math.random() * 3 + 2;
                            
                            const isKaon = Math.random() > 0.85;
                            const pType = isKaon ? 'kaon' : 'pion';
                            const pConfig = PARTICLE_TYPES[pType];

                            particles.current.push({
                                x: 0, y: 0, z: 0,
                                vx: Math.sin(phi) * Math.cos(theta) * speed,
                                vy: Math.sin(phi) * Math.sin(theta) * speed,
                                vz: Math.cos(phi) * speed,
                                type: pType as any,
                                life: pConfig.life + Math.random()*20, 
                                maxLife: pConfig.life + 20,
                                color: pConfig.color, 
                                size: pConfig.size, 
                                trail: []
                            });
                        }
                        p.life = 0; // Destroy beam particle
                    }
                }

                // Cull
                if (p.life <= 0 || Math.abs(p.x) > 600 || Math.abs(p.y) > 400 || Math.abs(p.z) > 400) {
                    particles.current.splice(i, 1);
                }
            }

            // --- 3. Render Particles (Sorted by Depth) ---
            // Create render objects with projected coordinates
            const renderQueue = particles.current.map(p => {
                const proj = project3D(p.x, p.y, p.z, width, height, rx, ry);
                
                // Project Trail
                const projTrail = p.trail.map(t => project3D(t.x, t.y, t.z, width, height, rx, ry));

                return { ...p, proj, projTrail };
            });

            // Sort: High Z (far) to Low Z (near) for Painter's Algorithm
            renderQueue.sort((a, b) => b.proj.zIndex - a.proj.zIndex);

            renderQueue.forEach(p => {
                // Draw Trail
                if (p.projTrail.length > 1) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.size * p.proj.scale * 0.5;
                    ctx.globalAlpha = (p.life / p.maxLife) * 0.5;
                    ctx.moveTo(p.projTrail[0].x, p.projTrail[0].y);
                    for (let t of p.projTrail) ctx.lineTo(t.x, t.y);
                    ctx.stroke();
                }

                // Draw Particle
                ctx.beginPath();
                ctx.globalAlpha = p.life / p.maxLife;
                const radius = Math.max(0.5, p.size * p.proj.scale);
                ctx.fillStyle = p.color;
                
                // Special Glow for Higgs
                if (p.type === 'higgs') {
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#fbbf24';
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.arc(p.proj.x, p.proj.y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
                ctx.shadowBlur = 0;
            });

            animationFrameId.current = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [config]);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        LHC Collision Simulator 3D
                        <InfoTooltip title="3D Physics Engine" text="Interactive 3D visualization of the interaction point. Drag the view to rotate the detector. Simulates particle showers, decay chains, and detector geometry." />
                    </h1>
                    <p className="text-slate-400 text-sm">Interactive High-Energy Physics Event Display</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Controls Panel */}
                <div className="w-full lg:w-80 bg-slate-800 border border-slate-700 rounded-xl p-5 flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <Settings className="text-cyan-400" size={20} />
                            <h2 className="font-bold text-white">Controls</h2>
                        </div>
                        <button 
                            onClick={() => setShowGuide(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium transition-all"
                        >
                            <BookOpen size={14} />
                            Physics Manual
                        </button>
                    </div>

                    {/* Beam Energy */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-300">Beam Energy</label>
                            <span className="text-cyan-400 font-mono">{config.energy} TeV</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="7.0" 
                            step="0.1"
                            value={config.energy}
                            onChange={(e) => setConfig({...config, energy: parseFloat(e.target.value)})}
                            className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">Kinetic energy per proton.</p>
                    </div>

                    {/* Bunch Intensity */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-300">Bunch Intensity</label>
                            <span className="text-cyan-400 font-mono">{config.bunchIntensity}e11</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="2.5" 
                            step="0.1"
                            value={config.bunchIntensity}
                            onChange={(e) => setConfig({...config, bunchIntensity: parseFloat(e.target.value)})}
                            className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-slate-500">Protons per bunch (affects luminosity).</p>
                    </div>

                     {/* Focusing (Beta Star) */}
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <label className="text-slate-300">Beta Star (Focus)</label>
                            <span className="text-cyan-400 font-mono">{config.focusing}m</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="1.0" 
                            step="0.05"
                            value={config.focusing}
                            onChange={(e) => setConfig({...config, focusing: parseFloat(e.target.value)})}
                            className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            style={{direction: 'rtl'}} // Lower is tighter focus
                        />
                        <p className="text-[10px] text-slate-500">Beam squeeze at interaction point.</p>
                    </div>

                    <div className="mt-auto pt-6 space-y-3">
                         <button 
                            onClick={toggleSimulation}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                                runningState 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                                : 'bg-green-500 hover:bg-green-400 text-slate-900 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                            }`}
                        >
                            {runningState ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            {runningState ? 'ABORT SEQUENCE' : 'INITIATE BEAM'}
                        </button>
                        <button 
                            onClick={resetSimulation}
                            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                    </div>
                </div>

                {/* Simulation Viewport */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1"><Zap size={12}/> Luminosity</div>
                            <div className="text-xl font-mono text-white">{stats.luminosity.toFixed(2)} <span className="text-xs text-slate-500">Hz/nb</span></div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1"><Activity size={12}/> Collisions</div>
                            <div className="text-xl font-mono text-white">{stats.collisions.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 opacity-20"><Atom size={40}/></div>
                            <div className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1"><Atom size={12}/> Higgs Candidates</div>
                            <div className={`text-xl font-mono ${stats.higgsCandidates > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{stats.higgsCandidates}</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="text-slate-400 text-xs uppercase mb-1 flex items-center gap-1"><Database size={12}/> Mag. Temp</div>
                            <div className={`text-xl font-mono ${stats.temperature > 2.0 ? 'text-red-400' : 'text-blue-400'}`}>{stats.temperature.toFixed(2)} K</div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden group">
                        <canvas 
                            ref={canvasRef} 
                            width={1200} 
                            height={600}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            className="w-full h-full object-contain cursor-move active:cursor-grabbing bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5"
                        />
                        
                        {/* 3D Interaction Hint */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1 bg-slate-900/50 backdrop-blur rounded-full border border-slate-700 text-xs text-slate-400 pointer-events-none">
                            <Move3d size={14} />
                            <span>Drag to rotate 3D view</span>
                        </div>
                        
                        {/* Legend */}
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-3 text-xs pointer-events-none">
                            <div className="font-bold text-slate-300 mb-2">Particle Legend</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div> <span className="text-slate-400">Pion (π)</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div> <span className="text-slate-400">Kaon (K)</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#a855f7]"></div> <span className="text-slate-400">Muon (μ)</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f43f5e] shadow-[0_0_5px_#f43f5e]"></div> <span className="text-slate-400">Higgs (H)</span></div>
                            </div>
                        </div>

                        {!runningState && stats.collisions === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-slate-600 flex flex-col items-center animate-pulse">
                                    <Move3d size={64} className="mb-4 opacity-50"/>
                                    <p className="font-mono text-sm tracking-widest uppercase">System Standby</p>
                                    <p className="text-xs text-slate-600 mt-2">Click and drag to inspect detector geometry</p>
                                </div>
                            </div>
                        )}
                        
                         <div className="absolute top-4 left-4 font-mono text-xs text-cyan-500/50 pointer-events-none">
                            VIEW: 3D PROJECTION<br/>
                            CAM: {rotation.x.toFixed(2)}, {rotation.y.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
            
            {showGuide && <ScienceGuideModal onClose={() => setShowGuide(false)} />}
        </div>
    );
};

export default CollisionSimulator;