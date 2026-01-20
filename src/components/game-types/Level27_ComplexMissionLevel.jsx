import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';

const Level27_ComplexMissionLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    // Stage 1: Math (Fuel), 2: Logic (Nav), 3: Code (Launch)
    const [stage, setStage] = useState(1);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState(null); // { status, message }

    // --- Stage 1: Fuel Mixing ---
    const [fuelCurrent, setFuelCurrent] = useState(0);
    const FUEL_TARGET = 15;
    const FUEL_OPTIONS = [2, 3, 5, -1];

    // --- Stage 2: Navigation Pattern ---
    // Pattern: Star, Moon, Star, Moon, [?]
    const [navSelection, setNavSelection] = useState(null);
    const NAV_PATTERN = ['🌟', '🌙', '🌟', '🌙', '?'];
    const NAV_ANSWER = '🌟'; // The correct answer for index 4
    const NAV_OPTIONS = [
        { icon: '☀️', label: t('l27_nav_sun') },
        { icon: '🌟', label: t('l27_nav_star') },
        { icon: '🌙', label: t('l27_nav_moon') },
        { icon: '☄️', label: t('l27_nav_comet') }
    ];

    // --- Stage 3: Launch Code ---
    const [code, setCode] = useState("");
    const CORRECT_CODE = "358";

    // --- Handlers ---

    // Stage 1
    const handleAddFuel = (amount) => {
        const newVal = fuelCurrent + amount;
        if (newVal < 0) {
            setFuelCurrent(0);
            return;
        }
        setFuelCurrent(newVal);

        if (newVal === FUEL_TARGET) {
            handleStageComplete(t('l27_fuel_fill'), 2);
        } else if (newVal > FUEL_TARGET) {
            setFeedback({ status: 'wrong', message: t('l27_fuel_overflow') });
            setMistakes(m => m + 1);
        } else {
            setFeedback(null);
        }
    };

    // Stage 2
    const handleNavSelect = (item) => {
        setNavSelection(item);
        if (item === NAV_ANSWER) {
            handleStageComplete(t('l27_nav_safe'), 3);
        } else {
            setFeedback({ status: 'wrong', message: t('l27_nav_wrong') });
            setMistakes(m => m + 1);
        }
    };

    // Stage 3
    const handleCodeInput = (num) => {
        if (code.length < 3) {
            const newCode = code + num;
            setCode(newCode);
        }
    };

    const handleCodeSubmit = () => {
        if (code === CORRECT_CODE) {
            handleStageComplete(t('l27_code_correct'), 4); // 4 = Win
        } else {
            setFeedback({ status: 'wrong', message: t('l27_code_wrong') });
            setMistakes(m => m + 1);
            setCode("");
        }
    };

    const handleStageComplete = (msg, nextStage) => {
        setFeedback({ status: 'correct', message: msg });
        setTimeout(() => {
            setFeedback(null);
            if (nextStage === 4) {
                // Determine stars based on mistakes
                let stars = 3;
                if (mistakes > 2) stars = 2;
                if (mistakes > 5) stars = 1;
                onComplete(stars);
            } else {
                setStage(nextStage);
            }
        }, 1500);
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
            {/* Header */}
            {/* Header - Compact RWD Style */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', width: '100%', flexShrink: 0 }}>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    LEVEL 27
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '8px 20px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '85%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
                        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{t('l27_title')}</h2>
                        {/* Error Count Inside White Box (Right Side) */}
                        <div style={{ padding: '2px 8px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {t('l23_mistakes').replace('{count}', mistakes)}
                        </div>
                    </div>
                    <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                        {t('l27_stage_fuel').replace(' (', ' - ').replace(')', '') /** Fallback/Simplify logic if needed, but simple replacement works for now */}
                        {stage === 1 ? t('l27_stage_fuel') : stage === 2 ? t('l27_stage_nav') : t('l27_stage_code')}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1, background: '#ecf0f1', borderRadius: '20px', padding: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.05)'
            }}>

                {/* STAGE 1: FUEL */}
                {stage === 1 && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>⛽</div>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>{t('l27_fuel_target').replace('{target}', FUEL_TARGET)}</h3>

                        {/* Tank Visualization */}
                        <div style={{
                            width: '60px', height: '200px', background: '#bdc3c7',
                            borderRadius: '10px', margin: '0 auto 30px auto',
                            position: 'relative', overflow: 'hidden', border: '3px solid #7f8c8d'
                        }}>
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, width: '100%',
                                height: `${Math.min((fuelCurrent / FUEL_TARGET) * 100, 100)}%`,
                                background: fuelCurrent > FUEL_TARGET ? '#e74c3c' : '#2ecc71',
                                transition: 'height 0.5s ease-in-out'
                            }}></div>
                            <div style={{
                                position: 'absolute', width: '100%', textAlign: 'center',
                                bottom: '5px', color: 'white', fontWeight: 'bold', textShadow: '0 1px 2px black'
                            }}>
                                {fuelCurrent}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            {FUEL_OPTIONS.map((val, i) => (
                                <button key={i} onClick={() => handleAddFuel(val)} className="btn-push"
                                    style={{
                                        width: '60px', height: '60px', borderRadius: '50%',
                                        fontSize: '1.2rem', fontWeight: 'bold',
                                        background: val > 0 ? '#3498db' : '#e67e22', color: 'white',
                                        border: 'none', boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 // Center text
                                    }}>
                                    {val > 0 ? `+${val}` : val}
                                </button>
                            ))}
                            <button onClick={() => setFuelCurrent(0)} className="btn-push"
                                style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    fontSize: '1.2rem', fontWeight: 'bold',
                                    background: '#95a5a6', color: 'white',
                                    border: 'none', boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 // Center text
                                }}>
                                ↺
                            </button>
                        </div>
                    </div>
                )}

                {/* STAGE 2: NAVIGATION */}
                {stage === 2 && (
                    <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🗺️</div>
                        <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{t('l27_nav_guide')}</h3>
                        <p style={{ color: '#7f8c8d', marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            ?
                        </p>

                        {/* Pattern Display */}
                        <div style={{
                            display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center',
                            marginBottom: '40px', background: 'white', padding: '15px', borderRadius: '15px',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            flexWrap: 'wrap', width: '100%', boxSizing: 'border-box'
                        }}>
                            {NAV_PATTERN.map((item, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '15px',
                                        background: item === '?' ? '#fff3cd' : '#ecf0f1',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        fontSize: '2.5rem',
                                        border: item === '?' ? '3px solid #f1c40f' : '2px solid #bdc3c7',
                                        boxShadow: item === '?' ? '0 0 15px #f1c40f' : 'none',
                                        animation: item === '?' ? 'pulse-border 1.5s infinite' : 'none',
                                        position: 'relative'
                                    }}>
                                        {item === '?' && navSelection ? navSelection : item}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Style Removed: moved to global CSS or ignored for safety */}

                        {/* Options */}
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {NAV_OPTIONS.map((opt, i) => (
                                <button key={i} onClick={() => handleNavSelect(opt.icon)}
                                    className="btn-push"
                                    style={{
                                        minWidth: '90px', padding: '10px', borderRadius: '15px',
                                        background: 'white', border: 'none',
                                        boxShadow: '0 5px 0 #bdc3c7', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                                    }}>
                                    <span style={{ fontSize: '2.5rem' }}>{opt.icon}</span>
                                    <span style={{ fontSize: '1rem', color: '#7f8c8d', fontWeight: 'bold' }}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STAGE 3: LAUNCH CODE */}
                {stage === 3 && (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center' // Center the box itself
                    }}>
                        {/* The "Red Box" Constraint Area */}
                        <div style={{
                            width: '100%', maxWidth: '320px',
                            border: '2px solid #e74c3c', // Visible as requested to show the "range"
                            borderRadius: '15px',
                            padding: '15px',
                            background: 'rgba(255,255,255,0.5)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>🔑</div>
                            <h3 style={{ color: '#2c3e50', fontSize: '1.4rem', margin: '0' }}>{t('l27_code_input')}</h3>
                            <p style={{ color: '#7f8c8d', fontSize: '0.9rem', lineHeight: '1.4', margin: '0', textAlign: 'center' }}>
                                {t('l27_code_hint')}
                            </p>

                            {/* Visual Clues for 3-5-8 */}
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '10px 0' }}>
                                {/* 3: Triangle */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <svg width="40" height="40" viewBox="0 0 100 100">
                                        <polygon points="50,15 90,85 10,85" fill="#e74c3c" stroke="#c0392b" strokeWidth="5" />
                                    </svg>
                                </div>
                                {/* 5: Pentagon (Star-like but Pentagon is clearer for counting sides? No, classic Star is 5 points) */}
                                {/* Let's use a Star for 5 */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <svg width="40" height="40" viewBox="0 0 100 100">
                                        <polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#f1c40f" stroke="#f39c12" strokeWidth="5" />
                                    </svg>
                                </div>
                                {/* 8: Spider/Octagon? Octagon is geometry. Spider is fun animal context. */}
                                {/* Octagon */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <svg width="40" height="40" viewBox="0 0 100 100">
                                        <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#3498db" stroke="#2980b9" strokeWidth="5" />
                                    </svg>
                                </div>
                            </div>

                            {/* Display */}
                            <div style={{
                                fontSize: '2rem', letterSpacing: '8px', fontWeight: 'bold',
                                background: '#2c3e50', color: '#2ecc71', padding: '5px 30px',
                                borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontFamily: 'monospace', minWidth: '140px', height: '60px' // Flex center with fixed height
                            }}>
                                {code.padEnd(3, '_')}
                            </div>

                            {/* Numpad */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
                                width: '100%', maxWidth: '240px'
                            }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <button key={n} onClick={() => handleCodeInput(n.toString())}
                                        className="btn-push"
                                        style={{
                                            height: '50px', fontSize: '1.4rem',
                                            background: 'white', border: 'none', borderRadius: '10px',
                                            boxShadow: '0 3px 0 #bdc3c7', color: '#2c3e50', fontWeight: 'bold'
                                        }}>
                                        {n}
                                    </button>
                                ))}
                                <button onClick={() => setCode("")} style={{ height: '50px', background: '#e74c3c', color: 'white', borderRadius: '10px', border: 'none', boxShadow: '0 3px 0 #c0392b', fontWeight: 'bold', fontSize: '1.2rem' }}>C</button>
                                <button onClick={() => handleCodeInput("0")} style={{ height: '50px', background: 'white', borderRadius: '10px', border: 'none', boxShadow: '0 3px 0 #bdc3c7', fontSize: '1.4rem', fontWeight: 'bold', color: '#2c3e50' }}>0</button>
                                <button onClick={handleCodeSubmit} style={{ height: '50px', background: '#2ecc71', color: 'white', borderRadius: '10px', border: 'none', boxShadow: '0 3px 0 #27ae60', fontWeight: 'bold', fontSize: '1rem' }}>OK</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback Overlay */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', zIndex: 20
                    }}
                        onClick={() => { if (feedback.status === 'wrong') setFeedback(null); }} // Click to dismiss
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                            {feedback.status === 'correct' ? '🎉' : '❌'}
                        </div>
                        <h2 style={{ color: feedback.status === 'correct' ? '#27ae60' : '#e74c3c' }}>
                            {feedback.message}
                        </h2>
                        {feedback.status === 'wrong' && (
                            <button className="btn-primary" style={{ marginTop: '20px', fontSize: '1.2rem', padding: '10px 30px' }}
                                onClick={(e) => { e.stopPropagation(); setFeedback(null); }}>
                                {t('game_retry')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Level27_ComplexMissionLevel;
