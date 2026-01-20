import { useState, useEffect } from 'react';
import './App.css';
import { getLevelConfig } from './data/levels';
import SplashScreen from './components/SplashScreen';
import MainMenu from './components/MainMenu';
import LevelMap from './components/LevelMap';
import GameScene from './components/GameScene';
import CharacterUnlockOverlay from './components/CharacterUnlockOverlay';
import ResetConfirmationModal from './components/ResetConfirmationModal';
import PlayerProfileModal from './components/PlayerProfileModal';
import { playSfx, SFX, playBgm, resumeBgm } from './utils/sfx';
import { TEXT } from './utils/i18n';
import i18n from './utils/i18n';
import VersionUpdateModal from './components/VersionUpdateModal';
import { Capacitor } from '@capacitor/core';

const APP_VERSION = '1.2.9'; // Update this when releasing new versions
const DOWNLOAD_URL = 'https://drive.google.com/file/d/1kbZNX10NL_x6IiG2qMLIfIodK_WpTWFU/view?usp=drive_link';
const REMOTE_VERSION_URL = 'https://script.google.com/macros/s/AKfycbyrZsg79FydTH3otRORgIRsFYWi_ZM2SGDU41gJv3-BXPlfzCZzDogBL-Q3pc2fyHa9ZA/exec'; // 填入您的 GAS 部署網址

// --- Security Helpers ---
const SECURITY_SALT = 'zora_city_secret_2025'; // A secret key to prevent casual tampering

