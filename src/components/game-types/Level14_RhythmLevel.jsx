import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const RhythmLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {

    const t = TEXT[language] || TEXT['zh-TW'];

    // Game Config
    const pads = [
        { id: 'red', color: '#e74c3c', activeColor: '#ff7675', icon: '🥁', name: t.l14_pad_red },
        { id: 'blue', color: '#3498db', activeColor: '#74b9ff', icon: '🎹', name: t.l14_pad_blue },
        { id: 'yellow', color: '#f1c40f', activeColor: '#ffeaa7', icon: '🔔', name: t.l14_pad_yellow },
        { id: 'green', color: '#2ecc71', activeColor: '#55efc4', icon: '🎸', name: t.l14_pad_green }
    ];

    const rounds = [
        { count: 3, speed: 800 }, // Round 1: 3 notes
        { count: 4, speed: 700 }, // Round 2: 4 notes
        { count: 5, speed: 600 }  // Round 3: 5 notes
    ];

    // State
    const [currentRound, setCurrentRound] = useState(0);
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false); // Computer is playing
    const [activePad, setActivePad] = useState(null); // Which pad is lit up
    const [message, setMessage] = useState(t.l14_ready);
    const [gameState, setGameState] = useState('start'); // start, playing, input, success, fail, complete
    const [mistakes, setMistakes] = useState(0);
    const [showHelp, setShowHelp] = useState(true); // Show help initially

    // Generate random sequence
    const generateSequence = (length) => {
        const newSeq = [];
        for (let i = 0; i < length; i++) {
            const randomPad = pads[Math.floor(Math.random() * pads.length)];
            newSeq.push(randomPad.id);
        }
        return newSeq;
    };

    // Start a round
    const startRound = (roundIndex) => {
        const roundConfig = rounds[roundIndex];
        const newSeq = generateSequence(roundConfig.count);
        setSequence(newSeq);
        setPlayerSequence([]);
        setGameState('playing');
        setMessage(t.l14_watch);
        playSequence(newSeq, roundConfig.speed);
    };

    // Play the sequence (Visual)
    const playSequence = (seq, speed) => {
        setIsPlaying(true);
        let i = 0;
        const interval = setInterval(() => {
            if (i >= seq.length) {
                clearInterval(interval);
                setActivePad(null);
                setIsPlaying(false);
                setGameState('input');
                setMessage(t.l14_turn);
                return;
            }

            // Flash pad
            setActivePad(seq[i]);

            // Audio placeholder (can add real sound later)
            // playSound(seq[i]); 

            setTimeout(() => {
                setActivePad(null);
            }, speed / 2);

            i++;
        }, speed);
    };

    // Handle Pad Click
    const handlePadClick = (padId) => {
        if (gameState !== 'input') return;

        // Visual feedback
        setActivePad(padId);
        setTimeout(() => setActivePad(null), 300);

        const expectedPadId = sequence[playerSequence.length];

        if (padId === expectedPadId) {
            // Correct
            const newPlayerSeq = [...playerSequence, padId];
            setPlayerSequence(newPlayerSeq);

            if (newPlayerSeq.length === sequence.length) {
                // Round Complete
                setGameState('success');
                setMessage(t.l14_great);

                setTimeout(() => {
                    if (currentRound < rounds.length - 1) {
                        setCurrentRound(prev => prev + 1);
                        startRound(currentRound + 1);
                    } else {
                        setGameState('complete');
                        setMessage(t.l14_all_clear);
                    }
                }, 1000);
            }
        } else {
            // Wrong
            setMistakes(prev => prev + 1);
            setGameState('fail');
            setMessage(t.l14_fail);
        }
    };

    const handleCloseHelp = () => {
        setShowHelp(false);
        if (gameState === 'start' && sequence.length === 0) {
            startRound(0);
        }
    };

    // Initialize Level
    useEffect(() => {
    }, []);

    const handleLevelComplete = () => {
        let stars = 3;
        if (mistakes > 2) stars = 2;
        if (mistakes > 5) stars = 1;
        onComplete(stars);
    };

    const handleRetry = () => {
        startRound(currentRound);
    };

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '0 20px', boxSizing: 'border-box' }}>

            {/* Header Style */}
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
                    minWidth: '280px',
                    position: 'relative'
                }}>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
                            width: '32px', height: '32px', borderRadius: '50%', background: '#3498db', color: 'white',
                            border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem'
                        }}
                    >
                        ?
                    </button>
                    <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '2.2rem' }}>{t.l14_title}</h2>
                    <div style={{ color: '#7f8c8d', fontSize: '1.1rem', fontWeight: '500' }}>{t.l14_desc}</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                {/* Removed redundant secondary title to save space */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ marginTop: '5px', color: '#2980b9', fontWeight: 'bold', background: '#d4e6f1', padding: '5px 15px', borderRadius: '15px', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {t.l14_round.replace('{current}', currentRound + 1).replace('{total}', rounds.length)}
                    </div>
                    <div style={{
                        marginTop: '5px',
                        padding: '5px 15px',
                        background: '#FFEBEE',
                        color: '#D32F2F',
                        borderRadius: '15px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        display: 'inline-block'
                    }}>
                        {t.game_mistakes.replace('{count}', mistakes)}
                    </div>
                </div>
            </div>




            {/* Game Message */}
            <h3 style={{ height: '24px', color: '#333', marginBottom: '10px', marginTop: '0' }}>{message}</h3>

            {/* Pads Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px',
                maxWidth: '320px', margin: '0 auto',
                pointerEvents: gameState === 'input' ? 'auto' : 'none',
                opacity: gameState === 'input' || isPlaying ? 1 : 0.7
            }}>
                {pads.map(pad => (
                    <div
                        key={pad.id}
                        onPointerDown={() => handlePadClick(pad.id)}
                        style={{
                            aspectRatio: '1',
                            backgroundColor: activePad === pad.id ? pad.activeColor : pad.color,
                            borderRadius: '15px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            cursor: 'pointer',
                            boxShadow: activePad === pad.id ? `0 0 30px ${pad.activeColor}` : '0 4px 8px rgba(0,0,0,0.2)',
                            transform: activePad === pad.id ? 'scale(0.95)' : 'scale(1)',
                            transition: 'all 0.1s ease',
                            userSelect: 'none'
                        }}
                    >
                        <div style={{ fontSize: '2.5rem' }}>{pad.icon}</div>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{pad.name}</div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div style={{ marginTop: '20px', height: '40px' }}>
                {gameState === 'fail' && (
                    <button className="btn-primary" onClick={handleRetry} style={{ background: '#e74c3c', fontSize: '1rem', padding: '8px 20px' }}>{t.game_retry || "Retry"}</button>
                )}
                {gameState === 'complete' && (
                    <button className="btn-success" onClick={handleLevelComplete} style={{ fontSize: '1rem', padding: '8px 20px' }}>{t.game_get_stars}</button>
                )}
            </div>
            {/* Help Modal */}
            {
                showHelp && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white', padding: '20px', borderRadius: '20px', maxWidth: '85%', width: '320px',
                            textAlign: 'center', boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                            border: '4px solid #3498db'
                        }}>
                            <h2 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.8rem', margin: '0 0 15px 0' }}>{t.game_help_title}</h2>

                            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                                <div style={{ width: '32%' }}>
                                    <div style={{ fontSize: '2.5rem' }}>👀</div>
                                    <h3 style={{ margin: '5px 0', fontSize: '1.1rem', color: '#3498db' }}>{t.l14_help_1_title}</h3>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{t.l14_help_1_desc}</div>
                                </div>
                                <div style={{ width: '32%' }}>
                                    <div style={{ fontSize: '2.5rem' }}>🧠</div>
                                    <h3 style={{ margin: '5px 0', fontSize: '1.1rem', color: '#f1c40f' }}>{t.l14_help_2_title}</h3>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{t.l14_help_2_desc}</div>
                                </div>
                                <div style={{ width: '32%' }}>
                                    <div style={{ fontSize: '2.5rem' }}>👆</div>
                                    <h3 style={{ margin: '5px 0', fontSize: '1.1rem', color: '#e74c3c' }}>{t.l14_help_3_title}</h3>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{t.l14_help_3_desc}</div>
                                </div>
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleCloseHelp}
                                style={{ fontSize: '1.1rem', padding: '8px 30px', borderRadius: '50px', width: '80%' }}
                            >
                                {t.l14_start}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default RhythmLevel;
