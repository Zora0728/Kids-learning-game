import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const LogicMazeLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [hasKey, setHasKey] = useState(false);
    const [mistakes, setMistakes] = useState(0); // Hit walls

    const t = TEXT[language] || TEXT['zh-TW'];

    // Maze Config
    // 0: Empty, 1: Wall, 2: Start, 3: Key, 4: Door, 5: Goal
    // Simple 5x5 Grid
    const mazeGrid = [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 2, 0, 0, 1, 3, 1],
        [1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 4, 1], // Door at (5,4)
        [1, 0, 1, 5, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
    ];

    const CELL_SIZE = 50;

    // Knight State
    const [knightPos, setKnightPos] = useState({ x: 1, y: 1 }); // Grid coords

    // Initial Position Setup
    useEffect(() => {
        // Reset
        setHasKey(false);
        setMistakes(0);
        setKnightPos({ x: 1, y: 1 });
    }, [levelNumber, language]);

    // Check Wall Collision
    const isWalkable = (r, c) => {
        if (r < 0 || c < 0 || r >= mazeGrid.length || c >= mazeGrid[0].length) return false;
        const cell = mazeGrid[r][c];
        if (cell === 1) return false; // Wall
        if (cell === 4 && !hasKey) return false; // Locked Door
        return true;
    };

    // Movement Logic for D-pad
    const moveKnight = (dx, dy) => {
        const nextX = knightPos.x + dx;
        const nextY = knightPos.y + dy;

        if (isWalkable(nextY, nextX)) {
            setKnightPos({ x: nextX, y: nextY });

            // Check Triggers
            const cell = mazeGrid[nextY][nextX];
            if (cell === 3 && !hasKey) {
                setHasKey(true); // Pick up key
            }
            if (cell === 5) {
                finishLevel();
            }
        } else {
            // Hit wall feedback
            setMistakes(prev => prev + 1);
            // Optional: Shake animation or sound could go here
        }
    };

    const finishLevel = () => {
        // Win
        let stars = 3;
        if (mistakes > 5) stars = 2;
        if (mistakes > 10) stars = 1;
        onComplete(stars);
    };

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '0 20px 50px 20px', textAlign: 'center', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.2rem', color: '#7f8c8d', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                    LEVEL {levelNumber}
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '30px',
                    padding: '15px 40px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    minWidth: '280px'
                }}>
                    <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.5rem' }}>{t.l10_title}</h2>
                    <div style={{ color: '#7f8c8d', fontSize: '1.1rem', fontWeight: '500' }}>
                        {hasKey ? t.l10_desc_door : t.l10_desc_find}
                    </div>
                </div>

                <div style={{
                    marginTop: '15px',
                    padding: '8px 20px',
                    background: '#FFEBEE', // Light Pink
                    color: '#D32F2F', // Red Text
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'inline-block'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            <div
                style={{
                    position: 'relative',
                    width: '350px',
                    margin: '20px auto',
                    display: 'grid',
                    gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#fff'
                }}
            >
                {mazeGrid.map((row, r) => (
                    row.map((cell, c) => {
                        let content = null;
                        let bg = '#eee'; // Floor
                        if (cell === 1) bg = '#546E7A'; // Wall
                        if (cell === 2) content = <span style={{ opacity: 0.2 }}>🏁</span>;
                        if (cell === 3) content = !hasKey ? <span style={{ fontSize: '1.5rem' }}>🔑</span> : null;
                        if (cell === 4) bg = hasKey ? '#81C784' : '#A1887F'; // Door (functionally locked until hasKey)
                        if (cell === 4) content = hasKey ? <span style={{ fontSize: '1.5rem' }}>🔓</span> : <span style={{ fontSize: '1.5rem' }}>🔒</span>;
                        if (cell === 5) content = <span style={{ fontSize: '2rem' }}>🏰</span>;

                        return (
                            <div key={`${r}-${c}`} style={{
                                width: CELL_SIZE, height: CELL_SIZE,
                                background: bg,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}>
                                {content}
                            </div>
                        );
                    })
                ))}

                {/* Knight Character (Grid Positioned) */}
                <div
                    style={{
                        position: 'absolute',
                        left: knightPos.x * CELL_SIZE,
                        top: knightPos.y * CELL_SIZE,
                        width: CELL_SIZE, height: CELL_SIZE,
                        transition: 'left 0.2s, top 0.2s', // Smooth slide
                        zIndex: 10,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: '2rem',
                        filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))'
                    }}
                >
                    🛡️
                </div>
            </div>

            {/* D-Pad Controls */}
            <div className="d-pad" style={{
                display: 'grid',
                gridTemplateColumns: '80px 80px 80px',
                gridTemplateRows: '60px 60px',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '30px'
            }}>
                {/* Row 1: Empty, Up, Empty */}
                <div />
                <button className="btn-control" onClick={() => moveKnight(0, -1)}>⬆️</button>
                <div />

                {/* Row 2: Left, Down, Right */}
                <button className="btn-control" onClick={() => moveKnight(-1, 0)}>⬅️</button>
                <button className="btn-control" onClick={() => moveKnight(0, 1)}>⬇️</button>
                <button className="btn-control" onClick={() => moveKnight(1, 0)}>➡️</button>
            </div>

            <style jsx>{`
                .btn-control {
                    width: 100%;
                    height: 100%;
                    font-size: 2rem;
                    border: none;
                    border-radius: 15px;
                    background: white;
                    box-shadow: 0 5px 0 #ddd;
                    cursor: pointer;
                    transition: transform 0.1s;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0;
                }
                .btn-control:active {
                    transform: translateY(4px);
                    box-shadow: 0 1px 0 #ddd;
                }
            `}</style>

        </div>
    );
};

export default LogicMazeLevel;
