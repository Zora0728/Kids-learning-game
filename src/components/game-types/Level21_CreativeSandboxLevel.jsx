import { useState, useRef, useEffect } from 'react';
import '../../App.css';
import '../../App.css';
import { useTranslation } from 'react-i18next';

const Level21_CreativeSandboxLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();

    // --- Configuration (Scenic Layout - Decoupled) ---
    const SHOW_DEBUG = false;

    // 1. Static Scenery (Landmarks)
    const LANDMARKS = [
        { id: 'l_tree', x: 20, y: 50 },
        { id: 'l_house', x: 80, y: 47 },
        { id: 'l_stump', x: 35, y: 70 },
        { id: 'l_table', x: 80, y: 70 },
        { id: 'l_bush', x: 25, y: 90 },
    ];

    // 2. Interactive Drop Zones (Shadows)
    const TARGETS = [
        // Owl (Near Tree)
        { id: 't1', x: 25, y: 45, width: 25, height: 25, label: t('l21_t1'), type: 'small', correctItem: 'owl', scaleMsg: '0.8' },

        // Gift (Left of House)
        { id: 't3', x: 60, y: 55, width: 35, height: 35, label: t('l21_t3'), type: 'big', correctItem: 'gift', scaleMsg: '1.6' },

        // Fox (Above Stump)
        { id: 't5', x: 36, y: 63, width: 25, height: 25, label: t('l21_t5'), type: 'med', correctItem: 'fox', scaleMsg: '1.2' },

        // Bear (Left of Table)
        { id: 't2', x: 65, y: 75, width: 30, height: 30, label: t('l21_t2'), type: 'big', correctItem: 'bear', scaleMsg: '1.6' },

        // Dog (In Bush)
        { id: 't4', x: 35, y: 87, width: 25, height: 25, label: t('l21_t4'), type: 'small', correctItem: 'dog', scaleMsg: '0.8' },
    ];

    const ITEMS = [
        { id: 'bear', icon: '🐻', name: t('l21_i1'), correctScale: 'big' }, // Changed to Big
        { id: 'owl', icon: '🦉', name: t('l21_i2'), correctScale: 'small' },
        { id: 'gift', icon: '🎁', name: t('l21_i3'), correctScale: 'big' },
        { id: 'dog', icon: '🐶', name: t('l21_i4'), correctScale: 'small' },
        { id: 'fox', icon: '🦊', name: t('l21_i5'), correctScale: 'med' },
    ];

    const SCALES = [
        { id: 'small', val: 0.8, label: t('l21_scale_s') || 'S', msg: 'x0.8' },
        { id: 'med', val: 1.2, label: t('l21_scale_m') || 'M', msg: 'x1.2' },
        { id: 'big', val: 1.6, label: t('l21_scale_l') || 'L', msg: 'x1.6' },
    ];

    // --- State ---
    const [selectedScale, setSelectedScale] = useState('med'); // 'small', 'med', 'big'
    const [placedItems, setPlacedItems] = useState([]); // { itemId, x, y, scale }
    const [feedback, setFeedback] = useState(null); // { status, message }
    const [mistakes, setMistakes] = useState(0);
    const [selectedId, setSelectedId] = useState(null); // For drag highlighting
    const [scaleVal, setScaleVal] = useState(1.2);

    // Pointer Drag State
    const [dragState, setDragState] = useState({
        isDragging: false,
        itemId: null,
        startPos: { x: 0, y: 0 },
        currentPos: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
        scale: 1.2
    });

    // Update scale value when selection changes
    useEffect(() => {
        const s = SCALES.find(sc => sc.id === selectedScale);
        if (s) setScaleVal(s.val);
    }, [selectedScale]);

    // --- Pointer Events Logic (Mobile Compatible) ---
    const handlePointerDown = (e, item) => {
        if (feedback) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();

        // Calculate offset from center of item for smoother pickup
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        setDragState({
            isDragging: true,
            itemId: item.id,
            startPos: { x: centerX, y: centerY },
            currentPos: { x: e.clientX, y: e.clientY },
            offset: { x: e.clientX - centerX, y: e.clientY - centerY },
            scale: scaleVal, // Capture current scale
            icon: item.icon // Pass icon for visual
        });
        setSelectedId(item.id);
    };

    const handlePointerMove = (e) => {
        if (!dragState.isDragging) return;
        e.preventDefault();
        setDragState(prev => ({
            ...prev,
            currentPos: { x: e.clientX, y: e.clientY }
        }));
    };

    const handlePointerUp = (e) => {
        if (!dragState.isDragging) return;

        // Check drops
        const dropX = e.clientX;
        const dropY = e.clientY;

        // Find if dropped on any target
        // We need to check intersection with target DOM elements
        // Helper: get elements at point
        const elements = document.elementsFromPoint(dropX, dropY);
        const targetElement = elements.find(el => el.dataset.targetId); // We will add data-target-id to targets

        if (targetElement) {
            const tId = targetElement.dataset.targetId;
            const target = TARGETS.find(t => t.id === tId);
            if (target) {
                handleDropLogic(target, dragState.itemId, dragState.scale);
            }
        }

        setDragState(prev => ({ ...prev, isDragging: false, itemId: null }));
        setSelectedId(null);
    };

    // Global listeners for move/up
    useEffect(() => {
        if (dragState.isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState.isDragging]);


    const handleDropLogic = (target, itemId, droppedScale) => {
        const item = ITEMS.find(i => i.id === itemId);
        if (!item) return;

        // Check Match
        if (target.correctItem !== item.id) {
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t('l17_wrong_item') }); // "Wrong Item"
            setTimeout(() => setFeedback(null), 1000);
            return;
        }

        // Check Scale
        const correctScaleObj = SCALES.find(s => s.id === target.type);
        if (!correctScaleObj || Math.abs(droppedScale - correctScaleObj.val) > 0.01) {
            setMistakes(m => m + 1);
            setFeedback({ status: 'wrong', message: t('l16_wrong_place') || "Wrong Size!" });
            setTimeout(() => setFeedback(null), 1000);
            return;
        }

        // Success
        setPlacedItems(prev => [...prev, {
            itemId: item.id,
            x: target.x,
            y: target.y,
            scale: droppedScale
        }]);

        setFeedback({ status: 'correct', message: t('game_correct') });
        setTimeout(() => setFeedback(null), 1000);

        // Check Win
        if (placedItems.length + 1 >= TARGETS.length) {
            setTimeout(() => {
                let stars = 3;
                if (mistakes > 2) stars = 2;
                if (mistakes > 5) stars = 1;
                onComplete(stars);
            }, 1000);
        }
    };

    // Helper to render complex landmarks
    const renderLandmark = (id) => {
        switch (id) {
            case 'l_tree':
                return <div style={{ fontSize: '35cqmin', lineHeight: 1 }}>🌳</div>;
            case 'l_house':
                return <div style={{ fontSize: '35cqmin', lineHeight: 1 }}>🏠</div>;
            case 'l_stump':
                return <div style={{ fontSize: '10cqmin', lineHeight: 1 }}>🪵</div>;
            case 'l_table':
                return (
                    <div style={{
                        width: '16cqmin', height: '10cqmin', background: '#8D6E63',
                        borderRadius: '6px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ position: 'absolute', bottom: '-70%', left: '15%', width: '12%', height: '70%', background: '#6D4C41', borderRadius: '0 0 4px 4px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-70%', right: '15%', width: '12%', height: '70%', background: '#6D4C41', borderRadius: '0 0 4px 4px' }}></div>
                        <div style={{ fontSize: '5cqmin', marginBottom: '20%', lineHeight: 1 }}>🎂</div>
                    </div>
                );
            case 'l_bush':
                return (
                    <div style={{ width: '20cqmin', height: '12cqmin' }}>
                        <svg viewBox="0 0 100 60" width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <circle cx="20" cy="45" r="22" fill="#66BB6A" />
                            <circle cx="80" cy="45" r="22" fill="#66BB6A" />
                            <circle cx="50" cy="35" r="28" fill="#81C784" />
                            <circle cx="35" cy="55" r="20" fill="#66BB6A" />
                            <circle cx="65" cy="55" r="20" fill="#66BB6A" />
                            <g transform="translate(30, 30)"><circle cx="0" cy="0" r="5" fill="white" /><circle cx="0" cy="0" r="2" fill="#FFEB3B" /></g>
                            <g transform="translate(70, 40)"><circle cx="0" cy="0" r="5" fill="white" /><circle cx="0" cy="0" r="2" fill="#FFEB3B" /></g>
                            <g transform="translate(50, 55)"><circle cx="0" cy="0" r="5" fill="white" /><circle cx="0" cy="0" r="2" fill="#FFEB3B" /></g>
                        </svg>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="game-container" style={{
            display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
            padding: '10px 20px', maxWidth: '800px', margin: '0 auto', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)', color: '#5D4037'
        }}>
            {/* Header - Figure 1 Style */}
            <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>


                <h3 style={{ textAlign: 'center', margin: '0 0 5px 0', color: '#90A4AE', letterSpacing: '1px' }}>LEVEL 21</h3>

                <div style={{
                    background: 'white', borderRadius: '40px', padding: '10px 20px',
                    textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    maxWidth: '400px', margin: '0 auto'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.6rem', color: '#37474F' }}>{t('l21_title')}</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', color: '#78909C', fontSize: '0.9rem' }}>
                        <span>{t('l21_desc')}</span>
                        <span>✨</span>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                    <div style={{ background: '#E3F2FD', color: '#1565C0', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {t('l21_complete').replace('{current}', placedItems.length).replace('{total}', TARGETS.length)}
                    </div>
                    <div style={{ background: '#FFEBEE', color: '#C62828', padding: '5px 15px', borderRadius: '15px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {t('game_mistakes').replace('{count}', mistakes)}
                    </div>
                </div>
            </div>

            {/* Sandbox Area (Map) - Scene Composition */}
            <div
                id="game-sand-box"
                style={{
                    width: '100%',
                    maxWidth: '500px', // Constrain width for portrait ratio
                    aspectRatio: '4/5', // Lock aspect ratio
                    height: 'auto', // Allow height to be determined by ratio
                    maxHeight: '70vh', // Prevent vertical overflow
                    margin: '0 auto', // Center horizontally
                    boxSizing: 'border-box', // Include border in width calculation
                    containerType: 'size', // Enable Size Queries (Width & Height)
                    // Sky (Top 55%) and Grass (Bottom 45%)
                    background: 'linear-gradient(to bottom, #FFF3E0 0%, #FFF3E0 55%, #DCEDC8 55%, #C5E1A5 100%)',
                    borderRadius: '25px', overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: '8px solid white',
                    zIndex: 1
                }}>

                {/* --- Debug Grid --- */}
                {SHOW_DEBUG && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                        {/* Horizontal Lines */}
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(y => (
                            <div key={'h' + y} style={{ position: 'absolute', top: `${y}%`, width: '100%', height: '1px', background: 'rgba(0,0,0,0.1)' }}>
                                <span style={{ position: 'absolute', left: '2px', top: '-10px', fontSize: '0.6rem', color: '#555' }}>y:{y}</span>
                            </div>
                        ))}
                        {/* Vertical Lines */}
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(x => (
                            <div key={'v' + x} style={{ position: 'absolute', left: `${x}%`, height: '100%', width: '1px', background: 'rgba(0,0,0,0.1)' }}>
                                <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '0.6rem', color: '#555' }}>x:{x}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- Decor (Cloud & Bunting) --- */}
                <div style={{ position: 'absolute', top: '10%', left: '40%', fontSize: '15cqmin', opacity: 0.8, zIndex: 3, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>☁️</div>
                <div style={{ position: 'absolute', top: '8%', right: '20%', fontSize: '10cqmin', opacity: 0.6, zIndex: 3 }}>☁️</div>

                {/* Bunting (Spanning Tree to House approx) */}
                <div style={{ position: 'absolute', top: '40%', left: '20%', width: '60%', height: '40px', zIndex: 2 }}>
                    <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 20" style={{ overflow: 'visible' }}>
                        <path d="M0,5 Q10,25 20,5 T40,5 T60,5 T80,5 T100,5" fill="none" stroke="#A1887F" strokeWidth="0.8" />
                        <path d="M0,5 Q5,20 10,5 Z" fill="#FFAB91" />
                        <path d="M10,5 Q15,20 20,5 Z" fill="#FFE082" />
                        <path d="M20,5 Q25,20 30,5 Z" fill="#81D4FA" />
                        <path d="M30,5 Q35,20 40,5 Z" fill="#A5D6A7" />
                        <path d="M40,5 Q45,20 50,5 Z" fill="#E1BEE7" />
                        <path d="M50,5 Q55,20 60,5 Z" fill="#FFCC80" />
                        <path d="M60,5 Q65,20 70,5 Z" fill="#80CBC4" />
                        <path d="M70,5 Q75,20 80,5 Z" fill="#90CAF9" />
                        <path d="M80,5 Q85,20 90,5 Z" fill="#C5E1A5" />
                    </svg>
                </div>

                {/* --- Landmarks (Static Visuals) --- */}
                {LANDMARKS.map(l => (
                    <div key={l.id} style={{
                        position: 'absolute',
                        left: `${l.x}%`, top: `${l.y}%`,
                        transform: `translate(-50%, -50%) translate(0, ${l.y < 50 ? '-10%' : '0'})`, // Slight tweak for horizon items
                        zIndex: l.y > 60 ? 20 : 5, // Foreground vs Background
                        pointerEvents: 'none', // Non-interactive
                        filter: 'sepia(0.1) drop-shadow(0 5px 15px rgba(0,0,0,0.1))',
                        whiteSpace: 'nowrap'
                    }}>
                        {renderLandmark(l.id)}
                        {SHOW_DEBUG && (
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                background: 'green', color: 'white', fontSize: '0.6rem', padding: '2px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 101, opacity: 0.8
                            }}>
                                {l.id} ({l.x},{l.y})
                            </div>
                        )}
                    </div>
                ))}

                {/* --- Interactive Targets (Shadows) --- */}
                {TARGETS.map(target => {
                    const isDone = placedItems.find(p => p.itemId === target.correctItem);
                    const itemDef = ITEMS.find(it => it.id === target.correctItem);

                    return (
                        <div key={target.id}
                            data-target-id={target.id}
                            style={{
                                position: 'absolute',
                                left: `${target.x}%`, top: `${target.y}%`,
                                transform: `translate(-50%, -50%)`,
                                width: target.type === 'big' ? '18%' : target.type === 'med' ? '15%' : '12%',
                                height: target.type === 'big' ? '18%' : target.type === 'med' ? '15%' : '12%',
                                aspectRatio: '1/1',
                                overflow: 'visible',
                                zIndex: 30,
                                border: SHOW_DEBUG ? '2px dashed red' : 'none',
                                display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}>

                            {/* Animal Silhouette */}
                            <div style={{
                                fontSize: target.type === 'big' ? '15cqmin' : target.type === 'med' ? '12cqmin' : '9cqmin',
                                filter: 'brightness(0) opacity(0.3)',
                                pointerEvents: 'none',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                                width: '100%', height: '100%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}>
                                {itemDef.icon}
                            </div>

                            {/* Debug Coordinates */}
                            {SHOW_DEBUG && (
                                <div style={{
                                    position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'black', color: 'white', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '4px',
                                    whiteSpace: 'nowrap', zIndex: 100
                                }}>
                                    {target.correctItem}: {target.x}, {target.y}
                                </div>
                            )}

                            {/* Shadow Visual ("Slot") */}
                            <div style={{
                                width: '100%', height: '100%',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '50%',
                                filter: 'blur(5px)',
                                transform: 'scaleY(0.5) translateY(50%)', // Flattened shadow on ground
                                opacity: isDone ? 0 : 1, transition: 'opacity 0.5s'
                            }}></div>

                            {/* Placed Item */}
                            {placedItems.filter(p => p.itemId === target.correctItem).map((p, i) => (
                                <div key={i} style={{
                                    position: 'absolute', top: '50%', left: '50%',
                                    transform: `translate(-50%, -50%)`,
                                    fontSize: target.type === 'big' ? '15cqmin' : target.type === 'med' ? '12cqmin' : '9cqmin',
                                    pointerEvents: 'none',
                                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    lineHeight: 1, whiteSpace: 'nowrap', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}>
                                    {itemDef?.icon}
                                </div>
                            ))}
                        </div>
                    );
                })}

                <style>{`
                    @keyframes popIn {
                        from { transform: translate(-50%, -50%) translate(0, 0) scale(0); opacity: 0; }
                    }
                `}</style>

                {
                    feedback && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: feedback.status === 'correct' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)',
                            color: 'white', padding: '15px 30px', borderRadius: '50px',
                            fontSize: '1.5rem', fontWeight: 'bold', zIndex: 100,
                            animation: 'fadeInOut 0.5s',
                            whiteSpace: 'nowrap'
                        }}>
                            {feedback.message}
                        </div>
                    )
                }

                {/* Floating Drag Proxy */}
                {dragState.isDragging && (
                    <div style={{
                        position: 'fixed',
                        left: dragState.currentPos.x,
                        top: dragState.currentPos.y,
                        transform: 'translate(-50%, -50%)',
                        fontSize: dragState.scale === 1.6 ? '150px' : dragState.scale === 1.2 ? '120px' : '90px', // px fallback for fixed
                        pointerEvents: 'none',
                        zIndex: 9999,
                        opacity: 0.8
                    }}>
                        <div style={{
                            fontSize: dragState.scale === 1.6 ? '15cqmin' : dragState.scale === 1.2 ? '12cqmin' : '9cqmin',
                            lineHeight: 1
                        }}>
                            {dragState.icon}
                        </div>
                    </div>
                )}
            </div >

            {/* Controls */}
            <div style={{
                marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px',
                width: '100%', maxWidth: '500px', margin: '10px auto'
            }}>
                {/* Scale Selector */}
                < div style={{
                    display: 'flex', justifyContent: 'center', gap: '20px',
                    background: '#fff', padding: '10px', borderRadius: '20px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                }}>
                    {
                        SCALES.map(s => (
                            <button key={s.id}
                                onClick={() => setSelectedScale(s.id)}
                                style={{
                                    padding: '8px 20px', borderRadius: '15px', border: 'none',
                                    background: selectedScale === s.id ? '#3498db' : '#ecf0f1',
                                    color: selectedScale === s.id ? 'white' : '#7f8c8d',
                                    fontWeight: 'bold', fontSize: '1rem',
                                    transform: selectedScale === s.id ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'all 0.2s', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                                }}
                            >
                                <span>{s.label}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>x{s.val}</span>
                            </button>
                        ))
                    }
                </div >

                {/* Item Dock */}
                {/* Item Dock */}
                <div style={{
                    background: 'rgba(255,255,255,0.8)', padding: '15px', borderRadius: '20px 20px 0 0',
                    display: 'flex', justifyContent: 'center', gap: '10px', overflowX: 'auto',
                    width: '100%', boxSizing: 'border-box', minHeight: '100px',
                    containerType: 'inline-size'
                }}>
                    {
                        ITEMS.map(item => {
                            const isPlaced = placedItems.find(p => p.itemId === item.id);
                            if (isPlaced) return null; // Hide if placed

                            return (
                                <div key={item.id}
                                    onPointerDown={(e) => handlePointerDown(e, item)}
                                    style={{
                                        fontSize: '12cqmin', // Standard size for dock
                                        cursor: 'grab',
                                        opacity: selectedId === item.id ? 0.5 : 1,
                                        transform: 'scale(1)', transition: 'transform 0.1s',
                                        touchAction: 'none',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    {item.icon}
                                </div>
                            );
                        })
                    }
                    {
                        placedItems.length === ITEMS.length && (
                            <div style={{ fontSize: '1.2rem', color: '#27ae60', fontWeight: 'bold', padding: '10px' }}>
                                🎉 {t('game_complete') || "Complete!"}
                            </div>
                        )
                    }
                </div >
            </div >

            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -40%); }
                    20% { opacity: 1; transform: translate(-50%, -50%); }
                    80% { opacity: 1; transform: translate(-50%, -50%); }
                    100% { opacity: 0; transform: translate(-50%, -60%); }
                }
            `}</style>
        </div >
    );
};

export default Level21_CreativeSandboxLevel;
