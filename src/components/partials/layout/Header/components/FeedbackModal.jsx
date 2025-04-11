import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FeedbackModal({ onClose }) {
    const [feedback, setFeedback] = useState('');
    const [subject, setSubject] = useState('');
    const [errors, setErrors] = useState({
        subject: '',
        feedback: ''
    });

    const handleSubmit = () => {
        const newErrors = {
            subject: '',
            feedback: ''
        };

        if (!subject) {
            newErrors.subject = 'Please select a subject';
        }

        if (feedback.length < 10) {
            newErrors.feedback = 'Feedback must be at least 10 characters long';
        }

        setErrors(newErrors);

        // Only proceed if there are no errors
        if (!newErrors.subject && !newErrors.feedback) {
            // Handle form submission here
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-[60px] pr-4">
            <div className="bg-white rounded-2xl w-[280px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 flex items-start gap-3">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="font-medium text-[15px]">How can we improve?</div>
                        <div className="text-[11px] text-gray-500">Please tell us more about your issue.</div>
                    </div>
                </div>

                {/* Form */}
                <div className="px-4 py-3">
                    <div className="mb-4 relative">
                        <select 
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value);
                                setErrors(prev => ({...prev, subject: ''}));
                            }}
                            className={`w-full p-2 border ${errors.subject ? 'border-red-500' : 'border-gray-200'} rounded-lg text-[13px] outline-none appearance-none bg-white pr-8`}
                        >
                            <option value="">Subject</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={16} />
                        </div>
                        {errors.subject && <div className="text-red-500 text-[11px] mt-1">{errors.subject}</div>}
                    </div>
                    
                    <div className="mb-1">
                        <textarea
                            value={feedback}
                            onChange={(e) => {
                                setFeedback(e.target.value.slice(0, 500));
                                setErrors(prev => ({...prev, feedback: ''}));
                            }}
                            placeholder="What problems have you experienced?"
                            className={`w-full h-[120px] p-2 border ${errors.feedback ? 'border-red-500' : 'border-gray-200'} rounded-lg text-[13px] outline-none resize-none`}
                        />
                        {errors.feedback && <div className="text-red-500 text-[11px] mt-1">{errors.feedback}</div>}
                    </div>
                    <div className="text-right text-[10px] text-gray-400 mb-4">
                        {feedback.length}/500
                    </div>

                    <button 
                        onClick={handleSubmit}
                        className="w-full mt-4 py-2 bg-[#FF1493] text-white rounded-lg text-[13px] font-medium hover:bg-opacity-90 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
} 