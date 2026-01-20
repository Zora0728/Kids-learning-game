import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const PixelPuzzlesLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    // 5x5 Nonogram Patterns
    // 1: Filled, 0: Empty
    const patterns = [
        // Pattern A: Heart
        [
            [0, 1, 0, 1, 0],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0],
            [0, 0, 1, 0, 0]
        ],
        // Pattern B: Smiley
        [
            [0, 1, 1, 1, 0],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 0, 1, 1],
            [0, 1, 1, 1, 0]
        ]
    ];

    const t = TEXT[language] || TEXT['zh-TW'];

    // Select pattern based on play session or randomness?
    // Let's stick to Pattern A (Heart) for Level 11 for now.
    const TARGET_GRID = patterns[0];
    const GRID_SIZE = 5;

    const [userGrid, setUserGrid] = useState(
        Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
    );
    const [isComplete, setIsComplete] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    // Calculate Hints
    const getRowHints = (row) => {
        const hints = [];
        let count = 0;
        for (let cell of row) {
            if (cell === 1) {
                count++;
            } else if (count > 0) {
                hints.push(count);
                count = 0;
            }
        }
        if (count > 0) hints.push(count);
        if (hints.length === 0) hints.push(0);
        return hints;
    };

    const getColHints = (colIndex) => {
        const col = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            col.push(TARGET_GRID[i][colIndex]);
        }
        return getRowHints(col);
    };

    const rowHints = TARGET_GRID.map(row => getRowHints(row));
    const colHints = Array.from({ length: GRID_SIZE }, (_, i) => getColHints(i));

    const handleCellClick = (r, c) => {
        if (isComplete) return;

        const newGrid = [...userGrid];
        const newRow = [...newGrid[r]];
        // Toggle: 0 -> 1 -> 0
        const newVal = newRow[c] === 1 ? 0 : 1;
        newRow[c] = newVal;
        newGrid[r] = newRow;

        // Mistake Logic: Clicking a cell that is NOT part of the pattern (is 0 in target) and turning it ON (1)
        // Or should we count every wrong toggle? 
        // Standard Nonagram: Marking a cell that should be empty, or missing a cell that should be full?
        // Let's count "Turning ON a wrong cell" as a mistake.
        if (newVal === 1 && TARGET_GRID[r][c] === 0) {
            setMistakes(prev => prev + 1);
        }

        setUserGrid(newGrid);
        checkWin(newGrid);
    };

    const checkWin = (currentGrid) => {
        const isMatch = JSON.stringify(currentGrid) === JSON.stringify(TARGET_GRID);
        if (isMatch) {
            setIsComplete(true);
            setTimeout(() => {
                setIsComplete(true);
                setTimeout(() => {
                    let stars = 3;
                    if (mistakes > 2) stars = 2;
                    if (mistakes > 5) stars = 1;
                    onComplete(stars);
                }, 1000);
            }, 1000);
        }
    };

    // Calculate Grid Visuals - Responsive
    // Use smaller fixed size or viewport based?
    // Let's rely on CSS Grid '1fr' if possible, or dynamic styling.
    // Ideally we want the grid to fit.

    return (
        <div className="game-level-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', boxSizing: 'border-box' }}>
            {/* Header - Card Style */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>
                    LEVEL 11
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '8px 25px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)', textAlign: 'center', marginBottom: '5px',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{t.l11_title}</h2>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            width: '20px', height: '20px', borderRadius: '50%', background: '#2196F3', color: 'white',
                            border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0
                        }}
                    >
                        ?
                    </button>
                </div>
                <div style={{ marginTop: '2px', padding: '2px 10px', background: '#FFEBEE', color: '#D32F2F', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <p style={{ color: '#666', marginBottom: '10px', fontSize: '0.9rem', margin: '5px 0' }}>{t.l11_desc}</p>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px', // Widen Container
                margin: '10px 0 0 20px', // Left align
                background: 'white',
                padding: '20px', // More padding
                minHeight: 'auto',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Unified Grid Container to Force Alignment */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `auto repeat(${GRID_SIZE}, 1fr)`,
                    gridTemplateRows: `auto repeat(${GRID_SIZE}, 1fr)`,
                    gap: '2px',
                    width: '100%',
                    maxWidth: '350px', // Constrain total size
                    margin: '0 auto',
                    aspectRatio: '6/6' // Maintain square-ish aspect ratio
                }}>

                    {/* Top-Left Empty Corner */}
                    <div></div>

                    {/* Column Hints (Top Row) */}
                    {colHints.map((hints, i) => (
                        <div key={`col-hint-${i}`} style={{
                            display: 'flex', flexDirection: 'column',
                            justifyContent: 'flex-end', alignItems: 'center',
                            fontSize: '0.8rem', fontWeight: 'bold', color: '#555',
                            paddingBottom: '5px'
                        }}>
                            {hints.map((h, hi) => <div key={hi}>{h}</div>)}
                        </div>
                    ))}

                    {/* Row Hints & Cells (Grid Rows) */}
                    {userGrid.map((row, r) => (
                        <>
                            {/* Row Hint (First Column) */}
                            <div key={`row-hint-${r}`} style={{
                                display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                                gap: '3px', fontSize: '0.8rem', fontWeight: 'bold', color: '#555',
                                paddingRight: '5px'
                            }}>
                                {rowHints[r].join(' ')}
                            </div>

                            {/* Cells */}
                            {row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    style={{
                                        background: cell === 1 ? '#FF6B6B' : 'white',
                                        cursor: 'pointer',
                                        border: '1px solid #ccc',
                                        aspectRatio: '1/1', // Keep cells square
                                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                                    }}
                                />
                            ))}
                        </>
                    ))}
                </div>

                <div style={{ marginTop: '10px', fontWeight: 'bold', color: isComplete ? '#4CAF50' : '#888', height: '24px' }}>
                    {isComplete ? t.game_complete : ""}
                </div>
            </div>

            <div style={{ margin: '10px 0', fontSize: '0.8rem', color: '#999', flexShrink: 0 }}>
                {t.l11_footer}
            </div>

            {/* Help Overlay - Added per user request */}
            {showHelp && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
                }} onClick={() => setShowHelp(false)}>
                    <div style={{
                        background: 'white', padding: '25px', borderRadius: '20px', maxWidth: '300px',
                        textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: '#2c3e50', marginTop: 0 }}>{t.game_help_title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                            {/* Visual Example */}
                            <svg width="120" height="120" viewBox="0 0 100 100" style={{ background: '#f5f5f5', borderRadius: '10px' }}>
                                {/* Hint row: 2 */}
                                <text x="15" y="45" fontSize="12" fill="#333" fontWeight="bold">2</text>
                                {/* Grid Row */}
                                <rect x="30" y="30" width="20" height="20" fill="#FF6B6B" stroke="#555" strokeWidth="1" />
                                <rect x="50" y="30" width="20" height="20" fill="#FF6B6B" stroke="#555" strokeWidth="1" />
                                <rect x="70" y="30" width="20" height="20" fill="white" stroke="#555" strokeWidth="1" />

                                {/* Hint col: 1 */}
                                <text x="35" y="25" fontSize="12" fill="#333" fontWeight="bold">1</text>
                                <rect x="30" y="50" width="20" height="20" fill="white" stroke="#555" strokeWidth="1" />
                                <rect x="50" y="50" width="20" height="20" fill="white" stroke="#555" strokeWidth="1" />
                                <rect x="70" y="50" width="20" height="20" fill="white" stroke="#555" strokeWidth="1" />

                                {/* Hand Pointer */}
                                <text x="50" y="85" fontSize="10" fill="#666">{t.l11_help_hint}</text>
                            </svg>
                        </div>
                        <p style={{ textAlign: 'left', lineHeight: '1.4', color: '#555', fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-line' }}>
                            {t.l11_help_body}
                        </p>
                        <button onClick={() => setShowHelp(false)} style={{
                            padding: '10px 30px', background: '#2196F3', color: 'white', border: 'none',
                            borderRadius: '20px', fontSize: '1rem', cursor: 'pointer', marginTop: '10px'
                        }}>{t.game_got_it}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PixelPuzzlesLevel;
