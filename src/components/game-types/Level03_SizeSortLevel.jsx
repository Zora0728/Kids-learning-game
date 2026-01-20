import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const SizeSortLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [items, setItems] = useState([]);
    const [baskets, setBaskets] = useState([]);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);
    const [showWinOverlay, setShowWinOverlay] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- Refactor: Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const itemsRef = useRef(items);

    useEffect(() => { itemsRef.current = items; }, [items]);

    const initLevel = () => {
        const categories = [
            { id: 'big', label: t.l3_big, scale: 1.5, color: '#FF9F43' },
            { id: 'small', label: t.l3_small, scale: 0.8, color: '#54a0ff' }
        ];

        const baseIcons = ['🍎', '⭐️', '🚙', '🐸'];
        const initialItems = [];

        baseIcons.forEach((icon, index) => {
            initialItems.push({ id: `big-${index}`, type: 'big', icon: icon, scale: 1.6, color: '#FF9F43' });
            initialItems.push({ id: `small-${index}`, type: 'small', icon: icon, scale: 0.7, color: '#54a0ff' });
        });

        const shuffledItems = [...initialItems].sort(() => Math.random() - 0.5);

        setItems(shuffledItems);
        setBaskets(categories);
        setScore(0);
        setMistakes(0);
        setShowFailOverlay(false);
        setShowWinOverlay(false);
        draggingRef.current = null;
    };

    useEffect(() => { initLevel(); }, [language]); // Re-init if language changes

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

            // 1. Hide preview
            if (dragPreviewRef.current) dragPreviewRef.current.style.display = 'none';

            // 2. BOunding Box Collision Detection (More Robust)
            const cursorX = e.clientX;
            const cursorY = e.clientY;

            // Find all baskets
            const baskets = document.querySelectorAll('.basket-wrapper');
            let matchedBasketId = null;

            baskets.forEach(basket => {
                const rect = basket.getBoundingClientRect();
                if (cursorX >= rect.left && cursorX <= rect.right &&
                    cursorY >= rect.top && cursorY <= rect.bottom) {
                    matchedBasketId = basket.dataset.id;
                }
            });

            // 3. Restore original element
            if (draggingRef.current.element) {
                draggingRef.current.element.style.opacity = '1';
                draggingRef.current.element.style.pointerEvents = 'auto';
            }

            if (matchedBasketId) {
                processMatch(draggingRef.current.itemId, matchedBasketId);
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

    const [debugInfo, setDebugInfo] = useState('');

    const processMatch = (itemId, basketType) => {
        const currentItems = itemsRef.current;
        const item = currentItems.find(i => i.id === itemId);

        setDebugInfo(`Try: ${itemId} -> ${basketType}`);

        if (item && !item.matched) {
            // Force string comparison to be safe
            if (String(item.type) === String(basketType)) {
                setDebugInfo(`SUCCESS: ${itemId} matched ${basketType}`);
                playSfx(SFX.CLICK);

                // Update Items State
                setItems(prev => prev.map(i => i.id === itemId ? { ...i, matched: true } : i));

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
                                if (earnedStars > 0) {
                                    onComplete(earnedStars);
                                } else {
                                    setShowFailOverlay(true);
                                }
                            }, 500);
                            return currMistakes;
                        });
                    }
                    return newScore;
                });
            } else {
                setDebugInfo(`FAIL: ${item.type} != ${basketType}`);
                playSfx(SFX.ERROR);
                setMistakes(prev => prev + 1);
            }
        } else {
            setDebugInfo(`ERR: Item ${itemId} not found or matched`);
        }
    };

    const handlePointerDown = (e, item) => {
        if (item.matched) return;
        e.preventDefault();
        playSfx(SFX.DRAG);

        e.currentTarget.style.opacity = '0';
        e.currentTarget.style.pointerEvents = 'none'; // CRITICAL FIX: Allow click-through to basket
        draggingRef.current = { itemId: item.id, element: e.currentTarget };

        if (dragPreviewRef.current) {
            const clone = e.currentTarget.cloneNode(true);
            // Reset position styles for the clone to ensure it centers correctly
            clone.style.position = 'absolute';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.margin = '0';
            clone.style.opacity = '1';
            clone.style.transform = `scale(${item.scale * 1.2})`;
            clone.style.pointerEvents = 'none'; // Critical: ignore pointer events on clone

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            // Center the container on the cursor
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    const renderBasket = (basket) => {
        // Find items that match this basket and are already matched
        const matchedItems = items.filter(i => i.matched && i.type === basket.id);

        return (
            <div key={basket.id} className="basket-wrapper" data-id={basket.id}
                style={{
                    width: basket.id === 'big' ? '140px' : '100px',
                    height: basket.id === 'big' ? '140px' : '100px',
                    background: 'rgba(255,255,255,0.8)',
                    border: `4px solid ${basket.color}`,
                    borderRadius: '20px',
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center',
                    position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s'
                }}>
                <span style={{ fontSize: basket.id === 'big' ? '3rem' : '1.5rem', pointerEvents: 'none', opacity: matchedItems.length > 0 ? 0.3 : 1 }}>📦</span>

                {/* Visual Feedback: Show matched items inside */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '2px', padding: '10px' }}>
                    {matchedItems.map(item => (
                        <div key={item.id} style={{ fontSize: '1.5rem', animation: 'popIn 0.3s' }}>{item.icon}</div>
                    ))}
                </div>

                <span style={{
                    position: 'absolute', bottom: '-15px', background: basket.color, color: 'white',
                    padding: '2px 15px', borderRadius: '15px', fontSize: '1rem', fontWeight: 'bold',
                    pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 5
                }}>
                    {basket.label}
                </span>
            </div>
        );
    };

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', touchAction: 'none' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '100px', height: '100px',
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
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>{t.l3_title}</h2>
                    <p style={{ margin: '5px 0', color: '#7f8c8d' }}>{t.l3_desc}</p>
                </div>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div className="baskets-zone" style={{
                display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '40px',
                padding: '20px 10px', minHeight: '180px'
            }}>
                {baskets.map(renderBasket)}
            </div>

            <div className="items-zone" style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px',
                padding: '20px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px 20px 0 0',
                minHeight: '200px', position: 'relative'
            }}>
                {items.map(item => {
                    if (item.matched) return null;
                    return (
                        <div key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item)}
                            style={{
                                width: '80px', height: '80px', fontSize: '3rem',
                                display: 'flex',
                                justifyContent: 'center', alignItems: 'center',
                                opacity: 1,
                                cursor: 'grab', zIndex: 10, position: 'relative', userSelect: 'none', touchAction: 'none',
                                transform: `scale(${item.scale})`,
                                transition: 'opacity 0.2s'
                            }}>
                            <div style={{ pointerEvents: 'none' }}>{item.icon}</div>
                        </div>
                    );
                })}
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

export default SizeSortLevel;
