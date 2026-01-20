import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const RecyclingLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {

    const t = TEXT[language] || TEXT['zh-TW'];

    // Game Data
    const renderCustomIcon = (type) => {
        if (type === 'fish_bone') {
            return (
                <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }}>
                    {/* Head */}
                    <path d="M25 35 Q 40 25 45 50 Q 40 75 25 65 Q 10 50 25 35 Z" fill="#555" />
                    {/* Eye */}
                    <circle cx="25" cy="45" r="3" fill="white" />
                    {/* Spine */}
                    <path d="M45 50 Q 65 50 85 50" stroke="#555" strokeWidth="5" strokeLinecap="round" fill="none" />
                    {/* Ribs */}
                    <path d="M52 35 Q 56 50 52 65" stroke="#555" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M64 38 Q 68 50 64 62" stroke="#555" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M76 41 Q 80 50 76 59" stroke="#555" strokeWidth="4" strokeLinecap="round" fill="none" />
                    {/* Tail */}
                    <path d="M85 50 L 95 38 L 95 62 Z" fill="#555" />
                </svg>
            );
        }
        if (type === 'banana_peel') {
            return (
                <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(3px 3px 3px rgba(0,0,0,0.2))' }}>
                    {/* Inner Peel (Back) */}
                    <path d="M45 35 Q 35 60 50 65 Q 65 60 55 35" fill="#FFF9C4" stroke="#5D4037" strokeWidth="3" />

                    {/* Right Flap (Outer Skin) */}
                    <path d="M55 30 Q 80 40 85 65 Q 88 75 75 70 Q 60 60 55 50" fill="#FDD835" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Left Flap (Outer Skin) */}
                    <path d="M45 30 Q 20 40 15 65 Q 12 75 25 70 Q 40 60 45 50" fill="#FDD835" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Center Flap (Front - Main Draped part) */}
                    <path d="M42 30 Q 30 50 35 65 Q 50 80 65 65 Q 70 50 58 30" fill="#FDD835" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Blue Sticker */}
                    <ellipse cx="35" cy="55" rx="4" ry="3" fill="#1E88E5" transform="rotate(-20 35 55)" />

                    {/* Stalk */}
                    <path d="M42 32 Q 40 15 48 10 L 52 10 Q 60 15 58 32" fill="#FBC02D" stroke="#3E2723" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Stalk Top Detail */}
                    <ellipse cx="50" cy="10" rx="4" ry="2" fill="#5D4037" />
                </svg>
            );
        }
        if (type === 'apple_core') {
            return (
                <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.1))' }}>
                    {/* Bitten Left */}
                    <path d="M30 30 Q 45 50 30 70" fill="none" stroke="none" />
                    {/* Bitten Right */}
                    <path d="M70 30 Q 55 50 70 70" fill="none" stroke="none" />

                    {/* Main Core Shape */}
                    <path d="M30 30 Q 50 20 70 30 L 70 70 Q 50 80 30 70 Z" fill="#FFF3CD" />

                    {/* Top Part (Skin) */}
                    <path d="M25 35 Q 30 15 50 20 Q 70 15 75 35 Q 50 30 25 35" fill="#E74C3C" />

                    {/* Bottom Part (Skin) */}
                    <path d="M30 70 Q 50 75 70 70 Q 75 90 50 90 Q 25 90 30 70" fill="#E74C3C" />

                    {/* Bitten Areas (Curved in) - Actually drawing the core with curves via path above is simpler. 
                        Let's refine: Top chunk, Bottom chunk, thin middle. 
                     */}
                    {/* Redrawing for better "Bitten" look */}
                    {/* Top Chunk */}
                    <path d="M25 30 Q 50 15 75 30 Q 70 38 75 42 Q 50 38 25 42 Q 30 38 25 30" fill="#E74C3C" />
                    {/* Bottom Chunk */}
                    <path d="M28 65 Q 50 62 72 65 Q 75 80 50 85 Q 25 80 28 65" fill="#E74C3C" />
                    {/* Core Flesh Connecting */}
                    <path d="M25 40 Q 35 50 28 65 L 72 65 Q 65 50 75 40 L 75 42 Q 65 52 72 65 L 28 65 Q 35 52 25 42 Z" fill="#FFF3CD" />
                    {/* Simplified shape: Hourglass-ish */}
                    <path d="M26 35 Q 50 32 74 35 L 74 38 Q 60 50 74 62 L 74 65 Q 50 68 26 65 L 26 62 Q 40 50 26 38 Z" fill="#FFF3CD" />
                    <path d="M26 35 Q 20 20 50 15 Q 80 20 74 35" fill="#E74C3C" /> {/* Top Skin */}
                    <path d="M26 65 Q 20 80 50 85 Q 80 80 74 65" fill="#E74C3C" /> {/* Bottom Skin */}

                    {/* Seeds */}
                    <ellipse cx="45" cy="50" rx="3" ry="5" fill="#3E2723" transform="rotate(15 45 50)" />
                    <ellipse cx="55" cy="50" rx="3" ry="5" fill="#3E2723" transform="rotate(-15 55 50)" />

                    {/* Stalk */}
                    <path d="M50 15 Q 50 5 55 5" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M55 5 Q 65 8 60 12" fill="#4CAF50" /> {/* Leaf */}
                </svg>
            );
        }
        return null;
    };

    const bins = [
        { id: 'recycle', name: t.l13_bin_recycle, color: '#2ecc71', icon: '♻️' },
        { id: 'trash', name: t.l13_bin_trash, color: '#3498db', icon: '🗑️' },
        { id: 'compost', name: t.l13_bin_compost, color: '#e67e22', icon: 'banana_peel', isCustom: true }
    ];

    const items = [
        { id: 'bottle', name: t.l13_item_bottle, type: 'recycle', icon: '🍾' },
        { id: 'paper', name: t.l13_item_paper, type: 'recycle', icon: '📰' },
        { id: 'can', name: t.l13_item_can, type: 'recycle', icon: '🥫' },
        { id: 'tissue', name: t.l13_item_tissue, type: 'trash', icon: '🧻' },
        { id: 'plastic_bag', name: t.l13_item_bag, type: 'trash', icon: '🛍️' },
        { id: 'banana', name: t.l13_item_banana, type: 'compost', icon: 'banana_peel', isCustom: true },
        { id: 'fish_bone', name: t.l13_item_bone, type: 'compost', icon: 'fish_bone', isCustom: true },
        { id: 'apple', name: t.l13_item_apple, type: 'compost', icon: 'apple_core', isCustom: true }
    ];

    // State
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'

    // Drag State
    const [dragState, setDragState] = useState({
        isDragging: false,
        startPos: { x: 0, y: 0 },
        currentPos: { x: 0, y: 0 },
        offset: { x: 0, y: 0 }
    });

    const currentItem = items[currentItemIndex];
    const isFinished = currentItemIndex >= items.length;

    // Pointer Events
    const handlePointerDown = (e) => {
        if (isFinished || feedback) return;
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        setDragState({
            isDragging: true,
            startPos: { x: rect.left, y: rect.top },
            currentPos: { x: rect.left, y: rect.top },
            offset: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });
    };

    const handlePointerMove = (e) => {
        if (!dragState.isDragging) return;
        e.preventDefault();
        setDragState(prev => ({
            ...prev,
            currentPos: { x: e.clientX - prev.offset.x, y: e.clientY - prev.offset.y }
        }));
    };

    const handlePointerUp = (e) => {
        if (!dragState.isDragging) return;
        setDragState(prev => ({ ...prev, isDragging: false }));

        // Check drop target
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
        const binElement = dropTarget?.closest('.bin-target');

        if (binElement) {
            const binType = binElement.dataset.type;
            checkAnswer(binType);
        }
    };

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

    const checkAnswer = (binType) => {
        if (binType === currentItem.type) {
            // Correct
            setFeedback('correct');
            setScore(prev => prev + 1);
            setTimeout(() => {
                setFeedback(null);
                setCurrentItemIndex(prev => prev + 1);
            }, 800);
        } else {
            // Wrong
            setFeedback('wrong');
            setMistakes(prev => prev + 1);
            setTimeout(() => {
                setFeedback(null);
            }, 800);
        }
    };

    const handleLevelComplete = () => {
        let stars = 3;
        if (mistakes > 2) stars = 2;
        if (mistakes > 5) stars = 1;
        onComplete(stars);
    };

    return (
        <div className="game-level-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px', boxSizing: 'border-box' }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                {levelNumber && (
                    <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        LEVEL {levelNumber}
                    </div>
                )}
                <div style={{
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '30px',
                    padding: '5px 25px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ margin: '0', color: '#2c3e50', fontSize: '1.2rem' }}>{t.l13_title}</h2>
                    <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{t.l13_desc}</div>
                </div>

                <div style={{
                    marginTop: '10px',
                    padding: '2px 15px',
                    background: '#FFEBEE',
                    color: '#D32F2F',
                    borderRadius: '15px',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Bins Area - Flex Grow */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap', alignContent: 'center' }}>
                {bins.map(bin => (
                    <div
                        key={bin.id}
                        className="bin-target"
                        data-type={bin.id}
                        style={{
                            width: '28%', minWidth: '80px', maxWidth: '120px',
                            height: '140px', // Fixed height fine here
                            border: `3px solid ${bin.color}`,
                            borderRadius: '10px',
                            background: `${bin.color}22`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                            padding: '10px',
                            position: 'relative'
                        }}
                    >
                        <div style={{ fontSize: '3rem', flex: 1, display: 'flex', alignItems: 'center' }}>
                            {bin.isCustom ? <div style={{ width: '60px', height: '60px' }}>{renderCustomIcon(bin.icon)}</div> : bin.icon}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: bin.color }}>{bin.name}</div>
                    </div>
                ))}
            </div>

            {/* Draggable Item Area - Bottom Fixed */}
            <div style={{ flexShrink: 0, minHeight: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', paddingBottom: '10px' }}>
                {!isFinished && currentItem && (
                    <div
                        onPointerDown={handlePointerDown}
                        style={{
                            width: '100px', height: '100px',
                            background: 'white', borderRadius: '50%',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            cursor: dragState.isDragging ? 'grabbing' : 'grab',
                            position: dragState.isDragging ? 'fixed' : 'relative',
                            left: dragState.isDragging ? dragState.currentPos.x : 'auto',
                            top: dragState.isDragging ? dragState.currentPos.y : 'auto',
                            zIndex: 1000,
                            transform: dragState.isDragging ? 'scale(1.1)' : 'scale(1)',
                            touchAction: 'none',
                            pointerEvents: dragState.isDragging ? 'none' : 'auto'
                        }}
                    >
                        <div style={{ fontSize: '3.5rem', lineHeight: '1', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {currentItem.isCustom ? <div style={{ width: '70px', height: '70px' }}>{renderCustomIcon(currentItem.icon)}</div> : currentItem.icon}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#555', marginTop: '2px' }}>{currentItem.name}</div>

                        {/* Feedback Overlay */}
                        {feedback === 'correct' && (
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>✔</div>
                        )}
                        {feedback === 'wrong' && (
                            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(231, 76, 60, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '2rem' }}>✘</div>
                        )}
                    </div>
                )}

                {isFinished && (
                    <div style={{ animation: 'fadeIn 0.5s', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3>{t.l13_complete}</h3>
                        <button className="btn-primary" onClick={handleLevelComplete}>{t.game_get_stars}</button>
                    </div>
                )}
            </div>

            {!isFinished && <div style={{ fontSize: '0.9rem', color: '#999', textAlign: 'center', marginBottom: '10px' }}>
                {t.l13_remaining.replace('{count}', items.length - currentItemIndex)}
            </div>}
        </div>
    );
};

export default RecyclingLevel;
