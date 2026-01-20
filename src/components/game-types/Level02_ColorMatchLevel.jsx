import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const ColorMatchLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [items, setItems] = useState([]);
    const [baskets, setBaskets] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- REFACTOR: Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const itemsRef = useRef(items);

    useEffect(() => { itemsRef.current = items; }, [items]);

    const initLevel = () => {
        const colors = [
            { id: 'red', label: t.l2_red, color: '#FF6B6B' },
            { id: 'blue', label: t.l2_blue, color: '#4ECDC4' },
            { id: 'green', label: t.l2_green, color: '#90D056' },
            { id: 'yellow', label: t.l2_yellow, color: '#FFE66D' }
        ];

        const initialItems = [];
        colors.forEach(c => {
            initialItems.push({ id: `${c.id}-1`, type: c.id, color: c.color, icon: '🍎' });
            initialItems.push({ id: `${c.id}-2`, type: c.id, color: c.color, icon: '🧢' });
        });

        const iconMap = {
            'red': ['🍎', '🍓'],
            'blue': ['🐳', '🚙'],
            'green': ['🐸', '🐢'],
            'yellow': ['🍌', '⭐️']
        };

        const refinedItems = initialItems.map((item, index) => {
            const variant = index % 2;
            return {
                ...item,
                icon: iconMap[item.type][variant]
            };
        });

        const shuffledItems = [...refinedItems].sort(() => Math.random() - 0.5);

        setItems(shuffledItems);
        setBaskets(colors);
        setScore(0);
        setMistakes(0);
        setShowFailOverlay(false);
        draggingRef.current = null;
    };

    useEffect(() => { initLevel(); }, [language]); // Re-init if language changes (for labels)

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
            const basketElement = dropTarget?.closest('.basket-wrapper');

            if (basketElement) {
                const basketId = basketElement.dataset.id;
                if (basketId) {
                    processMatch(draggingRef.current.itemId, basketId);
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

    const processMatch = (itemId, basketColor) => {
        const currentItems = itemsRef.current;
        const item = currentItems.find(i => i.id === itemId);

        if (item && !item.matched) {
            if (item.type === basketColor) {
                playSfx(SFX.CLICK);
                const newItems = currentItems.map(i => i.id === itemId ? { ...i, matched: true } : i);
                setItems(newItems);

                setScore(prev => {
                    const newScore = prev + 1;
                    if (newScore >= currentItems.length) {
                        setMistakes(currMistakes => {
                            const errorRate = (currMistakes / currentItems.length) * 100;
                            let earnedStars = 0;
                            if (errorRate <= 5) earnedStars = 3;
                            else if (errorRate <= 20) earnedStars = 2;
                            else if (errorRate <= 40) earnedStars = 1;

                            setTimeout(() => {
                                if (earnedStars > 0) onComplete(earnedStars);
                                else setShowFailOverlay(true);
                            }, 500);
                            return currMistakes;
                        });
                    }
                    return newScore;
                });
            } else {
                playSfx(SFX.ERROR);
                setMistakes(prev => prev + 1);
            }
        }
    };

    const handlePointerDown = (e, item) => {
        if (item.matched) return;
        e.preventDefault();

        e.currentTarget.style.opacity = '0';
        draggingRef.current = { itemId: item.id, element: e.currentTarget };
        playSfx(SFX.DRAG);

        if (dragPreviewRef.current) {
            const clone = e.currentTarget.cloneNode(true);
            clone.style.position = 'relative';
            clone.style.left = '0';
            clone.style.top = '0';
            clone.style.opacity = '1';
            clone.style.transform = 'scale(1.2) rotate(10deg)';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    const renderBasket = (basket) => (
        <div key={basket.id} className="basket-wrapper" data-id={basket.id}
            style={{
                width: '100px', height: '120px', background: 'rgba(255,255,255,0.8)',
                border: `4px solid ${basket.color}`, borderRadius: '10px 10px 40px 40px',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
                position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
            <div style={{ marginBottom: '10px', fontSize: '2rem', marginTop: 'auto', pointerEvents: 'none' }}>
                <div style={{ width: '60px', height: '10px', background: basket.color, borderRadius: '10px', opacity: 0.5 }}></div>
            </div>
            <span style={{ position: 'absolute', top: '-15px', background: basket.color, color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold', pointerEvents: 'none' }}>
                {basket.label}
            </span>
        </div>
    );

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', touchAction: 'none' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '80px', height: '80px',
                pointerEvents: 'none', zIndex: 9999, display: 'none',
                justifyContent: 'center', alignItems: 'center',
                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'
            }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', margin: '10px 0 20px 0' }}>
                {levelNumber && (
                    <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        LEVEL {levelNumber}
                    </div>
                )}
                <h2 style={{
                    textAlign: 'center', color: '#555', margin: 0,
                    background: 'rgba(255,255,255,0.6)', padding: '10px 25px', borderRadius: '30px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '1.5rem', lineHeight: '1.4'
                }}>
                    {t.l2_title}<br />
                    <span style={{ fontSize: '1rem', color: '#777' }}>{t.l2_desc}</span>
                </h2>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div className="baskets-zone" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', padding: '20px 10px', minHeight: '140px' }}>
                {baskets.map(renderBasket)}
            </div>

            <div className="items-zone" style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px',
                padding: '20px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px 20px 0 0',
                minHeight: '200px', position: 'relative'
            }}>
                {items.map(item => (
                    <div key={item.id}
                        onPointerDown={(e) => handlePointerDown(e, item)}
                        style={{
                            width: '70px', height: '70px', fontSize: '3rem',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            opacity: item.matched ? 0 : 1,
                            cursor: 'grab', zIndex: 10, position: 'relative', userSelect: 'none', touchAction: 'none',
                            transition: 'opacity 0.2s'
                        }}>
                        <span style={{ pointerEvents: 'none' }}>{item.icon}</span>
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
                        <img src="assets/game_fail.png" style={{ width: '80px', height: '80px', marginBottom: '10px' }} alt="Failed" />
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{t.fail_title}</h2>
                        <p style={{ fontSize: '1rem' }}>
                            {t.game_mistakes.replace('{count}', mistakes)}<br />
                            {t.game_error_rate.replace('{rate}', Math.round((mistakes / items.length) * 100))}<br />
                            {t.fail_retry_prompt}
                        </p>
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

export default ColorMatchLevel;