// Simple hash function for checksum
const getChecksum = (data) => {
  const str = JSON.stringify(data) + SECURITY_SALT;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

function App() {
  const [scene, setScene] = useState('splash'); // splash, menu, map, game
  const [level, setLevel] = useState(1);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Global Profile/Settings State
  const [profileMode, setProfileMode] = useState('full'); // 'full', 'settings', 'rewards_only'

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [remoteVersionData, setRemoteVersionData] = useState(null); // { version, hash }

  const [syncId, setSyncId] = useState(() => {
    return localStorage.getItem('game_sync_id') || '';
  });

  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [levelProgress, setLevelProgress] = useState(() => {
    const saved = localStorage.getItem('game_level_progress');
    const checksum = localStorage.getItem('game_level_progress_checksum');
    try {
      if (!saved) return {};
      const data = JSON.parse(saved);
      if (checksum !== getChecksum(data)) {
        console.warn("Integrity check failed for level progress.");
      }
      return data;
    } catch (e) {
      console.warn("Failed to parse level progress, resetting.", e);
      return {};
    }
  });

  const [unlockedMilestones, setUnlockedMilestones] = useState(() => {
    const saved = localStorage.getItem('game_unlocked_milestones');
    const checksum = localStorage.getItem('game_unlocked_milestones_checksum');
    try {
      if (!saved) return [];
      const data = JSON.parse(saved);
      if (checksum !== getChecksum(data)) {
        console.warn("Integrity check failed for milestones.");
      }
      return data;
    } catch (e) {
      console.warn("Failed to parse milestones, resetting.", e);
      return [];
    }
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('game_language') || 'zh-TW';
  });

  const [unlockLevel, setUnlockLevel] = useState(null);
  const [lastPlayedLevel, setLastPlayedLevel] = useState(null);

  // --- Helper Functions ---

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('game_language', newLang);
    i18n.changeLanguage(newLang);
  };

  const saveToCloud = async (currentProgress, currentMilestones) => {
    if (!syncId || !REMOTE_VERSION_URL) return;
    try {
      await fetch(REMOTE_VERSION_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'save_progress',
          syncId: syncId,
          levelProgress: currentProgress || levelProgress,
          unlockedMilestones: currentMilestones || unlockedMilestones,
          checksum: getChecksum(currentProgress || levelProgress)
        })
      });
      setLastSyncTime(new Date());
      console.log("Cloud sync: Progress saved.");
    } catch (e) {
      console.warn("Cloud sync failed:", e);
    }
  };

  const loadFromCloud = async (inputSyncId) => {
    if (!inputSyncId || !REMOTE_VERSION_URL) return;
    try {
      const response = await fetch(`${REMOTE_VERSION_URL}?action=load_progress&syncId=${inputSyncId}`);
      const data = await response.json();
      if (data.status === 'success') {
        const cloudProgress = JSON.parse(data.progress);
        const cloudMilestones = JSON.parse(data.milestones);
        if (data.checksum === getChecksum(cloudProgress)) {
          setLevelProgress(cloudProgress);
          setUnlockedMilestones(cloudMilestones);
          setSyncId(inputSyncId);
          localStorage.setItem('game_sync_id', inputSyncId);
          return { success: true };
        } else {
          return { success: false, error: 'Integrity Failed' };
        }
      } else {
        return { success: false, error: data.message };
      }
    } catch (e) {
      return { success: false, error: 'Connection Error' };
    }
  };

  const generateNewSyncId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'ZORA-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSyncId(result);
    localStorage.setItem('game_sync_id', result);
    return result;
  };

  // --- Effects ---

  // Save local progress whenever it changes
  useEffect(() => {
    localStorage.setItem('game_level_progress', JSON.stringify(levelProgress));
    localStorage.setItem('game_level_progress_checksum', getChecksum(levelProgress));
  }, [levelProgress]);

  useEffect(() => {
    localStorage.setItem('game_unlocked_milestones', JSON.stringify(unlockedMilestones));
    localStorage.setItem('game_unlocked_milestones_checksum', getChecksum(unlockedMilestones));
  }, [unlockedMilestones]);

  // Auto-Sync to Cloud
  useEffect(() => {
    if (syncId && scene !== 'splash') {
      const timer = setTimeout(() => saveToCloud(), 2000);
      return () => clearTimeout(timer);
    }
  }, [levelProgress, unlockedMilestones, syncId, scene]);

  useEffect(() => {
    const totalStars = Object.values(levelProgress).reduce((a, b) => a + b, 0);
    const maxLevel = Object.keys(levelProgress).length > 0 ? Math.max(...Object.keys(levelProgress).map(Number).filter(n => !isNaN(n))) + 1 : 1;
    if (scene === 'splash') return;
    const isMet = (m) => {
      if (typeof m === 'number') return totalStars >= m;
      if (m === 't_perfect') {
        const mainLevels = Array.from({ length: 28 }, (_, i) => i + 1);
        return mainLevels.every(lvl => levelProgress[lvl] === 3);
      }
      if (m === 't_god') return levelProgress[29] > 0;
      const map = { 'S1': 8, 'S2': 15, 'S3': 22 };
      return maxLevel >= map[m];
    };
    const allCandidates = ['S1', 10, 'S2', 25, 'S3', 40, 55, 't_perfect', 't_god'];
    let found = null;
    for (const m of allCandidates) {
      if (!unlockedMilestones.includes(m) && isMet(m)) {
        found = m;
        break;
      }
    }
    if (found && unlockLevel !== found) {
      if (['S1', 'S2', 'S3', 29, 't_god'].includes(found)) {
        playSfx(SFX.SP_UNLOCK);
      } else {
        playSfx(SFX.EARN_TITLE);
      }
      setUnlockLevel(found);
    }
  }, [levelProgress, unlockedMilestones, unlockLevel, scene]);

  useEffect(() => {
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      localStorage.setItem('app_version', APP_VERSION);
    }
    if (REMOTE_VERSION_URL) {
      fetch(REMOTE_VERSION_URL)
        .then(res => res.json())
        .then(data => {
          if (data && data.version) {
            setRemoteVersionData({
              version: data.version,
              hash: data.hash || null
            });
          }
        })
        .catch(err => console.warn("Remote version check failed:", err));
    }
  }, []);

  useEffect(() => {
    playBgm();
    const handleInteraction = () => {
      resumeBgm();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);



  // --- Logic for Game Scene ---
  useEffect(() => {
    if (scene === 'game') {
      const config = getLevelConfig(level);
      setCurrentConfig(config);
    }
  }, [level, scene]);

  const handleBackToMenu = () => {
    setScene('menu');
  };

  const handleBackToMap = () => {
    setLastPlayedLevel(level);
    setScene('map');
  };

  const handleLevelComplete = (earnedStars) => {
    setLevelProgress(prev => {
      const currentBest = prev[level] || 0;
      if (earnedStars > currentBest) {
        return { ...prev, [level]: earnedStars };
      }
      return prev;
    });
  };

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
  };

  const handleUnlockContinue = () => {
    // Mark as seen when closing
    if (unlockLevel) {
      setUnlockedMilestones(prev => [...prev, unlockLevel]);
    }
    setUnlockLevel(null);
  };

  const handleUnlockAll = () => {
    const allLevels = {};
    for (let i = 1; i <= 30; i++) {
      allLevels[i] = 3; // Give 3 stars to all
    }
    setLevelProgress(allLevels);
    // Mark earlier milestones as seen, but leave the highest Title (20) and SP (S3) 
    // to provide user feedback without spamming 7 popups.
  };

  const executeReset = () => {
    try {
      // 1. Clear Progress
      setLevelProgress({});
      localStorage.removeItem('game_level_progress'); // Explicit remove

      // 2. Clear Milestones & Notifications
      setUnlockedMilestones([]);
      localStorage.removeItem('game_unlocked_milestones'); // Explicit remove
      setUnlockLevel(null);

      try {
        sessionStorage.clear(); // Clear 'new level' notifications
      } catch (e) {
        console.warn("Session storage clear failed", e);
      }

      // 3. Reset State & Scene
      setLevel(1);
      setShowResetConfirm(false); // Close modal

      // Hard Reset: Force reload to ensure clean state
      window.location.reload();

    } catch (error) {
      console.error("Reset functionality error:", error);
      alert("重置過程發生錯誤，請重新整理網頁。");
    }
  };

  // --- Scene Rendering ---
  if (scene === 'splash') {
    return <SplashScreen onFinish={() => setScene('menu')} />;
  }

  return (
    <>


      {unlockLevel && (
        <CharacterUnlockOverlay
          level={unlockLevel}
          onContinue={handleUnlockContinue}
          onChallenge={() => {
            if (unlockLevel) {
              // Unlock logic first
              setUnlockedMilestones(prev => [...prev, unlockLevel]);
              // Set Level and Go to Game
              setLevel(unlockLevel);
              setScene('game');
              setUnlockLevel(null);
              playSfx(SFX.CLICK);
            }
          }}
        />
      )}

      <div className="app-container">
        {scene === 'game' ? (
          <GameScene
            config={currentConfig}
            level={level}
            onBack={handleBackToMap}
            onNextLevel={handleNextLevel}
            onLevelComplete={handleLevelComplete}
            language={language}
          />
        ) : scene === 'map' ? (
          <LevelMap
            progress={levelProgress}
            onSelectLevel={(lvl) => {
              setLevel(lvl);
              setScene('game');
            }}
            onBack={() => setScene('menu')}
            onUnlockAll={handleUnlockAll}
            onResetProgress={() => setShowResetConfirm(true)}
            initialFocusLevel={lastPlayedLevel}
            onOpenProfile={() => {
              setProfileMode('full');
              setIsProfileOpen(true);
            }}
            language={language}
          />
        ) : ( // Default to MainMenu if not splash, game, or map
          <MainMenu
            onStart={() => {
              const lastLevel = Object.keys(levelProgress).length > 0 ? Math.max(...Object.keys(levelProgress).map(Number)) : 1;
              setLevel(lastLevel);
              setScene('map');
            }}
            onSettings={() => {
              playSfx(SFX.OPEN_SETTINGS);
              setProfileMode('settings');
              setIsProfileOpen(true);
            }}
            onRewards={() => {
              playSfx(SFX.CLICK);
              setProfileMode('rewards_only');
              setIsProfileOpen(true);
            }}
            onReset={() => {
              playSfx(SFX.CLICK);
              setShowResetConfirm(true);
            }}
            language={language}
            version={APP_VERSION}
          />
        )}
      </div>

      {showResetConfirm && (
        <ResetConfirmationModal
          onConfirm={executeReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* Global Profile/Settings Modal */}
      <PlayerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        mode={profileMode}
        levelProgress={levelProgress}
        maxLevel={(() => {
          const validLevels = Object.keys(levelProgress).map(Number).filter(n => !isNaN(n));
          return validLevels.length > 0 ? Math.max(...validLevels) + 1 : 1;
        })()}
        totalStars={Object.values(levelProgress).reduce((a, b) => a + b, 0)}
        avatar={(() => {
          const stars = Object.values(levelProgress).reduce((a, b) => a + b, 0);
          if (levelProgress[29] > 0) return 'assets/sprites/title_rank_7.png'; // God
          const mainLevels = Array.from({ length: 28 }, (_, i) => i + 1);
          const isPerfect = mainLevels.every(lvl => levelProgress[lvl] === 3);
          if (isPerfect) return 'assets/sprites/title_rank_6.png'; // Perfect
          if (stars >= 55) return 'assets/sprites/title_rank_5.png'; // Dragon
          if (stars >= 40) return 'assets/sprites/title_rank_4.png'; // Wizard
          if (stars >= 25) return 'assets/sprites/title_rank_3.png'; // Knight
          if (stars >= 10) return 'assets/sprites/title_rank_2.png'; // Adventurer
          return 'assets/sprites/title_rank_1.png'; // Apprentice (Default)
        })()}
        currentTitle={(() => {
          const t = TEXT[language] || TEXT['zh-TW'];
          const stars = Object.values(levelProgress).reduce((a, b) => a + b, 0);
          if (levelProgress[29] > 0) return t.title_god_domain;
          const mainLevels = Array.from({ length: 28 }, (_, i) => i + 1);
          const isPerfect = mainLevels.every(lvl => levelProgress[lvl] === 3);
          if (isPerfect) return t.title_perfect_warrior;
          if (stars >= 55) return t.title_dragon_hero;
          if (stars >= 40) return t.title_wizard;
          if (stars >= 25) return t.title_knight;
          if (stars >= 10) return t.title_adventurer;
          return t.title_apprentice;
        })()}
        lastLevel={level}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        syncId={syncId}
        onGenerateSyncId={generateNewSyncId}
        onLoadFromCloud={loadFromCloud}
        lastSyncTime={lastSyncTime}
      />

      {/* Version Update Modal */}
      <VersionUpdateModal
        currentLanguage={language}
        APP_VERSION={APP_VERSION}
        remoteVersion={remoteVersionData?.version}
        remoteHash={remoteVersionData?.hash}
        downloadUrl={DOWNLOAD_URL}
        isNative={Capacitor.isNativePlatform()}
      />
    </>
  );
}

export default App;
