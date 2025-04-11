import { ChevronLeft, HelpCircle, Phone, Mail, Twitter, Facebook, Youtube, Instagram, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal';

export default function SupportModal({ onClose }) {
    const [showFeedback, setShowFeedback] = useState(false);
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const isProduction = import.meta.env.PROD;
                const protocol = isProduction ? 'https' : 'http';
                const response = await fetch(`${protocol}://mitigetcontrol.mitiget.com.ng/licensing/support_contact/1/view/`);
                const data = await response.json();
                if (data.status === 'success') {
                    setContactInfo(data.data);
                }
            } catch (error) {
                console.error('Error fetching contact information:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContactInfo();
    }, []);

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
        window.location.href = `mailto:${contactInfo?.email || 'info@m-clarion.com'}`;
    };

    const socialLinks = {
        twitter: contactInfo?.twitter_handle ? `https://twitter.com/${contactInfo.twitter_handle.replace('@', '')}` : 'https://twitter.com/m_clarion',
        facebook: contactInfo?.facebook_handle ? `https://facebook.com/${contactInfo.facebook_handle}` : 'https://facebook.com/mclarion',
        youtube: contactInfo?.youtube_handle ? `https://youtube.com/${contactInfo.youtube_handle}` : 'https://youtube.com/@m-clarion',
        tiktok: contactInfo?.tiktok_handle ? `https://tiktok.com/${contactInfo.tiktok_handle}` : 'https://tiktok.com/@mclarion',
        instagram: contactInfo?.instagram_handle ? `https://instagram.com/${contactInfo.instagram_handle}` : 'https://instagram.com/mclarion'
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
                {loading ? (
                    <div className="px-4 py-3 text-center text-gray-500">Loading contact information...</div>
                ) : (
                    <div className="flex flex-col">
                        {contactInfo?.phone_numbers?.[0]?.split(',').map((phone, index) => (
                            <div key={index} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <Phone size={18} className="text-[#FF69B4]" />
                                </div>
                                <div className="text-[12px]">{phone.trim()}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Email */}
                <div 
                    onClick={handleEmailClick}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100"
                >
                    <div className="w-6 h-6 flex items-center justify-center">
                        <Mail size={18} className="text-[#FF69B4]" />
                    </div>
                    <div className="text-[12px]">{contactInfo?.email || 'info@m-clarion.com'}</div>
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
                            <path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74a2.89 2.89 0 0 1 2.31-4.64a2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                    </button>

                    {/* Instagram Icon */}
                    <button onClick={() => handleSocialClick(socialLinks.instagram)} className="hover:opacity-80 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" className="text-[#FF69B4]">
                            <path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
} 