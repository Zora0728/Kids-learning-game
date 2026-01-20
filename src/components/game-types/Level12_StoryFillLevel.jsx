import { useState, useEffect } from 'react';
import '../../App.css';
import { TEXT } from '../../utils/i18n';

const StoryFillLevel = ({ levelNumber, onComplete, onBack, language = 'zh-TW' }) => {

    const t = TEXT[language] || TEXT['zh-TW'];

    // Story Data
    const [storyData, setStoryData] = useState(null);

    useEffect(() => {
        setStoryData({
            title: t.l12_story_title,
            sentences: [
                {
                    text_pre: t.l12_s1_pre,
                    blank: t.l12_fishing_rod,
                    text_post: t.l12_s1_post,
                    options: [t.l12_fishing_rod, t.l12_pencil, t.l12_spoon],
                    image: "🎣"
                },
                {
                    text_pre: t.l12_s2_pre,
                    blank: t.l12_fish,
                    text_post: t.l12_s2_post,
                    options: [t.l12_bird, t.l12_fish, t.l12_elephant],
                    image: "🐟"
                },
                {
                    text_pre: t.l12_s3_pre,
                    blank: t.l12_happy,
                    text_post: t.l12_s3_post,
                    options: [t.l12_angry, t.l12_happy, t.l12_sad],
                    image: "🏠"
                }
            ]
        });

        // Reset state on language change if needed, but for now just updating text is enough
        // Ideally we should reset progress if language changes mid-game, but it's rare.
    }, [language]);

    const [currentStep, setCurrentStep] = useState(0);
    // Initialize answers with safe length (3 lines in story)
    const [answers, setAnswers] = useState(Array(3).fill(null));
    const [mistakes, setMistakes] = useState(0);
    const [isWrong, setIsWrong] = useState(false);

    const handleOptionSelect = (option) => {
        if (!storyData) return;
        const target = storyData.sentences[currentStep].blank;

        if (option === target) {
            // Correct
            const newAnswers = [...answers];
            newAnswers[currentStep] = option;
            setAnswers(newAnswers);

            // Go to next step or finish
            if (currentStep < storyData.sentences.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                // Determine finish
                // Manual completion triggered by button now
            }
        } else {
            // Wrong
            setMistakes(prev => prev + 1);
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
        }
    };

    if (!storyData) return null; // Wait for effect

    const currentSentence = storyData.sentences[currentStep];
    const isFinished = answers[storyData.sentences.length - 1] !== null;

    return (
        <div className="game-level-container" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '0 20px', boxSizing: 'border-box' }}>
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
                    <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.5rem' }}>{t.l12_title}</h2>
                    <div style={{ color: '#7f8c8d', fontSize: '1.1rem', fontWeight: '500' }}>— {storyData.title} —</div>
                </div>

                <div style={{
                    marginTop: '15px',
                    padding: '8px 20px',
                    background: '#FFEBEE',
                    color: '#D32F2F',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    display: 'inline-block'
                }}>
                    {t.game_mistakes.replace('{count}', mistakes)}
                </div>
            </div>

            {/* Story Display Area */}
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '30px',
                transition: 'all 0.3s'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.1))' }}>
                    {isFinished ? "🎉" : currentSentence.image}
                </div>

                <div style={{ fontSize: '1.2rem', lineHeight: '2', color: '#333' }}>
                    {isFinished ? (
                        // Show Full Story
                        <div>
                            {storyData.sentences.map((s, i) => (
                                <div key={i}>
                                    {s.text_pre} <span style={{ color: '#2196F3', fontWeight: 'bold' }}>{s.blank}</span> {s.text_post}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Show Current Sentence
                        <div>
                            {currentSentence.text_pre}
                            <span style={{
                                display: 'inline-block',
                                borderBottom: '3px solid #2196F3',
                                width: '100px',
                                textAlign: 'center',
                                color: '#2196F3',
                                fontWeight: 'bold',
                                margin: '0 5px'
                            }}>
                                {answers[currentStep] || "___"}
                            </span>
                            {currentSentence.text_post}
                        </div>
                    )}
                </div>
            </div>

            {/* Options Area */}
            {!isFinished && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    {currentSentence.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(opt)}
                            className="btn-option"
                            style={{
                                padding: '15px',
                                fontSize: '1.2rem',
                                border: '2px solid #eee',
                                borderRadius: '15px',
                                background: 'white',
                                color: '#333',
                                fontWeight: 'bold',
                                boxShadow: '0 5px 0 #ddd',
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                animation: isWrong ? 'shake 0.3s' : 'none'
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {isFinished && (
                <div style={{ animation: 'fadeIn 0.5s', marginTop: '20px' }}>
                    <div style={{ fontSize: '1.2rem', color: '#4CAF50', fontWeight: 'bold', marginBottom: '15px' }}>
                        {t.l12_success}
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            let stars = 3;
                            if (mistakes > 1) stars = 2;
                            if (mistakes > 3) stars = 1;
                            onComplete(stars);
                        }}
                        style={{ padding: '10px 30px', fontSize: '1.2rem', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                    >
                        {t.game_get_stars}
                    </button>
                </div>
            )}

            <style jsx>{`
                .btn-option:active {
                    transform: translateY(4px);
                    box-shadow: 0 1px 0 #ddd !important;
                }
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                    100% { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default StoryFillLevel;
