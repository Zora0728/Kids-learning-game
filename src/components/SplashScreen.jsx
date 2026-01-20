import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
    const [fadingOut, setFadingOut] = useState(false);

    useEffect(() => {
        // Start fading out after 2 seconds
        const timer = setTimeout(() => {
            setFadingOut(true);
        }, 2000);

        // Tell parent we are done after fade out animation (0.5s)
        const finishTimer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div className={`splash-screen ${fadingOut ? 'fade-out' : ''}`} style={{ backgroundColor: '#1e1e2e' }}>
            <div className="logo-container">
                <img src="assets/zora_city_logo02.png" alt="Zora City Logo" className="splash-logo" />
                <h1 className="splash-title">Level Up!</h1>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
