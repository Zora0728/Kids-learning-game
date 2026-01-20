import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../../App.css';

const Level24_GameMakerLevel = ({ levelNumber, onComplete, onBack }) => {
    const { t } = useTranslation();
    const GRID_W = 8;
    const GRID_H = 6;

    // Tools
    // Tools
    const TOOLS = [
        { id: 1, icon: '🧱', name: t('l24_wall'), color: '#7f8c8d' },
        { id: 2, icon: '🪙', name: t('l24_coin'), color: '#f1c40f' },
        { id: 3, icon: '🔺', name: t('l24_spike'), color: '#e74c3c' },
        { id: 4, icon: '🚩', name: t('l24_goal'), color: '#2ecc71' },
        { id: 9, icon: '🏃', name: t('l24_start'), color: '#3498db' },
        { id: 0, icon: '🧼', name: t('l24_eraser'), color: '#ecf0f1' },
    ];

    const [mode, setMode] = useState('edit'); // edit, play, win
    const [selectedTool, setSelectedTool] = useState(1);
    const [grid, setGrid] = useState([]);
    const [coinsCollected, setCoinsCollected] = useState(0);
    const [totalCoins, setTotalCoins] = useState(0);
    const [message, setMessage] = useState(null); // For errors/hints
    const [showInstructions, setShowInstructions] = useState(true); // Default show on start

    // Physics State
    const [player, setPlayer] = useState({ x: 1, y: 1, vx: 0, vy: 0, grounded: false });
    const requestRef = useRef();
    const keys = useRef({});

    // Init Grid
    useEffect(() => {
        const newGrid = Array(GRID_H).fill().map(() => Array(GRID_W).fill(0));
        // Removed default floor (Top-dowm doesn't need it)

        // Default Start & Goal
        newGrid[GRID_H - 1][GRID_W - 1] = 4; // Bottom right
        setGrid(newGrid);
    }, []);

    // Helpers
    const findStartPos = () => {
        for (let y = 0; y < GRID_H; y++) {
            for (let x = 0; x < GRID_W; x++) {
                if (grid[y][x] === 9) return { x, y };
            }
        }
        return { x: 1, y: 1 };
    };

    const checkInteraction = (x, y) => {
        const cell = grid[y][x];
        if (cell === 2) { // Coin
            setGrid(prev => {
                const ng = prev.map(row => [...row]);
                ng[y][x] = 0;
                return ng;
            });
            setCoinsCollected(c => c + 1);
        }
        if (cell === 3) { // Spike
            const start = findStartPos();
            setPlayer({ x: start.x, y: start.y });
        }
        if (cell === 4) { // Goal
            setMode('win');
            setTimeout(() => onComplete(3), 1500);
        }
    };
    const activeModal = mode === 'win';

    // --- Game Logic (Discrete Movement) ---
    useEffect(() => {
        if (mode !== 'play') return;

        const handleKeyDown = (e) => {
            if (activeModal) return;

            // Prevent default scrolling for arrows
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            let dx = 0;
            let dy = 0;

            if (e.code === 'ArrowLeft' || e.code === 'KeyA') dx = -1;
            else if (e.code === 'ArrowRight' || e.code === 'KeyD') dx = 1;
            else if (e.code === 'ArrowUp' || e.code === 'KeyW') dy = -1;
            else if (e.code === 'ArrowDown' || e.code === 'KeyS') dy = 1;
            else return;

            setPlayer(prev => {
                const nextX = prev.x + dx;
                const nextY = prev.y + dy;

                if (nextX < 0 || nextX >= GRID_W || nextY < 0 || nextY >= GRID_H) return prev;
                if (grid[nextY][nextX] === 1) return prev;

                checkInteraction(nextX, nextY);
                return { x: nextX, y: nextY };
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mode, grid]); // Removed coinsCollected from dep as it's not needed for movement logic, only grid is needed for walls

    // START POS
    useEffect(() => {
        if (mode === 'play') {
            const start = findStartPos();
            setPlayer({ x: start.x, y: start.y }); // Reset position
            setCoinsCollected(0);
            let total = 0;
            grid.forEach(row => row.forEach(c => { if (c === 2) total++ }));
            setTotalCoins(total);
        }
    }, [mode]);


    // Constraints
    const LIMITS = {
        1: { max: 20, name: t('l24_wall') },
        2: { min: 3, name: t('l24_coin') },
        3: { min: 1, max: 10, name: t('l24_spike') }
    };

    const getCounts = () => {
        let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 9: 0 };
        grid.forEach(row => row.forEach(c => { if (counts[c] !== undefined) counts[c]++ }));
        return counts;
    };

    // Edit Mode Handlers
    const handleGridClick = (x, y) => {
        if (mode !== 'edit') return;
        const currentTool = selectedTool;
        const currentCell = grid[y][x];

        // If trying to place same tool, do nothing (or maybe remove? Eraser is 0)
        if (currentCell === currentTool) return;

        // Check Max Limits (only if not erasing)
        if (currentTool !== 0) {
            const counts = getCounts();
            if (LIMITS[currentTool]?.max && counts[currentTool] >= LIMITS[currentTool].max) {
                setMessage(t('l24_limit_max').replace('{max}', LIMITS[currentTool].max).replace('{name}', LIMITS[currentTool].name));
                setTimeout(() => setMessage(null), 2000);
                return;
            }
        }

        const newGrid = grid.map(row => [...row]);

        if (currentTool === 9) { // Only 1 start
            newGrid.forEach((r, ry) => r.forEach((c, rx) => { if (c === 9) newGrid[ry][rx] = 0; }));
        }
        if (currentTool === 4) { // Only 1 goal
            newGrid.forEach((r, ry) => r.forEach((c, rx) => { if (c === 4) newGrid[ry][rx] = 0; }));
        }

        newGrid[y][x] = currentTool;
        setGrid(newGrid);
    };

    const handlePlayCheck = () => {
        const counts = getCounts();

        if (counts[2] < LIMITS[2].min) {
            setMessage(t('l24_limit_min_coin').replace('{min}', LIMITS[2].min));
            setTimeout(() => setMessage(null), 2000);
            return;
        }
        if (counts[3] < LIMITS[3].min) {
            setMessage(t('l24_limit_min_spike').replace('{min}', LIMITS[3].min));
            setTimeout(() => setMessage(null), 2000);
            return;
        }
        if (counts[4] === 0) {
            setMessage(t('l24_missing_goal'));
            setTimeout(() => setMessage(null), 2000);
            return;
        }
        if (counts[9] === 0) {
            // Should be default, but just in case
            setMessage(t('l24_missing_start'));
            setTimeout(() => setMessage(null), 2000);
            return;
        }

        setMode('play');
    };

    const handleClear = () => {
        const newGrid = Array(GRID_H).fill().map(() => Array(GRID_W).fill(0));
        // No floor
        newGrid[1][1] = 9; // Reset Start relative to top-left
        setGrid(newGrid);
    };

    return (
        <div className="game-level-container" style={{
            width: '100%', maxWidth: '800px', margin: '0 auto',
            display: 'flex', flexDirection: 'column', height: '100%',
            overflow: 'hidden', padding: '10px', boxSizing: 'border-box',
            fontFamily: 'var(--font-main)',
            userSelect: 'none', touchAction: 'none'
        }}>
            {/* 1. Header (Title separate from Stats) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '100%', marginBottom: '5px' }}>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>
                    LEVEL 24
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '8px 25px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '5px'
                }}>
                    <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{t('l24_title')}</h2>
                </div>

                {/* Mission Stats (Conditions) - Distinct Block */}
                {mode === 'edit' && (
                    <div style={{
                        background: 'white', borderRadius: '15px', padding: '8px 15px', width: 'auto', minWidth: '80%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', gap: '20px',
                        fontSize: '1rem', marginBottom: '5px', border: '1px solid #eee'
                    }}>
                        <div style={{ color: getCounts()[2] >= LIMITS[2].min ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                            🪙 {getCounts()[2]}/{LIMITS[2].min}
                        </div>
                        <div style={{ color: getCounts()[3] >= LIMITS[3].min ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                            🔺 {getCounts()[3]}/{LIMITS[3].min}
                        </div>
                        <div style={{ color: getCounts()[1] > LIMITS[1].max ? '#e74c3c' : '#7f8c8d' }}>
                            🧱 {getCounts()[1]}/{LIMITS[1].max}
                        </div>
                    </div>
                )}
                {/* Play Mode Header */}
                {mode === 'play' && (
                    <div style={{
                        background: '#f1c40f', color: '#fff', padding: '5px 20px', borderRadius: '20px',
                        fontWeight: 'bold', fontSize: '1rem',
                        display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 0 #d35400'
                    }}>
                        <span>🪙 {coinsCollected} / {totalCoins}</span>
                        <div style={{ width: '1px', height: '15px', background: 'rgba(255,255,255,0.5)' }}></div>
                        <button onClick={() => setMode('edit')} style={{
                            background: 'none', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer'
                        }}>
                            {t('l24_edit')}
                        </button>
                    </div>
                )}
            </div>

            {/* Moved Controls Area (Top) */}
            {mode === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '5px' }}>

                    {/* Row 1: First 4 Tools */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        {TOOLS.slice(0, 4).map(t => (
                            <button key={t.id} onClick={() => setSelectedTool(t.id)}
                                style={{
                                    width: '50px', height: '45px',
                                    border: selectedTool === t.id ? `3px solid ${t.color}` : '2px solid #ecf0f1',
                                    background: 'white', borderRadius: '10px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    transform: selectedTool === t.id ? 'translateY(-2px)' : 'none',
                                    boxShadow: selectedTool === t.id ? `0 4px 6px ${t.color}40` : 'none',
                                    transition: 'all 0.1s'
                                }}>
                                <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                            </button>
                        ))}
                    </div>

                    {/* Row 2: Remaining Tools + Execute Button */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        {TOOLS.slice(4).map(t => (
                            <button key={t.id} onClick={() => setSelectedTool(t.id)}
                                style={{
                                    width: '50px', height: '45px',
                                    border: selectedTool === t.id ? `3px solid ${t.color}` : '2px solid #ecf0f1',
                                    background: 'white', borderRadius: '10px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    transform: selectedTool === t.id ? 'translateY(-2px)' : 'none',
                                    boxShadow: selectedTool === t.id ? `0 4px 6px ${t.color}40` : 'none',
                                    transition: 'all 0.1s'
                                }}>
                                <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                            </button>
                        ))}
                        {/* Execute Button as 3rd item in 2nd row */}
                        <button onClick={handlePlayCheck} style={{
                            width: '100px', height: '45px', borderRadius: '10px', border: 'none',
                            background: '#2ecc71', color: 'white', fontWeight: 'bold', fontSize: '1rem',
                            boxShadow: '0 4px 0 #27ae60', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                        }}>
                            {t('l24_test')}
                        </button>
                    </div>
                </div>
            )}

            {/* ... Grid (Skipped in replacement, targeting surrounding) ... */}
            {/* Note: ViewFile showed Grid is after Header. I need to be careful with targeting. */}
            {/* I will use the EndLine/StartLine relative to what I viewed (Line 300 area is Toolbar). */}
            {/* The tool call requires contiguous logic. I will split this into two calls or use replace on Toolbar section only. */}
            {/* Replacement below targets Toolbar (Line 296+) */}

            {/* 3. Controls Area (Edit Mode) */}


            {/* 2. Game Grid Canvas - Main Area */}
            <div style={{
                flex: 1, position: 'relative', background: '#ecf0f1', borderRadius: '10px',
                overflow: 'hidden', border: '4px solid #bdc3c7',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
                minHeight: '0', margin: '5px 0'
            }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: `repeat(${GRID_W}, 1fr)`, gridTemplateRows: `repeat(${GRID_H}, 1fr)`,
                    aspectRatio: `${GRID_W}/${GRID_H}`, width: '100%', maxHeight: '100%',
                    background: 'white', position: 'relative'
                }}>
                    {grid.map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`}
                            onPointerDown={(e) => { e.target.releasePointerCapture(e.pointerId); handleGridClick(x, y); }}
                            style={{
                                border: '1px solid rgba(0,0,0,0.05)',
                                background: cell === 1 ? '#2c3e50' : cell === 2 ? '#f1c40f22' : cell === 3 ? '#e74c3c22' : 'white',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                userSelect: 'none', cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '1.8rem' }}>
                                {cell === 1 && '🧱'}
                                {cell === 2 && '🪙'}
                                {cell === 3 && '🔺'}
                                {cell === 4 && '🚩'}
                                {cell === 9 && mode === 'edit' && '🏃'}
                            </span>
                        </div>
                    )))}
                    {mode === 'play' && (
                        <div style={{
                            position: 'absolute', left: `${(player.x / GRID_W) * 100}%`, top: `${(player.y / GRID_H) * 100}%`,
                            width: `${100 / GRID_W}%`, height: `${100 / GRID_H}%`,
                            transition: 'left 0.1s linear, top 0.1s linear', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10
                        }}>
                            <div style={{ fontSize: '2.2rem' }}>🏃</div>
                        </div>
                    )}
                </div>
            </div>




            {/* 4. Play Mode Controls (D-Pad) - NOW BELOW GRID */}
            {mode === 'play' && (
                <div style={{
                    height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    flexShrink: 0, paddingBottom: '10px'
                }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <button className="btn-secondary"
                            onPointerDown={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' })); }}
                            style={{ position: 'absolute', top: 0, left: '40px', width: '40px', height: '40px', fontSize: '1.5rem', padding: 0 }}>⬆️</button>
                        <button className="btn-secondary"
                            onPointerDown={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft' })); }}
                            style={{ position: 'absolute', top: '40px', left: 0, width: '40px', height: '40px', fontSize: '1.5rem', padding: 0 }}>⬅️</button>
                        <button className="btn-secondary"
                            onPointerDown={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight' })); }}
                            style={{ position: 'absolute', top: '40px', right: 0, width: '40px', height: '40px', fontSize: '1.5rem', padding: 0 }}>➡️</button>
                        <button className="btn-secondary"
                            onPointerDown={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown' })); }}
                            style={{ position: 'absolute', bottom: 0, left: '40px', width: '40px', height: '40px', fontSize: '1.5rem', padding: 0 }}>⬇️</button>
                    </div>
                </div>
            )}

            {/* Overlay Messages via Portal (or Fixed) */}
            {message && (
                <div style={{
                    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 20px',
                    borderRadius: '20px', zIndex: 100, fontWeight: 'bold'
                }}>
                    {message}
                </div>
            )}

            {mode === 'win' && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    color: 'white', zIndex: 100
                }}>
                    <div style={{ fontSize: '5rem' }}>🎉</div>
                    <h1>{t('l24_win')}</h1>
                </div>
            )}

            {showInstructions && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200
                }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '20px', maxWidth: '80%', textAlign: 'center' }}>
                        <h2>{t('l24_welcome_title')}</h2>
                        <ul style={{ textAlign: 'left', margin: '20px 0', paddingLeft: '20px' }}>
                            <li>{t('l24_welcome_1')}</li>
                            <li>{t('l24_welcome_2')}</li>
                            <li>{t('l24_welcome_3')}</li>
                            <li>{t('l24_welcome_4')}</li>
                        </ul>
                        <button className="btn-primary" onClick={() => setShowInstructions(false)}>{t('l24_btn_start')}</button>
                    </div>
                </div>
            )}
        </div>
    );

};

export default Level24_GameMakerLevel;
