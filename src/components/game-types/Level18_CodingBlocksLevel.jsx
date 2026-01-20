import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level18_CodingBlocksLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // 3 Stages: 1=Straight, 2=Turn, 3=Obstacle
    const [stage, setStage] = useState(1);
    const [mistakes, setMistakes] = useState(0);
    const [program, setProgram] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [showHelp, setShowHelp] = useState(true);
    const [feedback, setFeedback] = useState(null); // { status, message }
    const [robot, setRobot] = useState({ x: 0, y: 0, dir: 1 }); // dir: 0=N, 1=E, 2=S, 3=W

    // Grid Config (5x5)
    // 0=Empty, 1=Wall, 2=Start, 3=Goal
    const MAPS = {
        1: [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [2, 0, 0, 3, 0], // Straight line to right
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        2: [
            [0, 0, 3, 0, 0],
            [0, 0, 0, 0, 0], // Turn Up
            [2, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ],
        3: [
            [0, 0, 3, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0], // Obstacle
            [2, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ]
    };

    const INITIAL_POS = {
        1: { x: 0, y: 2, dir: 1 },
        2: { x: 0, y: 2, dir: 1 },
        3: { x: 0, y: 3, dir: 1 }
    };

    useEffect(() => {
        resetRobot();
    }, [stage]);

    const resetRobot = () => {
        setRobot({ ...INITIAL_POS[stage] });
        setIsRunning(false);
    };

    // Commands
    const COMMANDS = [
        { id: 'fwd', name: t.l18_cmd_fwd, icon: '⬆️' },
        { id: 'left', name: t.l18_cmd_left, icon: '↺' },
        { id: 'right', name: t.l18_cmd_right, icon: '↻' },
    ];

    const addToProgram = (cmd) => {
        if (!isRunning && program.length < 10) {
            setProgram([...program, cmd]);
        }
    };

    const runProgram = async () => {
        if (program.length === 0) return;
        setIsRunning(true);
        resetRobot(); // Start from clean state

        let currentRobot = { ...INITIAL_POS[stage] };
        let failed = false;

        // Visual delay for reset
        await new Promise(r => setTimeout(r, 500));

        for (let i = 0; i < program.length; i++) {
            const cmd = program[i];

            // Execute Step
            if (cmd.id === 'fwd') {
                let dx = 0, dy = 0;
                if (currentRobot.dir === 0) dy = -1; // N
                if (currentRobot.dir === 1) dx = 1;  // E
                if (currentRobot.dir === 2) dy = 1;  // S
                if (currentRobot.dir === 3) dx = -1; // W

                const nx = currentRobot.x + dx;
                const ny = currentRobot.y + dy;

                // Check bounds & content
                if (nx < 0 || nx >= 5 || ny < 0 || ny >= 5 || MAPS[stage][ny][nx] === 1) {
                    failed = true; // Bonk!
                } else {
                    currentRobot.x = nx;
                    currentRobot.y = ny;
                }
            } else if (cmd.id === 'left') {
                currentRobot.dir = (currentRobot.dir + 3) % 4;
            } else if (cmd.id === 'right') {
                currentRobot.dir = (currentRobot.dir + 1) % 4;
            }

            setRobot({ ...currentRobot });

            if (failed) break;

            // Check Goal
            if (MAPS[stage][currentRobot.y][currentRobot.x] === 3) {
                // Goal Reached!
                setFeedback({ status: 'correct', message: t.l18_success });
                await new Promise(r => setTimeout(r, 1000));

                if (stage < 3) {
                    setStage(s => s + 1);
                    setProgram([]);
                    setFeedback(null);
                    return;
                } else {
                    handleComplete(currentRobot.x, currentRobot.y);
                    return;
                }
            }

            await new Promise(r => setTimeout(r, 600)); // Step delay
        }

        // End of program
        setIsRunning(false);
        if (!failed && MAPS[stage][currentRobot.y][currentRobot.x] !== 3) {
            // Did not reach goal
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t.l18_fail_path });
        } else if (failed) {
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t.l18_fail_wall });
        }
    };

    const handleComplete = (x, y) => {
        // Use passed coordinates or fallback to state (safety)
        const checkX = x !== undefined ? x : robot.x;
        const checkY = y !== undefined ? y : robot.y;

        // Double check we are actually at the goal to prevent any weird state auto-wins
        const currentMap = MAPS[stage];
        const isAtGoal = currentMap[checkY][checkX] === 3;

        // If stage is 3 and we are at goal, call onComplete
        if (isAtGoal) {
            let stars = 3;
            if (mistakes > 2) stars = 2;
            if (mistakes > 5) stars = 1;
            onComplete(stars);
        }
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Consistent Header with Level 17 */}
            {/* Header - Card Style */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
                {levelNumber && (
                    <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        LEVEL {levelNumber}
                    </div>
                )}
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '30px', padding: '10px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '280px'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.8rem' }}>{t.l18_title}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t.l18_desc.replace('{stage}', stage)}</p>
                </div>
                <div style={{
                    marginTop: '10px', display: 'flex', gap: '10px'
                }}>
                    <div style={{ padding: '5px 15px', background: '#E3F2FD', color: '#1565C0', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t.l18_progress.replace('{current}', stage).replace('{total}', 3)}
                    </div>
                    <div style={{ padding: '5px 15px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t.game_mistakes.replace('{count}', mistakes)}
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div style={{
                flex: 1, display: 'flex', gap: '10px', overflow: 'hidden',
                maxHeight: '55%' // Reduced max-height
            }}>
                <div style={{
                    flex: 1, background: '#ecf0f1', borderRadius: '15px',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)',
                    padding: '10px', gap: '5px', position: 'relative'
                }}>
                    {MAPS[stage].map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`} style={{
                            background: cell === 1 ? '#7f8c8d' : '#fff',
                            borderRadius: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            border: '1px solid #bdc3c7', position: 'relative'
                        }}>
                            {cell === 2 && <span style={{ opacity: 0.3 }}>🏁</span>}
                            {cell === 3 && <span style={{ fontSize: '2rem' }}>⚡</span>}
                            {/* Robot Overlay */}
                            {robot.x === x && robot.y === y && (
                                <div style={{
                                    fontSize: '2rem',
                                    transform: `rotate(${robot.dir * 90}deg)`,
                                    transition: 'all 0.5s'
                                }}>🤖</div>
                            )}
                        </div>
                    )))}

                    {/* Feedback / Retry Overlay */}
                    {feedback && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(255,255,255,0.9)', borderRadius: '15px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            zIndex: 20
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px', color: feedback.status === 'correct' ? '#27ae60' : '#c0392b' }}>
                                {feedback.message}
                            </div>
                            {feedback.status === 'wrong' && (
                                <button className="btn-primary" onClick={() => { setFeedback(null); resetRobot(); }}>
                                    {t.game_retry}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Controls */}
            <div style={{
                flex: 1, marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '5px',
                overflow: 'hidden'
            }}>
                {/* Program Sequence (Shrunk) */}
                <div style={{
                    height: '60px', background: '#34495e', borderRadius: '10px', padding: '5px 10px',
                    display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto',
                    border: '3px solid #2c3e50', flexShrink: 0
                }}>
                    <span style={{ color: 'white', fontWeight: 'bold', marginRight: '5px', fontSize: '0.9rem' }}>{t.l18_program}</span>
                    {program.map((cmd, idx) => (
                        <div key={idx} style={{
                            padding: '3px 8px', background: '#f1c40f', borderRadius: '4px',
                            fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap',
                            border: '1px solid #f39c12'
                        }}>
                            {cmd.icon}
                        </div>
                    ))}
                    {program.length === 0 && <span style={{ color: '#95a5a6', fontSize: '0.8rem' }}>{t.l18_hint}</span>}
                </div>

                {/* Toolbox Buttons */}
                <div style={{
                    display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center',
                    padding: '10px', background: '#fff', borderRadius: '15px', flexWrap: 'wrap'
                }}>
                    {COMMANDS.map(cmd => (
                        <button key={cmd.id}
                            onClick={() => addToProgram(cmd)}
                            disabled={isRunning}
                            className="btn-glass"
                            style={{
                                padding: '8px 15px', fontSize: '0.9rem',
                                background: '#3498db', color: 'white',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                        >
                            {cmd.icon} {cmd.name}
                        </button>
                    ))}

                    <div style={{ width: '10px' }}></div>

                    <button onClick={() => setProgram(p => p.slice(0, -1))} className="btn-glass" style={{ background: '#f39c12', padding: '8px 12px' }} disabled={isRunning || program.length === 0}>
                        {t.l18_btn_back}
                    </button>
                    <button onClick={() => setProgram([])} className="btn-glass" style={{ background: '#e74c3c', padding: '8px 12px' }} disabled={isRunning}>
                        {t.l18_btn_clear}
                    </button>
                    <button onClick={runProgram} className="btn-glass" style={{ background: '#2ecc71', padding: '8px 20px' }} disabled={isRunning || program.length === 0}>
                        {t.l18_btn_run}
                    </button>
                </div>
            </div>

            {/* Help Modal */}
            {stage === 1 && showHelp && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'white', padding: '20px', borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 50,
                    width: '85%', textAlign: 'center', border: '5px solid #3498db'
                }}>
                    <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎮 {t.game_help_title}</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>👆</div>
                            <div style={{ background: '#3498db', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l18_step1}</div>
                        </div>
                        <div style={{ fontSize: '2rem', color: '#ccc' }}>➡</div>

                        {/* Step 2 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px', color: '#2ecc71' }}>▶</div>
                            <div style={{ background: '#2ecc71', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l18_step2}</div>
                        </div>
                        <div style={{ fontSize: '2rem', color: '#ccc' }}>➡</div>

                        {/* Step 3 */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>🤖⚡</div>
                            <div style={{ background: '#f1c40f', color: '#333', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l18_step3}</div>
                        </div>
                    </div>

                    <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '10px 30px' }} onClick={() => setShowHelp(false)}>
                        {t.l18_start}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Level18_CodingBlocksLevel;
