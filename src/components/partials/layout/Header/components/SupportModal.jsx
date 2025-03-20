import { ChevronLeft, HelpCircle, Phone, Mail, Twitter, Facebook, Youtube, Instagram, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function SupportModal({ onClose }) {
    const [showFeedback, setShowFeedback] = useState(false);

    if (showFeedback) {
        return <FeedbackModal onClose={() => setShowFeedback(false)} />;
    }

    const handleFeedbackClick = () => {
        setShowFeedback(true);
    };

    const handleSocialClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleEmailClick = () => {
        window.location.href = 'mailto:info@m-clarion.com';
    };

    const socialLinks = {
        twitter: 'https://twitter.com/m_clarion',
        facebook: 'https://facebook.com/mclarion',
        youtube: 'https://youtube.com/@m-clarion',
        tiktok: 'https://tiktok.com/@mclarion',
        instagram: 'https://instagram.com/mclarion'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-[60px] pr-4">
            <div className="bg-white rounded-2xl w-[280px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 flex items-start gap-3 bg-gray-50">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 mt-1">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="font-medium text-[13px]">Need help?</div>
                        <div className="text-[11px] text-gray-500">We're here to assist.</div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center">
                            <HelpCircle size={18} className="text-[#FF69B4]" />
                        </div>
                        <div>
                            <div className="text-[12px]">Help</div>
                            <div className="text-[10px] text-gray-500">Answers to all questions</div>
                        </div>
                    </div>
                    <ChevronLeft size={16} className="text-gray-400 rotate-180" />
                </div>

                {/* Feedback Section */}
                <div 
                    onClick={handleFeedbackClick}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between border-b border-gray-100"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center">
                            <MessageSquare size={18} className="text-[#FF69B4]" />
                        </div>
                        <div>
                            <div className="text-[12px]">Feedback</div>
                            <div className="text-[10px] text-gray-500">Share your experience</div>
                        </div>
                    </div>
                    <ChevronLeft size={16} className="text-gray-400 rotate-180" />
                </div>

                {/* Contact Numbers */}
                {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100">
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Phone size={18} className="text-[#FF69B4]" />
                        </div>
                        <div className="text-[12px]">+2348067191062</div>
                    </div>
                ))}

                {/* Email */}
                <div 
                    onClick={handleEmailClick}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100"
                >
                    <div className="w-6 h-6 flex items-center justify-center">
                        <Mail size={18} className="text-[#FF69B4]" />
                    </div>
                    <div className="text-[12px]">info@m-clarion.com</div>
                </div>

                {/* Social Networks */}
                <div className="px-4 pt-4 pb-2 text-center">
                    <div className="text-[12px] font-medium">Our social networks</div>
                    <div className="text-[10px] text-gray-500">You can reach us here</div>
                </div>
                <div className="px-4 py-3 flex justify-center gap-6">
                    {/* X (Twitter) Icon */}
                    <button onClick={() => handleSocialClick(socialLinks.twitter)} className="hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#FF69B4]">
                            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </button>

                    {/* Facebook Icon */}
                    <button onClick={() => handleSocialClick(socialLinks.facebook)} className="hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#FF69B4]">
                            <path fill="currentColor" d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7C18.34 21.21 22 17.06 22 12.06c0-5.53-4.5-10.02-10-10.02"/>
                        </svg>
                    </button>

                    {/* YouTube Icon */}
                    <button onClick={() => handleSocialClick(socialLinks.youtube)} className="hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#FF69B4]">
                            <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814M9.545 15.568V8.432L15.818 12z"/>
                        </svg>
                    </button>

                    {/* TikTok Icon */}
                    <button onClick={() => handleSocialClick(socialLinks.tiktok)} className="hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#FF69B4]">
                            <path fill="currentColor" d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48"/>
                        </svg>
                    </button>

                    {/* Instagram Icon */}
                    <button onClick={() => handleSocialClick(socialLinks.instagram)} className="hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#FF69B4]">
                            <path fill="currentColor" d="M12 2c2.717 0 3.056.01 4.122.06c1.065.05 1.79.217 2.428.465c.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428c.047 1.066.06 1.405.06 4.122c0 2.717-.01 3.056-.06 4.122c-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772a4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465c-1.066.047-1.405.06-4.122.06c-2.717 0-3.056-.01-4.122-.06c-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153a4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122c.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2m0 5a5 5 0 1 0 0 10a5 5 0 0 0 0-10m6.5-.25a1.25 1.25 0 0 0-2.5 0a1.25 1.25 0 0 0 2.5 0M12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
} 