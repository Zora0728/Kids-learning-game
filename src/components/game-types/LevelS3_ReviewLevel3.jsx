import { useState, useEffect } from 'react';
import '../../App.css';
import { useTranslation } from 'react-i18next';

const LevelS3_ReviewLevel3 = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    // 3 Stages: 0=Logic Lock, 1=Robot Coding, 2=Reward Assembly
    const [stage, setStage] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState(null);

    // --- Stage 0: Logic Lock (Equations) ---
    // Puzzle 1: x + 5 = 12, y - 3 = 4. Code = xy (77)
    // Puzzle 2: 2 x A = 16, B + 1 = 5. Code = AB (84)
    const [lockInput, setLockInput] = useState("");
    const [puzzleIndex, setPuzzleIndex] = useState(0);

    const PUZZLES = [
        {
            lines: ["A + 5 = 12", "B - 3 = 4", `${t('l18_program')} AB`],
            answer: "77"
        },
        {
            lines: ["2 x A = 16", "B + 1 = 5", `${t('l18_program')} AB`],
            answer: "84"
        }
    ];

    // --- Stage 1: Robot (Simplified Coding Blocks) ---
    // Grid 4x4. Start (0,0), Key (3,3). Obstacles (1,1), (2,2)
    const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
    const [program, setProgram] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    // --- Stage 2: Reward (Shadow Match) ---
    const [chestOpen, setChestOpen] = useState(false);

    // --- Handlers ---

    // Stage 0
    const handleNumClick = (n) => {
        if (lockInput.length < 2) setLockInput(prev => prev + n);
    };
    const handleClear = () => setLockInput("");
    const handleCheckLock = () => {
        const currentP = PUZZLES[puzzleIndex];
        if (lockInput === currentP.answer) {
            setFeedback({ status: 'correct', message: t('ls3_feedback_correct') });
            setTimeout(() => {
                setFeedback(null);
                setLockInput("");
                if (puzzleIndex < PUZZLES.length - 1) {
                    setPuzzleIndex(prev => prev + 1);
                } else {
                    setStage(1);
                }
            }, 1000);
        } else {
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t('ls3_feedback_wrong') });
            setLockInput("");
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    // Stage 1
    const addToProgram = (cmd) => {
        if (program.length < 8 && !isRunning) setProgram([...program, cmd]);
    };

    const runProgram = async () => {
        setIsRunning(true);
        let current = { x: 0, y: 0 };
        // Reset
        setRobotPos(current);
        await new Promise(r => setTimeout(r, 500));

        let failed = false;

        for (let cmd of program) {
            let next = { ...current };
            if (cmd === 'R') next.x++;
            if (cmd === 'D') next.y++;
            if (cmd === 'L') next.x--;
            if (cmd === 'U') next.y--;

            // Bounds & Obstacles (Simple diagonal walls)
            if (next.x < 0 || next.x > 3 || next.y < 0 || next.y > 3 ||
                (next.x === 1 && next.y === 1) || (next.x === 2 && next.y === 2)) {
                failed = true;
                break;
            }
            current = next;
            setRobotPos(current);
            await new Promise(r => setTimeout(r, 600));
        }

        setIsRunning(false);

        if (!failed && current.x === 3 && current.y === 3) {
            setFeedback({ status: 'correct', message: t('ls3_key_got') });
            setTimeout(() => {
                setFeedback(null);
                setStage(2);
            }, 1000);
        } else {
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t('ls3_fail') });
            setRobotPos({ x: 0, y: 0 }); // Reset visual
        }
    };

    // Stage 2
    const handleOpenChest = () => {
        setChestOpen(true);
        setTimeout(handleComplete, 2000);
    };

    const handleComplete = () => {
        let stars = 3;
        if (mistakes > 2) stars = 2;
        if (mistakes > 5) stars = 1;
        onComplete(stars);
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px',
                background: 'rgba(255,255,255,0.95)', padding: '10px 15px', borderRadius: '15px',
                marginBottom: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                flexShrink: 0, width: '100%', boxSizing: 'border-box'
            }}>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>
                    {stage === 0 ? t('ls3_lock_title') : stage === 1 ? t('ls3_robot_title') : t('ls3_chest_title')}
                </h2>
                <div style={{ padding: '3px 8px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {t('game_mistakes').replace('{count}', mistakes)}
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1, background: '#fff', borderRadius: '20px', padding: '20px',
                position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center'
            }}>

                {/* --- STAGE 0: LOCK --- */}
                {stage === 0 && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                            {PUZZLES[puzzleIndex].lines.map((text, i) => (
                                <div key={i} style={i === 2 ? { marginTop: '10px', color: '#e67e22' } : {}}>{text}</div>
                            ))}
                        </div>

                        {/* Display */}
                        <div style={{
                            background: '#333', color: '#0f0', fontFamily: 'monospace', fontSize: '2.5rem',
                            padding: '10px 30px', borderRadius: '10px', marginBottom: '20px', display: 'inline-block',
                            width: '100px', height: '40px', lineHeight: '40px'
                        }}>
                            {lockInput || "_ _"}
                        </div>

                        {/* Keypad */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '250px', margin: '0 auto' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                                <button key={n} onClick={() => handleNumClick(n.toString())} className="btn-secondary" style={{ fontSize: '1.5rem', padding: '10px' }}>
                                    {n}
                                </button>
                            ))}
                            <button onClick={handleClear} className="btn-secondary" style={{ background: '#e74c3c', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>C</button>
                            <button onClick={handleCheckLock} className="btn-secondary" style={{ background: '#2ecc71', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>OK</button>
                        </div>
                    </div>
                )}

                {/* --- STAGE 1: ROBOT --- */}
                {stage === 1 && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* Grid */}
                        <div style={{
                            flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)',
                            gap: '5px', maxWidth: '350px', margin: '0 auto', width: '100%'
                        }}>
                            {[...Array(16)].map((_, i) => {
                                const x = i % 4;
                                const y = Math.floor(i / 4);
                                const isWall = (x === 1 && y === 1) || (x === 2 && y === 2);
                                const isKey = (x === 3 && y === 3);
                                return (
                                    <div key={i} style={{
                                        background: isWall ? '#7f8c8d' : '#ecf0f1', borderRadius: '8px',
                                        position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                    }}>
                                        {isKey && <div style={{ fontSize: '2rem' }}>🗝️</div>}
                                        {robotPos.x === x && robotPos.y === y && (
                                            <div style={{ fontSize: '2rem', transition: 'all 0.5s' }}>🤖</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Controls */}
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ background: '#34495e', padding: '10px', borderRadius: '10px', color: 'white', minHeight: '30px', display: 'flex', gap: '5px', overflowX: 'auto' }}>
                                {program.map((c, i) => <span key={i} style={{ background: '#f1c40f', padding: '2px 6px', borderRadius: '4px', color: '#333' }}>{c}</span>)}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                                <button onClick={() => addToProgram('U')} className="btn-glass" disabled={isRunning} style={{ fontSize: '1.5rem', padding: '5px 15px' }}>▲</button>
                                <button onClick={() => addToProgram('D')} className="btn-glass" disabled={isRunning} style={{ fontSize: '1.5rem', padding: '5px 15px' }}>▼</button>
                                <button onClick={() => addToProgram('L')} className="btn-glass" disabled={isRunning} style={{ fontSize: '1.5rem', padding: '5px 15px' }}>◀</button>
                                <button onClick={() => addToProgram('R')} className="btn-glass" disabled={isRunning} style={{ fontSize: '1.5rem', padding: '5px 15px' }}>▶</button>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px' }}>
                                <button onClick={() => setProgram([])} className="btn-glass" style={{ background: '#e74c3c', width: '80px' }} disabled={isRunning}>🗑️</button>
                                <button onClick={runProgram} className="btn-glass" style={{ background: '#2ecc71', width: '80px' }} disabled={isRunning}>▶</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STAGE 2: TREASURE --- */}
                {stage === 2 && (
                    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={handleOpenChest}>
                        {chestOpen ? (
                            <div style={{ animation: 'popIn 0.5s' }}>
                                <div style={{ fontSize: '8rem' }}>💎</div>
                                <h2>{t('ls3_chest_win')}</h2>
                            </div>
                        ) : (
                            <div style={{ animation: 'bounce 2s infinite' }}>
                                <div style={{ fontSize: '8rem' }}>🎁</div>
                                <h2>{t('ls3_chest_open')}</h2>
                            </div>
                        )}
                        <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`}</style>
                    </div>
                )}

                {/* Feedback */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px 40px', borderRadius: '30px',
                        fontSize: '1.2rem', zIndex: 100
                    }}>
                        {feedback.message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LevelS3_ReviewLevel3;
