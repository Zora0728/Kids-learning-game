import { useState, useEffect } from 'react';
import '../App.css';
import { useTranslation } from 'react-i18next';

const CharacterUnlockOverlay = ({ level, onContinue, onChallenge }) => {
    const { t } = useTranslation();

    // Milestone Data
    const milestones = {
        10: {
            title: t('ms_5_title'),
            role: t('title_adventurer'),
            desc: t('ms_5_desc'),
            sprite: "/assets/sprites/title_rank_2.png",
            color: "#4ECDC4",
            reward: t('ms_5_reward')
        },
        25: {
            title: t('ms_10_title'),
            role: t('title_knight'),
            desc: t('ms_10_desc'),
            sprite: "/assets/sprites/title_rank_3.png",
            color: "#A29BFE",
            reward: t('ms_10_reward')
        },
        40: {
            title: t('ms_15_title'),
            role: t('title_wizard'),
            desc: t('ms_15_desc'),
            sprite: "/assets/sprites/title_rank_4.png",
            color: "#FF6B6B",
            reward: t('ms_15_reward')
        },
        55: {
            title: t('ms_20_title'),
            role: t('title_dragon_hero'),
            desc: t('ms_20_desc'),
            sprite: "/assets/sprites/title_rank_5.png",
            color: "#FF4757",
            reward: t('ms_20_reward')
        },
        // Special Levels (Triggered by unlocking L8, L15, L22)
        'S1': {
            title: t('ms_S1_title'),
            role: t('ls1_title'),
            desc: t('ms_S1_desc'),
            sprite: "/assets/game_Hidden levels.png",
            color: "#E056FD",
            reward: t('ms_S1_reward')
        },
        'S2': {
            title: t('ms_S2_title'),
            role: t('ls2_title'),
            desc: t('ms_S2_desc'),
            sprite: "/assets/game_Hidden levels.png",
            color: "#FF4081",
            reward: t('ms_S2_reward')
        },
        'S3': {
            title: t('ms_S3_title'),
            role: "Challenge III",
            desc: t('ms_S3_desc'),
            sprite: "/assets/game_Hidden levels.png",
            color: "#2979FF",
            reward: t('ms_S3_reward')
        },
        't_perfect': {
            title: t('ms_perfect_title'),
            role: t('title_perfect_warrior'),
            desc: t('ms_perfect_desc'),
            sprite: "/assets/sprites/title_rank_6.png",
            color: "#FFD700",
            reward: t('ms_perfect_reward')
        },
        't_god': {
            title: t('ms_god_title'),
            role: t('title_god_domain'),
            desc: t('ms_god_desc'),
            sprite: "/assets/sprites/title_rank_7.png",
            color: "#6200EA",
            reward: t('ms_god_reward')
        }
    };

    const data = milestones[level];

    if (!data) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 2000,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            margin: 0, padding: 0,
            animation: 'fadeIn 0.5s'
        }}>
            {/* Simple Glow Background */}
            <div className="rays" style={{
                position: 'absolute', width: '600px', height: '600px',
                background: `radial-gradient(circle, ${data.color}44 0%, transparent 70%)`,
                borderRadius: '50%', zIndex: -1,
                animation: 'pulse 3s infinite'
            }}></div>

            <div className="unlock-card" style={{
                background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center',
                boxShadow: '0 0 50px rgba(255,255,255,0.5)',
                width: '90%', maxWidth: '360px',
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transformOrigin: 'center center',
                border: `5px solid ${data.color}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <h3 style={{ color: '#888', margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('ms_level_up')}</h3>
                <h1 style={{ color: data.color, margin: '5px 0 15px 0', fontSize: '2rem', textShadow: '2px 2px 0px #eee', lineHeight: 1.2 }}>{data.title}</h1>

                <div style={{
                    margin: '10px 0',
                    animation: 'float 3s ease-in-out infinite',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    height: '160px', width: '160px'
                }}>
                    {data.sprite ? (
                        <img src={data.sprite} alt="Role" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' }} />
                    ) : (
                        <div style={{ fontSize: '5rem', filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' }}>{data.icon}</div>
                    )}
                </div>

                <div style={{ background: '#f9f9f9', padding: '10px 20px', borderRadius: '15px', marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#333' }}>{t('ms_get_title')}</h2>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: data.color }}>{data.role}</div>
                </div>

                <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5', fontSize: '0.95rem' }}>
                    {data.desc}
                </p>

                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                    {onChallenge && (typeof level === 'string' && level.startsWith('S')) && (
                        <button
                            onClick={onChallenge}
                            style={{
                                background: '#FF4757', border: 'none', padding: '12px 25px',
                                fontSize: '1.1rem', borderRadius: '50px',
                                boxShadow: `0 5px 15px rgba(255, 71, 87, 0.4)`,
                                cursor: 'pointer', color: 'white', fontWeight: 'bold', flex: 1, minWidth: '120px'
                            }}
                        >
                            {t('ms_btn_challenge')}
                        </button>
                    )}

                    <button
                        onClick={onContinue}
                        style={{
                            background: data.color, border: 'none', padding: '12px 30px',
                            fontSize: '1.1rem', borderRadius: '50px',
                            boxShadow: `0 5px 15px ${data.color}66`,
                            animation: !onChallenge ? 'pulse 2s infinite' : 'none',
                            cursor: 'pointer', color: 'white', fontWeight: 'bold', flex: 1, minWidth: '120px'
                        }}
                    >
                        {t('ms_btn_continue')}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                @media (max-width: 480px) {
                    .unlock-card {
                        padding: 20px !important;
                        width: 85% !important;
                    }
                    h1 { font-size: 1.8rem !important; }
                }
            `}</style>
        </div>
    );
};

export default CharacterUnlockOverlay;
