import { useContext, useEffect, useRef, useState } from "react";
import useUser from "../../../../../hooks/useUser";
import chevronDownIcon from "../../../../../assets/icons/chevron-down.svg";
import GlobalModalContext from "../../../../../contexts/global-modal-context";
import AuthContext from "../../../../../contexts/auth-context";
import { Lock, Star, MessageCircle, ChevronRight, Shield, Mail, CircleUser, Headphones, MessageSquare, LogOut, Eye, UserRoundCog, PenSquare } from 'lucide-react';
import { Switch } from '@headlessui/react';
import SupportModal from './SupportModal';
import FeedbackModal from './FeedbackModal';
import RateModal from './RateModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import ResetPasswordForm from '../../../forms/auth/ResetPasswordForm/ResetPasswordForm';
import UserPreferences from '../../../../profile/UserPreferences/UserPreferences';

export default function SessionButton() {
    const auth = useContext(AuthContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hideSensitiveData, setHideSensitiveData] = useState(true);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [mode, setMode] = useState('view');
    const [userData, setUserData] = useState(null);
    const menuRef = useRef(null);
    const {showGlobalModal} = useContext(GlobalModalContext);
    
    // Listen for user:updated event to refresh user data
    useEffect(() => {
        const handleUserUpdated = () => {
            // Force a fresh user data fetch when user data is updated
            const freshUserData = auth.getUser();
            setUserData(freshUserData);
        };
        
        window.addEventListener('user:updated', handleUserUpdated);
        return () => {
            window.removeEventListener('user:updated', handleUserUpdated);
        };
    }, [auth]);
    
    useEffect(() => {
        function removeMenu(e) {
            if (!menuRef.current.contains(e.target)) setIsExpanded(false);
        }

        if (isExpanded) document.addEventListener('click', removeMenu)
        return () => {
            document.removeEventListener('click', removeMenu);
        }
    }, [isExpanded, menuRef.current]);

    // Get fresh user data whenever the menu is opened
    useEffect(() => {
        if (isExpanded) {
            // Force a fresh user data fetch
            const freshUserData = auth.getUser();
            setUserData(freshUserData);
        }
    }, [isExpanded, auth]);

    // When profile modal is closed, refresh user data
    useEffect(() => {
        if (!showProfile) {
            // Force a fresh user data fetch when profile modal is closed
            const freshUserData = auth.getUser();
            setUserData(freshUserData);
        }
    }, [showProfile, auth]);

    function handleProfileClicked() {
        setIsExpanded(false);
        setShowProfile(true);
        setMode('edit');
    }

    function handleLogoutClicked() {
        setIsExpanded(false);
        setShowLogoutConfirm(true);
    }

    function handleLogoutConfirmed() {
        setShowLogoutConfirm(false);
        auth.logout();
    }
    
    // If userData is available from the local state, use it
    // Otherwise fall back to the useUser hook
    const hookUser = useUser();
    const user = userData || hookUser;
    
    if (!user) {
        return null; // Or a loading state if you prefer
    }

    const {firstName, lastName, email} = user;
    const initials = firstName && lastName ?
        `${firstName[0]}${lastName[0]}` :
        email ? email[0] : '?';

    // Function to mask email
    const maskEmail = (email) => {
        if (!email) return '';
        const [username, domain] = email.split('@');
        // Only show first character and last character of username
        const usernameLength = username.length;
        const maskedUsername = usernameLength > 2 
            ? `${username[0]}${'•'.repeat(usernameLength - 2)}${username[usernameLength - 1]}` 
            : username[0] + '•'.repeat(usernameLength - 1);
        
        // Only show the domain extension (.com, .org, etc)
        const domainParts = domain.split('.');
        const extension = domainParts.pop();
        const maskedDomain = '•'.repeat(domain.length - extension.length - 1) + '.' + extension;
        
        return `${maskedUsername}@${maskedDomain}`;
    };

    function handleSupportClicked() {
        setIsExpanded(false);
        setShowSupportModal(true);
    }

    function handleFeedbackClicked() {
        setIsExpanded(false);
        setShowFeedbackModal(true);
    }

    function handleRateClicked() {
        setIsExpanded(false);
        setShowRateModal(true);
    }

    function handleChangePasswordClicked() {
        setIsExpanded(false);
        setShowChangePassword(true);
    }

    return (
        <>
            <div ref={menuRef} className='relative'>
                <button onClick={() => setIsExpanded(!isExpanded)} type="button" className='border-[.5px] border-[#CCC] rounded-full pr-1 flex gap-1'>
                    <div className='border-2 border-text-pink rounded-full flex items-center justify-center'>
                        <span className='inline-grid place-items-center w-6 h-6 p-[2px] border-2 border-white rounded-full bg-[#FF69B4] text-white font-semibold text-xs capitalize'>{initials.toUpperCase()}</span>
                    </div>
                    <img src={chevronDownIcon} alt="chevron icon" className='self-center' />
                </button>
                {isExpanded && (
                    <div className="absolute top-full right-0 mt-1 bg-[#F5F5F5] rounded-2xl z-50 shadow-lg w-[280px] overflow-hidden border border-black max-h-[80vh] overflow-y-auto">
                        {/* User Info Section */}
                        <div className="px-4 py-2 bg-white">
                            <div className="flex items-center gap-3">
                                <div className='w-8 h-8 rounded-full bg-[#FF69B4] flex items-center justify-center text-white font-medium'>
                                    {initials.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-sm flex items-center gap-1">
                                        Hello, {firstName}!
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="8" fill="#FF69B4" fillOpacity="0.1"/>
                                            <circle cx="8" cy="8" r="4" fill="#FF69B4"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Data Section */}
                        <div className="mt-1">
                            <div className="px-4 mb-1">
                                <div className="text-xs text-gray-500">Personal Data</div>
                                <div className="text-[10px] text-gray-400">Your personal information</div>
                            </div>
                            <div className="bg-white">
                                <div className="px-4 py-[10px] flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <CircleUser size={16} className="text-[#FF69B4]" />
                                        <div>
                                            <div className="text-[13px] flex items-center gap-2">
                                                {firstName} {lastName}
                                                <button onClick={handleProfileClicked} className="hover:bg-gray-100 p-1 rounded">
                                                    <PenSquare size={14} className="text-[#FF69B4]" />
                                                </button>
                                            </div>
                                            <div className="text-[10px] text-gray-400">Full name</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-[10px] flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-[#FF69B4]" />
                                        <div>
                                            <div className="text-[13px]">{hideSensitiveData ? maskEmail(email) : email}</div>
                                            <div className="text-[10px] text-gray-400">E-mail</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="mt-2">
                            <div className="px-4 mb-1">
                                <div className="text-xs text-gray-500">Security</div>
                                <div className="text-[10px] text-gray-400">Your account security</div>
                            </div>
                            <div className="bg-white">
                                <div className="px-4 py-[10px] flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Eye size={16} className="text-[#FF69B4]" />
                                        <div>
                                            <div className="text-[13px]">Hide sensitive data</div>
                                            <div className="text-[10px] text-gray-400">Disable screenshot</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Switch
                                            checked={hideSensitiveData}
                                            onChange={setHideSensitiveData}
                                            className={`${hideSensitiveData ? 'bg-[#FF1493]' : 'bg-gray-200'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none`}
                                        >
                                            <span className={`${hideSensitiveData ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                                        </Switch>
                                    </div>
                                </div>
                                <button onClick={handleChangePasswordClicked} className="w-full px-4 py-[10px] flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Lock size={16} className="text-[#FF69B4]" />
                                        <span className="text-[13px]">Change Password</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="mt-2">
                            <div className="px-4 mb-1">
                                <div className="text-xs text-gray-500">About</div>
                                <div className="text-[10px] text-gray-400">Help and information</div>
                            </div>
                            <div className="bg-white">
                                <button onClick={handleSupportClicked} className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Headphones size={16} className="text-[#FF1493]" />
                                        <span className="text-[13px]">Support</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                                <div className="px-4 text-[10px] text-gray-400 -mt-1 mb-2">Our contact</div>
                                
                                <button onClick={handleFeedbackClicked} className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={16} className="text-[#FF1493]" />
                                        <span className="text-[13px]">Feedback</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                                <div className="px-4 text-[10px] text-gray-400 -mt-1 mb-2">How can we improve?</div>
                                
                                <button onClick={handleRateClicked} className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <Star size={16} strokeWidth={2} className="text-[#FF1493]" />
                                        <span className="text-[13px]">Rate the app</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                                <div className="px-4 text-[10px] text-gray-400 -mt-1 mb-2">Tell us about your experience</div>
                                
                                <button onClick={handleLogoutClicked} className="w-full px-4 py-[10px] flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <LogOut size={16} className="text-[#FF69B4]" />
                                        <span className="text-[13px]">Logout</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
            {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
            {showRateModal && <RateModal onClose={() => setShowRateModal(false)} />}
            {showLogoutConfirm && (
                <LogoutConfirmModal 
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={handleLogoutConfirmed}
                />
            )}
            {showChangePassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <ResetPasswordForm 
                            setResetSuccessful={() => setShowChangePassword(false)} 
                            type="change-password"
                            email={user.email}
                        />
                    </div>
                </div>
            )}
            {showProfile && (
                <div className="fixed top-0 left-0 w-full h-full bg-[#050505]/25 flex items-center justify-center z-30">
                    <div className="w-full max-w-xl bg-white rounded-lg overflow-hidden">
                        <div className="py-[10px] px-6 bg-black text-white text-lg font-semibold flex justify-between items-center">
                            <span>Profile</span>
                            <button type="button" onClick={() => setShowProfile(false)} className="text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={26} height={26}>
                                    <line x1="8" y1="8" x2="16" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <UserPreferences initialMode={mode} onClose={() => setShowProfile(false)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}