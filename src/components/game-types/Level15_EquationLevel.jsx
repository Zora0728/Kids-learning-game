import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level15_EquationLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // Equation Structure: part1 op part2 = result
    // Missing part is represented by '?'
    const [equation, setEquation] = useState({ part1: 0, op: '+', part2: 0, result: 0, missing: 'part1', answer: 0 });
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
    const [questionCount, setQuestionCount] = useState(0);
    const [mistakes, setMistakes] = useState(0);

    const generateEquation = () => {
        // Types: 0: ? + a = b, 1: a + ? = b, 2: ? - a = b, 3: a - ? = b
        const type = Math.floor(Math.random() * 4);

        let p1, p2, res, ans, missingStr;
        const op = type < 2 ? '+' : '-';

        if (op === '+') {
            p1 = Math.floor(Math.random() * 9) + 1; // 1-9
            p2 = Math.floor(Math.random() * 9) + 1; // 1-9
            res = p1 + p2;

            if (type === 0) { // ? + p2 = res
                ans = p1;
                missingStr = 'part1';
            } else { // p1 + ? = res
                ans = p2;
                missingStr = 'part2';
            }
        } else { // -
            // Ensure result is positive
            p1 = Math.floor(Math.random() * 10) + 5; // 5-14
            p2 = Math.floor(Math.random() * (p1 - 1)) + 1; // 1 to p1-1
            res = p1 - p2;

            if (type === 2) { // ? - p2 = res
                ans = p1;
                missingStr = 'part1';
            } else { // p1 - ? = res
                ans = p2;
                missingStr = 'part2';
            }
        }

        setEquation({
            part1: missingStr === 'part1' ? '?' : p1,
            op: op,
            part2: missingStr === 'part2' ? '?' : p2,
            result: res,
            missing: missingStr,
            answer: ans
        });

        // Generate Options (3 wrong, 1 correct)
        const opts = new Set();
        opts.add(ans);
        while (opts.size < 4) {
            let offset = Math.floor(Math.random() * 7) - 3; // -3 to +3
            let val = ans + offset;
            if (val >= 0 && val !== ans) opts.add(val);
            // Fallback to purely random if stuck
            if (opts.size < 4 && Math.random() < 0.1) opts.add(Math.floor(Math.random() * 20));
        }
        setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    };

    useEffect(() => {
        generateEquation();
    }, []);

    const handleOptionClick = (val) => {
        if (feedback) return;

        if (val === equation.answer) {
            setFeedback('correct');
            setTimeout(() => {
                setFeedback(null);
                const nextCount = questionCount + 1;
                setQuestionCount(nextCount);
                if (nextCount >= 5) {
                    let stars = 3;
                    if (mistakes > 1) stars = 2;
                    if (mistakes > 3) stars = 1;
                    onComplete(stars);
                } else {
                    generateEquation();
                }
            }, 1000);
        } else {
            setMistakes(prev => prev + 1);
            setFeedback('wrong');
            setTimeout(() => {
                setFeedback(null);
            }, 800);
        }
    };

    // Helper to render Box or Number
    const renderPart = (val) => {
        if (val === '?') {
            return (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '80px', height: '80px',
                    background: '#FFF9C4', // Pale Yellow
                    border: '4px dashed #FFB74D', // Orange dashed border
                    borderRadius: '15px',
                    color: '#FFB74D',
                    marginLeft: '10px', marginRight: '10px',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)',
                    verticalAlign: 'middle'
                }}>
                    <span style={{ fontSize: '3rem', fontWeight: 'bold' }}>?</span>
                </div>
            );
        }
        return <span style={{ margin: '0 10px' }}>{val}</span>;
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: '#F3E5F5', // Soft Purple
            paddingTop: '20px'
        }}>
            {/* Standard Title Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.2rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL {levelNumber}
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '30px',
                    padding: '15px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    minWidth: '280px'
                }}>
                    <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.5rem' }}>{t.l15_title}</h2>
                    <div style={{ color: '#7f8c8d', fontSize: '1.1rem', fontWeight: '500' }}>{t.l15_desc}</div>
                </div>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', marginTop: '10px'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Blackboard */}
            <div style={{
                position: 'relative',
                width: '90%', maxWidth: '380px',
                minHeight: '350px',
                background: '#37474F', // Softer Blackboard Color
                border: '10px solid #8D6E63', // Thinner, softer wood frame
                borderRadius: '20px',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white',
                fontFamily: '"Comic Sans MS", cursive, sans-serif'
            }}>
                {/* Chalk Dust Texture Overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
                    pointerEvents: 'none',
                    borderRadius: '10px'
                }}></div>

                {/* Progress */}
                {/* Progress - Moved to bottom right to avoid title overlap */}
                <div style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#81D4FA', opacity: 0.9 }}>
                    {t.l15_question}
                </div>

                {/* Progress - Below Question */}
                <div style={{ fontSize: '1rem', color: '#CFD8DC', opacity: 0.8, marginBottom: '30px' }}>
                    {questionCount + 1} / 5
                </div>

                {/* Equation Display */}
                <div style={{
                    fontSize: '3rem',
                    marginBottom: '50px',
                    fontFamily: '"Chalkboard SE", "Comic Sans MS", sans-serif',
                    textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'
                }}>
                    {renderPart(equation.part1)}
                    <span style={{ margin: '0 10px' }}>{equation.op}</span>
                    {renderPart(equation.part2)}
                    <span style={{ margin: '0 10px' }}>=</span>
                    <span style={{ margin: '0 10px' }}>{equation.result}</span>
                </div>

                {/* Feedback Icon Overlay */}
                {feedback && (
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        fontSize: '9rem',
                        zIndex: 10,
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))'
                    }}>
                        {feedback === 'correct' ? '🌟' : '❌'}
                    </div>
                )}
                <style>{`@keyframes popIn { from { transform: translate(-50%, -50%) scale(0); } to { transform: translate(-50%, -50%) scale(1); } }`}</style>

                {/* Options Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    width: '85%'
                }}>
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(opt)}
                            className="btn-option"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                border: '2px dashed rgba(255,255,255,0.6)',
                                borderRadius: '15px',
                                color: 'white',
                                fontSize: '1.8rem',
                                padding: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontFamily: '"Comic Sans MS", cursive, sans-serif'
                            }}
                            onPointerDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                            onPointerEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                                e.currentTarget.style.borderColor = 'white';
                            }}
                            onPointerLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Decorative Chalk */}
            <div style={{ marginTop: '15px', display: 'flex', gap: '15px', opacity: 0.8 }}>
                <div style={{ width: '60px', height: '20px', background: '#F8BBD0', borderRadius: '4px', transform: 'rotate(-5deg)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}></div>
                <div style={{ width: '40px', height: '20px', background: '#B39DDB', borderRadius: '4px', transform: 'rotate(10deg)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}></div>
            </div>

        </div>
    );
};

export default Level15_EquationLevel;
