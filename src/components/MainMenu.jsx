import '../App.css';
import { TEXT } from '../utils/i18n';

const MainMenu = ({ onStart, onSettings, onRewards, onReset, language = 'zh-TW', version }) => {
  const t = TEXT[language] || TEXT['zh-TW'];

  return (
    <div className="screen-container menu-bg">
      {/* Title Area */}
      <h1 className="game-title">Learning<br />Adventure</h1>

      {/* Character Circle */}
      <div className="character-circle">
        <img src="assets/app_icon_transparent.png" alt="Hero" className="hero-avatar" />
      </div>

      {/* Button Stack */}
      <div className="menu-buttons">
        <button className="btn-primary" onClick={onStart}>
          {t.menu_play}
        </button>
        <button className="btn-secondary" onClick={onRewards}>
          {t.menu_rewards}
        </button>
        <button className="btn-success" onClick={onSettings}>
          {t.menu_settings}
        </button>
        <button className="btn-danger" onClick={onReset} style={{ marginTop: '10px', fontSize: '0.9rem', padding: '8px 20px' }}>
          {t.menu_reset}
        </button>
      </div>

      <style jsx>{`
        .menu-bg {
          /* Specific background for menu if needed, creating cloud shapes with CSS is advanced, 
             so we will use the global sky blue for now */
        }
        
        .game-title {
          font-size: 3rem;
          color: white;
          text-shadow: 0 4px 0 rgba(0,0,0,0.1);
          text-align: center;
          margin-top: 40px;
          line-height: 1.1;
        }

        .character-circle {
          width: 180px;
          height: 180px;
          background: white;
          border-radius: 50%;
          border: 8px solid rgba(255,255,255,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 30px 0;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .hero-avatar {
          width: 80%;
          height: auto;
        }

        .menu-buttons {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-top: auto; /* Push to bottom slightly */
          margin-bottom: 30px;
        }

          margin-bottom: 30px;
        }

        .version-tag {
          position: absolute;
          bottom: 10px;
          width: 100%;
          text-align: center;
          color: rgba(0,0,0,0.4); 
          font-size: 0.9rem;
          font-weight: bold;
          font-family: sans-serif;
          pointer-events: none;
        }

        .btn-danger {
          background: #e74c3c;
          border: none;
          border-radius: 25px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.1s, background 0.2s;
        }
        .btn-danger:active {
          transform: scale(0.95);
          background: #c0392b;
        }
      `}</style>
      <div className="version-tag">v{version}</div>
    </div>
  );
};

export default MainMenu;
