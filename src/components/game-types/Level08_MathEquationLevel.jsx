import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const MathEquationLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [currentRound, setCurrentRound] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [options, setOptions] = useState([]);

    // Use t helper
    const t = TEXT[language] || TEXT['zh-TW'];

    // Questions: 5 + ? = 8
    const questions = [
        { type: 'missing_addend', num1: 2, num2: 3, sum: 5, icon: '🍎', color: '#ff7675' },  // 2 + ? = 5
        { type: 'missing_addend', num1: 4, num2: 4, sum: 8, icon: '🚙', color: '#74b9ff' },  // 4 + ? = 8
        { type: 'sum', num1: 3, num2: 4, sum: 7, icon: '⭐', color: '#ffeaa7' },             // 3 + 4 = ?
    ];

    const q = questions[currentRound];

    const getAnswer = () => {
        if (q.type === 'missing_addend') return q.sum - q.num1;
        if (q.type === 'sum') return q.num1 + q.num2;
        return 0;
    };

    const targetAnswer = getAnswer();

    useEffect(() => {
        initRound();
    }, [currentRound]);

    const initRound = () => {
        const correctAnswer = getAnswer();
        let opts = [correctAnswer];
        while (opts.length < 3) {
            const r = Math.floor(Math.random() * 9) + 1;
            if (!opts.includes(r)) opts.push(r);
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setOptions(opts.sort(() => Math.random() - 0.5));
    };

    // --- Refactor: Direct DOM Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);

    useEffect(() => {
        const handleMove = (e) => {
            if (!draggingRef.current || !dragPreviewRef.current) return;
            e.preventDefault();
            const x = e.clientX;
            const y = e.clientY;
            dragPreviewRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        };

        const handleUp = (e) => {
            if (!draggingRef.current) return;
            e.preventDefault();

            if (dragPreviewRef.current) dragPreviewRef.current.style.display = 'none';
            if (draggingRef.current.element) draggingRef.current.element.style.opacity = '1';

            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            const answerSlot = dropTarget?.closest('.answer-slot');

            if (answerSlot) {
                checkAnswer(draggingRef.current.itemId);
            }
            draggingRef.current = null;
        };

        window.addEventListener('pointermove', handleMove, { passive: false });
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        };
    }, [currentRound]);

    const handlePointerDown = (e, val) => {
        e.preventDefault();

        draggingRef.current = { itemId: val, element: e.currentTarget };
        e.currentTarget.style.opacity = '0';

        if (dragPreviewRef.current) {
            dragPreviewRef.current.innerText = val; // Set content
            dragPreviewRef.current.style.background = questions[currentRound].color; // Set color
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    const checkAnswer = (val) => {
        if (val === targetAnswer) {
            // Correct
            if (currentRound < questions.length - 1) {
                setCurrentRound(prev => prev + 1);
            } else {
                const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
                onComplete(stars);
            }
        } else {
            setMistakes(prev => prev + 1);
        }
    };

    const renderCount = (count, icon) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80px', gap: '2px' }}>
            {Array(count).fill(0).map((_, i) => (
                <span key={i} style={{ fontSize: '1.2rem', lineHeight: 1 }}>{icon}</span>
            ))}
        </div>
    );

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', margin: '10px 0 20px 0' }}>
                {levelNumber && (
                    <div style={{
                        fontSize: '0.9rem', color: '#888', fontWeight: 'bold',
                        letterSpacing: '1px', textTransform: 'uppercase'
                    }}>
                        LEVEL {levelNumber}
                    </div>
                )}
                <h2 style={{
                    textAlign: 'center', color: '#555', margin: 0,
                    background: 'rgba(255,255,255,0.6)', padding: '10px 25px', borderRadius: '30px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '1.5rem',
                    lineHeight: '1.4'
                }}>
                    {t.l8_title} ({currentRound + 1}/{questions.length})<br />
                    <span style={{ fontSize: '1rem', color: '#777' }}>{t.l8_desc}</span>
                </h2>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Equation Area */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                marginTop: '10px', padding: '20px', background: 'white', borderRadius: '20px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
                {/* Part 1 */}
                <div style={{ textAlign: 'center' }}>
                    {renderCount(q.num1, q.icon)}
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#555' }}>{q.num1}</div>
                </div>

                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#888' }}>+</div>

                {/* Part 2 (Might be missing) */}
                <div style={{ textAlign: 'center' }}>
                    {q.type === 'missing_addend' ? (
                        <div
                            className="answer-slot"
                            style={{
                                width: '80px', height: '80px', background: '#f0f0f0',
                                border: '3px dashed #aaa', borderRadius: '15px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '2.5rem', color: '#ccc',
                                userSelect: 'none'
                            }}
                        >
                            ?
                        </div>
                    ) : (
                        <>
                            {renderCount(q.num2, q.icon)}
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#555' }}>{q.num2}</div>
                        </>
                    )}
                </div>

                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#888' }}>=</div>

                {/* Sum (Might be missing) */}
                <div style={{ textAlign: 'center' }}>
                    {q.type === 'sum' ? (
                        <div
                            className="answer-slot"
                            style={{
                                width: '80px', height: '80px', background: '#f0f0f0',
                                border: '3px dashed #aaa', borderRadius: '15px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '2.5rem', color: '#ccc',
                                userSelect: 'none'
                            }}
                        >
                            ?
                        </div>
                    ) : (
                        <>
                            {renderCount(q.sum, q.icon)}
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#555' }}>{q.sum}</div>
                        </>
                    )}
                </div>
            </div>

            {/* Drag Preview (Hidden by default) */}
            <div ref={dragPreviewRef}
                style={{
                    position: 'fixed', top: 0, left: 0,
                    width: '70px', height: '70px',
                    borderRadius: '50%',
                    display: 'none', justifyContent: 'center', alignItems: 'center',
                    fontSize: '2.5rem', fontWeight: 'bold', color: 'white',
                    pointerEvents: 'none', zIndex: 9999,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                    transform: 'translate(-50%, -50%)', // Centered
                }}
            ></div>

            {/* Draggable Options */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '50px', position: 'relative' }}>
                {options.map((opt, i) => (
                    <div key={i}
                        onPointerDown={(e) => handlePointerDown(e, opt)}
                        style={{
                            width: '70px', height: '70px',
                            background: q.color,
                            borderRadius: '50%',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontSize: '2.5rem', fontWeight: 'bold', color: 'white',
                            cursor: 'grab', boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                            userSelect: 'none', touchAction: 'none'
                        }}
                    >
                        <div style={{ pointerEvents: 'none' }}>{opt}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MathEquationLevel;
