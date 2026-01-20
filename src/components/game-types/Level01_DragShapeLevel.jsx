import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const DragShapeLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [shapes, setShapes] = useState([]);
    const [targets, setTargets] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // --- Refactored Drag State (Direct DOM) ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const shapesRef = useRef(shapes);

    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);

    const initLevel = () => {
        const initialShapes = [
            { id: 'circle', type: 'circle', color: '#FF6B6B' },
            { id: 'square', type: 'square', color: '#4ECDC4' },
            { id: 'triangle', type: 'triangle', color: '#FFE66D' },
            { id: 'star', type: 'star', color: '#FF9F43' },
            { id: 'pentagon', type: 'pentagon', color: '#A29BFE' },
        ];
        const shuffledShapes = [...initialShapes].sort(() => Math.random() - 0.5);
        const shuffledTargets = [...initialShapes].sort(() => Math.random() - 0.5).map(s => ({
            id: `t-${s.type}`, type: s.type
        }));

        setShapes(shuffledShapes);
        setTargets(shuffledTargets);
        setMistakes(0);
        setShowFailOverlay(false);
        draggingRef.current = null;
    };

    useEffect(() => { initLevel(); }, []);

    // --- Pointer Events ---
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

            // Restore Opacity
            if (draggingRef.current.element) {
                draggingRef.current.element.style.opacity = '1';
            }

            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            const targetElement = dropTarget?.closest('.svg-target-wrapper');

            if (targetElement) {
                const targetType = targetElement.dataset.type;
                if (targetType) {
                    processMatch(draggingRef.current.itemId, targetType);
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

    const processMatch = (shapeId, targetType) => {
        const currentShapes = shapesRef.current;
        const shape = currentShapes.find(s => s.id === shapeId);
        if (!shape || shape.matched) return;

        if (shape.type === targetType) {
            playSfx(SFX.CLICK);
            const newShapes = currentShapes.map(s => s.id === shapeId ? { ...s, matched: true } : s);
            setShapes(newShapes);

            const totalMatched = newShapes.filter(s => s.matched).length;
            if (totalMatched === newShapes.length) {
                const totalShapes = newShapes.length;
                setMistakes(currMistakes => {
                    const errorRate = (currMistakes / totalShapes) * 100;
                    let stars = 3;
                    if (errorRate > 5) stars = 2;
                    if (errorRate > 20) stars = 1;
                    if (errorRate > 40) stars = 0;
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

    const renderTargetShape = (type, filledColor) => {
        const commonProps = {
            fill: filledColor || "rgba(255,255,255,0.5)",
            stroke: filledColor ? "none" : "#aaa",
            strokeWidth: "3",
            strokeDasharray: filledColor ? "none" : "8,5"
        };
        if (type === 'circle') return <circle cx="50" cy="50" r="35" {...commonProps} />;
        if (type === 'square') return <rect x="15" y="15" width="70" height="70" rx="10" {...commonProps} />;
        if (type === 'triangle') return <polygon points="50,15 15,85 85,85" strokeLinejoin="round" {...commonProps} />;
        if (type === 'star') return <polygon points="50,5 61,35 95,35 68,55 79,85 50,70 21,85 32,55 5,35 39,35" strokeLinejoin="round" {...commonProps} />;
        if (type === 'pentagon') return <polygon points="50,5 95,38 79,90 21,90 5,38" strokeLinejoin="round" {...commonProps} />;
    };

    const renderDraggableShape = (type, color) => {
        if (type === 'circle') return <circle cx="40" cy="40" r="35" fill={color} />;
        if (type === 'square') return <rect x="10" y="10" width="60" height="60" rx="10" fill={color} />;
        if (type === 'triangle') return <polygon points="40,5 10,75 70,75" fill={color} strokeLinejoin="round" strokeWidth="5" stroke={color} />;
        if (type === 'star') return <polygon points="40,5 49,29 76,29 55,45 63,69 40,57 17,69 25,45 4,29 31,29" fill={color} strokeLinejoin="round" strokeWidth="3" stroke={color} />;
        if (type === 'pentagon') return <polygon points="40,5 76,31 63,73 17,73 4,31" fill={color} strokeLinejoin="round" strokeWidth="3" stroke={color} />;
    };

    return (
        <div className="game-level-container" style={{ touchAction: 'none' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '100px', height: '100px',
                pointerEvents: 'none', zIndex: 9999, display: 'none',
                justifyContent: 'center', alignItems: 'center',
                filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.4))'
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
                    {t.l1_instruction_title}<br />
                    <span style={{ fontSize: '1rem', color: '#777' }}>{t.l1_instruction_desc}</span>
                </h2>
                <div style={{
                    color: '#FF6B6B', fontWeight: 'bold',
                    background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                    fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div className="target-zone" style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px',
                padding: '10px', width: '100%', maxWidth: '600px', margin: '0 auto'
            }}>
                {targets.map(t => {
                    const matchedShape = shapes.find(s => s.matched && s.type === t.type);
                    return (
                        <div key={t.id} className="svg-target-wrapper" data-type={t.type}
                            style={{ width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <svg width="90" height="90" viewBox="0 0 100 100" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                                {renderTargetShape(t.type, matchedShape?.color)}
                                {matchedShape && <circle cx="85" cy="85" r="15" fill="#90D056" stroke="white" strokeWidth="2" />}
                                {matchedShape && <path d="M78 85 L83 90 L92 80" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                            </svg>
                            {!matchedShape && <div className="target-hint" style={{ position: 'absolute', fontSize: '1.5rem', color: '#ccc', pointerEvents: 'none' }}>?</div>}
                        </div>
                    );
                })}
            </div>

            <div style={{ flex: 1 }}></div>

            <div className="shapes-zone" style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px',
                padding: '20px', width: '100%', maxWidth: '600px', margin: '0 auto',
                background: 'rgba(255,255,255,0.3)', borderRadius: '20px 20px 0 0', position: 'relative'
            }}>
                {shapes.map(s => (
                    <div key={s.id}
                        onPointerDown={(e) => handlePointerDown(e, s)}
                        style={{
                            width: '70px', height: '70px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            opacity: s.matched ? 0 : 1, // Only hide if matched. Dragging hide handled by DOM.
                            transition: 'opacity 0.2s',
                            cursor: 'grab', zIndex: 10, position: 'relative', userSelect: 'none', touchAction: 'none'
                        }}>
                        <svg width="70" height="70" viewBox="0 0 80 80" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                            {renderDraggableShape(s.type, s.color)}
                        </svg>
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

export default DragShapeLevel;
