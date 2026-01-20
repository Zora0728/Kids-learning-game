import { useState } from 'react';
import { TEXT } from '../utils/i18n';

const SyncTutorialModal = ({ isOpen, onClose, language = 'zh-TW' }) => {
    const [page, setPage] = useState(1);
    const totalPages = 3;
    const t = TEXT[language] || TEXT['zh-TW'];

    if (!isOpen) return null;

    const renderPage = () => {
        switch (page) {
            case 1:
                return (
                    <div className="tutorial-page">
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📱 ➔ ☁️</div>
                        <h3>{language === 'zh-TW' ? '第一步：在舊裝置產生代碼' : 'Step 1: Generate ID on Old Device'}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>
                            {language === 'zh-TW'
                                ? '在您的舊手機或電腦點擊「啟動雲端同步」，系統會給您一組像是 ABCD-A1B2 的「同步碼」。'
                                : 'Click "Enable Cloud Sync" on your old device to get a "Sync ID" like ABCD-A1B2.'}
                        </p>
                    </div>
                );
            case 2:
                return (
                    <div className="tutorial-page">
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>☁️ ➔ 📲</div>
                        <h3>{language === 'zh-TW' ? '第二步：在新裝置輸入代碼' : 'Step 2: Enter ID on New Device'}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>
                            {language === 'zh-TW'
                                ? '打開新裝置，在同步欄位輸入剛才的代碼並按「同步」，您的星星和成就就會飛過來囉！'
                                : 'Open your new device, enter the ID in the sync field and click "Sync". Your stars and achievements will fly over!'}
                        </p>
                    </div>
                );
            case 3:
                return (
                    <div className="tutorial-page">
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔄 ✨</div>
                        <h3>{language === 'zh-TW' ? '自動同步：無縫遊玩' : 'Auto-Sync: Play Seamlessly'}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>
                            {language === 'zh-TW'
                                ? '一旦綁定代碼，遊戲每次開啟都會自動更新進度。再也不怕換手機或不小心清除網頁紀錄了！'
                                : 'Once linked, the game will auto-update every time it opens. Never fear changing phones or clearing browser history again!'}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={onClose}>
            <div className="modal-content" style={{
                background: 'white', padding: '30px', borderRadius: '30px',
                width: '85%', maxWidth: '350px', textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }} onClick={e => e.stopPropagation()}>

                {renderPage()}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                    {[1, 2, 3].map(p => (
                        <div key={p} style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: page === p ? '#3498db' : '#ddd',
                            transition: 'background 0.3s'
                        }} />
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {page > 1 && (
                        <button className="btn-secondary" onClick={() => setPage(page - 1)} style={{ flex: 1 }}>
                            {language === 'zh-TW' ? '上一步' : 'Back'}
                        </button>
                    )}
                    <button className="btn-primary" onClick={() => {
                        if (page < totalPages) setPage(page + 1);
                        else onClose();
                    }} style={{ flex: 2 }}>
                        {page < totalPages ? (language === 'zh-TW' ? '下一步' : 'Next') : (language === 'zh-TW' ? '我明白了！' : 'Got it!')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyncTutorialModal;
