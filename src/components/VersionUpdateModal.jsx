import { TEXT } from '../utils/i18n';

const VersionUpdateModal = ({
    currentLanguage = 'zh-TW',
    APP_VERSION,
    remoteVersion,
    remoteHash,
    downloadUrl,
    isNative = false
}) => {
    const t = TEXT[currentLanguage] || TEXT['zh-TW'];

    // This modal shows if:
    // 1. Remote Version is newer than Local APP_VERSION
    const isNewUpdateAvailable = remoteVersion && remoteVersion !== APP_VERSION;

    if (!isNewUpdateAvailable) return null;

    const handleUpdateAction = () => {
        if (isNative) {
            if (downloadUrl) window.open(downloadUrl, '_blank');
        } else {
            // Web App: Just reload to get the newest code
            window.location.reload();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '25px',
                width: '85%', maxWidth: '350px', textAlign: 'center',
                boxShadow: '0 0 40px rgba(0,255,255,0.3)',
                animation: 'bounceIn 0.5s'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🚀</div>
                <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
                    {currentLanguage === 'zh-TW' ? "發現新版本！" : "New Version Available!"}
                </h2>
                <div style={{ color: '#7f8c8d', marginBottom: '20px', lineHeight: '1.5' }}>
                    <p style={{ margin: '0 0 10px 0' }}>
                        {currentLanguage === 'zh-TW'
                            ? `最新版本 ${remoteVersion} 已發布（您目前為 ${APP_VERSION}）。${isNative ? '請下載最新版本以獲得完整功能。' : '請重新整理頁面以更新。'}`
                            : `Version ${remoteVersion} is ready (Current: ${APP_VERSION}). ${isNative ? 'Please download the latest version.' : 'Please refresh the page to update.'}`}
                    </p>

                    {isNative && remoteHash && (
                        <div style={{
                            fontSize: '0.7rem', background: '#f8f9fa', padding: '8px',
                            borderRadius: '10px', wordBreak: 'break-all', color: '#95a5a6',
                            border: '1px dashed #dcdde1', marginBottom: '10px'
                        }}>
                            SHA-256 Hash:<br />{remoteHash}
                        </div>
                    )}

                    <span style={{ fontSize: '0.8rem', color: '#999' }}>
                        {isNative
                            ? (currentLanguage === 'zh-TW' ? "(建議使用瀏覽器開啟下載)" : "(Recommend opening in browser to download)")
                            : (currentLanguage === 'zh-TW' ? "(您的遊戲紀錄將會保留)" : "(Your progress will be saved)")}
                    </span>
                </div>

                <button
                    onClick={handleUpdateAction}
                    className="btn-3d-blue"
                    style={{
                        background: '#3498db', color: 'white', border: 'none',
                        padding: '12px 30px', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold',
                        cursor: 'pointer', boxShadow: '0 4px 0 #2980b9', width: '100%'
                    }}
                >
                    {isNative
                        ? (currentLanguage === 'zh-TW' ? "前往下載新版本" : "Download New Version")
                        : (currentLanguage === 'zh-TW' ? "立即更新" : "Update Now")}
                </button>
            </div>
            <style>{`
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default VersionUpdateModal;
