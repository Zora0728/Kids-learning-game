import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';

const Level28_FinalExamLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    // 5 Trials: Wisdom(1), Courage(2), Memory(3), Knowledge(4), Skill(5)
    const [stage, setStage] = useState(1);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState(null); // { status, message }

    // --- Stage 1: Wisdom (Math Balance) ---
    // Left: 8. Right: 3 + ?
    const [scaleSelection, setScaleSelection] = useState(null);
    const SCALE_OPTIONS = [3, 4, 5, 8];
    const SCALE_ANSWER = 5;

    // --- Stage 2: Courage (Logic Pattern) ---
    // 🔴 🔵 🔴 ?
    const [riverSelection, setRiverSelection] = useState(null);
    const RIVER_PATTERN = ['🔴', '🔵', '🔴', '?'];
    const RIVER_ANSWER = '🔵';
    const RIVER_OPTIONS = ['🔴', '🔵', '🟢', '🟡'];

    // --- Stage 3: Memory (New) ---
    // Show 3 items, then hide 1. Which one is missing?
    // KEEP IT SIMPLE: Show sequence 🍎 🍌 🍇 for 3s, then mask to [?] [?] [?] and ask "Which was first?"
    // OR: "Find the pair?"
    // Let's do: "Pattern Recall". Show 3 colors. Hide. Ask "What was the 2nd color?"
    const [memPhase, setMemPhase] = useState('watch'); // watch, guess
    const MEM_SEQ = ['🐸', '🐷', '🐯'];
    const MEM_OPTIONS = ['🐸', '🐷', '🐯', '🐼'];
    const MEM_ANSWER = '🐷';

    // --- Stage 4: Knowledge (New) ---
    // Simple classification
    const QUESTION = t('l28_know_q');
    const KNOWLEDGE_OPTIONS = [
        { id: 'a', icon: '🍎', label: t('l28_opt_apple') },
        { id: 'b', icon: '🚌', label: t('l28_opt_bus') },
        { id: 'c', icon: '👕', label: t('l28_opt_clothes') }
    ];
    const KNOWLEDGE_ANSWER = 'b';

    // --- Stage 5: Skill (Coding Key) ---
    // 3x3 Grid. Start (0,0) -> Goal (2,0)
    // Needs: F, F (Simple) or F, R, F, L (Complex)
    // Let's do a simple 1D path with a turn? 
    // Grid:
    // [K] [ ] [ ]
    // [ ] [ ] [L]
    // Commands: F, R, D(Down)? No, just F, Turn.
    // Let's use standard F, L, R.
    // Start (0,0) Facing East. Goal (2,1).
    // Path: F, F, R, F.
    const [program, setProgram] = useState([]);
    const [heroPos, setHeroPos] = useState({ x: 0, y: 0, dir: 1 }); // 1=Right
    const [isRun, setIsRun] = useState(false);

    // Grid 3x3
    // 0 1 2
    // S . .
    // . . G

    const COMMANDS = [
        { id: 'F', label: t('l26_cmd_f'), icon: '👣' },
        { id: 'R', label: t('l26_cmd_r'), icon: '↪️' },
        { id: 'L', label: t('l26_cmd_l'), icon: '↩️' }
    ];

    // --- Handlers ---

    // STAGE 1
    const handleScaleSelect = (val) => {
        if (typeof val !== 'number') return; // Safety
        if (val === 5) { // Hardcoded correct answer for simplicity here
            handleStageComplete(t('l28_scale_bal'), 2);
        } else {
            handleMistake(t('l28_scale_wrong'));
        }
    };

    // STAGE 2
    const handleRiverSelect = (val) => {
        setRiverSelection(val);
        if (val === RIVER_ANSWER) {
            handleStageComplete(t('l28_river_safe'), 3);
        } else {
            handleMistake(t('l28_river_wrong'));
        }
    };

    // STAGE 3 (Memory)
    useEffect(() => {
        if (stage === 3) {
            setMemPhase('watch');
            const timer = setTimeout(() => {
                setMemPhase('guess');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    const handleMemSelect = (val) => {
        if (val === MEM_ANSWER) {
            handleStageComplete(t('l28_mem_correct'), 4);
        } else {
            handleMistake(t('l28_mem_wrong'));
        }
    };

    // STAGE 4 (Knowledge)
    const handleKnowledgeSelect = (id) => {
        if (id === KNOWLEDGE_ANSWER) {
            handleStageComplete(t('l28_know_correct'), 5);
        } else {
            handleMistake(t('l28_know_wrong'));
        }
    };

    // STAGE 5 (Coding)
    const addToProgram = (cmd) => {
        if (isRun) return;
        if (program.length < 6) setProgram([...program, cmd]);
    };

    const runCode = async () => {
        if (program.length === 0) return;
        setIsRun(true);
        setHeroPos({ x: 0, y: 0, dir: 1 }); // Reset

        // Wait
        await new Promise(r => setTimeout(r, 500));

        let curr = { x: 0, y: 0, dir: 1 };
        // Target: (2, 1)

        let failed = false;

        for (let cmd of program) {
            if (cmd.id === 'F') {
                if (curr.dir === 1) curr.x += 1; // Right
                else if (curr.dir === 2) curr.y += 1; // Down
                else if (curr.dir === 3) curr.x -= 1; // Left
                else if (curr.dir === 0) curr.y -= 1; // Up
            } else if (cmd.id === 'R') {
                curr.dir = (curr.dir + 1) % 4;
            } else if (cmd.id === 'L') {
                curr.dir = (curr.dir + 3) % 4;
            }

            // Visual Update
            setHeroPos({ ...curr });
            await new Promise(r => setTimeout(r, 800));

            // Check Bounds (3x2 Grid)
            if (curr.x < 0 || curr.x > 2 || curr.y < 0 || curr.y > 1) {
                failed = true;
                break;
            }
        }

        if (!failed && curr.x === 2 && curr.y === 1) {
            handleStageComplete(t('l28_skill_win'), 6); // 6=Win
        } else {
            handleMistake(t('l28_skill_fail'));
            setIsRun(false);
            setHeroPos({ x: 0, y: 0, dir: 1 });
        }
    };

    // Common
    const handleMistake = (msg) => {
        setMistakes(m => m + 1);
        setFeedback({ status: 'wrong', message: msg });
        // Auto dismiss handled by user manual close or timeout? 
        // Let's use timeout for small hints, or user close for big overlay
    };

    const handleStageComplete = (msg, next) => {
        setFeedback({ status: 'correct', message: msg });
        setTimeout(() => {
            setFeedback(null);
            if (next === 6) {
                // Finish
                let stars = 3;
                if (mistakes > 2) stars = 2;
                if (mistakes > 5) stars = 1;
                onComplete(stars);
            } else {
                setStage(next);
            }
        }, 2000);
    };

    // --- Render ---

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)',
            touchAction: 'none'
        }}>
            {/* Header - Card Style */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL 28
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.95)', borderRadius: '30px', padding: '10px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '280px'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.3rem' }}>{t('l28_title')}</h2>
                    <div style={{ fontSize: '0.8rem', color: '#555' }}>
                        {stage === 1 ? t('l28_stage_wisdom') : stage === 2 ? t('l28_stage_courage') : stage === 3 ? t('l28_stage_focus') : stage === 4 ? t('l28_stage_knowledge') : t('l28_stage_skill')}
                    </div>
                </div>
                <div style={{
                    marginTop: '10px', padding: '5px 15px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold'
                }}>
                    {t('l23_mistakes').replace('{count}', mistakes)}
                </div>
            </div>

            {/* Main Stage Area */}
            <div style={{
                flex: 1, background: '#fff', borderRadius: '20px', padding: '20px 20px 50px 20px', // Extra bottom padding
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', // Avoid 'center' clipping
                position: 'relative', overflowY: 'auto', overflowX: 'hidden', border: '5px solid #2c3e50',
                paddingTop: '30px'
            }}>

                {/* STAGE 1: MATH */}
                {stage === 1 && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '10px' }}>⚖️</div>
                        <h3 style={{ marginBottom: '30px' }}>{t('l28_scale_bal')}</h3>

                        {/* Scale Visual */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
                            {/* Left Pan */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #34495e',
                                    borderBottom: 'none', background: '#ecf0f1', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: '2rem', fontWeight: 'bold'
                                }}>
                                    8
                                </div>
                                <div style={{ width: '2px', height: '50px', background: '#34495e' }}></div>
                            </div>

                            {/* Fulcrum */}
                            <div style={{ width: '0', height: '0', borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '40px solid #34495e' }}></div>

                            {/* Right Pan */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #34495e',
                                    borderBottom: 'none', background: '#ecf0f1', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: '1.5rem', fontWeight: 'bold', flexDirection: 'column'
                                }}>
                                    <div>3 + ?</div>
                                </div>
                                <div style={{ width: '2px', height: '50px', background: '#34495e' }}></div>
                            </div>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {SCALE_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handleScaleSelect(opt)}
                                    className="btn-push"
                                    style={{
                                        width: '60px', height: '60px', borderRadius: '50%',
                                        fontSize: '1.5rem', fontWeight: 'bold',
                                        background: '#f1c40f', border: 'none',
                                        boxShadow: '0 4px 0 #d35400', color: '#2c3e50',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0
                                    }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {/* STAGE 2: LOGIC */}
                {stage === 2 && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🦁</div>
                        <h3 style={{ marginBottom: '30px' }}>{t('l27_nav_guide')}</h3>

                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px',
                            background: '#3498db', padding: '20px', borderRadius: '20px',
                            flexWrap: 'wrap'
                        }}>
                            {RIVER_PATTERN.map((p, i) => (
                                <div key={i} style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: '2.5rem', border: '3px solid white',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                                }}>
                                    {p === '?' && riverSelection ? riverSelection : p}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {RIVER_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => handleRiverSelect(opt)}
                                    className="btn-push"
                                    style={{
                                        width: '70px', height: '70px', borderRadius: '15px',
                                        fontSize: '2.5rem', background: 'white', border: 'none',
                                        boxShadow: '0 4px 0 #bdc3c7',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center' // Fix centering
                                    }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STAGE 3: MEMORY */}
                {stage === 3 && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>👀</div>
                        <h3 style={{ marginBottom: '30px' }}>{memPhase === 'watch' ? t('l28_mem_watch') : t('l28_mem_guess')}</h3>

                        <div style={{
                            display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px',
                            minHeight: '80px', alignItems: 'center'
                        }}>
                            {MEM_SEQ.map((item, i) => (
                                <div key={i} style={{
                                    fontSize: '3rem', width: '80px', height: '80px',
                                    background: '#ecf0f1', borderRadius: '15px',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    border: '3px solid #bdc3c7',
                                    animation: memPhase === 'watch' ? 'popIn 0.5s' : 'none'
                                }}>
                                    {memPhase === 'watch' ? item : (i === 1 ? '?' : item)}
                                </div>
                            ))}
                        </div>

                        {memPhase === 'guess' && (
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {MEM_OPTIONS.map(opt => (
                                    <button key={opt} onClick={() => handleMemSelect(opt)}
                                        className="btn-push"
                                        style={{
                                            width: '70px', height: '70px', borderRadius: '15px',
                                            fontSize: '2.5rem', background: 'white', border: 'none',
                                            boxShadow: '0 4px 0 #bdc3c7', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                        }}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                        {memPhase === 'watch' && <div style={{ color: '#7f8c8d' }}>{t('l14_watch')}</div>}
                    </div>
                )}

                {/* STAGE 4: KNOWLEDGE */}
                {stage === 4 && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>📖</div>
                        <h3 style={{ marginBottom: '30px' }}>{QUESTION}</h3>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {KNOWLEDGE_OPTIONS.map(opt => (
                                <button key={opt.id} onClick={() => handleKnowledgeSelect(opt.id)}
                                    className="btn-push"
                                    style={{
                                        padding: '20px', borderRadius: '20px',
                                        background: 'white', border: 'none',
                                        boxShadow: '0 5px 0 #bdc3c7',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                        minWidth: '100px'
                                    }}>
                                    <span style={{ fontSize: '3rem' }}>{opt.icon}</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STAGE 5: CODING */}
                {stage === 5 && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>{t('l28_skill_task')}</h3>

                        {/* Grid */}
                        <div style={{
                            flex: '0 0 auto', // Don't grow too much
                            background: '#ecf0f1', borderRadius: '15px', margin: '0 auto',
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)',
                            gap: '5px', padding: '10px',
                            width: '100%', maxWidth: '300px',
                            height: 'auto', aspectRatio: '3/2',
                            marginBottom: '20px' // Increased space below to prevent overlap
                        }}>
                            {/* Cells */}
                            {[0, 1, 2, 3, 4, 5].map(i => {
                                const x = i % 3;
                                const y = Math.floor(i / 3);
                                const isGoal = (x === 2 && y === 1);
                                return (
                                    <div key={i} style={{
                                        background: 'white', borderRadius: '10px', border: '2px solid #bdc3c7',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        fontSize: '1.2rem', position: 'relative', overflow: 'hidden'
                                    }}>
                                        {isGoal && '🎁'}
                                        {/* Hero & Arrow Side-by-Side (or Overlay without cover) */}
                                        {heroPos.x === x && heroPos.y === y && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                width: '100%', height: '100%'
                                            }}>
                                                <span style={{ fontSize: '1.5rem', zIndex: 10 }}>🦸</span>
                                                {/* Arrow Indicator - Separate, small, next to hero? */}
                                                {/* User asked for Left/Right placement */}
                                                <div style={{
                                                    marginLeft: '-5px', // Overlap slightly or just next to it
                                                    transform: `rotate(${(heroPos.dir - 1) * 90}deg)`,
                                                    transition: 'transform 0.3s',
                                                    fontSize: '1rem', color: '#2ecc71', fontWeight: 'bold', zIndex: 5
                                                }}>
                                                    ➤
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Control Bar */}
                        <div style={{ marginTop: 'auto', width: '100%', padding: '5px', boxSizing: 'border-box' }}>
                            {/* Program Display Bar */}
                            <div style={{
                                background: '#34495e', borderRadius: '10px', padding: '10px',
                                minHeight: '40px', display: 'flex', alignItems: 'center', gap: '10px',
                                marginBottom: '10px', color: 'white', fontSize: '1rem',
                                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)', overflowX: 'auto',
                                whiteSpace: 'nowrap'
                            }}>
                                <span style={{ fontWeight: 'bold', flexShrink: 0 }}>{t('l26_prog')}:</span>
                                {program.length === 0 ? (
                                    <span style={{ color: '#95a5a6', fontStyle: 'italic', fontSize: '0.9rem' }}>{t('l26_empty')}</span>
                                ) : (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {program.map((c, i) => (
                                            <div key={i} style={{
                                                padding: '2px 8px', background: '#f1c40f', borderRadius: '5px',
                                                color: '#2c3e50', fontWeight: 'bold', display: 'flex', alignItems: 'center', fontSize: '0.9rem'
                                            }}>
                                                {c.icon}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Buttons Area */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                {/* Top Row: Commands & Undo */}
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {/* Forward - Clearer Icon */}
                                    <button className="btn-push" onClick={() => addToProgram(COMMANDS[0])} disabled={isRun}
                                        style={{ background: '#5dade2', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', border: 'none', boxShadow: '0 3px 0 #2980b9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>{COMMANDS[0].icon}</span> {t('l26_cmd_f')}
                                    </button>
                                    {/* Left */}
                                    <button className="btn-push" onClick={() => addToProgram(COMMANDS[2])} disabled={isRun}
                                        style={{ background: '#5dade2', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', border: 'none', boxShadow: '0 3px 0 #2980b9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>{COMMANDS[2].icon}</span> {t('l26_cmd_l')}
                                    </button>
                                    {/* Right */}
                                    <button className="btn-push" onClick={() => addToProgram(COMMANDS[1])} disabled={isRun}
                                        style={{ background: '#5dade2', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', border: 'none', boxShadow: '0 3px 0 #2980b9', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span>{COMMANDS[1].icon}</span> {t('l26_cmd_r')}
                                    </button>
                                    {/* Backspace/Undo */}
                                    <button className="btn-push" onClick={() => setProgram(p => p.slice(0, -1))} disabled={isRun || program.length === 0}
                                        style={{ background: '#f39c12', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.9rem', border: 'none', boxShadow: '0 3px 0 #d35400' }}>
                                        ⬅ {t('l28_btn_undo')}
                                    </button>
                                </div>

                                {/* Bottom Row: Clear & Run */}
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '100%' }}>
                                    {/* Clear */}
                                    <button className="btn-push" onClick={() => setProgram([])} disabled={isRun || program.length === 0}
                                        style={{ background: '#e74c3c', color: 'white', padding: '6px 30px', borderRadius: '10px', fontSize: '1rem', border: 'none', boxShadow: '0 3px 0 #c0392b' }}>
                                        {t('l18_btn_clear')}
                                    </button>
                                    {/* Run */}
                                    <button className="btn-push" onClick={runCode} disabled={isRun || program.length === 0}
                                        style={{ background: '#2ecc71', color: 'white', padding: '6px 30px', borderRadius: '10px', fontSize: '1rem', border: 'none', boxShadow: '0 3px 0 #27ae60' }}>
                                        {t('l26_run')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(255,255,255,0.98)', display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', zIndex: 100
                    }}
                        onClick={() => { if (feedback.status === 'wrong') setFeedback(null); }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                            {feedback.status === 'correct' ? '🏆' : '⚠️'}
                        </div>
                        <h2 style={{ color: feedback.status === 'correct' ? '#f1c40f' : '#e74c3c', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {feedback.message}
                        </h2>
                        {feedback.status === 'wrong' && <div style={{ marginTop: '20px', color: '#95a5a6' }}>{t('game_retry')}</div>}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Level28_FinalExamLevel;
