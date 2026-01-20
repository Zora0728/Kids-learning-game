import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { useTranslation } from 'react-i18next';

// Review Level 1: Chapter 1 Comprehensive Challenge
// Includes: Shapes (L1), Colors (L2), Numbers (L4), Phonics/Animals (L5/6)

const LevelS1_ReviewLevel1 = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [targets, setTargets] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [showWinOverlay, setShowWinOverlay] = useState(false);

    // Smooth Drag State 


    // Initialize Level Data (Mixed Content)
    const initLevel = () => {
        // Diverse Items
        const rawData = [
            { id: '1', type: 'shape', value: 'star', color: '#FFD700', label: t('ls1_item_star') || 'Star' },
            { id: '2', type: 'color', value: 'red_apple', color: '#FF5252', label: t('l17_food') || 'Apple' }, // Matches Red Basket
            { id: '3', type: 'number', value: '7', color: '#448AFF', label: '7' },
            { id: '4', type: 'animal', value: 'cat', color: '#FFA000', label: t('l6_cat') || 'Cat' },
            { id: '5', type: 'shape', value: 'triangle', color: '#69F0AE', label: t('ls1_item_triangle') || 'Triangle' },
            { id: '6', type: 'number', value: '3', color: '#E040FB', label: '3' }
        ];

        // Shuffle items for the "Pick Up" zone
        const shuffledItems = [...rawData].sort(() => Math.random() - 0.5).map(i => ({ ...i, matched: false }));

        // Targets correspond to the items
        // We need to clearly indicate what goes where.
        const targetConfig = rawData.map(i => ({
            id: `t-${i.id}`,
            matchId: i.id, // Only matches this specific item ID for review simplicity
            type: i.type,
            value: i.value,
            color: i.color,
            label: i.label // Hint text
        }));

        // Shuffle targets too? Or keep them ordered? 
        // Let's shuffle targets to make it a real matching game.
        const shuffledTargets = [...targetConfig].sort(() => Math.random() - 0.5);

        setItems(shuffledItems);
        setTargets(shuffledTargets);
        setMistakes(0);
        setShowWinOverlay(false);
        setMistakes(0);
        setShowWinOverlay(false);
    };

    useEffect(() => {
        initLevel();
    }, []);

    // --- Refactor: Direct DOM Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);

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

            if (dragPreviewRef.current) {
                dragPreviewRef.current.style.display = 'none';
                dragPreviewRef.current.innerHTML = ''; // Clear clone
            }
            if (draggingRef.current.element) draggingRef.current.element.style.opacity = '1';

            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            const targetElement = dropTarget?.closest('.review-target-wrapper');

            if (targetElement) {
                const targetMatchId = targetElement.dataset.matchId;
                if (targetMatchId) {
                    processMatch(draggingRef.current.itemId, targetMatchId);
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
    }, [items]); // Items needed for processMatch closure if not using Refs? 
    // processMatch uses 'items' state.
    // We should use a Ref for items or rely on dependency.
    // If we put [items] here, it re-binds listeners on every match. That's fine.

    // POINTER EVENTS
    const handlePointerDown = (e, item) => {
        if (item.matched) return;
        e.preventDefault();

        draggingRef.current = { itemId: item.id, element: e.currentTarget };
        e.currentTarget.style.opacity = '0';

        if (dragPreviewRef.current) {
            // Clone the visual content
            const clone = e.currentTarget.cloneNode(true);
            clone.style.opacity = '1';
            clone.style.transform = 'scale(1.1)'; // Slight pop
            clone.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    const processMatch = (itemId, targetMatchId) => {
        // Strict ID matching for this review level
        if (itemId === targetMatchId) {
            // Correct
            const newItems = items.map(i => i.id === itemId ? { ...i, matched: true } : i);
            setItems(newItems);

            const totalMatched = newItems.filter(i => i.matched).length;
            if (totalMatched === newItems.length) {
                // Success
                setTimeout(() => {
                    onComplete(3); // Always give 3 stars for Bonus Level completion to help player
                }, 500);
            }
        } else {
            // Wrong
            setMistakes(prev => prev + 1);
        }
    };

    // --- RENDER HELPERS --- //

    // 1. Shape Render
    const renderShape = (value, color) => {
        if (value === 'star') return <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ fill: color }}><polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" /></svg>;
        if (value === 'triangle') return <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ fill: color }}><polygon points="50,10 10,90 90,90" /></svg>;
        // Fallback
        return <div style={{ width: '100%', height: '100%', background: color, borderRadius: '50%' }}></div>;
    };

    // 2. Color/Object Render
    const renderObject = (value, color, isGhost) => {
        if (value === 'red_apple') return <span style={{ fontSize: isGhost ? '4rem' : '3rem', transition: 'font-size 0.3s' }}>🍎</span>;
        return <div style={{ width: isGhost ? '60px' : '40px', height: isGhost ? '60px' : '40px', background: color, borderRadius: '50%', border: '2px solid #fff' }}></div>;
    };

    // 3. Number Render
    const renderNumber = (value, color, isGhost) => {
        return <span style={{ fontSize: isGhost ? '5rem' : '3rem', fontWeight: 'bold', color: color, transition: 'font-size 0.3s' }}>{value}</span>;
    };

    // 4. Animal Render
    const renderAnimal = (value, isGhost) => {
        if (value === 'cat') return <span style={{ fontSize: isGhost ? '4rem' : '3rem', transition: 'font-size 0.3s' }}>🐱</span>;
        return <span>🐾</span>;
    };

    const renderItemContent = (item, isGhost = false) => {
        if (item.type === 'shape') return renderShape(item.value, item.color); // Shapes auto-scale
        if (item.type === 'color') return renderObject(item.value, item.color, isGhost);
        if (item.type === 'number') return renderNumber(item.value, item.color, isGhost);
        if (item.type === 'animal') return renderAnimal(item.value, isGhost);
        return null;
    };

    return (
        <div className="game-level-container" style={{
            background: 'linear-gradient(to bottom, #E1F5FE, #B3E5FC)',
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            paddingTop: '40px', // Slightly tight top to max space
            boxSizing: 'border-box' // Critical Fix: Ensure padding is included in height
        }}>
            {/* Header - Compact */}
            <div style={{ textAlign: 'center', padding: '5px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#0277BD', fontWeight: 'bold' }}>{t('ls1_bonus')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: '2px 0', color: '#01579B', fontSize: '1.5rem' }}>{t('ls1_title')}</h2>
                    <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '2px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 2px rgba(0,0,0,0.1)' }}>
                        {t('game_mistakes').replace('{count}', mistakes)}
                    </div>
                </div>
                <p style={{ margin: 0, color: '#0288D1', fontSize: '0.9rem' }}>{t('ls1_desc')}</p>
            </div>

            {/* Targets Grid - 2 Columns x 3 Rows */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
                padding: '5px', width: '85%', maxWidth: '340px', margin: '0 auto',
                background: 'rgba(255,255,255,0.5)', borderRadius: '15px',
                flexShrink: 1,
                minHeight: '0',
                flexShrink: 1,
                minHeight: '0',
                marginBottom: '220px' // Increased to ensure no overlap with bottom bar
            }}>
                {targets.map(t => {
                    const matchedItem = items.find(i => i.matched && i.id === t.matchId);

                    return (
                        <div key={t.id}
                            className="review-target-wrapper"
                            data-match-id={t.matchId}
                            style={{
                                height: '14vh', // Dynamic Height
                                width: '100%',
                                background: '#fff',
                                borderRadius: '12px',
                                border: '2px dashed #90A4AE',
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center',
                                position: 'relative',
                                boxShadow: matchedItem ? 'inset 0 0 10px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            {matchedItem ? (
                                // Render Matched Item
                                <div style={{ width: '60%', height: '60%', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'popIn 0.3s' }}>
                                    {renderItemContent(matchedItem)}
                                </div>
                            ) : (
                                // Render Hint
                                <>
                                    <div style={{ fontSize: '0.85rem', color: '#CFD8DC', textAlign: 'center', marginBottom: '5px', width: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {t.label}
                                    </div>
                                    {/* Ghost Icon Hint - LARGE */}
                                    <div style={{ opacity: 0.25, transform: 'scale(1)', filter: 'grayscale(100%)', width: '60%', height: '60%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {renderItemContent({ ...t }, true)}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Draggable Items Zone - Absolute Bottom Bar - 2 Rows */}
            <div style={{
                position: 'absolute',
                bottom: '18%', // Lowered from 22%
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '320px',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                justifyItems: 'center',
                gap: '15px',
                zIndex: 10,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '20px'
            }}>
                {items.map(item => {
                    const isDragging = false; // We use direct DOM preview, no react state for this to avoid lag

                    if (item.matched) return null; // Don't render in pick-up zone if matched

                    return (
                        <div
                            key={item.id}
                            onPointerDown={(e) => handlePointerDown(e, item)}
                            style={{
                                width: '60px', height: '60px',
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                opacity: 1, // Always visible (preview is clone)
                                transform: 'scale(1)',
                                cursor: 'grab',
                                touchAction: 'none'
                            }}
                        >
                            <div style={{ width: '70%', height: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {renderItemContent(item)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Drag Preview (Hidden by default, populated by cloning) */}
            <div ref={dragPreviewRef}
                style={{
                    position: 'fixed', top: 0, left: 0,
                    width: '80px', height: '80px', // slightly larger container
                    display: 'none', justifyContent: 'center', alignItems: 'center',
                    pointerEvents: 'none', zIndex: 9999,
                }}
            ></div>
        </div>
    );
};

export default LevelS1_ReviewLevel1;
