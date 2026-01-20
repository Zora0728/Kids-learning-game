import { useState, useEffect, useRef } from 'react';
import '../App.css';
import { CHAPTERS, getLevelConfig, getChapterByLevel } from '../data/levels';
import { playSfx, SFX } from '../utils/sfx';
import { TEXT, getTrans } from '../utils/i18n';

const LevelMap = ({ progress, onSelectLevel, onBack, onUnlockAll, onResetProgress, initialFocusLevel, onOpenProfile, language = 'zh-TW' }) => {
  // Calculate Stats
  const levelsPlayed = Object.keys(progress).map(Number).filter(n => !isNaN(n));
  const maxLevel = levelsPlayed.length > 0 ? Math.max(...levelsPlayed) + 1 : 1;
  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);

  // Target Level: Use initialFocusLevel if provided (returning from game), else maxLevel
  const targetLevel = initialFocusLevel || maxLevel;

  // Helper: map level to chapter ID
  const getChapterIdForLevel = (lvl) => {
    if (lvl === 'S1') return 'chapter_1';
    if (lvl === 'S2') return 'chapter_2';
    if (lvl === 'S3') return 'chapter_3';
    // Level 29 is effectively in Chapter 4 visually for now
    if (lvl === 29) return 'chapter_4';
    const found = CHAPTERS.find(c => c.levels.includes(lvl));
    return found ? found.id : 'chapter_1';
  };

  // Determine initial chapter
  const [activeChapterId, setActiveChapterId] = useState(() => getChapterIdForLevel(targetLevel));
  const [showPerfectModal, setShowPerfectModal] = useState(false);

  // Check for Perfect Star Warrior Title (Levels 1-28 all 3 stars)
  useEffect(() => {
    const mainLevels = Array.from({ length: 28 }, (_, i) => i + 1);
    const allPerfect = mainLevels.every(lvl => progress[lvl] === 3);
    const hasShown = localStorage.getItem('perfect_warrior_shown');

    if (allPerfect && !hasShown) {
      setTimeout(() => setShowPerfectModal(true), 1000); // Small delay for effect
    }
  }, [progress]);

  const handleClosePerfectModal = () => {
    localStorage.setItem('perfect_warrior_shown', 'true');
    setShowPerfectModal(false);
    playSfx(SFX.CLICK);
  };

  const currentLevelRef = useRef(null);
  const activeChapter = CHAPTERS.find(c => c.id === activeChapterId);

  // Auto-switch chapter and scroll when targetLevel changes
  useEffect(() => {
    const targetChapterId = getChapterIdForLevel(targetLevel);
    if (targetChapterId !== activeChapterId) {
      setActiveChapterId(targetChapterId);
    }

    // 2. Scroll to level
    if (currentLevelRef.current) {
      setTimeout(() => {
        currentLevelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [targetLevel]); // Depend on targetLevel instead of maxLevel



  // Determine Avatar based on Stars (Thresholds: 10, 25, 40, 55)
  // Determine Avatar based on Stars (Thresholds: 10, 25, 40, 55)
  // Use Sprites
  let AvatarIcon = 'assets/sprites/title_rank_1.png'; // Default
  const t = TEXT[language] || TEXT['zh-TW'];
  let Title = t.title_apprentice;

  // Check Titles
  if (progress[29] > 0) { AvatarIcon = 'assets/sprites/title_rank_7.png'; Title = t.title_god_domain; }
  else {
    // Perfect Warrior Check
    const mainLevels = Array.from({ length: 28 }, (_, i) => i + 1);
    const isPerfect = mainLevels.every(lvl => progress[lvl] === 3);
    if (isPerfect) { AvatarIcon = 'assets/sprites/title_rank_6.png'; Title = t.title_perfect_warrior; }
    else if (totalStars >= 55) { AvatarIcon = 'assets/sprites/title_rank_5.png'; Title = t.title_dragon_hero; }
    else if (totalStars >= 40) { AvatarIcon = 'assets/sprites/title_rank_4.png'; Title = t.title_wizard; }
    else if (totalStars >= 25) { AvatarIcon = 'assets/sprites/title_rank_3.png'; Title = t.title_knight; }
    else if (totalStars >= 10) { AvatarIcon = 'assets/sprites/title_rank_2.png'; Title = t.title_adventurer; }
  }

  // Check "God's Domain" override for title display? Or just keep based on stars?
  // Let's keep stars for the main avatar, but the Modal shows all.

  // Drag to Scroll Logic
  const containerRef = useRef(null);
  const isDraggingMap = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const handleDragStart = (e) => {
    // Only drag if not clicking a button directly? 
    // Actually standard behavior is: mouse down starts drag prep.
    isDraggingMap.current = true;
    startY.current = e.clientY;
    startScrollTop.current = containerRef.current ? containerRef.current.scrollTop : 0;
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  };

  const handleDragMove = (e) => {
    if (!isDraggingMap.current || !containerRef.current) return;
    e.preventDefault();
    const deltaY = e.clientY - startY.current;
    containerRef.current.scrollTop = startScrollTop.current - deltaY;
  };

  const handleDragEnd = () => {
    isDraggingMap.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  return (
    <div
      className="screen-container level-map-root" // Added class for specifity if needed
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundColor: '#E0F7FA',
        boxSizing: 'border-box',
        // Make map fill the status bar area
        marginTop: 'calc(-1 * env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        height: 'calc(100vh + env(safe-area-inset-top))' // Compensate height
      }}
    >
      {/* Player Profile Header (Fixed via Flex Layout) */}
      <div
        onClick={() => { playSfx(SFX.OPEN_SETTINGS); onOpenProfile(); }}
        className="player-profile"
        style={{
          background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
          width: '100%',
          padding: '15px 20px',
          paddingTop: 'calc(15px + env(safe-area-inset-top))', // Add padding for notch
          marginTop: 'calc(-1 * env(safe-area-inset-top))',   // Pull up provided by body padding
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'var(--color-text-dark)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          zIndex: 20, cursor: 'pointer'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            fontSize: '2.5rem', background: 'white', borderRadius: '50%',
            width: '60px', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden'
          }}>
            <img src={AvatarIcon} alt="Rank" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Lv. {maxLevel}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{Title} ℹ️</div>
            {/* Debug Buttons - Hidden for now */
              false && (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onUnlockAll(); }}
                    className="btn-primary"
                    style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: '5px', background: '#ccc', border: 'none' }}
                  >
                    {t.profile_unlock_all}
                  </button>
                  <button
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResetProgress();
                    }}
                    className="btn-primary"
                    style={{ fontSize: '0.7rem', padding: '2px 8px', marginTop: '5px', background: '#ff7675', border: 'none' }}
                  >
                    {t.profile_reset}
                  </button>
                </div>
              )
            }
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{t.map_collected_stars}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5A4A42', textShadow: 'none' }}>
            ⭐ {totalStars}
          </div>
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        className="map-container-scroll"
        ref={containerRef}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerLeave={handleDragEnd}
        style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          cursor: 'grab',
          touchAction: 'pan-y',
          paddingTop: '0px'
        }}
      >

        {/* Chapter Title Bar */}
        <div className="map-header">
          <button className="btn-success icon-btn" onClick={onBack}>⬅</button>
          <div style={{ overflow: 'hidden' }}>
            <h2 className="map-title">{getTrans(activeChapter.title, language)}</h2>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>{getTrans(activeChapter.description, language)}</div>
          </div>
        </div>

        {/* Chapter Tabs */}
        <div className="chapter-tabs">
          {CHAPTERS.map(chap => (
            <button
              key={chap.id}
              className={`tab-btn ${activeChapterId === chap.id ? 'active' : ''}`}
              style={{ backgroundColor: activeChapterId === chap.id ? chap.color : '#ccc' }}
              onClick={() => setActiveChapterId(chap.id)}
            >
              {chap.id === 'chapter_1' ? 'I' : chap.id === 'chapter_2' ? 'II' : chap.id === 'chapter_3' ? 'III' : 'IV'}
            </button>
          ))}
        </div>

        {/* Winding Path */}
        <div className="map-path-container">
          {activeChapter.levels.map((lvl, index) => {
            // Boss Visuals can remain as cosmetic markers only, or be removed.
            const isCompleted = levelsPlayed.includes(lvl);
            const stars = progress?.[lvl] || 0;

            // Milestone Logic (Visual Only - No Blocking)
            const STAR_THRESHOLDS = { 5: 10, 10: 25, 15: 40, 20: 55 };
            const milestoneStarsNeeded = STAR_THRESHOLDS[lvl];
            const isMilestone = !!milestoneStarsNeeded;
            const hasMetMilestone = isMilestone && totalStars >= milestoneStarsNeeded;

            // Standard Progression Lock Only
            const isLocked = lvl > maxLevel;

            let btnStyle = {};
            let scale = 1;

            if (isMilestone) {
              scale = 1.3;
            }

            if (isCompleted) {
              btnStyle = { borderColor: '#55efc4', background: '#f0fff4' };
            } else if (!isLocked && lvl === maxLevel) {
              // Current & Unlocked
              btnStyle = { borderColor: '#ff9f43', background: '#fff', boxShadow: '0 0 15px #ff9f43' };
              scale = isMilestone ? 1.4 : 1.1;
            } else {
              // Not reached
              btnStyle = { borderColor: '#ccc', opacity: 0.6 };
            }

            btnStyle.transform = `scale(${scale})`;

            // Special Level Logic (S1->L7, S2->L14, S3->L21)
            const SPECIAL_MAP = { 7: 'S1', 14: 'S2', 21: 'S3' };

            const renderSpecialLevel = () => {
              const specialId = SPECIAL_MAP[lvl];
              if (specialId && levelsPlayed.includes(lvl)) {
                const sStars = progress?.[specialId] || 0;
                const sCompleted = sStars > 0;

                return (
                  <div style={{ position: 'absolute', right: -90, top: -10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Rounded Star SVG Button */}
                    <div
                      style={{
                        position: 'relative', width: '75px', height: '75px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
                      }}
                      onClick={() => { playSfx(SFX.CLICK); onSelectLevel(specialId); }}
                      onPointerDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                      onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                        <polygon
                          points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
                          fill={sCompleted ? "#CE93D8" : "#F3E5F5"}
                          stroke={sCompleted ? "#CE93D8" : "#F3E5F5"}
                          strokeWidth="10"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        fontSize: '0.9rem', fontWeight: 'bold', color: '#6A1B9A',
                        pointerEvents: 'none'
                      }}>
                        SP
                      </div>
                    </div>

                    <div className="level-stars" style={{ marginTop: '0px' }}>{sCompleted ? '⭐'.repeat(sStars) : 'BONUS'}</div>
                    {/* Connection Line */}
                    <div style={{ position: 'absolute', left: -20, top: 35, width: '30px', height: '4px', background: '#E1BEE7', zIndex: -1 }}></div>
                  </div>
                );
              }
              return null;
            };

            // Labels
            const titles = {
              5: t.title_adventurer,
              10: t.title_knight,
              15: t.title_wizard,
              20: t.title_dragon_hero
            };

            return (
              <div
                key={lvl}
                className={`level-node node-${index % 2 === 0 ? 'left' : 'right'}`}
                ref={(lvl === targetLevel) ? currentLevelRef : null}
              >
                <button
                  className="level-btn"
                  style={btnStyle}
                  onClick={() => { if (!isLocked) { playSfx(SFX.CLICK); onSelectLevel(lvl); } }}
                  disabled={isLocked}
                >
                  {isLocked ? '🔒' : lvl}
                </button>
                <div className="level-stars">
                  {isCompleted ? '⭐'.repeat(stars) : ((!isLocked && lvl === maxLevel) ? <span style={{ color: '#ff9f43', fontWeight: 'bold' }}>GO!</span> : '')}
                </div>

                {/* Special Label for Milestones logic: Only show if MET */}
                {isMilestone && hasMetMilestone && (
                  <div style={{
                    position: 'absolute', top: -30, width: '160px', left: '50%', transform: 'translateX(-50%)',
                    textAlign: 'center', fontSize: '0.75rem', fontWeight: 'bold',
                    color: '#fff',
                    background: '#ff9f43',
                    padding: '4px 8px', borderRadius: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '2px solid #fff',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}>
                    🏆 BOSS: {titles[lvl]}
                  </div>
                )}

                {renderSpecialLevel()}

                {/* BOSS Level (Attached to Level 28) */}
                {lvl === 28 && levelsPlayed.includes(28) && (
                  <div style={{ position: 'absolute', left: 80, top: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
                    {/* Shiny Star Node for BOSS */}
                    <div
                      style={{
                        width: '85px', height: '85px', cursor: 'pointer',
                        animation: 'pulse-grow 2s infinite',
                        filter: 'drop-shadow(0 0 10px gold)'
                      }}
                      onClick={() => onSelectLevel(29)}
                    >
                      <div style={{ fontSize: '4rem' }}>🌟</div>
                    </div>

                    <div className="level-stars" style={{ color: '#d35400', fontWeight: 'bold', textShadow: '0 0 5px orange' }}>
                      {progress?.[29] ? '⭐'.repeat(progress[29]) : 'BOSS'}
                    </div>
                    {/* Connection Line (Left of star, connecting to node right) */}
                    <div style={{ position: 'absolute', left: -20, top: 40, width: '30px', height: '4px', background: 'gold', zIndex: -1 }}></div>

                    {/* Style Removed for stability. */}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <style jsx>{`
        .map-header {
          width: 100%;
          box-sizing: border-box; /* Fix padding issue */
          display: flex;
          align-items: center;
          padding: 15px; /* Increased padding */
          background: white;
          border-radius: 0 0 20px 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          position: relative;
          z-index: 10;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 15px;
          flex-shrink: 0; /* Prevent shrinking */
        }

        .map-title {
          margin: 0;
          color: var(--color-text-dark);
          white-space: nowrap; /* Prevent wrap */
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chapter-tabs {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 20px 0;
          padding: 0 20px; /* Safe padding */
          width: 100%;
          box-sizing: border-box;
          flex-wrap: wrap; 
        }

        .tab-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .tab-btn.active {
          transform: scale(1.1);
          border: 3px solid white;
          box-shadow: 0 5px 10px rgba(0,0,0,0.2);
        }

        .map-path-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px; 
          padding-bottom: 50px;
          width: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='200' viewBox='0 0 100 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 0 Q 100 50 50 100 Q 0 150 50 200' stroke='%23ffffff' stroke-width='4' fill='none' stroke-dasharray='10' opacity='0.5'/%3E%3C/svg%3E");
          background-repeat: repeat-y;
          background-position: center;
        }

        .level-node {
          position: relative;
          transition: transform 0.2s;
        }
        
        .node-left { margin-right: 60px; }
        .node-right { margin-left: 60px; }

        .level-btn {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: white;
          border: 5px solid var(--color-sky-blue);
          color: var(--color-text-dark);
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 5px 0 rgba(0,0,0,0.1);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .level-btn:active {
          transform: scale(0.95);
        }

        .level-stars {
          font-size: 0.8rem;
          margin-top: 5px;
          text-align: center;
        }
      `}</style>
      </div>
      {/* Perfect Star Warrior Modal */}
      {
        showPerfectModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            animation: 'fadeIn 0.5s'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fff 0%, #f9f9f9 100%)',
              padding: '40px', borderRadius: '30px', maxWidth: '90%', width: '400px',
              textAlign: 'center', position: 'relative',
              boxShadow: '0 0 50px rgba(255, 215, 0, 0.5)',
              border: '5px solid #FFD700',
              animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '10px', animation: 'bounce 1s infinite' }}>🏆</div>
              <h1 style={{
                background: 'linear-gradient(to right, #FFD700, #FDB931)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))',
                fontSize: '2.5rem', margin: '0 0 10px 0'
              }}>
                完美星戰士！
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#555', lineHeight: '1.6' }}>
                太強了！<br />
                你已經將所有關卡都獲得 3 顆星！<br />
                這就是傳說中的實力嗎？
              </p>
              <div style={{ marginTop: '30px' }}>
                <button onClick={handleClosePerfectModal} className="btn-primary" style={{
                  fontSize: '1.2rem', padding: '12px 40px',
                  background: 'linear-gradient(to bottom, #FFD700, #FFA500)',
                  border: 'none', boxShadow: '0 5px 0 #d35400'
                }}>
                  我收下了！
                </button>
              </div>

              {/* Confetti Effect (CSS only for simplicity) */}
              <style>{`
                    @keyframes scaleUp { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                `}</style>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default LevelMap;
