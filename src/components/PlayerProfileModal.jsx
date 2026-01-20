import { useState } from 'react';
import '../App.css';
import { TEXT } from '../utils/i18n';
import FeedbackModal from './FeedbackModal';
import { toggleBgm, playSfx, SFX } from '../utils/sfx';
import SyncTutorialModal from './SyncTutorialModal';

const PlayerProfileModal = ({
    isOpen,
    onClose,
    levelProgress,
    maxLevel,
    totalStars,
    avatar,
    currentTitle,
    mode = 'full', // 'full' or 'rewards_only'
    currentLanguage = 'zh-TW',
    onLanguageChange,
    syncId,
    onGenerateSyncId,
    onLoadFromCloud,
    lastSyncTime
}) => {
    if (!isOpen) return null;

    const t = TEXT[currentLanguage] || TEXT['zh-TW'];

    // State for Title Preview Modal
    const [selectedTitle, setSelectedTitle] = useState(null);
    // State for Feedback Modal
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    // State for Cloud Sync input
    const [cloudInputId, setCloudInputId] = useState('');
    const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'|'error', msg: '' }
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);

    // State for settings (to force re-render)
    const [bgmEnabled, setBgmEnabled] = useState(() => localStorage.getItem('game_bgm_enabled') !== 'false');
    const [sfxEnabled, setSfxEnabled] = useState(() => localStorage.getItem('game_sfx_enabled') !== 'false');



    // Titles Configuration
    // Condition: function receiving (progress, maxLevel) -> boolean
    const TITLES = [
        { id: 't1', name: t.title_apprentice, desc: currentLanguage === 'zh-TW' ? "開始冒險" : "Start Adventure", condition: () => true, sprite: 'assets/sprites/title_rank_1.png' }, // Apprentice (Empty)
        { id: 't2', name: t.title_adventurer, desc: currentLanguage === 'zh-TW' ? "獲得 10 顆星星" : "Collect 10 Stars", condition: (p, m, s) => s >= 10, sprite: 'assets/sprites/title_rank_2.png' }, // Adventurer (Sword)
        { id: 't3', name: t.title_knight, desc: currentLanguage === 'zh-TW' ? "獲得 25 顆星星" : "Collect 25 Stars", condition: (p, m, s) => s >= 25, sprite: 'assets/sprites/title_rank_3.png' }, // Knight
        { id: 't4', name: t.title_wizard, desc: currentLanguage === 'zh-TW' ? "獲得 40 顆星星" : "Collect 40 Stars", condition: (p, m, s) => s >= 40, sprite: 'assets/sprites/title_rank_4.png' }, // Wizard
        { id: 't5', name: t.title_dragon_hero, desc: currentLanguage === 'zh-TW' ? "獲得 55 顆星星" : "Collect 55 Stars", condition: (p, m, s) => s >= 55, sprite: 'assets/sprites/title_rank_5.png' }, // Dragon
        {
            id: 't_perfect',
            name: t.title_perfect_warrior,
            desc: currentLanguage === 'zh-TW' ? "所有已解鎖關卡皆獲得 3 顆星" : "Get 3 Stars in all Main Levels",
            condition: (p, m, s) => {
                // Strict: Levels 1-28 must be 3 stars
                const mainLevels = Array.from({ length: 28 }, (_, i) => i + 1);
                return mainLevels.every(lvl => p[lvl] === 3);
            },
            sprite: 'assets/sprites/title_rank_6.png' // Perfect
        },
        {
            id: 't_god',
            name: t.title_god_domain,
            desc: currentLanguage === 'zh-TW' ? "通過傳說中的 BOSS 關卡" : "Complete the Boss Level",
            condition: (p) => !!p[29], // Level 29 completed
            sprite: 'assets/sprites/title_rank_7.png' // God
        }
    ];

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', zIndex: 100,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={onClose}>
            <div className="modal-content" style={{
                background: 'white', padding: '20px', borderRadius: '25px',
                width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto',
                position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                textAlign: 'center'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute', top: '10px', right: '15px',
                    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888'
                }}>✖</button>

                {(mode !== 'settings') && (
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '4rem', background: '#ecf0f1', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', overflow: 'hidden' }}>
                            {typeof avatar === 'string' && avatar.includes('assets') ? (
                                <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                avatar
                            )}
                        </div>
                        <h2 style={{ margin: '0', color: '#2c3e50' }}>{t.profile_level} {maxLevel} {currentTitle}</h2>
                        <div style={{ fontSize: '1.2rem', color: '#f1c40f', fontWeight: 'bold', marginTop: '5px' }}>
                            ⭐ {totalStars} {t.profile_stars}
                        </div>
                    </div>
                )}

                {(mode !== 'settings') && (
                    <h3 style={{ borderBottom: '2px solid #ecf0f1', paddingBottom: '10px', color: '#7f8c8d' }}>
                        {t.profile_titles}
                    </h3>
                )}

                {(mode !== 'settings') && (
                    <div className="titles-list" style={{ textAlign: 'left', maxHeight: '300px', overflowY: 'auto' }}>
                        {TITLES.map((title) => {
                            const isUnlocked = title.condition(levelProgress, maxLevel, totalStars);
                            return (
                                <div key={title.id}
                                    onClick={() => setSelectedTitle({ ...title, isUnlocked })}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px', borderBottom: '1px solid #eee',
                                        opacity: isUnlocked ? 1 : 0.6,
                                        background: isUnlocked ? '#f9fbe7' : 'transparent',
                                        cursor: 'pointer'
                                    }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: isUnlocked ? '#2c3e50' : '#bdc3c7' }}>
                                            {title.name} {isUnlocked && '✅'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>{title.desc}</div>
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem', fontWeight: 'bold',
                                        color: isUnlocked ? '#2ecc71' : '#e74c3c',
                                        border: `1px solid ${isUnlocked ? '#2ecc71' : '#e74c3c'}`,
                                        padding: '2px 8px', borderRadius: '10px'
                                    }}>
                                        {isUnlocked ? t.profile_unlocked : t.profile_locked}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {mode !== 'rewards_only' && (
                    <div style={{ marginTop: (mode === 'settings' ? '0' : '20px'), borderTop: (mode === 'settings' ? 'none' : '2px solid #ecf0f1'), paddingTop: (mode === 'settings' ? '40px' : '20px') }}>
                        {/* Music Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>
                                <span>🎵</span> <span>{t.settings_music}</span>
                            </div>
                            <button
                                onClick={() => {
                                    const newState = !bgmEnabled;
                                    setBgmEnabled(newState);
                                    localStorage.setItem('game_bgm_enabled', newState ? 'true' : 'false');
                                    toggleBgm(newState);
                                    if (newState) playSfx(SFX.CLICK);
                                }}
                                style={{
                                    cursor: 'pointer', padding: '8px 20px', borderRadius: '50px', border: 'none',
                                    background: bgmEnabled ? '#2ecc71' : '#e74c3c', // Green or Red
                                    color: 'white', fontWeight: 'bold', fontSize: '1rem',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', minWidth: '100px'
                                }}>
                                {bgmEnabled ? t.settings_on : t.settings_off}
                            </button>
                        </div>

                        {/* SFX Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>
                                <span>🔊</span> <span>{t.settings_sfx}</span>
                            </div>
                            <button
                                onClick={() => {
                                    const newState = !sfxEnabled;
                                    setSfxEnabled(newState);
                                    localStorage.setItem('game_sfx_enabled', newState ? 'true' : 'false');
                                    if (newState) playSfx(SFX.CLICK);
                                }}
                                style={{
                                    cursor: 'pointer', padding: '8px 20px', borderRadius: '50px', border: 'none',
                                    background: sfxEnabled ? '#2ecc71' : '#e74c3c',
                                    color: 'white', fontWeight: 'bold', fontSize: '1rem',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)', minWidth: '100px'
                                }}>
                                {sfxEnabled ? t.settings_on : t.settings_off}
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>
                                <span>🌐</span> <span>{t.settings_language}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    const nextState = currentLanguage === 'zh-TW' ? 'en-US' : 'zh-TW';
                                    onLanguageChange(nextState); // Call parent handler
                                    playSfx(SFX.CLICK);
                                }}
                                style={{
                                    cursor: 'pointer', padding: '8px 20px', borderRadius: '50px', border: '1px solid #ccc',
                                    background: '#f1f2f6', color: '#2c3e50', fontWeight: 'bold', fontSize: '1rem',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)', minWidth: '100px'
                                }}>
                                {currentLanguage === 'en-US' ? 'English' : '繁體中文'}
                            </button>
                        </div>

                        <button className="btn-3d-blue"
                            style={{
                                width: '100%', marginBottom: '15px',
                                background: '#5D9CEC', color: 'white', border: 'none', borderRadius: '50px',
                                padding: '15px', fontSize: '1.2rem', fontWeight: 'bold',
                                boxShadow: '0 5px 0 #4A89DC, 0 10px 10px rgba(0,0,0,0.2)',
                                cursor: 'pointer', transition: 'transform 0.1s'
                            }}
                            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = '0 0 0 #4A89DC, 0 0 0 rgba(0,0,0,0)'; }}
                            onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 0 #4A89DC, 0 10px 10px rgba(0,0,0,0.2)'; }}
                            onClick={() => setIsFeedbackOpen(true)}>
                            {t.menu_feedback}
                        </button>

                        {/* Cloud Sync Section */}
                        <div style={{ marginTop: '20px', borderTop: '2px solid #ecf0f1', paddingTop: '20px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: '#666', fontWeight: 'bold' }}>
                                    <span>☁️</span> <span>{currentLanguage === 'zh-TW' ? "雲端同步" : "Cloud Sync"}</span>
                                </div>
                                <button
                                    onClick={() => setIsTutorialOpen(true)}
                                    style={{
                                        background: '#3498db', color: 'white', border: 'none', borderRadius: '50%',
                                        width: '24px', height: '24px', fontSize: '0.8rem', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'
                                    }}>
                                    ?
                                </button>
                            </div>

                            {syncId ? (
                                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>{currentLanguage === 'zh-TW' ? "您的同步碼" : "Your Sync ID"}</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3498db' }}>{syncId}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(syncId);
                                                setSyncStatus({ type: 'success', msg: currentLanguage === 'zh-TW' ? '已複製' : 'Copied' });
                                                setTimeout(() => setSyncStatus(null), 2000);
                                            }}
                                            style={{ background: '#ecf0f1', border: 'none', padding: '5px 10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            {currentLanguage === 'zh-TW' ? "複製" : "Copy"}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#bdc3c7', marginTop: '5px' }}>
                                        {currentLanguage === 'zh-TW' ? "進度將自動備份至雲端" : "Progress is auto-backed up"}
                                        {lastSyncTime && ` (${lastSyncTime.toLocaleTimeString()})`}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={onGenerateSyncId}
                                    style={{
                                        width: '100%', padding: '12px', background: '#3498db', color: 'white',
                                        border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px'
                                    }}
                                >
                                    {currentLanguage === 'zh-TW' ? "啟動雲端同步" : "Enable Cloud Sync"}
                                </button>
                            )}

                            <div style={{ borderTop: '1px dashed #eee', paddingTop: '15px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '8px' }}>
                                    {currentLanguage === 'zh-TW' ? "從其他裝置回復進度：" : "Restore from another device:"}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="ZORA-XXXX"
                                        value={cloudInputId}
                                        onChange={(e) => setCloudInputId(e.target.value.toUpperCase())}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd',
                                            fontSize: '1rem', textAlign: 'center'
                                        }}
                                    />
                                    <button
                                        onClick={async () => {
                                            if (!cloudInputId) return;
                                            setSyncStatus({ type: 'info', msg: 'Syncing...' });
                                            const res = await onLoadFromCloud(cloudInputId);
                                            if (res.success) {
                                                setSyncStatus({ type: 'success', msg: currentLanguage === 'zh-TW' ? '同步成功！' : 'Synced!' });
                                            } else {
                                                setSyncStatus({ type: 'error', msg: res.error });
                                            }
                                            setTimeout(() => setSyncStatus(null), 3000);
                                        }}
                                        style={{
                                            padding: '0 20px', background: '#2ecc71', color: 'white',
                                            border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        {currentLanguage === 'zh-TW' ? "同步" : "Sync"}
                                    </button>
                                </div>
                                {syncStatus && (
                                    <div style={{
                                        fontSize: '0.8rem', textAlign: 'center', marginTop: '8px',
                                        color: syncStatus.type === 'error' ? '#e74c3c' : '#2ecc71'
                                    }}>
                                        {syncStatus.msg}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Yellow Home Button */}
                        {mode !== 'settings' && (
                            <button className="btn-3d-yellow"
                                style={{
                                    width: '100%', marginTop: '20px',
                                    background: '#FFCE54', color: '#5D4037', border: 'none', borderRadius: '50px',
                                    padding: '15px', fontSize: '1.2rem', fontWeight: 'bold',
                                    boxShadow: '0 5px 0 #F6BB42, 0 10px 10px rgba(0,0,0,0.2)',
                                    cursor: 'pointer', transition: 'transform 0.1s'
                                }}
                                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(5px)'; e.currentTarget.style.boxShadow = '0 0 0 #F6BB42, 0 0 0 rgba(0,0,0,0)'; }}
                                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 0 #F6BB42, 0 10px 10px rgba(0,0,0,0.2)'; }}
                                onClick={() => window.location.reload()}>
                                {t.settings_back_home}
                            </button>
                        )}

                        <p style={{ fontSize: '0.9rem', color: '#bbb', marginTop: '20px' }}>
                            {t.settings_more_coming}
                        </p>
                    </div>
                )}

            </div>

            {/* Title Preview Modal */}
            {selectedTitle && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    animation: 'fadeIn 0.2s'
                }} onClick={() => setSelectedTitle(null)}>
                    <div style={{
                        background: 'white', padding: '30px', borderRadius: '25px',
                        width: '80%', maxWidth: '300px', textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)',
                        animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedTitle(null)} style={{
                            position: 'absolute', top: '10px', right: '15px',
                            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888'
                        }}>✖</button>

                        <h2 style={{ color: selectedTitle.isUnlocked ? '#2c3e50' : '#7f8c8d', marginBottom: '10px' }}>
                            {selectedTitle.name}
                        </h2>

                        <div style={{
                            fontSize: '6rem', margin: '20px auto',
                            width: '120px', height: '120px',
                            background: selectedTitle.isUnlocked ? '#f1c40f' : '#95a5a6',
                            borderRadius: '50%',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            overflow: 'hidden',
                            position: 'relative' // For absolute centering of '?'
                        }}>
                            <img src={selectedTitle.sprite} alt="Sprite" style={{
                                width: '100%', height: '100%', objectFit: 'contain',
                                filter: selectedTitle.isUnlocked ? 'none' : 'blur(8px) grayscale(100%) opacity(0.6)',
                                transition: 'filter 0.3s'
                            }} />
                            {!selectedTitle.isUnlocked && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: '5rem', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    zIndex: 10
                                }}>
                                    ?
                                </div>
                            )}
                        </div>

                        <p style={{ color: '#7f8c8d', lineHeight: '1.5' }}>
                            {selectedTitle.desc}
                        </p>

                        {!selectedTitle.isUnlocked && (
                            <div style={{
                                marginTop: '15px', padding: '8px 15px',
                                background: '#e74c3c', color: 'white', fontWeight: 'bold', borderRadius: '20px',
                                display: 'inline-block', fontSize: '0.9rem'
                            }}>
                                🔒 {t.profile_locked}
                            </div>
                        )}
                        {selectedTitle.isUnlocked && (
                            <div style={{
                                marginTop: '15px', padding: '8px 15px',
                                background: '#2ecc71', color: 'white', fontWeight: 'bold', borderRadius: '20px',
                                display: 'inline-block', fontSize: '0.9rem'
                            }}>
                                ✅ {t.profile_unlocked}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                currentLanguage={currentLanguage}
            />
            <SyncTutorialModal
                isOpen={isTutorialOpen}
                onClose={() => setIsTutorialOpen(false)}
                language={currentLanguage}
            />
        </div>
    );
};

export default PlayerProfileModal;
