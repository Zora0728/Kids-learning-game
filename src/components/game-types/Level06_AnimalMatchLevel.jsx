import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const AnimalMatchLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [items, setItems] = useState([]);
    const [targets, setTargets] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [matches, setMatches] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const itemsRef = useRef(items);
    const targetsRef = useRef(targets);

    useEffect(() => { itemsRef.current = items; }, [items]);
    useEffect(() => { targetsRef.current = targets; }, [targets]);

    const initLevel = () => {
        const data = [
            { id: 'dog', img: '🐶', name: t.l6_dog, color: '#FF7675' },
            { id: 'cat', img: '🐱', name: t.l6_cat, color: '#FFE66D' },
            { id: 'lion', img: '🦁', name: t.l6_lion, color: '#fab1a0' },
            { id: 'rabbit', img: '🐰', name: t.l6_rabbit, color: '#74B9FF' }
        ];

        // Items to drag (Images)
        const draggableItems = data.map(d => ({ ...d, matched: false }));
        // Targets (Names with empty slots)
        const targetSlots = data.map(d => ({ ...d, filled: false }));

        setItems(draggableItems.sort(() => Math.random() - 0.5));
        setTargets(targetSlots.sort(() => Math.random() - 0.5));
        setMistakes(0);
        setMatches(0);
        setShowFailOverlay(false);
        draggingRef.current = null;
    };

    useEffect(() => { initLevel(); }, [language]);

    // --- Global Pointer Events ---
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
            const targetElement = dropTarget?.closest('.target-name-slot');

            if (targetElement) {
                const targetId = targetElement.dataset.id;
                if (targetId) {
                    processMatch(draggingRef.current.itemId, targetId);
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

    const processMatch = (draggedId, targetId) => {
        const currentItems = itemsRef.current;
        const currentTargets = targetsRef.current;

        if (draggedId === targetId) {
            // Match!
            playSfx(SFX.CLICK);
            const item = currentItems.find(i => i.id === draggedId);
            setItems(prev => prev.map(i => i.id === draggedId ? { ...i, matched: true } : i));
            setTargets(prev => prev.map(t => t.id === targetId ? { ...t, filled: true, matchedItem: item.img } : t));

            // We need to track matches. Since state updates are async, we can't trust 'matches' state immediately inside this loop if called rapidly (though unlikely here).
            // Better to calculate based on new state or just functional update.
            setMatches(prevMatches => {
                const newMatches = prevMatches + 1;
                if (newMatches === currentItems.length) {
                    // Win
                    // Use functional update for mistakes to be safe
                    setMistakes(currentMistakes => {
                        let stars = 3;
                        if (currentMistakes > 0) stars = 2;
                        if (currentMistakes > 2) stars = 1;
                        setTimeout(() => {
                            onComplete(stars);
                        }, 500);
                        return currentMistakes;
                    });
                }
                return newMatches;
            });
        } else {
            playSfx(SFX.ERROR);
            setMistakes(prev => prev + 1);
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
            clone.style.transform = 'scale(1.2)';
            clone.style.opacity = '1';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', touchAction: 'none' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '60px', height: '60px',
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
                    {t.l6_title}<br />
                    <span style={{ fontSize: '1rem', color: '#777' }}>{t.l6_desc}</span>
                </h2>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
                {/* Draggable Images */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {items.map(item => (
                        <div key={item.id}
                            onPointerDown={(e) => !item.matched && handlePointerDown(e, item)}
                            style={{
                                width: '60px', height: '60px',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '3rem', cursor: 'grab',
                                opacity: item.matched ? 0 : 1, // Drag hide via DOM
                                pointerEvents: item.matched ? 'none' : 'auto',
                                border: 'none', borderRadius: '50%',
                                userSelect: 'none', touchAction: 'none',
                                transition: 'opacity 0.2s'
                            }}>
                            <div style={{ pointerEvents: 'none' }}>{item.img}</div>
                        </div>
                    ))}
                </div>

                {/* Target Names */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {targets.map(target => (
                        <div key={target.id} className="target-name-slot" data-id={target.id}
                            style={{
                                width: '200px', height: '60px',
                                background: target.filled ? target.color : '#f0f0f0',
                                border: '2px dashed #ccc', borderRadius: '15px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
                                transition: 'all 0.3s', userSelect: 'none'
                            }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#555' }}>{target.name}</span>
                            {target.filled && <span style={{ fontSize: '2rem' }}>{target.matchedItem}</span>}
                            {!target.filled && <div style={{ width: '40px', height: '40px', border: '1px dashed #999', borderRadius: '50%' }}></div>}
                        </div>
                    ))}
                </div>
            </div>

            {showFailOverlay && (
                <div className="fail-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className="fail-card" style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                        <img src="/assets/game_fail.png" style={{ width: '80px', height: '80px', marginBottom: '10px' }} alt="Failed" />
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{t.fail_title}</h2>
                        <p>{t.fail_retry_prompt}</p>
                        <button className="btn-success" onClick={() => window.location.reload()}>{t.game_retry}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnimalMatchLevel;
