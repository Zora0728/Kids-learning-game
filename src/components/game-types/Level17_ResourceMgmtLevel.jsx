import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const Level17_ResourceMgmtLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const t = TEXT[language] || TEXT['zh-TW'];

    // Game State
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [feedback, setFeedback] = useState(null); // { status, message }

    // Helpers for names
    const getExplorerName = (id) => {
        if (id === 'boy') return t.l17_boy;
        if (id === 'girl') return t.l17_girl;
        if (id === 'dog') return t.l17_dog;
        return '';
    };

    const getResourceName = (id) => {
        if (id === 'food') return t.l17_food;
        if (id === 'water') return t.l17_water;
        return '';
    };

    // Explorers: 👦 Boy, 👧 Girl, 🐶 Dog (Bonus character)
    const [explorers, setExplorers] = useState([
        { id: 'boy', icon: '👦', need: null, timeLeft: 0, status: 'idle' },
        { id: 'girl', icon: '👧', need: null, timeLeft: 0, status: 'idle' },
        { id: 'dog', icon: '🐶', need: null, timeLeft: 0, status: 'idle' }
    ]);

    const [debugMsg, setDebugMsg] = useState("Ready");

    const TARGET_SCORE = 10;
    const REQUEST_DURATION = 8; // Slower (was 5) for better mobile experience

    // Resource Types
    const RESOURCES = [
        { id: 'food', icon: '🍎' },
        { id: 'water', icon: '💧' }
    ];

    const timerRef = useRef(null);
    const winTimerRef = useRef(null); // Fix leak
    const [showInstructions, setShowInstructions] = useState(true);

    // Game Loop
    useEffect(() => {
        // Start Request Loop
        timerRef.current = setInterval(() => {
            setExplorers(prev => {
                if (score >= TARGET_SCORE) return prev;

                // 1. Decrease time
                let updated = prev.map(exp => {
                    if (exp.need) {
                        if (exp.timeLeft <= 1) {
                            setMistakes(m => m + 1);
                            setFeedback({ status: 'wrong', message: t.l17_too_slow });
                            setTimeout(() => setFeedback(null), 1000);
                            return { ...exp, need: null, timeLeft: 0, status: 'sad' };
                        }
                        return { ...exp, timeLeft: exp.timeLeft - 1 };
                    }
                    if (exp.status === 'sad' || exp.status === 'happy') {
                        return { ...exp, status: 'idle' };
                    }
                    return exp;
                });

                // 2. Randomly assign new request
                const idleIndices = updated.map((e, i) => (!e.need && e.status === 'idle') ? i : -1).filter(i => i !== -1);

                // 50% chance (was 30%)
                if (idleIndices.length > 0 && Math.random() < 0.5) {
                    const randomIndex = idleIndices[Math.floor(Math.random() * idleIndices.length)];
                    const randomResource = RESOURCES[Math.floor(Math.random() * RESOURCES.length)];

                    updated[randomIndex] = {
                        ...updated[randomIndex],
                        need: randomResource.id,
                        timeLeft: REQUEST_DURATION,
                        status: 'waiting'
                    };
                }

                return updated;
            });
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
            if (winTimerRef.current) clearTimeout(winTimerRef.current);
        };
    }, [score]);


    // Check Win Condition
    // Check Win Condition
    useEffect(() => {
        if (score >= TARGET_SCORE) {
            // Stop generating requests immediately
            clearInterval(timerRef.current);

            // Trigger win immediately (or very short delay) to avoid state race
            // Use a flag to ensure onComplete is called only once
            if (!winTimerRef.current) {
                winTimerRef.current = setTimeout(() => {
                    let stars = 3;
                    if (mistakes > 2) stars = 2;
                    if (mistakes > 5) stars = 1;
                    onComplete(stars);
                }, 500); // Shorter delay (0.5s)
            }
        }
    }, [score, mistakes, onComplete]);


    // --- Optimized Drag State (Refs) ---
    const dragPreviewRef = useRef(null);
    const draggingIdRef = useRef(null); // Stores resource ID ('food' or 'water')
    const [activeDragId, setActiveDragId] = useState(null); // For visual feedback only

    // State Ref to prevent stale closures in Event Listeners
    const explorersRef = useRef(explorers);
    useEffect(() => { explorersRef.current = explorers; }, [explorers]);

    const lastDropTime = useRef(0);

    // Global Pointer Events
    useEffect(() => {
        const handleGlobalMove = (e) => {
            if (!draggingIdRef.current || !dragPreviewRef.current) return;
            e.preventDefault();
            const x = e.clientX;
            const y = e.clientY;
            dragPreviewRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.2)`;
        };

        const handleGlobalUp = (e) => {
            if (!draggingIdRef.current) return;

            // Debounce check
            const now = Date.now();
            if (now - lastDropTime.current < 300) {
                draggingIdRef.current = null;
                setActiveDragId(null);
                if (dragPreviewRef.current) dragPreviewRef.current.style.display = 'none';
                return;
            }
            lastDropTime.current = now;

            const resourceId = draggingIdRef.current;
            const hitX = e.clientX;
            const hitY = e.clientY;

            // Manual Hit Test
            const targets = document.querySelectorAll('.explorer-drop-zone');
            let hitExplorerId = null;
            let minDist = 9999;
            // let debugLog = `Drop: ${Math.round(hitX)},${Math.round(hitY)} | Targets: ${targets.length}`;

            targets.forEach(target => {
                const rect = target.getBoundingClientRect();
                if (
                    hitX >= rect.left - 20 &&
                    hitX <= rect.right + 20 &&
                    hitY >= rect.top - 20 &&
                    hitY <= rect.bottom + 20
                ) {
                    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                    const dist = Math.hypot(hitX - center.x, hitY - center.y);
                    // debugLog += ` | Hit: ${target.dataset.id} Dist: ${Math.round(dist)}`;

                    if (dist < minDist) {
                        minDist = dist;
                        hitExplorerId = target.dataset.id;
                    }
                }
            });
            // setDebugMsg(debugLog);

            if (hitExplorerId) {
                const currentExplorers = explorersRef.current;
                const index = currentExplorers.findIndex(exp => exp.id === hitExplorerId);

                if (index !== -1) {
                    const explorer = currentExplorers[index];

                    if (explorer.need === resourceId) {
                        // Correct
                        setScore(s => s + 1);
                        setFeedback({ status: 'correct', message: t.l17_thank_you });
                        setTimeout(() => setFeedback(null), 500);

                        setExplorers(prev => {
                            const newArr = [...prev];
                            const idx = newArr.findIndex(e => e.id === hitExplorerId);
                            if (idx !== -1) newArr[idx] = { ...newArr[idx], need: null, timeLeft: 0, status: 'happy' };
                            return newArr;
                        });
                    } else if (explorer.need) {
                        // Wrong
                        setMistakes(m => m + 1);
                        setFeedback({ status: 'wrong', message: t.l17_wrong_item });
                        setTimeout(() => setFeedback(null), 500);
                    }
                }
            }

            // Cleanup
            draggingIdRef.current = null;
            setActiveDragId(null);
            if (dragPreviewRef.current) {
                dragPreviewRef.current.style.display = 'none';
            }
        };

        window.addEventListener('pointermove', handleGlobalMove, { passive: false });
        window.addEventListener('pointerup', handleGlobalUp);
        return () => {
            window.removeEventListener('pointermove', handleGlobalMove);
            window.removeEventListener('pointerup', handleGlobalUp);
        };
    }, []);

    const handlePointerDown = (e, resourceId) => {
        e.preventDefault();
        // Prevent default touch actions like scroll
        // e.target.releasePointerCapture(e.pointerId); // Sometimes needed

        draggingIdRef.current = resourceId;
        setActiveDragId(resourceId);

        // Init Preview
        if (dragPreviewRef.current) {
            const x = e.clientX;
            const y = e.clientY;
            dragPreviewRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.2)`;
            dragPreviewRef.current.style.display = 'flex';
        }
    };



    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
                <div style={{ fontSize: '1.2rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL 17
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '30px', padding: '10px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '280px',
                    width: 'auto'
                }}>
                    <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.8rem' }}>{t.l17_title}</h2>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t.l17_desc.replace('{count}', TARGET_SCORE)}</p>
                </div>
                <div style={{
                    marginTop: '10px', display: 'flex', gap: '10px'
                }}>
                    <div style={{ padding: '5px 15px', background: '#E3F2FD', color: '#1565C0', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t.l17_fulfilled.replace('{count}', score)}
                    </div>
                    <div style={{ padding: '5px 15px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '20px', fontWeight: 'bold' }}>
                        {t.l17_missed.replace('{count}', mistakes)}
                    </div>
                </div>
            </div>

            {/* Main Game Area (Campsite) */}
            <div style={{
                flex: 1, position: 'relative', width: '100%',
                maxHeight: '60%', // Limit height to bring bottom up
                background: 'linear-gradient(to bottom, #81C784 0%, #C8E6C9 100%)', // Forest Green
                borderRadius: '20px', border: '5px solid #fff',
                display: 'flex', justifyContent: 'space-around', alignItems: 'center',
                padding: '10px 0', // Reduced padding
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)'
            }}>
                {/* Decor: Tent */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '4rem' }}>⛺</div>
                <div style={{ position: 'absolute', top: '15%', right: '15%', fontSize: '3rem' }}>🌲</div>

                {/* Explorers */}
                {explorers.map(exp => (
                    <div
                        key={exp.id}
                        data-id={exp.id}
                        className="explorer-drop-zone"
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            transition: 'all 0.3s',
                            transform: exp.status === 'happy' ? 'scale(1.1)' : 'scale(1)',
                            zIndex: 10
                        }}
                    >
                        {/* Request Bubble */}
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: exp.need ? 'white' : 'transparent',
                            border: exp.need ? '3px solid #333' : 'none',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            marginBottom: '10px',
                            opacity: exp.need ? 1 : 0, transition: 'all 0.3s',
                            position: 'relative',
                            boxShadow: exp.need ? '0 5px 15px rgba(0,0,0,0.2)' : 'none'
                        }}>
                            {/* Timer Ring (Simple SVG) */}
                            {exp.need && (
                                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                                    <circle cx="35" cy="35" r="32" stroke="#ddd" strokeWidth="4" fill="none" />
                                    <circle cx="35" cy="35" r="32" stroke={exp.timeLeft < 1 ? '#e74c3c' : '#3498db'} strokeWidth="4" fill="none"
                                        strokeDasharray="200" strokeDashoffset={200 - (200 * exp.timeLeft / REQUEST_DURATION)}
                                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                                    />
                                </svg>
                            )}
                            <span style={{ fontSize: '2rem' }}>
                                {exp.need === 'food' ? '🍎' : exp.need === 'water' ? '💧' : ''}
                            </span>
                        </div>

                        {/* Character */}
                        <div style={{
                            fontSize: '4rem', filter: exp.status === 'sad' ? 'grayscale(100%)' : 'none',
                            cursor: 'pointer'  // Hint it's interactive
                        }}>
                            {exp.icon}
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.7)', padding: '2px 10px', borderRadius: '10px',
                            marginTop: '5px', fontSize: '1rem', fontWeight: 'bold', color: '#333'
                        }}>
                            {getExplorerName(exp.id)}
                        </div>
                    </div>
                ))}

                {/* Feedback Toast */}
                {feedback && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: feedback.status === 'correct' ? 'rgba(46, 204, 113, 0.9)' : 'rgba(231, 76, 60, 0.9)',
                        color: 'white', padding: '15px 30px', borderRadius: '50px',
                        fontSize: '1.5rem', fontWeight: 'bold', zIndex: 100,
                        animation: 'fadeInOut 0.5s'
                    }}>
                        {feedback.message}
                    </div>
                )}
            </div>

            {/* Resource Dock */}
            <div style={{
                marginTop: '15px', padding: '15px', background: '#fff', borderRadius: '20px',
                display: 'flex', justifyContent: 'center', gap: '30px',
                boxShadow: '0 -5px 15px rgba(0,0,0,0.05)',
                touchAction: 'none' // Important for pointer events
            }}>
                {RESOURCES.map(res => (
                    <div
                        key={res.id}
                        onPointerDown={(e) => handlePointerDown(e, res.id)}
                        className="resource-card"
                        style={{
                            width: '100px', height: '100px',
                            background: '#f8f9fa', border: '3px solid #e0e0e0', borderRadius: '15px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'grab', userSelect: 'none',
                            opacity: activeDragId === res.id ? 0.3 : 1,
                            touchAction: 'none', // Critical for instant touch drag
                            transform: activeDragId === res.id ? 'scale(0.95)' : 'scale(1)'
                        }}
                    >
                        <div style={{ fontSize: '3rem' }}>{res.icon}</div>
                        <div style={{ fontWeight: 'bold', color: '#555' }}>{getResourceName(res.id)}</div>
                    </div>
                ))}
            </div>

            {/* Drag Preview (Custom) */}
            <div
                ref={dragPreviewRef}
                style={{
                    position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 9999,
                    width: '80px', height: '80px',
                    background: 'white', borderRadius: '50%', border: '4px solid #3498db',
                    display: 'none', justifyContent: 'center', alignItems: 'center',
                    fontSize: '3rem', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}
            >
                {activeDragId === 'food' ? '🍎' : activeDragId === 'water' ? '💧' : ''}
            </div>

            {/* Instructions Modal */}
            {showInstructions && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', zIndex: 999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '20px', width: '80%', maxWidth: '400px',
                        textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏕️</div>
                        <h2 style={{ color: '#2c3e50', marginBottom: '15px' }}>{t.l17_help_title}</h2>
                        <ul style={{ textAlign: 'left', margin: '0 0 20px 20px', fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
                            <li>{t.l17_help_1}</li>
                            <li>{t.l17_help_2}</li>
                            <li>{t.l17_help_3.replace('{target}', TARGET_SCORE)}</li>
                        </ul>
                        <button className="btn-primary" onClick={() => setShowInstructions(false)} style={{ fontSize: '1.2rem', padding: '10px 40px' }}>
                            {t.l18_start || 'Start'}
                        </button>
                    </div>
                </div>
            )}



            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -40%); }
                    20% { opacity: 1; transform: translate(-50%, -50%); }
                    80% { opacity: 1; transform: translate(-50%, -50%); }
                    100% { opacity: 0; transform: translate(-50%, -60%); }
                }
                .resource-card:active { transform: scale(0.95); border-color: #3498db !important; }
            `}</style>
        </div>
    );
};

export default Level17_ResourceMgmtLevel;
