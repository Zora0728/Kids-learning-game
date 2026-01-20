import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const NumberOrderLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [matches, setMatches] = useState([]); // Array of size 5
    const [numbers, setNumbers] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- Refactor: Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const numbersRef = useRef(numbers);
    const matchesRef = useRef(matches);

    useEffect(() => { numbersRef.current = numbers; }, [numbers]);
    useEffect(() => { matchesRef.current = matches; }, [matches]);

    const initLevel = () => {
        const initialMatches = Array(5).fill(null);
        const initialNumbers = [
            { id: 'n1', value: 1, color: '#FF6B6B' },
            { id: 'n2', value: 2, color: '#4ECDC4' },
            { id: 'n3', value: 3, color: '#FFE66D' },
            { id: 'n4', value: 4, color: '#FF9F43' },
            { id: 'n5', value: 5, color: '#A29BFE' }
        ];

        const shuffledNumbers = [...initialNumbers].sort(() => Math.random() - 0.5);

        setMatches(initialMatches);
        setNumbers(shuffledNumbers);
        setMistakes(0);
        setShowFailOverlay(false);
        draggingRef.current = null;
    };

    useEffect(() => { initLevel(); }, []); // Re-init not sensitive to lang change here for content

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
            const slotElement = dropTarget?.closest('.target-slot');

            if (slotElement) {
                const slotIndexRaw = slotElement.dataset.index;
                if (slotIndexRaw !== undefined) {
                    processMatch(draggingRef.current.itemId, parseInt(slotIndexRaw));
                }
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
    }, []);

    const processMatch = (numId, slotIndex) => {
        const currentNumbers = numbersRef.current;
        const currentMatches = matchesRef.current;
        const num = currentNumbers.find(n => n.id === numId);

        if (num && !num.matched) {
            const targetValue = slotIndex + 1;

            if (currentMatches[slotIndex] === null) {
                if (num.value === targetValue) {
                    playSfx(SFX.CLICK);
                    const newMatches = [...currentMatches];
                    newMatches[slotIndex] = num;
                    setMatches(newMatches);

                    const newNumbers = currentNumbers.map(n => n.id === numId ? { ...n, matched: true } : n);
                    setNumbers(newNumbers);

                    const filledCount = newMatches.filter(n => n !== null).length;
                    if (filledCount === 5) {
                        setMistakes(currMistakes => {
                            const errorRate = (currMistakes / 5) * 100;
                            let stars = 3;
                            if (errorRate <= 5) stars = 3;
                            else if (errorRate <= 25) stars = 2;
                            else if (errorRate <= 45) stars = 1;
                            else stars = 0;

                            setTimeout(() => {
                                if (stars > 0) onComplete(stars);
                                else setShowFailOverlay(true);
                            }, 500);
                            return currMistakes;
                        });
                    }
                } else {
                    playSfx(SFX.ERROR);
                    setMistakes(prev => prev + 1);
                }
            }
        }
    };

    const handlePointerDown = (e, item) => {
        if (item.matched) return;
        e.preventDefault();
        playSfx(SFX.DRAG);

        e.currentTarget.style.opacity = '0';
        draggingRef.current = { itemId: item.id, element: e.currentTarget };

        if (dragPreviewRef.current) {
            const clone = e.currentTarget.cloneNode(true);
            clone.style.position = 'relative';
            clone.style.left = '0';
            clone.style.top = '0';
            clone.style.transform = 'rotate(-5deg) scale(1.2)';
            clone.style.opacity = '1';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    const renderTargetSlot = (match, index) => {
        const targetValue = index + 1;
        return (
            <div key={index} className="target-slot" data-index={index}
                style={{
                    width: '60px', height: '80px',
                    background: 'rgba(255,255,255,0.5)', border: '3px dashed #aaa', borderRadius: '10px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    position: 'relative', margin: '0 5px', userSelect: 'none'
                }}>
                {!match && <span style={{ fontSize: '2rem', color: 'rgba(0,0,0,0.1)', fontWeight: 'bold' }}>{targetValue}</span>}
                {match && (
                    <div style={{
                        width: '100%', height: '100%', background: match.color, borderRadius: '8px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '2rem', color: 'white', fontWeight: 'bold',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        {match.value}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '0 20px', boxSizing: 'border-box', touchAction: 'none' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '80px', height: '80px',
                pointerEvents: 'none', zIndex: 9999, display: 'none',
                justifyContent: 'center', alignItems: 'center',
                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'
            }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.2rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL {levelNumber}
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '30px', padding: '15px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '280px', marginBottom: '10px'
                }}>
                    <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '2.2rem' }}>{t.l4_title}</h2>
                    <div style={{ color: '#7f8c8d', fontSize: '1.1rem', fontWeight: '500' }}>{t.l4_desc}</div>
                </div>
                <div style={{
                    color: '#e74c3c', fontWeight: 'bold', background: '#fadbd8', padding: '5px 20px',
                    borderRadius: '20px', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div className="targets-zone" style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '20px', minHeight: '120px', background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px', margin: '0 10px 30px'
            }}>
                {matches.map((m, i) => renderTargetSlot(m, i))}
            </div>

            <div className="numbers-zone" style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px',
                padding: '30px 20px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px 20px 0 0',
                minHeight: '180px', position: 'relative'
            }}>
                {numbers.map(n => (
                    <div key={n.id}
                        onPointerDown={(e) => !n.matched && handlePointerDown(e, n)}
                        style={{
                            width: '60px', height: '80px', background: n.color, borderRadius: '10px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            fontSize: '2rem', color: 'white', fontWeight: 'bold',
                            cursor: n.matched ? 'default' : 'grab',
                            opacity: n.matched ? 0 : 1, // Drag hide via DOM
                            pointerEvents: n.matched ? 'none' : 'auto',
                            boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                            userSelect: 'none', touchAction: 'none', transition: 'opacity 0.2s'
                        }}>
                        <div style={{ pointerEvents: 'none' }}>{n.value}</div>
                    </div>
                ))}
            </div>

            {showFailOverlay && (
                <div className="fail-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 200, animation: 'fadeIn 0.3s'
                }}>
                    <div className="fail-card" style={{
                        background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '80%', maxWidth: '280px', border: '4px solid #f0f0f0'
                    }}>
                        <img src="/assets/game_fail.png" style={{ width: '80px', height: '80px', marginBottom: '10px' }} alt="Failed" />
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{t.fail_title}</h2>
                        <p style={{ fontSize: '1rem' }}>{t.game_mistakes.replace('{count}', mistakes)}<br />{t.fail_retry_prompt}</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="btn-success" onClick={onBack} style={{ padding: '10px' }}>{t.game_back}</button>
                            <button className="btn-primary" style={{ background: '#FF6B6B', padding: '10px' }} onClick={initLevel}>{t.game_retry}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NumberOrderLevel;
