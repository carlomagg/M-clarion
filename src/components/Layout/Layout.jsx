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
                setIsLoggedIn(isAuthenticated);
                if (!isAuthenticated) {
                    navigate('/login', { replace: true });
                    return;
                }

                // Check token expiration periodically
                const checkTokenExpiration = setInterval(() => {
                    const refreshTokenData = get('mc_refresh');
                    if (refreshTokenData && refreshTokenData.expiry) {
                        const currentTime = Math.floor(Date.now() / 1000);
                        if (currentTime > refreshTokenData.expiry) {
                            clearInterval(checkTokenExpiration);
                            // Show message and delay redirect
                            setMessage({ type: 'info', text: 'Your session has expired. You will be redirected to login.' });
                            setTimeout(() => {
                                auth.logout();
                                setIsLoggedIn(false);
                                navigate('/login', { replace: true, state: { sessionExpired: true } });
                            }, 3000); // 3 second delay
                        }
                    }
                }, 60000); // Check every minute

                return () => clearInterval(checkTokenExpiration);
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
                </GlobalModalContext.Provider>
            </MessageContext.Provider>
        </AuthContext.Provider>
    );
};

export default Layout;