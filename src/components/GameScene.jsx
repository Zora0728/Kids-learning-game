import { useState, useEffect } from 'react';
import '../App.css';
import { playSfx, SFX } from '../utils/sfx';
import { TEXT } from '../utils/i18n';
import DragShapeLevel from './game-types/Level01_DragShapeLevel';
import ColorMatchLevel from './game-types/Level02_ColorMatchLevel';
import SizeSortLevel from './game-types/Level03_SizeSortLevel';
import NumberOrderLevel from './game-types/Level04_NumberOrderLevel';
import PhonicsLevel from './game-types/Level05_PhonicsLevel';
import AnimalMatchLevel from './game-types/Level06_AnimalMatchLevel';
import CategorySortLevel from './game-types/Level07_CategorySortLevel';
import MathEquationLevel from './game-types/Level08_MathEquationLevel';
import SequenceOrderLevel from './game-types/Level09_SequenceOrderLevel';
import LogicMazeLevel from './game-types/Level10_LogicMazeLevel';
import ReviewLevel1 from './game-types/LevelS1_ReviewLevel1';
import PixelPuzzlesLevel from './game-types/Level11_PixelPuzzlesLevel';
import StoryFillLevel from './game-types/Level12_StoryFillLevel';
import RecyclingLevel from './game-types/Level13_RecyclingLevel';
import RhythmLevel from './game-types/Level14_RhythmLevel';
import EquationLevel from './game-types/Level15_EquationLevel';
import ReviewLevel2 from './game-types/LevelS2_ReviewLevel2';
import ScienceWaterLevel from './game-types/Level16_ScienceWaterLevel';
import ResourceMgmtLevel from './game-types/Level17_ResourceMgmtLevel';
import CodingBlocksLevel from './game-types/Level18_CodingBlocksLevel';
import Level19_LogicDeductionLevel from './game-types/Level19_LogicDeductionLevel';
import Level20_ExplorationLevel from './game-types/Level20_ExplorationLevel';
import Level21_CreativeSandboxLevel from './game-types/Level21_CreativeSandboxLevel';
import Level22_QuizMarathonLevel from './game-types/Level22_QuizMarathonLevel';
import ReviewLevel3 from './game-types/LevelS3_ReviewLevel3';
import Level23_VillageSimLevel from './game-types/Level23_VillageSimLevel';
import Level24_GameMakerLevel from './game-types/Level24_GameMakerLevel';
import Level25_AdvExplorationLevel from './game-types/Level25_AdvExplorationLevel';
import Level26_CodingChallengeLevel from './game-types/Level26_CodingChallengeLevel';
import Level27_ComplexMissionLevel from './game-types/Level27_ComplexMissionLevel';
import Level28_FinalExamLevel from './game-types/Level28_FinalExamLevel';
import Level29_GodDomainLevel from './game-types/Level29_GodDomainLevel';

