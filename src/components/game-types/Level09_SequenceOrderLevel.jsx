import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const SequenceOrderLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [matches, setMatches] = useState(Array(4).fill(null));
    const [items, setItems] = useState([]);
    const [mistakes, setMistakes] = useState(0);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const matchesRef = useRef(matches);
    const itemsRef = useRef(items);

    useEffect(() => { matchesRef.current = matches; }, [matches]);
    useEffect(() => { itemsRef.current = items; }, [items]);

    const initLevel = () => {
        // Daily Routine Sequence
        const data = [
            { id: 1, icon: '🌅', label: t.l9_wakeup, color: '#ffeaa7' },
            { id: 2, icon: '🪥', label: t.l9_brush, color: '#74b9ff' },
            { id: 3, icon: '🍳', label: t.l9_breakfast, color: '#ff7675' },
            { id: 4, icon: '🎒', label: t.l9_school, color: '#a29bfe' }
        ];

        setItems(data.sort(() => Math.random() - 0.5));
        setMatches(Array(4).fill(null));
        setMistakes(0);
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
            const slotElement = dropTarget?.closest('.sequence-slot');

            if (slotElement) {
                const slotIndexRaw = slotElement.dataset.index;
                if (slotIndexRaw !== undefined) {
                    checkPlacement(draggingRef.current.itemId, parseInt(slotIndexRaw));
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

    const checkPlacement = (id, slotIndex) => {
        const currentMatches = matchesRef.current;
        const currentItems = itemsRef.current;
        const targetId = slotIndex + 1; // 1-based sequence

        if (currentMatches[slotIndex] === null) {
            if (id === targetId) {
                playSfx(SFX.CLICK);
                const newMatches = [...currentMatches];
                newMatches[slotIndex] = currentItems.find(i => i.id === id);
                setMatches(newMatches);

                // Mark item as used (matched)
                setItems(prev => prev.map(i => i.id === id ? { ...i, matched: true } : i));

                // Check Win
                if (newMatches.filter(Boolean).length === 4) {
                    // Use functional update for mistakes to be safe
                    setMistakes(currMistakes => {
                        let stars = 3;
                        if (currMistakes > 0) stars = 2;
                        if (currMistakes > 2) stars = 1;

                        setTimeout(() => onComplete(stars), 500);
                        return currMistakes;
                    });
                }
            } else {
                playSfx(SFX.ERROR);
                setMistakes(prev => prev + 1);
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
            clone.style.transform = 'scale(1.1) rotate(-3deg)';
            clone.style.opacity = '1';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    return (
        <div className="game-level-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', touchAction: 'none', padding: '10px', boxSizing: 'border-box' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '90px', height: '110px',
                pointerEvents: 'none', zIndex: 9999, display: 'none',
                justifyContent: 'center', alignItems: 'center',
                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'
            }}></div>

            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                {levelNumber && (
                    <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        LEVEL {levelNumber}
                    </div>
                )}
                <h2 style={{
                    textAlign: 'center', color: '#555', margin: 0,
                    background: 'rgba(255,255,255,0.6)', padding: '5px 20px', borderRadius: '30px',
                    fontSize: '1.2rem', lineHeight: '1.4'
                }}>
                    {t.l9_title}<br />
                    <span style={{ fontSize: '0.9rem', color: '#777' }}>{t.l9_desc}</span>
                </h2>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '2px 15px', borderRadius: '15px',
                    fontSize: '0.9rem'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Slots Area - Flexible */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap', alignContent: 'center' }}>
                {matches.map((m, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {i > 0 && <div style={{ position: 'absolute', left: '-10px', top: '50%', color: '#ccc', transform: 'translateY(-50%)' }}>➡</div>}
                        <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#999', fontSize: '0.9rem' }}>{i + 1}</div>
                        <div className="sequence-slot" data-index={i}
                            style={{
                                width: '80px', height: '100px', // Slightly smaller
                                background: m ? m.color : '#f0f0f0',
                                border: '3px dashed #aaa', borderRadius: '15px',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                transition: 'all 0.3s', userSelect: 'none'
                            }}>
                            {m ? (
                                <>
                                    <div style={{ fontSize: '2.5rem' }}>{m.icon}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>{m.label}</div>
                                </>
                            ) : (
                                <div style={{ fontSize: '1.5rem', color: '#ddd' }}>?</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pickup Area - Fixed at Bottom */}
            <div style={{
                flexShrink: 0,
                display: 'flex', justifyContent: 'center', gap: '15px',
                padding: '10px 0',
                flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '20px 20px 0 0'
            }}>
                {items.map(item => (
                    <div key={item.id}
                        onPointerDown={(e) => !item.matched && handlePointerDown(e, item)}
                        style={{
                            width: '70px', height: '90px', // Compact
                            background: item.matched ? '#eee' : 'white',
                            border: `3px solid ${item.color}`, borderRadius: '15px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            cursor: item.matched ? 'default' : 'grab',
                            opacity: item.matched ? 0 : 1,
                            pointerEvents: item.matched ? 'none' : 'auto',
                            boxShadow: '0 5px 10px rgba(0,0,0,0.05)',
                            userSelect: 'none', touchAction: 'none',
                            transition: 'opacity 0.2s'
                        }}>
                        <div style={{ pointerEvents: 'none', fontSize: '2.5rem' }}>{item.icon}</div>
                        <div style={{ pointerEvents: 'none', fontSize: '0.8rem', color: '#555', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.1' }}>{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SequenceOrderLevel;
