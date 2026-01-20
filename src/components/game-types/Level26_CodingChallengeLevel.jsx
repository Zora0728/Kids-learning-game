import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';

const Level26_CodingChallengeLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    // --- Configuration ---
    const GRID_SIZE = 8;
    const LEVELS = [
        {
            id: 1, title: t('l26_lvl_1'),
            start: { x: 1, y: 1 }, dir: 1, // 0:Up, 1:Right, 2:Down, 3:Left
            goal: { x: 6, y: 1 },
            walls: [],
            limit: 10
        },
        {
            id: 2, title: t('l26_lvl_2'),
            start: { x: 1, y: 1 }, dir: 1,
            goal: { x: 6, y: 6 },
            walls: [
                { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
                { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 } // L-shape barrier
            ],
            limit: 15
        },
        {
            id: 3, title: t('l26_lvl_3'),
            start: { x: 1, y: 4 }, dir: 1,
            goal: { x: 7, y: 4 },
            walls: [
                { x: 3, y: 4 }, { x: 5, y: 4 } // Jump over these
            ],
            limit: 15
        }
    ];

    // --- State ---
    const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
    const [program, setProgram] = useState([]); // List of commands
    const [player, setPlayer] = useState({ x: 0, y: 0, dir: 1 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [executionStep, setExecutionStep] = useState(-1); // Which command is running
    const [message, setMessage] = useState(null);
    const [mistakes, setMistakes] = useState(0);

    const levelConfig = LEVELS[currentLevelIdx];

    // --- Init ---
    useEffect(() => {
        resetLevel();
    }, [currentLevelIdx]);

    const resetLevel = () => {
        setPlayer({ ...levelConfig.start, dir: levelConfig.dir });
        setProgram([]);
        setIsPlaying(false);
        setExecutionStep(-1);
        setMessage(null);
    };

    // --- Logic ---
    const COMMANDS = [
        { id: 'F', label: t('l26_cmd_f'), icon: '⬆️' },
        { id: 'L', label: t('l26_cmd_l'), icon: '↺' },
        { id: 'R', label: t('l26_cmd_r'), icon: '↻' },
        { id: 'J', label: t('l26_cmd_j'), icon: '🦘' },
    ];

    const addToProgram = (cmd) => {
        if (isPlaying) return;
        if (program.length < levelConfig.limit) {
            setProgram([...program, cmd]);
        } else {
            showMessage('commands full', t('l26_hint_full'));
        }
    };

    const removeFromProgram = (idx) => {
        if (isPlaying) return;
        setProgram(program.filter((_, i) => i !== idx));
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 1500);
    };

    const runProgram = async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setPlayer({ ...levelConfig.start, dir: levelConfig.dir }); // Reset pos
        setExecutionStep(-1);

        // Wait a bit before start
        await new Promise(r => setTimeout(r, 500));

        let currentP = { ...levelConfig.start, dir: levelConfig.dir };

        for (let i = 0; i < program.length; i++) {
            setExecutionStep(i);
            const cmd = program[i];

            // Execute Logic
            if (cmd.id === 'F') {
                const forward = getNextPos(currentP.x, currentP.y, currentP.dir);
                if (isValidMove(forward)) {
                    currentP.x = forward.x;
                    currentP.y = forward.y;
                } else {
                    currentP.bump = true; // Visual bump
                }
            } else if (cmd.id === 'L') {
                currentP.dir = (currentP.dir + 3) % 4;
            } else if (cmd.id === 'R') {
                currentP.dir = (currentP.dir + 1) % 4;
            } else if (cmd.id === 'J') {
                const step1 = getNextPos(currentP.x, currentP.y, currentP.dir);
                const step2 = getNextPos(step1.x, step1.y, currentP.dir);
                // Only valid if landing spot (step2) is valid AND within bounds
                // Jumping over a wall is OK, jumping INTO a wall is OK? Typically Jump lands 2 steps ahead.
                // Let's say Jump skips 1 tile.
                if (isWithinBounds(step2)) {
                    // Check landing spot for wall? Usually Jump can jump OVER walls.
                    // But cannot land ON wall.
                    if (!isWall(step2)) {
                        currentP.x = step2.x;
                        currentP.y = step2.y;
                    }
                }
            }

            setPlayer({ ...currentP, bump: false }); // Remove visual bump flag quickly?
            if (currentP.bump) {
                // Shake effect?
                showMessage('wrong', t('l26_hint_wall'));
                setMistakes(prev => prev + 1);
                setIsPlaying(false);
                return;
            }

            await new Promise(r => setTimeout(r, 800)); // Delay between steps

            // Check Win
            if (currentP.x === levelConfig.goal.x && currentP.y === levelConfig.goal.y) {
                handleWin();
                return;
            }
        }

        setIsPlaying(false);
        showMessage('wrong', t('l26_hint_fail'));
        setMistakes(prev => prev + 1);
    };

    const getNextPos = (x, y, dir) => {
        const d = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // U, R, D, L
        return { x: x + d[dir][0], y: y + d[dir][1] };
    };

    const isWithinBounds = (p) => {
        return p.x >= 0 && p.x < GRID_SIZE && p.y >= 0 && p.y < GRID_SIZE;
    };

    const isWall = (p) => {
        return levelConfig.walls.some(w => w.x === p.x && w.y === p.y);
    };

    const isValidMove = (p) => {
        return isWithinBounds(p) && !isWall(p);
    };

    const [levelScores, setLevelScores] = useState([]);

    const handleWin = () => {
        showMessage('correct', t('l26_hint_win'));

        // Calculate stars for this round
        let roundStars = 3;
        if (mistakes > 0) roundStars = 2; // 1 attempt = 3, 2nd attempt (1 mistake) = 2
        if (mistakes >= 2) roundStars = 1; // 3rd attempt+ = 1

        const newScores = [...levelScores, roundStars];
        setLevelScores(newScores);

        setTimeout(() => {
            if (currentLevelIdx < LEVELS.length - 1) {
                setCurrentLevelIdx(prev => prev + 1);
                setMistakes(0); // Reset for next round
            } else {
                // Average Score
                const total = newScores.reduce((a, b) => a + b, 0);
                const avg = Math.round(total / LEVELS.length);
                onComplete(avg);
            }
        }, 1500);
    };

    // --- Render Helpers ---
    const getRotation = (dir) => {
        return dir * 90; // 0->0, 1->90, etc.
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '900px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)',
            touchAction: 'none'
        }}>
            {/* Header */}
            {/* Header - Card Style with Inline Reset */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', width: '100%', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto', background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '5px 15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap' }}>

                    {/* Title */}
                    <div style={{ flexShrink: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: '#7f8c8d', fontWeight: 'bold' }}>LEVEL 26</div>
                        <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: 'bold' }}>{t('l26_title')}</div>
                    </div>

                    <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>

                    {/* Progress */}
                    <div style={{ fontSize: '0.9rem', color: '#1565C0', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {currentLevelIdx + 1}/{LEVELS.length}
                    </div>

                    {/* Errors */}
                    <div style={{ padding: '2px 6px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Err:{mistakes}
                    </div>

                    <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>

                    {/* Reset Button - Inline and Wider */}
                    <button className="btn-secondary" onClick={resetLevel} disabled={isPlaying}
                        style={{ padding: '4px 8px', borderRadius: '15px', fontSize: '0.8rem', opacity: 0.8, minWidth: '70px', whiteSpace: 'nowrap' }}>
                        {t('l26_reset')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px', overflow: 'hidden' }}>
                {/* 1. Game Board */}
                <div style={{
                    flex: 2, background: '#ecf0f1', borderRadius: '15px',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                    gap: '2px', padding: '10px', position: 'relative'
                }}>
                    {/* Grid Cells */}
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const isW = isWall({ x, y });
                        const isG = levelConfig.goal.x === x && levelConfig.goal.y === y;
                        return (
                            <div key={i} style={{
                                background: isW ? '#7f8c8d' : '#bdc3c7',
                                borderRadius: '5px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '1.5rem',
                                boxShadow: isW ? 'inset 0 0 10px rgba(0,0,0,0.2)' : 'none'
                            }}>
                                {isG && '🚩'}
                                {isW && '🧱'}
                            </div>
                        );
                    })}

                    {/* Player */}
                    <div style={{
                        position: 'absolute',
                        left: `calc(10px + ${player.x} * ((100% - 20px) / ${GRID_SIZE}))`,
                        top: `calc(10px + ${player.y} * ((100% - 20px) / ${GRID_SIZE}))`,
                        width: `calc((100% - 20px) / ${GRID_SIZE})`,
                        height: `calc((100% - 20px) / ${GRID_SIZE})`,
                        transition: 'all 0.5s ease-in-out',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 10
                    }}>
                        <div style={{
                            width: '80%', height: '80%',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontSize: '2rem',
                            transform: `rotate(${getRotation(player.dir)}deg)`,
                            transition: 'transform 0.5s',
                            filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))'
                        }}>
                            🤖
                        </div>
                    </div>

                    {/* Feedback Overlay */}
                    {message && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'rgba(255,255,255,0.95)', padding: '15px 30px', borderRadius: '20px',
                            boxShadow: '0 5px 20px rgba(0,0,0,0.2)', zIndex: 20, textAlign: 'center',
                            color: message.type === 'wrong' ? '#e74c3c' : '#2ecc71', fontWeight: 'bold'
                        }}>
                            {message.type === 'correct' ? '🎉' : message.type === 'wrong' ? '❌' : 'ℹ️'} {message.text}
                        </div>
                    )}
                </div>

                {/* 2. Control Panel (Bottom Bar - Styled like Level 18) */}
                <div style={{
                    marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '10px',
                    flexShrink: 0
                }}>
                    {/* Program Sequence Bar */}
                    <div style={{
                        height: '60px', background: '#34495e', borderRadius: '12px', padding: '5px 15px',
                        display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto',
                        border: '3px solid #2c3e50', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        <span style={{ color: '#ecf0f1', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '5px' }}>
                            {t('l26_prog')} ({program.length}/{levelConfig.limit}):
                        </span>
                        {program.map((cmd, i) => (
                            <div key={i} style={{
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', background: executionStep === i ? '#fff' : '#f1c40f',
                                borderRadius: '8px', border: executionStep === i ? '3px solid #f1c40f' : '2px solid #f39c12',
                                fontSize: '1.4rem', flexShrink: 0,
                                boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                                transition: 'all 0.2s',
                                transform: executionStep === i ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                {cmd.icon}
                                {!isPlaying && (
                                    <div onClick={(e) => { e.stopPropagation(); removeFromProgram(i); }}
                                        style={{
                                            position: 'absolute', top: -5, right: -5,
                                            width: '18px', height: '18px', borderRadius: '50%',
                                            background: '#e74c3c', color: 'white',
                                            fontSize: '0.7rem', fontWeight: 'bold',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                            cursor: 'pointer', border: '1px solid white'
                                        }}
                                    >×</div>
                                )}
                            </div>
                        ))}
                        {program.length === 0 && <span style={{ color: '#95a5a6', fontSize: '0.9rem' }}>{t('l26_empty')}</span>}
                    </div>

                    {/* Controls Toolbox */}
                    <div style={{
                        background: 'white', borderRadius: '15px', padding: '10px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap'
                    }}>
                        {/* Commands */}
                        {COMMANDS.map(cmd => (
                            <button key={cmd.id}
                                onClick={() => addToProgram(cmd)}
                                disabled={isPlaying}
                                title={cmd.label}
                                className="btn-push" // Assuming generic push button class or style below
                                style={{
                                    padding: '10px 20px', fontSize: '1rem', borderRadius: '12px',
                                    border: 'none', background: '#3498db', color: 'white',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 0 #2980b9', transition: 'all 0.1s',
                                    opacity: isPlaying ? 0.7 : 1
                                }}
                                onMouseDown={e => !isPlaying && (e.currentTarget.style.transform = 'translateY(4px)', e.currentTarget.style.boxShadow = '0 0 0 #2980b9')}
                                onMouseUp={e => !isPlaying && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 0 #2980b9')}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{cmd.icon}</span>
                                <span style={{ fontWeight: 'bold' }}>{cmd.label}</span>
                            </button>
                        ))}

                        <div style={{ width: '1px', height: '40px', background: '#eee', margin: '0 10px' }}></div>

                        {/* Actions */}
                        <button
                            onClick={runProgram}
                            disabled={isPlaying || program.length === 0}
                            style={{
                                padding: '10px 30px', fontSize: '1.2rem', borderRadius: '30px',
                                border: 'none', background: '#2ecc71', color: 'white',
                                display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold',
                                cursor: (isPlaying || program.length === 0) ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 0 #27ae60', transition: 'all 0.1s',
                                opacity: (isPlaying || program.length === 0) ? 0.7 : 1
                            }}
                            onMouseDown={e => !isPlaying && (e.currentTarget.style.transform = 'translateY(4px)', e.currentTarget.style.boxShadow = '0 0 0 #27ae60')}
                            onMouseUp={e => !isPlaying && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 0 #27ae60')}
                        >
                            {isPlaying ? t('l26_running') : t('l26_run')}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes pulse { 0% { background: #fff3cd; } 50% { background: #ffeeba; } 100% { background: #fff3cd; } }`}</style>
        </div>
    );
};

export default Level26_CodingChallengeLevel;
