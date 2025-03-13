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
    const [message, setMessage] = useState(null);
    const [globalModalBag, setGlobalModalBag] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const contentArea = useRef(null);
    const [isOnboardingVisible, setIsOnboardingVisible] = useState(
        auth.getUser()?.isFirstLogin && !get('isOnboardingTourShown')
    );

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

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

    if (!isLoggedIn) return null;

    return (
        <AuthContext.Provider value={{
            ...auth,
            logout: () => {
                setIsLoggedIn(false);
                auth.logout();
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