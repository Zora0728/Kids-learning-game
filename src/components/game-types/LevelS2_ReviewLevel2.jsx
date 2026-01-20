import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { useTranslation } from 'react-i18next';

// Review Level 2: Chapter 2 Comprehensive Challenge
// Includes: Math (L8), Logic (L9/10), Recycling (L13), Rhythm (L14)

const ReviewLevel2 = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [targets, setTargets] = useState([]);
    const [mistakes, setMistakes] = useState(0);

    // Smooth Drag State 


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
        return null;
    };

    // Initialize Level Data
    const initLevel = () => {
        // Solution Items (The tools you drag)
        const rawData = [
            { id: '1', type: 'math', value: '3', color: '#FF5252', label: '3', icon: '3️⃣' },
            { id: '2', type: 'recycle', value: 'green_bin', color: '#2E7D32', label: t('l13_bin_recycle'), icon: '♻️' },
            { id: '3', type: 'recycle', value: 'orange_bin', color: '#EF6C00', label: t('l13_bin_compost'), icon: 'banana_peel', isCustom: true },
            { id: '4', type: 'rhythm', value: 'drum', color: '#D84315', label: t('l14_pad_red'), icon: '🥁' },
            { id: '5', type: 'logic', value: 'key', color: '#FBC02D', label: t('ls2_item_key'), icon: '🔑' },
            { id: '6', type: 'pixel', value: 'block', color: '#424242', label: t('ls2_item_block'), icon: '⬛' }
        ];

        // Shuffle items for the "Pick Up" zone
        const shuffledItems = [...rawData].sort(() => Math.random() - 0.5).map(i => ({ ...i, matched: false }));

        // Problem Targets (Where you drop them)
        const targetConfig = rawData.map(i => {
            let problemText = "";
            let problemIcon = "";
            let bgColor = "#fff";

            if (i.type === 'math') { // 5 + ? = 8 -> 3
                problemText = t('ls2_prob_math') || "5 + ? = 8";
                bgColor = "#FFEBEE";
            } else if (i.value === 'green_bin') { // Bottle -> Recycle
                problemText = t('ls2_prob_recycle');
                problemIcon = "🍾";
                bgColor = "#E8F5E9";
            } else if (i.value === 'orange_bin') { // Fish Bone -> Compost
                problemText = t('ls2_prob_compost');
                problemIcon = "fish_bone";
                bgColor = "#FFF3E0";
                // isCustom check logic needed for problemIcon display
            } else if (i.type === 'rhythm') { // Rhythm -> Drum
                problemText = t('ls2_prob_rhythm');
                problemIcon = "🎵";
                bgColor = "#FBE9E7";
            } else if (i.type === 'logic') { // Door -> Key
                problemText = t('ls2_prob_logic');
                problemIcon = "🚪";
                bgColor = "#FFF9C4";
            } else if (i.type === 'pixel') { // Grid -> Block
                problemText = t('ls2_prob_pixel');
                problemIcon = "🔳";
                bgColor = "#F5F5F5";
            }

            return {
                id: `t-${i.id}`,
                matchId: i.id,
                label: i.label,
                problemText,
                problemIcon,
                problemIsCustom: problemIcon === 'fish_bone',
                bgColor,
                icon: i.icon,
                isCustom: i.isCustom
            };
        });

        // Shuffle targets
        const shuffledTargets = [...targetConfig].sort(() => Math.random() - 0.5);

        setItems(shuffledItems);
        setTargets(shuffledTargets);
        setMistakes(0);
        setMistakes(0);
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
                dragPreviewRef.current.innerHTML = '';
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
    }, [items]);

    // POINTER EVENTS
    const handlePointerDown = (e, item) => {
        if (item.matched) return;
        e.preventDefault();

        draggingRef.current = { itemId: item.id, element: e.currentTarget };
        e.currentTarget.style.opacity = '0';

        if (dragPreviewRef.current) {
            const clone = e.currentTarget.cloneNode(true);
            clone.style.opacity = '1';
            clone.style.transform = 'scale(1.1)';
            clone.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    const processMatch = (itemId, targetMatchId) => {
        if (itemId === targetMatchId) {
            // Correct
            const newItems = items.map(i => i.id === itemId ? { ...i, matched: true } : i);
            setItems(newItems);

            const totalMatched = newItems.filter(i => i.matched).length;
            if (totalMatched === newItems.length) {
                // Success
                setTimeout(() => {
                    onComplete(3);
                }, 500);
            }
        } else {
            // Wrong
            setMistakes(prev => prev + 1);
        }
    };

    return (
        <div className="game-level-container" style={{
            background: 'linear-gradient(to bottom, #FFF3E0, #FFE0B2)', // Orange theme for Chapter 2
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            paddingTop: '40px',
            boxSizing: 'border-box'
        }}>
            {/* Header - Compact */}
            <div style={{ textAlign: 'center', padding: '5px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#EF6C00', fontWeight: 'bold' }}>{t('ls1_bonus')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: '2px 0', color: '#E65100', fontSize: '1.5rem' }}>{t('ls2_title')}</h2>
                    <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '2px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 2px rgba(0,0,0,0.1)' }}>
                        {t('game_mistakes').replace('{count}', mistakes)}
                    </div>
                </div>
                <p style={{ margin: 0, color: '#F57C00', fontSize: '0.9rem' }}>{t('ls2_desc')}</p>
            </div>

            {/* Targets Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
                padding: '5px', width: '85%', maxWidth: '340px', margin: '0 auto',
                background: 'rgba(255,255,255,0.6)', borderRadius: '15px',
                flexShrink: 1,
                minHeight: '0',
                marginBottom: '220px' // Increased to prevent overlap
            }}>
                {targets.map(t => {
                    const matchedItem = items.find(i => i.matched && i.id === t.matchId);

                    return (
                        <div key={t.id}
                            className="review-target-wrapper"
                            data-match-id={t.matchId}
                            style={{
                                height: '14vh',
                                width: '100%',
                                background: t.bgColor,
                                borderRadius: '12px',
                                border: '2px dashed #FFB74D',
                                display: 'flex', flexDirection: 'column',
                                justifyContent: 'center', alignItems: 'center',
                                position: 'relative',
                                boxShadow: matchedItem ? 'inset 0 0 10px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            {matchedItem ? (
                                <div style={{ width: '80%', height: '80%', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'popIn 0.3s' }}>
                                    {matchedItem.isCustom ? renderCustomIcon(matchedItem.icon) : <div style={{ fontSize: '3.5rem' }}>{matchedItem.icon}</div>}
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: '0.85rem', color: '#8D6E63', textAlign: 'center', marginBottom: '5px', fontWeight: 'bold' }}>
                                        {t.problemText}
                                    </div>
                                    <div style={{ width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.7 }}>
                                        {t.problemIsCustom ? renderCustomIcon(t.problemIcon) : <div style={{ fontSize: '2.5rem' }}>{t.problemIcon}</div>}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Draggable Items Zone */}
            <div style={{
                position: 'absolute',
                bottom: '18%', // Lowered from 18%
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
                background: 'rgba(255,255,255,0.4)',
                borderRadius: '20px'
            }}>
                {items.map(item => {
                    // Removed unused dragState check to fix crash
                    if (item.matched) return null;

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
                                opacity: 1,
                                transform: 'scale(1)',
                                cursor: 'grab',
                                touchAction: 'none'
                            }}
                        >
                            <div style={{ width: '70%', height: '70%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {item.isCustom ? renderCustomIcon(item.icon) : <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Drag Preview */}
            <div ref={dragPreviewRef}
                style={{
                    position: 'fixed', top: 0, left: 0,
                    width: '80px', height: '80px',
                    display: 'none', justifyContent: 'center', alignItems: 'center',
                    pointerEvents: 'none', zIndex: 9999,
                }}
            ></div>
        </div>
    );
};

export default ReviewLevel2;
