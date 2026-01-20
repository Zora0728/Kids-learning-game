import { useTranslation } from 'react-i18next';
import '../App.css';

const ResetConfirmationModal = ({ onConfirm, onCancel }) => {
    const { t } = useTranslation();

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', zIndex: 3000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            animation: 'fadeIn 0.3s'
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '25px', textAlign: 'center',
                boxShadow: '0 0 40px rgba(0,0,0,0.5)', maxWidth: '350px', width: '90%',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                border: '5px solid #e74c3c'
            }}>
                {/* Crying Bunny Image */}
                <div style={{
                    width: '180px', height: '180px', margin: '10px 0',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    <img
                        src="assets/sprites/crying_bunny.png"
                        alt="Sad Bunny"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>

                <h2 style={{ color: '#e74c3c', margin: '10px 0', fontSize: '1.5rem' }}>
                    {t('menu_reset')}?
                </h2>

                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '1rem', marginBottom: '25px' }}>
                    {t('profile_reset_confirm')}
                </p>

                <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{ flex: 1, padding: '12px', fontSize: '1rem' }}
                    >
                        {t('settings_off')} {/* Cancel/Close - reusing "Off" or could add specific Cancel key. "關" is okay or "取消" */}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-danger"
                        style={{
                            flex: 1, padding: '12px', fontSize: '1rem',
                            background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50px',
                            fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 15px rgba(231, 76, 60, 0.4)'
                        }}
                    >
                        {t('profile_reset')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetConfirmationModal;
