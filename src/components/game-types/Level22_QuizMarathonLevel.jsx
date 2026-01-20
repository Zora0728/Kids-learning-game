import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level22_QuizMarathonLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // Possible States: 'intro', 'playing', 'finished'
    const [gameState, setGameState] = useState('intro');
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds total for 5 questions
    const [feedback, setFeedback] = useState(null); // { status, message }
    const [shuffledQuestions, setShuffledQuestions] = useState([]);

    const QUESTIONS = [
        // Math
        { type: 'math', q: '5 + 3 = ?', options: ['7', '8', '9'], a: '8', color: '#e74c3c' },
        { type: 'math', q: '10 - 4 = ?', options: ['6', '5', '4'], a: '6', color: '#e74c3c' },
        { type: 'math', q: '2 + 2 + 2 = ?', options: ['4', '6', '8'], a: '6', color: '#e74c3c' },
        // Logic
        { type: 'logic', q: '🌞 🌜 🌞 🌜 ...?', options: ['🌞', '🌜', '⭐'], a: '🌞', color: '#3498db' },
        { type: 'logic', q: '🔺 🟦 🔺 🟦 ...?', options: ['⚪', '🔺', '🟦'], a: '🔺', color: '#3498db' },
        // Science (Simple)
        { type: 'science', q: '🧊 🔥 ➡️ ?', options: ['💧', '💨', '🧱'], a: '💧', color: '#2ecc71' }, // Ice + Fire = Water
        { type: 'science', q: '🌧️ ☀️ ➡️ ?', options: ['🌈', '❄️', '🌪️'], a: '🌈', color: '#2ecc71' } // Rain + Sun = Rainbow
    ];

    useEffect(() => {
        // Shuffle and pick 5
        const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
        setShuffledQuestions(shuffled.slice(0, 5));
    }, []);

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('finished');
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    const handleStart = () => {
        setGameState('playing');
        setTimeLeft(60);
        setQIndex(0);
        setScore(0);
    };

    const handleAnswer = (opt) => {
        const currentQ = shuffledQuestions[qIndex];
        if (opt === currentQ.a) {
            setScore(s => s + 1);
            setFeedback({ status: 'correct', message: t.game_correct });
        } else {
            setFeedback({ status: 'wrong', message: t.l22_wrong.replace('{answer}', currentQ.a) });
        }

        setTimeout(() => {
            setFeedback(null);
            if (qIndex < shuffledQuestions.length - 1) {
                setQIndex(i => i + 1);
            } else {
                setGameState('finished');
            }
        }, 1200);
    };

    const getRank = () => {
        if (score === 5) return { title: t.l22_end_high, stars: 3 };
        if (score >= 3) return { title: t.l22_end_med, stars: 2 };
        return { title: t.l22_end_low, stars: 1 };
    };

    const currentQ = shuffledQuestions[qIndex];

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)'
        }}>

            {/* Intro Screen */}
            {gameState === 'intro' && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🏃💨</div>
                    <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>{t.l22_intro_title}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#7f8c8d' }}>
                        {t.l22_intro_desc.replace('{count}', 5)}
                    </p>
                    <button className="btn-primary" style={{ fontSize: '1.5rem', marginTop: '30px' }} onClick={handleStart}>
                        {t.l22_start}
                    </button>
                    {/* Secondary back button removed to avoid duplication with GameScene header */}
                </div>
            )}

            {/* Playing Screen */}
            {gameState === 'playing' && currentQ && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
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
                            <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.8rem' }}>{t.l22_title}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1rem', color: '#555' }}>
                                    {t.l22_q_num.replace('{current}', qIndex + 1)}
                                </span>
                                <span style={{ background: currentQ.color, color: 'white', padding: '2px 8px', borderRadius: '5px', fontSize: '0.8rem' }}>
                                    {currentQ.type === 'math' ? t.l22_type_math : currentQ.type === 'logic' ? t.l22_type_logic : t.l22_type_science}
                                </span>
                            </div>
                        </div>

                        {/* Top Bar: Time & Score */}
                        <div style={{
                            marginTop: '10px', display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 20px', boxSizing: 'border-box'
                        }}>
                            <div style={{
                                background: timeLeft < 10 ? '#e74c3c' : '#3498db', color: 'white',
                                padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', minWidth: '80px', textAlign: 'center'
                            }}>
                                ⏱️ {timeLeft}s
                            </div>
                            <div style={{
                                background: '#f1c40f', color: '#333',
                                padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold'
                            }}>
                                {t.l22_score.replace('{score}', score)}
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            fontSize: '4rem', marginBottom: '30px', fontWeight: 'bold', color: '#2c3e50',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {currentQ.q}
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' }}>
                            {currentQ.options.map((opt, idx) => (
                                <button key={idx}
                                    onClick={() => handleAnswer(opt)}
                                    className="btn-glass"
                                    style={{
                                        fontSize: '2rem', padding: '20px 30px', minWidth: '100px',
                                        background: '#fff', border: `3px solid ${currentQ.color}`, color: '#333'
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {/* Feedback Overlay */}
                        {feedback && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                background: 'rgba(255,255,255,0.95)', zIndex: 10, borderRadius: '20px'
                            }}>
                                <div style={{ fontSize: '5rem', marginBottom: '10px' }}>
                                    {feedback.status === 'correct' ? '✅' : '❌'}
                                </div>
                                <div style={{ fontSize: '1.5rem', color: feedback.status === 'correct' ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                    {feedback.message}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Finished Screen */}
            {gameState === 'finished' && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    textAlign: 'center', gap: '20px'
                }}>
                    <div style={{ fontSize: '5rem' }}>🏁</div>
                    <h1 style={{ color: '#2c3e50' }}>{t.l22_end_title}</h1>
                    <div style={{ fontSize: '2rem', color: '#34495e' }}>{t.l22_end_score.replace('{score}', score).replace('{total}', 5)}</div>

                    <div style={{
                        background: '#f9f9f9', padding: '20px', borderRadius: '15px',
                        border: '2px dashed #ccc', maxWidth: '80%'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#e67e22' }}>{getRank().title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                            {[...Array(getRank().stars)].map((_, i) => <span key={i} style={{ fontSize: '2rem' }}>⭐</span>)}
                        </div>
                    </div>

                    <button className="btn-primary" style={{ fontSize: '1.5rem', padding: '15px 40px' }} onClick={() => onComplete(getRank().stars)}>
                        {t.l22_claim}
                    </button>
                    <button className="btn-secondary" onClick={handleStart}>{t.game_retry}</button>
                </div>
            )}

        </div>
    );
};

export default Level22_QuizMarathonLevel;
