import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';

const Level25_AdvExplorationLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    // Zones: 0: Sunlight, 1: Twilight, 2: Midnight
    const [zoneIndex, setZoneIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Game State
    const [target, setTarget] = useState(null); // Current creature to find
    const [foundCount, setFoundCount] = useState(0); // How many found in this zone
    const [mistakes, setMistakes] = useState(0);
    const [message, setMessage] = useState(null); // Feedback message
    const [levelItems, setLevelItems] = useState([]); // All items in current level instance

    const containerRef = useRef(null);

    // --- DATA ---
    const ZONES = [
        {
            id: 'sunlight', name: t('l25_zone_sun'), depth: '0 - 200m',
            bgColor: '#48dbfb', darkColor: 'transparent',
            targets: [
                { id: 'turtle', icon: '🐢', name: t('l25_turtle'), fact: t('l25_turtle_fact') },
                { id: 'clownfish', icon: '🐠', name: t('l25_clownfish'), fact: t('l25_clownfish_fact') },
                { id: 'dolphin', icon: '🐬', name: t('l25_dolphin'), fact: t('l25_dolphin_fact') },
                { id: 'shark', icon: '🦈', name: t('l25_shark'), fact: t('l25_shark_fact') }
            ],
            others: [
                { id: 'fish1', icon: '🐟', name: '小魚' },
                { id: 'fish2', icon: '🐡', name: '河豚' },
                { id: 'shrimp', icon: '🦐', name: '蝦子' }
            ],
            trash: [
                { id: 't1', icon: '🥡', name: '便當盒' },
                { id: 't2', icon: '🥤', name: '塑膠杯' },
                { id: 't3', icon: '🥢', name: '免洗筷' }
            ]
        },
        {
            id: 'twilight', name: t('l25_zone_twilight'), depth: '200 - 1000m',
            bgColor: '#0abde3', darkColor: 'rgba(0,0,30,0.92)',
            targets: [
                { id: 'whale', icon: '🐋', name: t('l25_whale'), fact: t('l25_whale_fact') },
                { id: 'jellyfish', icon: '🪼', name: t('l25_jellyfish'), fact: t('l25_jellyfish_fact') },
                { id: 'squid', icon: '🦑', name: t('l25_squid'), fact: t('l25_squid_fact') }
            ],
            others: [
                { id: 'lobster', icon: '🦞', name: '龍蝦' },
                { id: 'octopus', icon: '🐙', name: '章魚' }
            ],
            trash: [
                { id: 't4', icon: '🧴', name: '瓶子' },
                { id: 't5', icon: '🛍️', name: '塑膠袋' }
            ]
        },
        {
            id: 'midnight', name: t('l25_zone_midnight'), depth: '1000m +',
            bgColor: '#000000', darkColor: 'rgba(0,0,0,0.98)',
            targets: [
                { id: 'angler', icon: '🐟', name: t('l25_angler'), fact: t('l25_angler_fact') },
                { id: 'crab', icon: '🦀', name: t('l25_crab'), fact: t('l25_crab_fact') },
                { id: 'dumbo', icon: '👾', name: t('l25_dumbo'), fact: t('l25_dumbo_fact') }
            ],
            others: [
                { id: 'shell', icon: '🐚', name: '貝殼' },
                { id: 'microbe', icon: '🦠', name: '微生物' }
            ],
            trash: [
                { id: 't6', icon: '👞', name: '破鞋子' },
                { id: 't7', icon: '🥫', name: '罐頭' },
                { id: 't8', icon: '🔋', name: '電池' }
            ]
        }
    ];

    const currentZone = ZONES[zoneIndex];

    // --- INIT LEVEL ---
    useEffect(() => {
        // Prepare items scatter
        const newItems = [];

        // 1. Add Targets (Positioned randomly but separated)
        currentZone.targets.forEach(t => {
            newItems.push({
                ...t, type: 'target',
                x: 10 + Math.random() * 80,
                y: 10 + Math.random() * 80,
                scale: 0.8 + Math.random() * 0.5
            });
        });

        // 2. Add Distractors (More of them)
        const distractorCount = 5 + (zoneIndex * 2); // Harder zones have more stuff
        for (let i = 0; i < distractorCount; i++) {
            const d = currentZone.others[Math.floor(Math.random() * currentZone.others.length)];
            newItems.push({
                ...d, type: 'other',
                uniqueId: `d-${i}`, // Unique key
                x: Math.random() * 90,
                y: Math.random() * 90,
                scale: 0.5 + Math.random() * 0.5,
                rotation: Math.random() * 360
            });
        }

        // 3. Add Trash (Bad!)
        const trashCount = 3 + zoneIndex;
        for (let i = 0; i < trashCount; i++) {
            const t = currentZone.trash[Math.floor(Math.random() * currentZone.trash.length)];
            newItems.push({
                ...t, type: 'trash',
                uniqueId: `t-${i}`,
                x: Math.random() * 90,
                y: Math.random() * 90,
                scale: 0.8,
                rotation: Math.random() * 360
            });
        }

        setLevelItems(newItems);

        // Pick first target
        setTarget(currentZone.targets[0]);
        setFoundCount(0);

    }, [zoneIndex]);


    // --- HANDLERS ---
    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
    };

    const handleItemClick = (item) => {
        if (!target) return;

        if (item.type === 'target') {
            if (item.id === target.id) {
                // Correct!
                showFeedback('correct', t('l25_found').replace('{name}', target.name));

                // Show Fact Modal? Or just next? 
                // Let's do simple flow: Next Target
                const nextTargetIndex = foundCount + 1;
                if (nextTargetIndex < currentZone.targets.length) {
                    setTimeout(() => {
                        setFoundCount(prev => prev + 1);
                        setTarget(currentZone.targets[nextTargetIndex]);
                    }, 1500);
                } else {
                    // Zone Complete
                    setTimeout(() => handleZoneComplete(), 1500);
                }
            } else {
                // Clicked wrong target
                handleMistake(t('l25_wrong_target').replace('{name}', target.name));
            }
        } else if (item.type === 'trash') {
            handleMistake(t('l25_trash'));
        } else {
            handleMistake(t('l25_wrong_generic').replace('{name}', target.name));
        }
    };

    const handleMistake = (msg) => {
        setMistakes(m => m + 1);
        showFeedback('wrong', msg);
    };

    const showFeedback = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 1500); // reduced from 2000 for faster pace
    };

    const handleZoneComplete = () => {
        if (zoneIndex < ZONES.length - 1) {
            setMessage({ type: 'info', text: t('l25_next_zone') });
            setTimeout(() => {
                setZoneIndex(prev => prev + 1);
                setMessage(null);
            }, 2000);
        } else {
            // All Done
            onComplete(3);
        }
    };

    // --- RENDER ---
    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100vh', // Fixed height
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Header */}
            {/* Header - Card Style RWD Optimized */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', zIndex: 20, position: 'relative' }}>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL 25
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '30px', padding: '8px 30px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '200px', maxWidth: '90%'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.3rem' }}>{t('l25_title')}</h2>
                    <div style={{ fontSize: '0.8rem', color: '#555' }}>
                        {currentZone.name?.split('(')[0]} {/* Simplified Zone Name */}
                    </div>
                </div>
                <div style={{
                    marginTop: '8px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'
                }}>
                    {target && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: '#fff3cd', padding: '4px 12px', borderRadius: '20px',
                            border: '2px solid #ffeeba'
                        }}>
                            <span style={{ color: '#856404', fontWeight: 'bold', fontSize: '0.8rem' }}>{t('l25_task')}</span>
                            <span style={{ fontSize: '1.2rem' }}>{target.icon}</span>
                            <span style={{ fontWeight: 'bold', color: '#856404', fontSize: '0.9rem' }}>{target.name}</span>
                        </div>
                    )}
                    <div style={{ padding: '4px 12px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {t('l23_mistakes').replace('{count}', mistakes)}
                    </div>
                </div>
            </div>

            {/* Game Canvas */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={(e) => {
                    // Prevent scrolling while exploring
                    // Note: React 18+ events are passive by default for wheel/touch/scroll.
                    // We rely on CSS touch-action: none.
                    const touch = e.touches[0];
                    if (containerRef.current && touch) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setMousePos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
                    }
                }}
                style={{
                    flex: 1, position: 'relative', borderRadius: '20px', overflow: 'hidden',
                    background: currentZone.bgColor,
                    cursor: 'none', // Mask default cursor
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
                    border: '4px solid #fff',
                    touchAction: 'none' // Prevent scrolling while exploring
                }}
            >
                {/* 1. Items Layer */}
                {
                    levelItems.map((item, i) => (
                        <div key={item.uniqueId || item.id}
                            onClick={() => handleItemClick(item)}
                            style={{
                                position: 'absolute', top: `${item.y}%`, left: `${item.x}%`,
                                fontSize: `${3 * (item.scale || 1)}rem`,
                                transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                                cursor: 'none', // Still hide cursor handled by parent, but make clickable
                                transition: 'top 5s ease-in-out, left 5s ease-in-out', // Slow drift?
                                animation: 'float 3s infinite alternate ease-in-out',
                                zIndex: target && item.id === target.id ? 5 : 1
                            }}
                        >
                            {item.icon}
                        </div>
                    ))
                }

                {/* 2. Darkness & Flashlight Layer (Mask) */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, transparent 95%, ${currentZone.darkColor} 100%)`,
                    pointerEvents: 'none', zIndex: 10
                }}></div>

                {/* 3. Flashlight Ring & Crosshair */}
                <div style={{
                    position: 'absolute', top: mousePos.y, left: mousePos.x,
                    width: '160px', height: '160px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 0 30px rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.1)',
                    transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 11,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ position: 'absolute', width: '20px', height: '2px', background: 'rgba(255,0,0,0.5)' }}></div>
                    <div style={{ position: 'absolute', width: '2px', height: '20px', background: 'rgba(255,0,0,0.5)' }}></div>
                </div>

                {/* 4. Feedback Overlay */}
                {
                    message && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'rgba(255,255,255,0.95)', padding: '20px 40px', borderRadius: '30px',
                            textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', zIndex: 100,
                            animation: 'popIn 0.3s'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                                {message.type === 'correct' ? '🎉' : message.type === 'wrong' ? '❌' : 'ℹ️'}
                            </div>
                            <div style={{
                                fontSize: '1.5rem', fontWeight: 'bold',
                                color: message.type === 'correct' ? '#2ecc71' : message.type === 'wrong' ? '#e74c3c' : '#0984e3'
                            }}>
                                {message.text}
                            </div>
                            {target && message.type === 'correct' && (
                                <div style={{ marginTop: '10px', color: '#666', fontSize: '1rem' }}>
                                    {target.fact}
                                </div>
                            )}
                        </div>
                    )
                }
                <style>{`@keyframes float { 0% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); } 100% { transform: translate(-50%, -50%) translateY(-10px) rotate(5deg); } }`}</style>
            </div >
        </div >
    );
};

export default Level25_AdvExplorationLevel;
