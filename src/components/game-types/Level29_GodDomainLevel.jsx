import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { playSfx, SFX } from '../../utils/sfx';
import '../../App.css';

const Level29_GodDomainLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    // Stages: 1. Speed Math, 2. Pattern Memory, 3. The Final Choice
    const [stage, setStage] = useState(1);
    // Boss Health Logic
    const [bossHp, setBossHp] = useState(30);
    const [status, setStatus] = useState('intro'); // intro, play, win
    const [feedback, setFeedback] = useState(null);

    // Stage 1: Math State
    const [mathQ, setMathQ] = useState(null);
    const [mathOptions, setMathOptions] = useState([]);

    // Stage 2: Memory State
    const [pattern, setPattern] = useState([]);
    const [userPattern, setUserPattern] = useState([]);
    const [isShowingPattern, setIsShowingPattern] = useState(false);

    // Stage 3: Logic/Click
    const [clickCount, setClickCount] = useState(0);

    // Intro/Outro
    useEffect(() => {
        if (status === 'intro') {
            setTimeout(() => setStatus('play'), 2000);
        }
    }, [status]);

    // Stage Controller
    useEffect(() => {
        if (status !== 'play') return;
        if (stage === 1 && !mathQ) generateMathQuestion();
        if (stage === 2 && pattern.length === 0) generatePattern();
    }, [status, stage]);

    // --- STAGE 1: SPEED MATH ---
    const generateMathQuestion = () => {
        const a = Math.floor(Math.random() * 9) + 2; // 2-10
        const b = Math.floor(Math.random() * 9) + 2;
        const isPlus = Math.random() > 0.5;
        const ans = isPlus ? a + b : a * b; // + or *
        const op = isPlus ? '+' : 'x';

        setMathQ({ text: `${a} ${op} ${b} = ?`, ans });

        // Generate options
        let opts = [ans];
        while (opts.length < 3) {
            let fake = ans + Math.floor(Math.random() * 10) - 5;
            if (fake !== ans && fake > 0 && !opts.includes(fake)) opts.push(fake);
        }
        setMathOptions(opts.sort(() => Math.random() - 0.5));
    };

    const handleMathAnswer = (val) => {
        if (val === mathQ.ans) {
            playSfx(SFX.CLICK);
            setFeedback({ type: 'correct', text: '正確！⚔️' });
            damageBoss(2); // 2 DMG per right answer
            if ((bossHp - 2) <= 20) { // Stage 1 threshold (30 -> 20)
                setStage(2);
                setFeedback({ type: 'info', text: t('l29_boss_p2') });
            } else {
                generateMathQuestion();
            }
        } else {
            playSfx(SFX.ERROR);
            setFeedback({ type: 'wrong', text: t('l29_wrong') });
            generateMathQuestion();
        }
    };

    // --- STAGE 2: MEMORY ---
    const generatePattern = () => {
        setIsShowingPattern(true);
        const newP = [];
        // Fixed length 4 for simplicity but challenging enough for kids
        for (let i = 0; i < 4; i++) newP.push(Math.floor(Math.random() * 4));
        setPattern(newP);
        setUserPattern([]);

        // Show sequence
        let i = 0;
        const interval = setInterval(() => {
            playTone(newP[i]);
            flashBtn(newP[i]);
            i++;
            if (i >= newP.length) {
                clearInterval(interval);
                setTimeout(() => setIsShowingPattern(false), 500);
            }
        }, 800);
    };

    const handleMemoryClick = (idx) => {
        if (isShowingPattern) return;

        playTone(idx);
        flashBtn(idx);

        const nextIdx = userPattern.length;
        if (pattern[nextIdx] === idx) {
            // playSfx(SFX.CLICK); // Handled by playTone
            const nextUserP = [...userPattern, idx];
            setUserPattern(nextUserP);

            if (nextUserP.length === pattern.length) {
                // Round Complete
                damageBoss(5);
                setFeedback({ type: 'correct', text: t('l29_mem_perfect') });
                if ((bossHp - 5) <= 10) { // Stage 2 threshold (20 -> 10)
                    setStage(3);
                    setFeedback({ type: 'info', text: t('l29_boss_p3') });
                } else {
                    setTimeout(generatePattern, 1000);
                }
            }
        } else {
            playSfx(SFX.ERROR);
            setFeedback({ type: 'wrong', text: t('l29_mem_fail') });
            setIsShowingPattern(true);
            setTimeout(generatePattern, 1000);
        }
    };

    // --- STAGE 3: CLICKER FINALE ---
    const handleBossClick = () => {
        if (stage !== 3) return;
        playSfx(SFX.CLICK); // Or DRAG sound? Or generic click.
        damageBoss(1);
        setClickCount(c => c + 1);
        // Visual shake
    };


    // --- UTILS ---
    const damageBoss = (amount) => {
        setBossHp(prev => {
            const next = prev - amount;
            if (next <= 0) {
                setStage(4); // Victory
                setStatus('win');
                setTimeout(() => {
                    // Ensure 3 stars
                    onComplete(3);
                }, 2000); // Delay to show victory anim
                return 0;
            }
            return next;
        });
        setFeedback(prev => prev ? prev : { type: 'dmg', text: `-${amount}` }); // Temp feedback if none
        setTimeout(() => setFeedback(null), 800);
    };

    const flashBtn = (idx) => {
        const btn = document.getElementById(`mem-btn-${idx}`);
        if (btn) {
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(1)';
            }, 300);
        }
    };

    const playTone = (idx) => {
        playSfx(SFX.CLICK); // Simple beep fallback
    };

    // --- RENDER ---
    if (status === 'win') {
        return (
            <div className="game-level-container" style={{
                background: 'black', color: 'gold', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', textAlign: 'center',
                position: 'fixed', top: 0, left: 0, zIndex: 9999
            }}>
                <div style={{ fontSize: '6rem', animation: 'spin 5s infinite linear' }}>🌟</div>
                <h1 style={{ fontSize: '3rem', textShadow: '0 0 20px gold' }}>{t('l29_win_title')}</h1>
                <p style={{ fontSize: '1.5rem', color: 'white', whiteSpace: 'pre-line' }}>{t('l29_win_desc')}</p>
                <div style={{ marginTop: '50px' }}>
                    <button onClick={onBack} style={{
                        padding: '15px 40px', fontSize: '1.5rem', borderRadius: '50px',
                        background: 'transparent', border: '3px solid gold', color: 'gold', cursor: 'pointer',
                        fontWeight: 'bold', boxShadow: '0 0 15px gold'
                    }}>
                        {t('l29_win_back')}
                    </button>
                    {/* No Next Level Button intentionally */}
                </div>
            </div>
        );
    }

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '100%', margin: '0 auto', height: '100vh',
            display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
            background: 'linear-gradient(to bottom, #2c3e50, #000000)', color: 'white',
            fontFamily: 'var(--font-main)',
            position: 'relative', overflow: 'hidden',
            touchAction: 'none', padding: '10px 0 0 0' // Top padding only
        }}>

            {/* Header / Boss HP */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#e74c3c', textShadow: '0 0 10px red', margin: '10px 0' }}>{t('l29_boss_name')}</h2>
                <div style={{ width: '80%', height: '20px', background: '#333', borderRadius: '10px', overflow: 'hidden', border: '2px solid #555' }}>
                    <div style={{
                        width: `${(bossHp / 30) * 100}%`, height: '100%',
                        background: 'linear-gradient(90deg, #e74c3c, #c0392b)',
                        transition: 'width 0.5s'
                    }}></div>
                </div>
                <div style={{ marginTop: '5px', fontSize: '0.9rem', color: '#aaa' }}>HP: {bossHp} / 30</div>
            </div>

            {/* Main Stage Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                {/* Boss Avatar */}
                <div style={{
                    fontSize: '6rem', marginBottom: '30px', cursor: stage === 3 ? 'pointer' : 'default',
                    filter: stage === 3 ? 'drop-shadow(0 0 15px red)' : 'none',
                    animation: feedback?.type === 'dmg' ? 'shake 0.5s' : 'float 3s infinite ease-in-out',
                    transform: stage === 3 ? `scale(${1 + (clickCount % 5) * 0.05})` : 'scale(1)'
                }} onClick={handleBossClick}>
                    {stage === 1 ? '🧙‍♂️' : stage === 2 ? '🧠' : '👾'}
                </div>

                {/* Stage 1: Math */}
                {stage === 1 && mathQ && (
                    <div style={{ animation: 'fadeIn 0.5s', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: 'bold' }}>{mathQ.text}</div>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            {mathOptions.map((opt, i) => (
                                <button key={i} onClick={() => handleMathAnswer(opt)} className="btn-pushable" style={{
                                    width: '80px', height: '60px', fontSize: '1.5rem', background: '#3498db', border: 'none', borderRadius: '10px', color: 'white'
                                }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stage 2: Memory */}
                {stage === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 120px)', gap: '15px', animation: 'fadeIn 0.5s', justifyContent: 'center' }}>
                        {['🔴', '🔵', '🟢', '🟡'].map((icon, i) => (
                            <button key={i} id={`mem-btn-${i}`}
                                onClick={() => handleMemoryClick(i)}
                                disabled={isShowingPattern}
                                style={{
                                    width: '120px', height: '120px', fontSize: '3rem',
                                    background: isShowingPattern ? '#555' : 'rgba(255,255,255,0.1)',
                                    border: `3px solid ${['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7'][i]}`,
                                    borderRadius: '15px', cursor: 'pointer', opacity: 0.7,
                                    transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}>
                                {icon}
                            </button>
                        ))}
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', color: '#aaa', marginTop: '10px', fontSize: '1rem', width: '100%' }}>
                            {t('l28_mem_watch') || '👀 觀察亮燈的順序，依順序點擊！'}
                        </div>
                    </div>
                )}

                {/* Stage 3: Mash */}
                {stage === 3 && (
                    <div style={{ animation: 'fadeIn 0.5s', textAlign: 'center' }}>
                        <h2 style={{ color: '#e74c3c', fontSize: '2rem', animation: 'pulse 0.5s infinite' }}>{t('l29_mash_title')}</h2>
                        <div style={{ fontSize: '1.2rem', color: '#aaa' }}>(tap!)</div>
                    </div>
                )}

            </div>

            {/* Feedback Overlay */}
            {feedback && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    fontSize: '2rem', fontWeight: 'bold',
                    color: feedback.type === 'correct' ? '#2ecc71' : feedback.type === 'wrong' ? '#e74c3c' : 'gold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)', pointerEvents: 'none',
                    animation: 'popIn 0.3s'
                }}>
                    {feedback.text}
                </div>
            )}

            <style>{`
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
                @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } 100% { transform: translateX(0); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Level29_GodDomainLevel;
