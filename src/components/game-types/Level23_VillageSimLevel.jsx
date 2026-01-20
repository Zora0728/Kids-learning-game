import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';

const Level23_VillageSimLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();

    // --- State ---
    const [mistakes, setMistakes] = useState(0);
    const [score, setScore] = useState(0);
    const [requests, setRequests] = useState([]); // Active villager requests
    const [villageLevel, setVillageLevel] = useState(1); // Visual growth
    const [feedback, setFeedback] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);

    // Resources
    const RESOURCES = [
        { id: 'wood', icon: '🪵', label: t('l23_wood'), color: '#e67n22' },
        { id: 'food', icon: '🍎', label: t('l23_food'), color: '#ff7675' },
        { id: 'stone', icon: '🪨', label: t('l23_stone'), color: '#b2bec3' }
    ];

    const TARGET_SCORE = 15; // Goal to win

    // --- Game Loop (Spawning) ---
    useEffect(() => {
        if (isGameOver) return;

        // Initial Spawn
        spawnRequest();

        const spawnInterval = setInterval(() => {
            if (requests.length < 3) { // Max 3 active checks
                spawnRequest();
            }
        }, 3000); // Slower spawn rate (3s) to be less chaotic

        return () => clearInterval(spawnInterval);
    }, [isGameOver]); // Removed requests dependency to avoid rapid re-triggering loops

    const spawnRequest = () => {
        setRequests(prev => {
            if (prev.length >= 3) return prev;

            // Slot Logic: [20%, 50%, 80%]
            const SLOTS = [20, 50, 80];
            // Find occupied slots
            const occupied = prev.map(r => r.slotPos);
            // Find available
            const available = SLOTS.filter(s => !occupied.includes(s));

            if (available.length === 0) return prev;

            // Pick random available
            const xPos = available[Math.floor(Math.random() * available.length)];
            const type = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];

            const newReq = {
                id: Date.now() + Math.random(),
                type: type,
                timeLeft: 50,
                x: xPos,
                slotPos: xPos // Track slot
            };
            return [...prev, newReq];
        });
    };

    // --- Interaction ---
    const handleResourceClick = (resId) => {
        if (isGameOver) return;

        // Check if ANY villager wants this
        // Priority: Oldest request first (index 0)
        const targetReq = requests[0];

        if (!targetReq) return; // No one to help

        if (targetReq.type.id === resId) {
            // Correct!
            setScore(prev => prev + 1);
            setRequests(prev => prev.slice(1)); // Remove oldest
            showFeedback('correct', t('l23_thanks'));

            // Visual Progression
            if ((score + 1) % 5 === 0) {
                setVillageLevel(prev => Math.min(prev + 1, 4));
            }

            if (score + 1 >= TARGET_SCORE) {
                handleWin();
            }

        } else {
            // Wrong!
            setMistakes(prev => prev + 1);
            showFeedback('wrong', t('l23_wrong'));
        }
    };

    const showFeedback = (status, msg) => {
        setFeedback({ status, message: msg });
        setTimeout(() => setFeedback(null), 800);
    };

    const handleWin = () => {
        setIsGameOver(true);
        setTimeout(() => {
            let stars = 3;
            if (mistakes > 2) stars = 2;
            if (mistakes > 5) stars = 1;
            onComplete(stars);
        }, 1500);
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Instruction Modal */}
            {!isGameStarted && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={(e) => e.target === e.currentTarget && setIsGameStarted(true)}>
                    <div style={{
                        background: 'white', padding: '25px', borderRadius: '25px',
                        width: '80%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏰</div>
                        <h2 style={{ color: '#2c3e50', margin: '0 0 15px 0' }}>{t('l23_title')}</h2>
                        <ul style={{ textAlign: 'left', color: '#555', fontSize: '1.1rem', lineHeight: '1.6', paddingLeft: '20px', listStyleType: 'none', marginBottom: '20px' }}>
                            <li>{t('l23_instr_1')}</li>
                            <li>{t('l23_instr_2')}</li>
                            <li>{t('l23_instr_3')}</li>
                            <li>{t('l23_instr_4').replace('{target}', TARGET_SCORE)}</li>
                        </ul>
                        <button onClick={() => setIsGameStarted(true)}
                            style={{
                                background: '#2ecc71', color: 'white', border: 'none',
                                padding: '10px 40px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold',
                                cursor: 'pointer', boxShadow: '0 4px 0 #27ae60'
                            }}
                        >
                            {t('game_got_it')}
                        </button>
                    </div>
                </div>
            )}
            {/* Header */}
            {/* Header - Card Style */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '1.2rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL 23
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '30px', padding: '10px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '280px'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.8rem' }}>{t('l23_desc')}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t('l23_instr_4').replace('{target}', TARGET_SCORE)}</p>
                </div>
                <div style={{
                    marginTop: '10px', display: 'flex', gap: '10px'
                }}>
                    <div style={{ padding: '5px 15px', background: '#E3F2FD', color: '#1565C0', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t('l21_complete').replace('{current}', score).replace('{total}', TARGET_SCORE)}
                    </div>
                    <div style={{ padding: '5px 15px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t('l23_mistakes').replace('{count}', mistakes)}
                    </div>
                </div>
            </div>

            {/* Main Scene: Village */}
            <div style={{
                flex: 1, minHeight: '50vh', borderRadius: '20px', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 50%, #A8E6CF 50%, #56AB2F 100%)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)', marginBottom: '10px'
            }}>
                {/* Background Decor */}
                <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: '4rem', opacity: 0.8 }}>☁️</div>
                <div style={{ position: 'absolute', top: '10%', right: '20%', fontSize: '3rem', opacity: 0.6 }}>☁️</div>
                <div style={{ position: 'absolute', bottom: '20%', left: '5%', fontSize: '3rem' }}>🌲</div>
                <div style={{ position: 'absolute', bottom: '25%', right: '8%', fontSize: '3rem' }}>🌳</div>

                {/* Village Buildings (Grow with level) */}
                <div style={{
                    position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
                    transition: 'all 0.5s', textAlign: 'center'
                }}>
                    {villageLevel >= 1 && <span style={{ fontSize: '4rem' }}>⛺</span>}
                    {villageLevel >= 2 && <span style={{ fontSize: '4rem' }}>🏠</span>}
                    {villageLevel >= 3 && <span style={{ fontSize: '4rem' }}>🏡</span>}
                    {villageLevel >= 4 && <span style={{ fontSize: '5rem' }}>🏰</span>}
                </div>

                {/* Villagers (Requests) */}
                {requests.map((req, i) => (
                    <div key={req.id} style={{
                        position: 'absolute', bottom: '15%', left: `${req.x}% `,
                        transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        animation: 'popIn 0.5s', transition: 'left 0.5s'
                    }}>
                        {/* Bubble */}
                        <div style={{
                            background: 'white', padding: '5px 10px', borderRadius: '15px',
                            marginBottom: '5px', boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                            border: i === 0 ? '3px solid #f1c40f' : '1px solid #ccc', // Highlight current target
                            transform: i === 0 ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.3s'
                        }}>
                            {req.type.icon}
                        </div>
                        {/* Villager */}
                        <div style={{ fontSize: '3rem' }}>🧑‍🌾</div>
                    </div>
                ))}

                {/* Feedback Overlay */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'rgba(255,255,255,0.95)', padding: '15px 30px', borderRadius: '30px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.2)', zIndex: 10, pointerEvents: 'none',
                        fontSize: '1.5rem', fontWeight: 'bold',
                        color: feedback.status === 'wrong' ? '#e74c3c' : '#2ecc71',
                        whiteSpace: 'nowrap'
                    }}>
                        {feedback.message}
                    </div>
                )}

                {isGameOver && (
                    <div style={{
                        position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: 'white', flexDirection: 'column', zIndex: 20, textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '5rem' }}>🎉</div>
                        <h1>{t('l23_win')}</h1>
                    </div>
                )}

            </div>

            {/* Controls: Big Buttons */}
            <div style={{
                height: '120px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center'
            }}>
                {RESOURCES.map(res => (
                    <button key={res.id}
                        onClick={() => handleResourceClick(res.id)}
                        className="btn-glass"
                        style={{
                            width: '100px', height: '100px', borderRadius: '20px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            fontSize: '1.5rem', background: 'white', borderBottom: `5px solid #ccc`,
                            transition: 'transform 0.1s'
                        }}
                        onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span style={{ fontSize: '3rem', marginBottom: '5px' }}>{res.icon}</span>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#555' }}>{res.label}</span>
                    </button>
                ))}
            </div>

            {/* Instruction */}
            <div style={{ textAlign: 'center', color: '#666', marginTop: '10px', fontSize: '0.9rem' }}>
                {t('l23_instr_2')} {t('l23_instr_3')}
            </div>

            <style>{`
@keyframes popIn { 0 % { transform: translateX(-50 %) scale(0); } 100 % { transform: translateX(-50 %) scale(1); } }
`}</style>
        </div>
    );
};

// Mode mock to fix linter variable check if I missed defining it above
// Actually I missed defining 'mode', let me fix that in the logic:
// Used 'isGameOver' instead. Fixed the 'mode' check in JSX.

export default Level23_VillageSimLevel;

// Re-patching the render for 'mode' usage above.
// Actually I will just fix the JSX block for "win" overlay.
