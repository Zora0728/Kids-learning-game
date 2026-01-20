import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level19_LogicDeductionLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // 3 Stages (Cases)
    const [stage, setStage] = useState(0); // 0-indexed for array access
    const [mistakes, setMistakes] = useState(0);
    const [showHelp, setShowHelp] = useState(true);
    const [feedback, setFeedback] = useState(null); // { status: 'correct'|'wrong', message: '' }

    const CASES = [
        {
            id: 1,
            question: t.l19_q1,
            options: [
                { id: 'horse', name: t.l19_q1_opt1, icon: '🐎', isCorrect: false },
                { id: 'cheetah', name: t.l19_q1_opt2, icon: '🐆', isCorrect: true },
                { id: 'dog', name: t.l19_q1_opt3, icon: '🐕', isCorrect: false }
            ]
        },
        {
            id: 2,
            question: t.l19_q2,
            options: [
                { id: 'red', name: t.l19_q2_opt1, icon: '🔴', isCorrect: false },
                { id: 'green', name: t.l19_q2_opt2, icon: '🟢', isCorrect: false },
                { id: 'blue', name: t.l19_q2_opt3, icon: '🔵', isCorrect: true }
            ]
        },
        {
            id: 3,
            question: t.l19_q3,
            options: [
                { id: 'cat', name: t.l19_q3_opt1, icon: '🐱', isCorrect: false },
                { id: 'dog', name: t.l19_q3_opt2, icon: '🐶', isCorrect: false },
                { id: 'rabbit', name: t.l19_q3_opt3, icon: '🐰', isCorrect: true }
            ]
        }
    ];

    const handleOptionClick = (option) => {
        if (option.isCorrect) {
            setFeedback({ status: 'correct', message: t.game_correct });
            setTimeout(() => {
                setFeedback(null);
                if (stage < CASES.length - 1) {
                    setStage(s => s + 1);
                } else {
                    handleComplete();
                }
            }, 1000);
        } else {
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t.game_try_again });
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleComplete = () => {
        let stars = 3;
        if (mistakes > 2) stars = 2;
        if (mistakes > 5) stars = 1;
        onComplete(stars);
    };

    const currentCase = CASES[stage];

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflowY: 'hidden', padding: '10px', boxSizing: 'border-box', // Fixed padding
            fontFamily: 'var(--font-main)'
        }}>
            {/* Header */}
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
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{t.l19_title}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t.l19_desc.replace('{stage}', stage + 1).replace('{total}', CASES.length)}</p>
                </div>
                <div style={{
                    marginTop: '10px', padding: '5px 15px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: '#fff', borderRadius: '20px', padding: '20px',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)', position: 'relative'
            }}>

                {/* Detective Avatar & Question */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', maxWidth: '90%' }}>
                    <div style={{ fontSize: '5rem', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>🕵️</div>
                    <div style={{
                        background: '#eef2f3', padding: '20px', borderRadius: '20px',
                        borderBottomLeftRadius: '0', border: '2px solid #bdc3c7',
                        fontSize: '1.2rem', color: '#2c3e50', lineHeight: '1.6', fontWeight: 'bold'
                    }}>
                        {currentCase.question.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                </div>

                {/* Options Grid */}
                <div style={{
                    display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', width: '100%',
                    alignContent: 'center'
                }}>
                    {currentCase.options.map(opt => (
                        <button key={opt.id}
                            onClick={() => handleOptionClick(opt)}
                            className="btn-glass"
                            style={{
                                width: '30%', minWidth: '100px', maxWidth: '150px',
                                aspectRatio: '1/1', // Square
                                height: 'auto', // Override fixed height
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                background: '#f8f9fa', border: '3px solid #e0e0e0',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                padding: '5px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#3498db'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#e0e0e0'; }}
                        >
                            <span style={{ fontSize: '3rem', marginBottom: '5px' }}>{opt.icon}</span>
                            <span style={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>{opt.name}</span>
                        </button>
                    ))}
                </div>

                {/* Feedback Overlay */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(255,255,255,0.9)', borderRadius: '20px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        zIndex: 10
                    }}>
                        <div style={{ fontSize: '5rem', marginBottom: '10px' }}>
                            {feedback.status === 'correct' ? '🎉' : '🤔'}
                        </div>
                        <div style={{
                            fontSize: '2rem', fontWeight: 'bold',
                            color: feedback.status === 'correct' ? '#27ae60' : '#e67e22'
                        }}>
                            {feedback.message}
                        </div>
                    </div>
                )}
            </div>

            {/* Visual Help Modal */}
            {stage === 0 && showHelp && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    background: 'white', padding: '20px', borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 50,
                    width: '85%', textAlign: 'center', border: '5px solid #9b59b6'
                }}>
                    <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎮 {t.game_help_title}</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>👀</div>
                            <div style={{ background: '#9b59b6', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l19_step1}</div>
                        </div>
                        <div style={{ fontSize: '2rem', color: '#ccc' }}>➡</div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>🧠</div>
                            <div style={{ background: '#3498db', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l19_step2}</div>
                        </div>
                        <div style={{ fontSize: '2rem', color: '#ccc' }}>➡</div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '5px' }}>👆✅</div>
                            <div style={{ background: '#2ecc71', color: 'white', padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' }}>{t.l19_step3}</div>
                        </div>
                    </div>

                    <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '10px 30px' }} onClick={() => setShowHelp(false)}>
                        {t.l19_start}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Level19_LogicDeductionLevel;
