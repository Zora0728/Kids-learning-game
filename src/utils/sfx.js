import howler from 'howler';
const { Howl, Howler } = howler;

// Sound Effects Map
export const SFX = {
    CELEBRATION: 'assets/audio/sfx/celebration.mp3', // Win Level
    EARN_TITLE: 'assets/audio/sfx/star_ping.mp3',  // Unlock Title
    LEVEL_UP: 'assets/audio/sfx/upgrade.mp3',      // Level Up? Or Star Increase
    SP_UNLOCK: 'assets/audio/sfx/victory.wav',     // Unlock SP/BOSS (Big Victory)
    DRAG: 'assets/audio/sfx/drag.mp3',      // Dragging
    OPEN_SETTINGS: 'assets/audio/sfx/open_set.mp3', // Open Profile/Settings
    INSTRUCTION: 'assets/audio/sfx/notification.mp3',  // Modal Open
    CLICK: 'assets/audio/sfx/click.mp3',          // Generic Click
    ERROR: 'assets/audio/sfx/error.mp3'      // Error / Wrong
};

// Global BGM Instance
let currentBgm = null;
let currentBgmPath = null;

// Helper to initialize BGM
export const playBgm = (path = 'assets/audio/music/background_music.mp3', volume = 0.3) => {
    try {
        const enabled = localStorage.getItem('game_bgm_enabled');
        if (enabled === 'false') {
            if (currentBgm) {
                currentBgm.stop();
                currentBgm = null;
                currentBgmPath = null;
            }
            return;
        }

        // If already playing the same track, just ensure volume and playing
        if (currentBgm && currentBgmPath === path) {
            if (!currentBgm.playing()) {
                currentBgm.play();
            }
            currentBgm.volume(volume);
            return;
        }

        // Stop previous BGM
        if (currentBgm) {
            currentBgm.stop();
            currentBgm.unload(); // Free memory
        }

        // Create new BGM
        currentBgm = new Howl({
            src: [path],
            html5: false, // Small file (480KB), Web Audio is more reliable
            loop: true,
            volume: volume,
            preload: true,
            onplayerror: (id, error) => {
                console.warn("BGM Play Error, attempting unlock:", error);
                currentBgm.once('unlock', () => {
                    currentBgm.play();
                });
            }
        });

        currentBgmPath = path;
        currentBgm.play();

    } catch (e) {
        console.warn("BGM Start Error:", e);
    }
};

export const stopBgm = () => {
    if (currentBgm) {
        currentBgm.stop();
    }
};

export const pauseBgm = () => {
    if (currentBgm) {
        currentBgm.pause();
    }
};

export const resumeBgm = () => {
    const enabled = localStorage.getItem('game_bgm_enabled');
    if (enabled !== 'false' && currentBgm && !currentBgm.playing()) {
        currentBgm.play();
    }
};

// Helper for UI/Settings to toggle BGM
export const toggleBgm = (shouldPlay) => {
    if (shouldPlay) {
        playBgm();
    } else {
        pauseBgm(); // Pause isn't enough if we want to stop it completely, but pause is fine for muting
    }
};


// Play Helper for SFX
export const playSfx = (sfxPath) => {
    try {
        const enabled = localStorage.getItem('game_sfx_enabled');
        if (enabled === 'false') return;

        const sound = new Howl({
            src: [sfxPath],
            volume: 0.6,
            html5: false, // Force Web Audio API for SFX (accurate timing)
        });

        sound.play();
    } catch (e) {
        console.warn("SFX Error:", e);
    }
};

// Auto-unlock audio context on first user interaction (standard web audio requirement)
try {
    const unlockAudio = () => {
        if (Howler.ctx.state === 'suspended') {
            Howler.ctx.resume();
        }
        // Also ensure BGM is playing if it should be
        resumeBgm();

        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
} catch (e) {
    console.warn("Audio Unlock Setup Failed", e);
}
