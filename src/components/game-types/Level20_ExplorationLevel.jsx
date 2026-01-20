import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level20_ExplorationLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // 3 Stages: Volcano, Ocean, Space
    const [stage, setStage] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [found, setFound] = useState(false);
    const [showHelp, setShowHelp] = useState(true);
    const [feedback, setFeedback] = useState(null); // { status, message }

    // Each stage has: background style, target item, obstacles (hiding spots)
    const STAGES = [
        {
            id: 'volcano',
            name: t.l20_s1_name,
            target: { icon: '💎', name: t.l20_s1_target },
            bg: 'linear-gradient(to bottom, #d35400, #c0392b)',
            // 3 Obstacles, one hides the target
            obstacles: [
                { id: 1, icon: '🪨', x: 20, y: 60, hasTarget: false },
                { id: 2, icon: '🌋', x: 50, y: 40, hasTarget: true },
                { id: 3, icon: '🪨', x: 80, y: 70, hasTarget: false },
            ]
        },
        {
            id: 'ocean',
            name: t.l20_s2_name,
            target: { icon: '🪼', name: t.l20_s2_target },
            bg: 'linear-gradient(to bottom, #2980b9, #2c3e50)',
            obstacles: [
                { id: 1, icon: '🌿', x: 30, y: 50, hasTarget: true },
                { id: 2, icon: '🐠', x: 70, y: 30, hasTarget: false },
                { id: 3, icon: '🪸', x: 60, y: 80, hasTarget: false },
            ]
        },
        {
            id: 'space',
            name: t.l20_s3_name,
            target: { icon: '👽', name: t.l20_s3_target },
            bg: 'linear-gradient(to bottom, #000000, #4b0082)',
            obstacles: [
                { id: 1, icon: '🪐', x: 20, y: 30, hasTarget: false },
                { id: 2, icon: '🌑', x: 70, y: 70, hasTarget: true },
                { id: 3, icon: '☄️', x: 50, y: 50, hasTarget: false },
            ]
        }
    ];

    const currentStage = STAGES[stage];

    // Handle clicking an obstacle
    const handleObstacleClick = (obs) => {
        if (found) return; // Already found

        if (obs.hasTarget) {
            setFound(true);
            setFeedback({ status: 'correct', message: t.l20_found.replace('{name}', currentStage.target.name) });

            setTimeout(() => {
                setFeedback(null);
                setFound(false);
                if (stage < STAGES.length - 1) {
                    setStage(s => s + 1);
                } else {
                    handleComplete();
                }
            }, 1500);
        } else {
            // Wrong choice
            setMistakes(m => m + 1);
            setFeedback({ status: 'info', message: t.l20_nothing });
            setTimeout(() => setFeedback(null), 800);
        }
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
            {/* Header - Card Style */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', width: '100%', position: 'relative', zIndex: 10 }}>
                {levelNumber && (
                    <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        LEVEL {levelNumber}
                    </div>
                )}
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '30px', padding: '10px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '280px'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{t.l20_title}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t.l20_desc.replace('{icon}', currentStage.target.icon).replace('{name}', currentStage.target.name)}</p>
                </div>
                <div style={{
                    marginTop: '10px', display: 'flex', gap: '10px'
                }}>
                    <div style={{ padding: '5px 15px', background: '#E3F2FD', color: '#1565C0', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t.game_progress.replace('{current}', stage + 1).replace('{total}', 3)}
                    </div>
                    <div style={{ padding: '5px 15px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t.game_mistakes.replace('{count}', mistakes)}
                    </div>
                </div>
            </div>

            {/* Main Exploration Area */}
            <div style={{
                height: '60vh', width: '100%', borderRadius: '20px', position: 'relative', overflow: 'hidden',
                background: currentStage.bg, border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
            }}>

                {/* Target Hint (Top Left) */}
                <div style={{
                    position: 'absolute', top: '20px', left: '20px',
                    background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '15px',
                    color: 'white', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.4)',
                    display: 'flex', gap: '10px', alignItems: 'center'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🔍</span>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t.l20_hint_target}</div>
                        <div style={{ fontSize: '1.2rem' }}>{currentStage.target.icon}</div>
                    </div>
                </div>

                {/* Obstacles / Hiding Spots */}
                {currentStage.obstacles.map(obs => (
                    <div key={obs.id}
                        onClick={() => handleObstacleClick(obs)}
                        style={{
                            position: 'absolute',
                            left: `${obs.x}%`, top: `${obs.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: '4rem', cursor: 'pointer',
                            transition: 'transform 0.2s',
                            filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.3))'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.0)'}
                    >
                        {/* If found and this is the target, show target icon ON TOP or replaced */}
                        {found && obs.hasTarget ? currentStage.target.icon : obs.icon}
                    </div>
                ))}

                {/* Feedback Overlay */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: 'rgba(255,255,255,0.95)', padding: '20px 40px', borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                        textAlign: 'center', zIndex: 10,
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                            {feedback.status === 'correct' ? '🎉' : '💨'}
                        </div>
                        <div style={{
                            fontSize: '1.5rem', fontWeight: 'bold',
                            color: feedback.status === 'correct' ? '#27ae60' : '#7f8c8d'
                        }}>
                            {feedback.message}
                        </div>
                    </div>
                )}

                <style>{`@keyframes popIn { from { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } to { transform: translate(-50%, -50%) scale(1); opacity: 1; } }`}</style>
            </div>

            {/* Visual Help Modal */}
            {stage === 0 && showHelp && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'white', padding: '20px', borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 50,
                    width: '85%', textAlign: 'center', border: '5px solid #2980b9'
                }}>
                    <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎮 {t.game_help_title}</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>🌎</div>
                            <div style={{ background: '#2980b9', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l20_step1}</div>
                        </div>
                        <div style={{ fontSize: '2rem', color: '#ccc' }}>➡</div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>🔍</div>
                            <div style={{ background: '#e67e22', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l20_step2}</div>
                        </div>
                        <div style={{ fontSize: '2rem', color: '#ccc' }}>➡</div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>💎🎉</div>
                            <div style={{ background: '#2ecc71', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l20_step3}</div>
                        </div>
                    </div>

                    <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '20px' }}>{t.l20_help_hint}</p>

                    <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '10px 30px' }} onClick={() => setShowHelp(false)}>
                        {t.l20_start}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Level20_ExplorationLevel;