const GameScene = ({ config, level, onBack, onNextLevel, onLevelComplete, language = 'zh-TW' }) => {
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [earnedStars, setEarnedStars] = useState(0);
    const [resetKey, setResetKey] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const t = TEXT[language] || TEXT['zh-TW'];

    useEffect(() => {
        // Reset state when level changes or component mounts
        setIsLoading(true);
        setShowWinOverlay(false);
        setEarnedStars(0);
        setResetKey(0);

        const timer = setTimeout(() => {
            setIsLoading(false);
            playSfx(SFX.INSTRUCTION); // Play hint sound when level starts
        }, 1500);
        return () => clearTimeout(timer);
    }, [level, config]);

    const handleWin = (stars = 3) => {
        setEarnedStars(stars);
        playSfx(SFX.CELEBRATION); // Play Win Sound
        setShowWinOverlay(true);
        if (onLevelComplete) onLevelComplete(stars);
    };

    const handleWinContinue = () => {
        playSfx(SFX.CLICK);
        setShowWinOverlay(false);
        onNextLevel();
    };

    const handleReplay = () => {
        playSfx(SFX.CLICK);
        setShowWinOverlay(false);
        setResetKey(prev => prev + 1); // Force re-mount of level component
    };

    const commonProps = {
        key: resetKey,
        levelNumber: level,
        onComplete: handleWin,
        onBack: onBack,
        playSfx: playSfx, // Pass to children
        language: language // Pass language down
    };

    // Render Logic based on Level Type
    const renderLevelContent = () => {
        if (config?.type === 'drag_shape') return <DragShapeLevel {...commonProps} />;
        if (config?.type === 'color_match') return <ColorMatchLevel {...commonProps} />;
        if (config?.type === 'size_sort') return <SizeSortLevel {...commonProps} />;
        if (config?.type === 'number_order') return <NumberOrderLevel {...commonProps} />;
        if (config?.type === 'phonics') return <PhonicsLevel {...commonProps} />;
        if (config?.type === 'animal_match') return <AnimalMatchLevel {...commonProps} />;
        if (config?.type === 'vehicle_sort') return <CategorySortLevel {...commonProps} />;
        if (config?.type === 'math_story') return <MathEquationLevel {...commonProps} />;
        if (config?.type === 'logic_sort') return <SequenceOrderLevel {...commonProps} />;
        if (config?.type === 'maze') return <LogicMazeLevel {...commonProps} />;
        if (config?.type === 'pixel_puzzles') return <PixelPuzzlesLevel {...commonProps} />;
        if (config?.type === 'story_fill') return <StoryFillLevel {...commonProps} />;
        if (config?.type === 'recycling') return <RecyclingLevel {...commonProps} />;
        if (config?.type === 'rhythm') return <RhythmLevel {...commonProps} />;
        if (config?.type === 'equation') return <EquationLevel {...commonProps} />;
        if (config?.type === 'review_1') return <ReviewLevel1 {...commonProps} />;
        if (config?.type === 'review_2') return <ReviewLevel2 {...commonProps} />;
        if (config?.type === 'review_3') return <ReviewLevel3 {...commonProps} />;
        if (config?.type === 'village_sim') return <Level23_VillageSimLevel {...commonProps} />;
        if (config?.type === 'game_maker') return <Level24_GameMakerLevel {...commonProps} />;
        if (config?.type === 'adv_exploration') return <Level25_AdvExplorationLevel {...commonProps} />;
        if (config?.type === 'coding_challenge') return <Level26_CodingChallengeLevel {...commonProps} />;
        if (config?.type === 'complex_mission') return <Level27_ComplexMissionLevel {...commonProps} />;
        if (config?.type === 'final_exam') return <Level28_FinalExamLevel {...commonProps} />;
        if (config?.type === 'god_domain') return <Level29_GodDomainLevel {...commonProps} />;
        if (config?.type === 'science_water') return <ScienceWaterLevel {...commonProps} />;
        if (config?.type === 'resource_mgmt') return <ResourceMgmtLevel {...commonProps} />;
        if (config?.type === 'coding_blocks') return <CodingBlocksLevel {...commonProps} />;
        if (config?.type === 'logic_deduction') return <Level19_LogicDeductionLevel {...commonProps} />;
        if (config?.type === 'exploration') return <Level20_ExplorationLevel {...commonProps} />;
        if (config?.type === 'creative_sandbox') return <Level21_CreativeSandboxLevel {...commonProps} />;
        if (config?.type === 'quiz_marathon') return <Level22_QuizMarathonLevel {...commonProps} />;

        // Fallback for other types not implemented yet
        return (
            <div className="card-panel" style={{ marginBottom: '20px', backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#555' }}>{config?.title}</h2>
                <p>{config?.description || "即將推出..."}</p>
                <p style={{ fontSize: '0.8rem', color: '#999' }}>Type: {config?.type}</p>

                <button className="btn-primary" onClick={() => handleWin(3)}>
                    Simulate Win (Dev)
                </button>
            </div>
        );
    };

    const bgImage = config?.background
        ? `linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url('assets/${config.background}')`
        : 'linear-gradient(to bottom, #87CEEB, #E0F7FA)'; // Default Sky

    return (
        <div className="screen-container" style={{ backgroundImage: bgImage, padding: 0 }}>
            {/* Top Bar */}
            <div className="header" style={{
                position: 'absolute',
                top: 'calc(10px + env(safe-area-inset-top))', // Safe area fix
                left: '5%', // Standardize left/width
                width: '90%',
                zIndex: 10,
                display: 'flex', justifyContent: 'flex-start' // Ensure alignment
            }}>
                <button className="btn-success" style={{ padding: '8px 20px', fontSize: '1.2rem', width: 'auto', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }} onClick={onBack}>
                    {t.game_back}
                </button>
            </div>


            {/* Main Game Area - Scrollable */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start', // Allow content to flow down, don't force center checking
                alignItems: 'center',
                width: '100%',
                paddingTop: 'calc(60px + env(safe-area-inset-top))', // Dynamic top padding
                paddingBottom: '20px', // Bottom spacer
                overflowY: 'auto', // Enable scrolling if content overflows
                overflowX: 'hidden'
            }}>
                {!isLoading && renderLevelContent()}
            </div>

            {/* Loading Transition Overlay */}
            {isLoading && (
                <div className="loading-overlay" style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center', zIndex: 50
                }}>
                    <img src="assets/game_icon.png" className="loading-icon" alt="Loading" style={{
                        width: '120px', animation: 'bounce 0.8s infinite alternate'
                    }} />
                    <h2 style={{ marginTop: '20px', color: '#555' }}>{t.game_loading}</h2>
                    <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-20px); } }`}</style>
                </div>
            )}

            {/* Victory Overlay */}
            {showWinOverlay && level !== 29 && (
                <div className="victory-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 100, animation: 'fadeIn 0.3s'
                }}>
                    <div className="victory-card" style={{
                        background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', width: '80%', maxWidth: '300px',
                        animation: 'popUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <h1>
                            {earnedStars === 3 ? t.victory_perfect :
                                earnedStars === 2 ? t.victory_great :
                                    t.victory_good}
                        </h1>
                        <div className="stars" style={{ fontSize: '2rem', margin: '10px 0 5px 0' }}>
                            {Array(3).fill(0).map((_, i) => (
                                <span key={i} style={{
                                    filter: i < earnedStars ? 'none' : 'grayscale(100%)',
                                    transition: 'filter 0.5s'
                                }}>⭐</span>
                            ))}
                        </div>
                        <p style={{ color: '#888', marginBottom: '20px' }}>{t.victory_stars_got.replace('{stars}', earnedStars)}</p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button className="btn-success" onClick={onBack} style={{ fontSize: '0.9rem', padding: '10px' }}>
                                {t.game_back}
                            </button>
                            <button className="btn-secondary" onClick={handleReplay} style={{ background: '#FF6B6B', fontSize: '0.9rem', padding: '10px' }}>
                                {t.game_retry}
                            </button>
                            {!['S1', 'S2', 'S3', 28].includes(level) && (
                                <button className="btn-primary" onClick={handleWinContinue} style={{ fontSize: '0.9rem', padding: '10px' }}>
                                    {t.game_next}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameScene;
