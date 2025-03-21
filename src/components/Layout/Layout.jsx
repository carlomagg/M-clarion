import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import auth from '../../utils/auth';
import AuthContext from '../../contexts/auth-context';
import MessageContext from '../../contexts/message-context';
import { get } from 'lockr';

import Sidebar from '../partials/layout/Sidebar/Sidebar';
import Header from '../partials/layout/Header/Header';
import Footer from '../partials/layout/Footer/Footer';
import ProcessIndicator from '../partials/ProcessIndicator/ProcessIndicator';
import OnboardingModal from '../partials/onboarding/OnboardingModal';
import GlobalModalContext from '../../contexts/global-modal-context';

const Layout = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(auth.isLoggedIn());
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [globalModalBag, setGlobalModalBag] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const contentArea = useRef(null);
    const [isOnboardingVisible, setIsOnboardingVisible] = useState(
        auth.getUser()?.isFirstLogin && !get('isOnboardingTourShown')
    );

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isAuthenticated = auth.isLoggedIn();
                const refreshTokenData = get('mc_refresh');
                const currentTime = Math.floor(Date.now() / 1000);

                // Check if token is expired
                if (refreshTokenData && refreshTokenData.expiry && currentTime > refreshTokenData.expiry) {
                    auth.logout();
                    setIsLoggedIn(false);
                    navigate('/login', { replace: true, state: { sessionExpired: true } });
                    return;
                }

                setIsLoggedIn(isAuthenticated);
                if (!isAuthenticated) {
                    navigate('/login', { replace: true });
                    return;
                }

                // Check token expiration periodically
                const checkTokenExpiration = setInterval(() => {
                    const currentRefreshToken = get('mc_refresh');
                    if (currentRefreshToken && currentRefreshToken.expiry) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        if (currentTime > currentRefreshToken.expiry) {
                            clearInterval(checkTokenExpiration);
                            auth.logout();
                            setIsLoggedIn(false);
                            setMessage({ type: 'info', text: 'Your session has expired. You will be redirected to login.' });
                            navigate('/login', { replace: true, state: { sessionExpired: true } });
                        }
                    }
                }, 60000); // Check every minute

                // Add window focus event listener
                const handleWindowFocus = () => {
                    const refreshTokenData = get('mc_refresh');
                    const currentTime = Math.floor(Date.now() / 1000);
                    
                    if (refreshTokenData && refreshTokenData.expiry && currentTime > refreshTokenData.expiry) {
                        auth.logout();
                        setIsLoggedIn(false);
                        navigate('/login', { replace: true, state: { sessionExpired: true } });
                    }
                };

                window.addEventListener('focus', handleWindowFocus);

                return () => {
                    clearInterval(checkTokenExpiration);
                    window.removeEventListener('focus', handleWindowFocus);
                };
            } catch (error) {
                console.error('Auth check failed:', error);
                navigate('/login', { replace: true });
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    useEffect(() => {
        if (contentArea.current) {
            contentArea.current.scrollTop = 0;
        }
    }, [location.pathname]);

    const handleShowGlobalModal = (type) => {
        const presentLocation = location.pathname + location.search;
        navigate(`/${type}`);
        setGlobalModalBag({ prevLocation: presentLocation });
    };

    const handleHideGlobalModal = () => {
        const prevLocation = globalModalBag?.prevLocation || '';
        navigate(prevLocation);
        setGlobalModalBag(null);
    };

    // Add message display component
    const MessageDisplay = () => {
        useEffect(() => {
            if (message) {
                // Auto-dismiss message after 5 seconds
                const timer = setTimeout(() => {
                    setMessage(null);
                }, 5000);
                return () => clearTimeout(timer);
            }
        }, [message]);

        if (!message) return null;
        
        return (
            <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${
                message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                message.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
            }`}>
                <span>{message.text}</span>
                <button 
                    onClick={() => setMessage(null)}
                    className="ml-3 text-sm hover:bg-opacity-20 hover:bg-black rounded-full h-5 w-5 flex items-center justify-center"
                >
                    ×
                </button>
            </div>
        );
    };

    if (isLoading) {
        return <div className="h-full w-full flex items-center justify-center">
            <ProcessIndicator />
        </div>;
    }

    if (!isLoggedIn) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            ...auth,
            logout: () => {
                auth.logout();
                setIsLoggedIn(false);
                navigate('/login', { replace: true });
            }
        }}>
            <MessageContext.Provider value={{
                message,
                dispatchMessage: (type, text) => setMessage(type === null ? type : { type, text })
            }}>
                <GlobalModalContext.Provider value={{
                    showGlobalModal: handleShowGlobalModal,
                    hideGlobalModal: handleHideGlobalModal
                }}>
                    <div className="h-full w-full flex">
                        {message && <ProcessIndicator />}
                        {isOnboardingVisible && (
                            <OnboardingModal onRemoveModal={() => setIsOnboardingVisible(false)} />
                        )}
                        <div className="h-full overflow-clip min-w-72">
                            <Sidebar />
                        </div>
                        <div className="overflow-auto flex flex-col h-full w-full layout-content-area" ref={contentArea}>
                            <Header />
                            <div className="bg-[#F1F1F1] grow relative flex flex-col">
                                <main className="grow">
                                    <Outlet />
                                </main>
                                <Footer />
                            </div>
                        </div>
                    </div>
                    <MessageDisplay />
                </GlobalModalContext.Provider>
            </MessageContext.Provider>
        </AuthContext.Provider>
    );
};

export default Layout;