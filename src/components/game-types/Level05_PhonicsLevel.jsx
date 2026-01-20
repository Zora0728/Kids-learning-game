import { useState, useEffect, useRef } from 'react';
import '../../App.css';
import { playSfx, SFX } from '../../utils/sfx';
import { TEXT } from '../../utils/i18n';

const PhonicsLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [placedLetters, setPlacedLetters] = useState([]);
    const [availableLetters, setAvailableLetters] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [showFailOverlay, setShowFailOverlay] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const t = TEXT[language] || TEXT['zh-TW'];

    // Words to spell
    const words = [
        { word: 'CAT', icon: '🐱', color: '#FFB86C' },
        { word: 'DOG', icon: '🐶', color: '#FF7675' },
        { word: 'BUS', icon: '🚌', color: '#74B9FF' }
    ];
    const currentWord = words[currentWordIndex];

    // --- Refs for Drag ---
    const dragPreviewRef = useRef(null);
    const draggingRef = useRef(null);
    const placedLettersRef = useRef(placedLetters);
    const availableLettersRef = useRef(availableLetters);
    const currentWordRef = useRef(currentWord);

    useEffect(() => { placedLettersRef.current = placedLetters; }, [placedLetters]);
    useEffect(() => { availableLettersRef.current = availableLetters; }, [availableLetters]);
    useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);

    useEffect(() => {
        initRound();
    }, [currentWordIndex]);

    const initRound = () => {
        const targetLen = words[currentWordIndex].word.length;
        setPlacedLetters(Array(targetLen).fill(null));

        const letters = words[currentWordIndex].word.split('').map((char, i) => ({
            id: `${char}-${i}-${currentWordIndex}`,
            value: char,
            matched: false
        }));

        setAvailableLetters(letters.sort(() => Math.random() - 0.5));
        draggingRef.current = null;
    };

    // --- Global Pointer Events ---
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

            if (dragPreviewRef.current) dragPreviewRef.current.style.display = 'none';
            if (draggingRef.current.element) draggingRef.current.element.style.opacity = '1';

            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            const slotElement = dropTarget?.closest('.letter-slot');

            if (slotElement) {
                const slotIndexRaw = slotElement.dataset.index;
                if (slotIndexRaw !== undefined) {
                    processMove(draggingRef.current.itemId, parseInt(slotIndexRaw));
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
    }, []);

    const processMove = (letterId, slotIndex) => {
        const currentPlaced = placedLettersRef.current;
        const currentAvailable = availableLettersRef.current;
        const wordData = currentWordRef.current;

        if (currentPlaced[slotIndex] !== null) return; // Slot occupied

        const letter = currentAvailable.find(l => l.id === letterId);
        if (!letter) return;

        const targetChar = wordData.word[slotIndex];

        if (letter.value === targetChar) {
            playSfx(SFX.CLICK);
            const newPlaced = [...currentPlaced];
            newPlaced[slotIndex] = { value: letter.value, id: letter.id };
            setPlacedLetters(newPlaced);

            setAvailableLetters(prev => prev.map(l => l.id === letterId ? { ...l, matched: true } : l));
        } else {
            playSfx(SFX.ERROR);
            setMistakes(prev => prev + 1);
        }
    };

    useEffect(() => {
        // Check if level finished (current word)
        const currentLen = placedLetters.filter(Boolean).length;
        if (currentLen === words[currentWordIndex].word.length && !isCompleted) {
            setIsCompleted(true);
        }
    }, [placedLetters, currentWordIndex, isCompleted]);

    useEffect(() => {
        if (isCompleted) {
            // 0 -> 1 (Dog), 1 -> 2 (Bus), 2 -> Finish
            if (currentWordIndex < words.length - 1) {
                const timer = setTimeout(() => {
                    setCurrentWordIndex(prev => prev + 1);
                    setPlacedLetters(Array(words[currentWordIndex + 1].word.length).fill(null)); // Initialize for next word
                    setIsCompleted(false); // Reset for next word
                }, 1500);
                return () => clearTimeout(timer);
            } else {
                // All words done
                const timer = setTimeout(() => {
                    onComplete(3); // Trigger level completion
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [isCompleted, currentWordIndex, onComplete]);


    const handlePointerDown = (e, letter) => {
        if (letter.matched) return;
        e.preventDefault();
        playSfx(SFX.DRAG);

        e.currentTarget.style.opacity = '0';
        draggingRef.current = { itemId: letter.id, element: e.currentTarget };

        if (dragPreviewRef.current) {
            const clone = e.currentTarget.cloneNode(true);
            clone.style.position = 'relative';
            clone.style.left = '0';
            clone.style.top = '0';
            clone.style.transform = 'scale(1.2)';
            clone.style.opacity = '1';

            dragPreviewRef.current.innerHTML = '';
            dragPreviewRef.current.appendChild(clone);
            dragPreviewRef.current.style.display = 'flex';
            dragPreviewRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '0 20px', boxSizing: 'border-box', touchAction: 'none' }}>
            <div ref={dragPreviewRef} style={{
                position: 'fixed', top: 0, left: 0, width: '60px', height: '60px',
                pointerEvents: 'none', zIndex: 9999, display: 'none',
                justifyContent: 'center', alignItems: 'center',
                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))'
            }}></div>

            <div key={currentWordIndex} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', margin: '10px 0 20px 0' }}>
                    <h2 style={{
                        textAlign: 'center', color: '#555', margin: 0,
                        background: 'rgba(255,255,255,0.6)', padding: '10px 25px', borderRadius: '30px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '1.5rem', lineHeight: '1.4'
                    }}>
                        Level {levelNumber} : {t.l5_title}
                    </h2>
                    <div style={{ fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>
                        {t.game_progress.replace('{current}', currentWordIndex + 1).replace('{total}', words.length)}
                    </div>
                    <div style={{
                        color: '#FF6B6B', fontWeight: 'bold',
                        background: '#FFE0E0', padding: '5px 20px', borderRadius: '20px',
                        fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {t.game_mistakes.replace('{count}', mistakes)}
                    </div>
                </div>

                <div style={{ fontSize: '6rem', margin: '10px 0 30px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>
                    {currentWord.icon}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                    {Array.from(currentWord.word).map((char, i) => (
                        <div key={i} className="letter-slot" data-index={i}
                            style={{
                                width: '60px', height: '80px', borderBottom: '4px solid #555',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '3rem', fontWeight: 'bold', color: '#333',
                                background: placedLetters[i] ? '#E0F7FA' : 'transparent',
                                transition: 'all 0.3s', userSelect: 'none'
                            }}>
                            {placedLetters[i]?.value || ''}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', minHeight: '80px', position: 'relative' }}>
                    {availableLetters.map((letter) => (
                        <div key={letter.id}
                            onPointerDown={(e) => !letter.matched && handlePointerDown(e, letter)}
                            style={{
                                width: '60px', height: '60px', background: letter.matched ? '#ccc' : currentWord.color,
                                borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '2rem', fontWeight: 'bold', color: 'white',
                                cursor: letter.matched ? 'default' : 'grab',
                                opacity: letter.matched ? 0.3 : 1, // Drag hide via DOM
                                pointerEvents: letter.matched ? 'none' : 'auto',
                                boxShadow: '0 4px 0 rgba(0,0,0,0.2)', userSelect: 'none', touchAction: 'none'
                            }}>
                            <div style={{ pointerEvents: 'none' }}>{letter.value}</div>
                        </div>
                    ))}
                </div>

                {showFailOverlay && (
                    <div className="fail-overlay" style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                    }}>
                        <div className="fail-card" style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
                            <img src="/assets/game_fail.png" style={{ width: '80px', height: '80px', marginBottom: '10px' }} alt="Failed" />
                            <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{t.fail_title}</h2>
                            <p>{t.fail_retry_prompt}</p>
                            <button className="btn-success" onClick={() => window.location.reload()}>{t.game_retry}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhonicsLevel;
