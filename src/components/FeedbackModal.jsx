import { useState } from 'react';
import { TEXT } from '../utils/i18n';

const FeedbackModal = ({ isOpen, onClose, currentLanguage = 'zh-TW' }) => {
    if (!isOpen) return null;

    const t = TEXT[currentLanguage] || TEXT['zh-TW'];
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrZsg79FydTH3otRORgIRsFYWi_ZM2SGDU41gJv3-BXPlfzCZzDogBL-Q3pc2fyHa9ZA/exec";

    const [formData, setFormData] = useState({
        email: '',
        issues: [],
        otherIssue: '',
        system: '',
        improvements: '',
        reply: 'no', // 'no' or 'yes'
        name: ''
    });

    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleIssueChange = (value) => {
        setFormData(prev => {
            const newIssues = prev.issues.includes(value)
                ? prev.issues.filter(i => i !== value)
                : [...prev.issues, value];
            return { ...prev, issues: newIssues };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            alert(t.fb_email);
            return;
        }

        setStatus('sending');

        // Compile data for Google Sheets
        const payload = {
            email: formData.email,
            issueType: [
                ...formData.issues.map(i => {
                    if (i === 'opt4') return `${t.fb_q1_opt4}: ${formData.otherIssue}`;
                    return t[`fb_q1_${i}`];
                })
            ].join(', '),
            system: formData.system ? t[`fb_q2_${formData.system}`] : 'Not Specified',
            improvements: formData.improvements,
            reply: formData.reply === 'yes' ? `Yes, Name: ${formData.name}` : 'No'
        };

        try {
            // Using no-cors mode for Google Apps Script Web App
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            // Since no-cors doesn't give us the response body, we assume success if no network error
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({
                    email: '',
                    issues: [],
                    otherIssue: '',
                    system: '',
                    improvements: '',
                    reply: 'no',
                    name: ''
                });
            }, 2000);

        } catch (error) {
            console.error("Feedback error:", error);
            setStatus('error');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.7)', zIndex: 2000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: 'white', padding: '25px', borderRadius: '20px',
                width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>{t.fb_title}</h2>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#2ecc71', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {t.fb_success}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                        {/* 1. Email */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#34495e' }}>
                                1. {t.fb_email} <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                required
                            />
                        </div>

                        {/* 2. Issue */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#34495e' }}>
                                2. {t.fb_q1}
                            </label>
                            {['opt1', 'opt2', 'opt3'].map(key => (
                                <div key={key} style={{ marginBottom: '5px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.issues.includes(key)}
                                            onChange={() => handleIssueChange(key)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        {t[`fb_q1_${key}`]}
                                    </label>
                                </div>
                            ))}
                            <div style={{ marginBottom: '5px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.issues.includes('opt4')}
                                        onChange={() => handleIssueChange('opt4')}
                                        style={{ marginRight: '8px' }}
                                    />
                                    {t.fb_q1_opt4}
                                </label>
                                {formData.issues.includes('opt4') && (
                                    <textarea
                                        value={formData.otherIssue}
                                        onChange={e => setFormData({ ...formData, otherIssue: e.target.value })}
                                        placeholder={t.fb_placeholder_desc}
                                        style={{ width: '100%', marginTop: '5px', padding: '8px', borderRadius: '5px', border: '1px solid #ddd', minHeight: '60px', boxSizing: 'border-box' }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* 3. System */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#34495e' }}>
                                3. {t.fb_q2}
                            </label>
                            <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="system"
                                    value="opt1"
                                    checked={formData.system === 'opt1'}
                                    onChange={e => setFormData({ ...formData, system: e.target.value })}
                                    style={{ marginRight: '5px' }}
                                />
                                {t.fb_q2_opt1}
                            </label>
                            <label style={{ cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="system"
                                    value="opt2"
                                    checked={formData.system === 'opt2'}
                                    onChange={e => setFormData({ ...formData, system: e.target.value })}
                                    style={{ marginRight: '5px' }}
                                />
                                {t.fb_q2_opt2}
                            </label>
                        </div>

                        {/* 4. Improvements */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#34495e' }}>
                                4. {t.fb_q3}
                            </label>
                            <textarea
                                value={formData.improvements}
                                onChange={e => setFormData({ ...formData, improvements: e.target.value })}
                                placeholder={t.fb_placeholder_desc}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* 5. Reply */}
                        <div>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#34495e' }}>
                                5. {t.fb_q4}
                            </label>
                            <div style={{ marginBottom: '5px' }}>
                                <label style={{ cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="reply"
                                        value="no"
                                        checked={formData.reply === 'no'}
                                        onChange={e => setFormData({ ...formData, reply: e.target.value })}
                                        style={{ marginRight: '5px' }}
                                    />
                                    {t.fb_q4_no}
                                </label>
                            </div>
                            <div>
                                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <input
                                        type="radio"
                                        name="reply"
                                        value="yes"
                                        checked={formData.reply === 'yes'}
                                        onChange={e => setFormData({ ...formData, reply: e.target.value })}
                                        style={{ marginRight: '5px' }}
                                    />
                                    {t.fb_q4_other}
                                </label>
                                {formData.reply === 'yes' && (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder={t.fb_placeholder_name}
                                        style={{ marginLeft: '25px', marginTop: '5px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd', width: '200px' }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={status === 'sending'}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '50px', border: 'none',
                                    background: '#ecf0f1', color: '#7f8c8d', fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                {t.fb_cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '50px', border: 'none',
                                    background: status === 'sending' ? '#95a5a6' : '#5D9CEC',
                                    color: 'white', fontWeight: 'bold', cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                {status === 'sending' ? t.fb_sending : t.fb_submit}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
