import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level16_ScienceWaterLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // Simplified Stages for Kids
    const [stages, setStages] = useState([
        { id: 'evaporation', name: t.l16_stage_evap, icon: '♨️', description: t.l16_desc_evap },
        { id: 'condensation', name: t.l16_stage_cond, icon: '☁️', description: t.l16_desc_cond },
        { id: 'precipitation', name: t.l16_stage_prec, icon: '🌧️', description: t.l16_desc_prec },
        { id: 'collection', name: t.l16_stage_coll, icon: '🌊', description: t.l16_desc_coll }
    ]);

    // Drop Zones
    const [slots, setSlots] = useState([
        { id: 'zone_evap', correctId: 'evaporation', label: t.l16_label_rise, x: '25%', y: '60%', item: null },
        { id: 'zone_cond', correctId: 'condensation', label: t.l16_label_cloud, x: '50%', y: '20%', item: null },
        { id: 'zone_prec', correctId: 'precipitation', label: t.l16_label_rain, x: '75%', y: '40%', item: null },
        { id: 'zone_coll', correctId: 'collection', label: t.l16_label_sea, x: '50%', y: '85%', item: null }
    ]);

    // Fix Stale Closure: Keep a Ref of slots for Event Listeners
    const slotsRef = useRef(slots);
    useEffect(() => {
        slotsRef.current = slots;
    }, [slots]);

    const [mistakes, setMistakes] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Shuffle stages for the pool
    const [poolItems, setPoolItems] = useState([]);

    // --- Optimized Drag State (Refs) ---
    // Instead of state causing re-renders, we use Ref to move a specific DOM element specifically
    const dragPreviewRef = useRef(null);
    const draggingIdRef = useRef(null);

    // We still need some state to trigger the mount of the preview, but we won't update it during move
    const [activeDragId, setActiveDragId] = useState(null);

    useEffect(() => {
        setPoolItems([...stages].sort(() => Math.random() - 0.5));
    }, []);

    const handlePointerDown = (e, item) => {
        e.preventDefault();
        e.stopPropagation(); // Stop propagation

        // release capture so we can handle global move on window
        if (e.target.hasPointerCapture && e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId);
        }

        draggingIdRef.current = item.id;
        setActiveDragId(item.id);

        // Initial Position update (next tick to ensure DOM is ready)
        setTimeout(() => {
            if (dragPreviewRef.current) {
                const x = e.clientX;
                const y = e.clientY;
                dragPreviewRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.1) rotate(5deg)`;
                dragPreviewRef.current.style.display = 'flex';
            }
        }, 0);
    };

    const handlePointerMove = (e) => {
        if (!draggingIdRef.current || !dragPreviewRef.current) return;
        e.preventDefault();

        // Direct DOM update - High Performance, No React Render
        const x = e.clientX;
        const y = e.clientY;
        dragPreviewRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.1) rotate(5deg)`;
    };

    const handlePointerUp = (e) => {
        if (!draggingIdRef.current) return;

        const itemId = draggingIdRef.current;

        // Hit logic
        const container = document.querySelector('.cycle-diagram-area'); // Use specific class for better scoping
        let dropped = false;

        if (container) {
            const cRect = container.getBoundingClientRect();
            const hitX = e.clientX;
            const hitY = e.clientY;

            // Find closest slot
            let bestCandidate = null;
            let minDist = 9999;

            // Use REF to get latest slots state inside event listener
            slotsRef.current.forEach(slot => {
                // Convert % to px relative to container
                const sx = (parseFloat(slot.x) / 100) * cRect.width + cRect.left;
                const sy = (parseFloat(slot.y) / 100) * cRect.height + cRect.top;

                const dist = Math.hypot(hitX - sx, hitY - sy);

                if (dist < 70) { // Increased hit radius
                    if (dist < minDist) {
                        minDist = dist;
                        bestCandidate = slot;
                    }
                }
            });

            if (bestCandidate) {
                handleAttemptDrop(bestCandidate, itemId);
                dropped = true;
            }
        }

        if (!dropped) {
            // Feedback for returning to pool
            setFeedback({ status: 'info', message: t.l16_back });
            setTimeout(() => setFeedback(null), 1000);
        }

        // Cleanup
        draggingIdRef.current = null;
        setActiveDragId(null);
        if (dragPreviewRef.current) {
            dragPreviewRef.current.style.display = 'none';
        }
    };

    // Global Listeners for Move/Up (Passive=false to allow preventDefault)
    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    const handleAttemptDrop = (slot, itemId) => {
        if (slot.item) return; // Slot full

        const item = stages.find(s => s.id === itemId);
        if (!item) return;

        if (slot.correctId === itemId) {
            // Correct
            // Functional update to ensure we use latest state even if called async (though ref handles the main issue)
            setSlots(prev => {
                const newSlots = prev.map(s => s.id === slot.id ? { ...s, item: item } : s);
                // Check completion inside setter to guarantee freshness? 
                // Or use useEffect on slots change. 
                // Let's keep it simple: we need to trigger completion.
                // We'll calculate 'allFilled' here.
                const allFilled = newSlots.every(s => s.item);
                if (allFilled) {
                    setTimeout(() => setIsComplete(true), 500);
                }
                return newSlots;
            });

            setPoolItems(prev => prev.filter(i => i.id !== itemId));
            setFeedback({ status: 'correct', message: t.game_correct || 'Correct!' });
            setTimeout(() => setFeedback(null), 1000); // 1s feedback

            // Removed direct logic check here, moved inside setSlots or redundant check
        } else {
            // Wrong
            setMistakes(prev => prev + 1);
            setFeedback({ status: 'wrong', message: t.l16_wrong_place });
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    const handleLevelComplete = () => {
        let stars = 3;
        if (mistakes > 2) stars = 2;
        if (mistakes > 4) stars = 1;
        onComplete(stars);
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%',
            overflow: 'hidden', padding: '10px 10px 80px 10px', // Extra bottom padding for pool
            boxSizing: 'border-box', position: 'relative'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
                <div style={{ fontSize: '1rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    LEVEL 16
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '8px 30px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center'
                }}>
                    <h2 style={{ margin: '0 0 2px 0', color: '#2c3e50', fontSize: '1.5rem' }}>{t.l16_title}</h2>
                    <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.8rem' }}>{t.l16_desc}</p>
                </div>
                <div style={{
                    marginTop: '5px', padding: '2px 12px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Cycle Diagram Area - Flexible Grow with Min Height */}
            <div className="cycle-diagram-area" style={{
                position: 'relative', width: '100%', flex: '1 1 auto',
                minHeight: '350px', // CRITICAL: Prevent collapse
                maxHeight: '60vh', // Prevent it from becoming too tall on tablets
                background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%)',
                borderRadius: '20px', border: '4px solid #fff', overflow: 'hidden',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)',
                marginBottom: '15px'
            }}>
                {/* Background Decor */}
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '30%', background: '#2980b9' }}></div>
                <div style={{
                    position: 'absolute', bottom: '20%', left: '-10%', width: '40%', height: '60%',
                    background: '#95a5a6', borderRadius: '50% 50% 0 0', transform: 'rotate(10deg)'
                }}></div>
                <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '3.5rem' }}>☀️</div>

                {/* Drop Slots */}
                {slots.map((slot) => (
                    <div
                        key={slot.id}
                        style={{
                            position: 'absolute', left: slot.x, top: slot.y,
                            transform: 'translate(-50%, -50%)',
                            width: 'clamp(70px, 18vw, 90px)', height: 'clamp(70px, 18vw, 90px)', // Valid CSS Function
                            border: '3px dashed rgba(255,255,255,0.9)',
                            borderRadius: '50%',
                            background: slot.item ? 'white' : 'rgba(255,255,255,0.4)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            zIndex: 10,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        {slot.item ? (
                            <>
                                <div style={{ fontSize: '2rem' }}>{slot.item.icon}</div>
                                <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{slot.item.name}</div>
                            </>
                        ) : (
                            <div style={{ color: 'white', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '0.9rem' }}>
                                {slot.label}
                            </div>
                        )}
                    </div>
                ))}

                {/* Arrows */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="white" />
                        </marker>
                    </defs>
                    <path d="M 25% 60% Q 30% 40% 45% 25%" stroke="white" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="10 5" />
                    <path d="M 55% 25% Q 65% 25% 75% 35%" stroke="white" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="10 5" />
                    <path d="M 80% 45% Q 75% 65% 60% 80%" stroke="white" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="10 5" />
                    <path d="M 45% 85% Q 30% 80% 25% 65%" stroke="white" strokeWidth="4" fill="none" markerEnd="url(#arrowhead)" strokeDasharray="10 5" />
                </svg>

                {/* Feedback */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: feedback.status === 'correct' ? '#2ecc71' : '#e74c3c',
                        color: 'white', padding: '15px 30px', borderRadius: '50px',
                        fontSize: '1.5rem', fontWeight: 'bold', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        zIndex: 20, whiteSpace: 'nowrap'
                    }}>
                        {feedback.status === 'correct' ? '✅ ' : '❌ '}{feedback.message}
                    </div>
                )}
            </div>

            {/* Draggable Items Pool - Fixed Height at Bottom, Scrollable if needed */}
            <div style={{
                width: '100%',
                height: '130px', flexShrink: 0,
                background: 'white', borderRadius: '15px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
                touchAction: 'none',
                overflowX: 'auto', padding: '10px'
            }}>
                {poolItems.length > 0 ? (
                    poolItems.map((item) => (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item)}
                            style={{
                                width: '75px', height: '95px', flexShrink: 0,
                                background: '#f1f2f6', border: '2px solid #bdc3c7', borderRadius: '10px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                cursor: 'grab', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                userSelect: 'none', touchAction: 'none',
                                opacity: activeDragId === item.id ? 0.3 : 1
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>{item.icon}</div>
                            <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '0.8rem' }}>{item.name}</div>
                        </div>
                    ))
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        {isComplete && (
                            <button className="btn-success" onClick={handleLevelComplete} style={{ fontSize: '1.2rem', padding: '10px 40px', pulsate: 'true' }}>
                                {t.l16_complete}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Optimized High-Perf Drag Preview (Ref-based, no React render on move) */}
            <div
                ref={dragPreviewRef}
                style={{
                    position: 'fixed',
                    left: 0, top: 0, // Initial 0,0, moved by transform
                    width: '80px', height: '100px',
                    pointerEvents: 'none', zIndex: 9999,
                    background: '#f1f2f6', border: '2px solid #3498db', borderRadius: '10px',
                    display: 'none', // Hidden initially
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)', opacity: 0.9
                }}
            >
                {/* We can't easily dynamically change content of a single Ref without state. 
                    But since we only drag one active item, we can cheat: 
                    When dragging starts, we essentially cloning the visuals. 
                    Actually, cleaner way: Map the current active ID to find content. 
                */}
                {(() => {
                    const item = stages.find(s => s.id === activeDragId);
                    return item ? (
                        <>
                            <div style={{ fontSize: '2.5rem', marginBottom: '5px' }}>{item.icon}</div>
                            <div style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '0.9rem' }}>{item.name}</div>
                        </>
                    ) : null;
                })()}
            </div>
        </div>
    );
};

export default Level16_ScienceWaterLevel;
