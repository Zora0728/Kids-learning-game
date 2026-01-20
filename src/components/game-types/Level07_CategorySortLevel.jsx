import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const FORCE_UPDATE_V3 = true; // Fix ReferenceError setDragState

const CategorySortLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [items, setItems] = useState([]);
    const [bins, setBins] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [score, setScore] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const itemsRef = useRef(items);

    // CRITICAL HOTFIX: Dummy function to prevent ReferenceError if old code lingers
    const setDragState = (val) => { console.log("Phantom setDragState called", val); };

    useEffect(() => { itemsRef.current = items; }, [items]);

    const initLevel = () => {
        const categories = [
            { id: 'land', label: t.l7_land, color: '#95a5a6', icon: '🛣️' },
            { id: 'sky', label: t.l7_sky, color: '#74b9ff', icon: '☁️' }
        ];

        const rawItems = [
            { id: 'c1', type: 'land', icon: '🚗' },
            { id: 'c2', type: 'land', icon: '🚌' },
            { id: 'c3', type: 'land', icon: '🏎️' },
            { id: 'c4', type: 'land', icon: '🚓' },
            { id: 'p1', type: 'sky', icon: '✈️' },
            { id: 'p2', type: 'sky', icon: '🚁' },
            { id: 'p3', type: 'sky', icon: '🚀' },
            { id: 'p4', type: 'sky', icon: '🛸' }
        ];

        setItems(rawItems.sort(() => Math.random() - 0.5));
        setBins(categories);
        setMistakes(0);
        setScore(0);
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
            const binElement = dropTarget?.closest('.category-bin');

            if (binElement) {
                const binId = binElement.dataset.id;
                if (binId) {
                    checkMatch(draggingRef.current.itemId, binId);
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

    const checkMatch = (id, binType) => {
        const currentItems = itemsRef.current;
        const item = currentItems.find(i => i.id === id);

        if (item && !item.matched) {
            if (item.type === binType) {
                playSfx(SFX.CLICK);
                const newItems = currentItems.map(i => i.id === id ? { ...i, matched: true } : i);
                setItems(newItems);

                setScore(prev => {
                    const newScore = prev + 1;
                    if (newScore === currentItems.length) {
                        setMistakes(currMistakes => {
                            let stars = 3;
                            if (currMistakes > 0) stars = 2;
                            if (currMistakes > 2) stars = 1;
                            setTimeout(() => onComplete(stars), 500);
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
        <div className="game-level-container" style={{ width: '100%', maxWidth: '800px', margin: '0 auto', touchAction: 'none' }}>
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
                    {t.l7_title}<br />
                    <span style={{ fontSize: '1rem', color: '#777' }}>{t.l7_desc}</span>
                </h2>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '20px 0' }}>
                {bins.map(bin => (
                    <div key={bin.id} className="category-bin" data-id={bin.id}
                        style={{
                            width: '160px', height: '160px',
                            background: bin.color, borderRadius: '30px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            color: 'white', fontWeight: 'bold', fontSize: '1.5rem',
                            border: '4px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            userSelect: 'none'
                        }}>
                        <span style={{ fontSize: '7rem', marginBottom: '0px', lineHeight: '1', pointerEvents: 'none' }}>{bin.icon}</span>
                        {bin.label}
                    </div>
                ))}
            </div>

            <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px',
                padding: '20px', background: 'rgba(255,255,255,0.4)', borderRadius: '20px',
                minHeight: '120px', position: 'relative'
            }}>
                {items.map(item => (
                    <div key={item.id}
                        onPointerDown={(e) => !item.matched && handlePointerDown(e, item)}
                        style={{
                            fontSize: '3.5rem', cursor: item.matched ? 'default' : 'grab',
                            opacity: item.matched ? 0 : 1, // Drag hide via DOM
                            pointerEvents: item.matched ? 'none' : 'auto',
                            transform: 'scale(1)',
                            userSelect: 'none', touchAction: 'none',
                            transition: 'opacity 0.2s'
                        }}>
                        <div style={{ pointerEvents: 'none' }}>{item.icon}</div>
                    </div>
                ))}
            </div>

            {showFailOverlay && (
                <div className="fail-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className="fail-card" style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                        <img src="assets/game_fail.png" style={{ width: '80px', height: '80px', marginBottom: '10px' }} alt="Failed" />
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{t.fail_title}</h2>
                        <p>{t.fail_retry_prompt}</p>
                        <button className="btn-success" onClick={() => window.location.reload()}>{t.game_retry}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySortLevel;
