import { ChevronLeft, Star } from 'lucide-react';
import { useState } from 'react';

export default function RateModal({ onClose }) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-[60px] pr-4">
            <div className="bg-white rounded-2xl w-[280px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 flex items-start gap-3">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="font-medium text-[15px]">Rate Us!</div>
                        <div className="text-[11px] text-gray-500">Tell us about your experience.</div>
                    </div>
                </div>

                {/* Rating Section */}
                <div className="px-4 py-6 flex flex-col items-center">
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                                className="focus:outline-none"
                            >
                                <Star
                                    size={32}
                                    className={`${
                                        (hoveredRating ? hoveredRating >= star : rating >= star)
                                            ? 'text-[#FF69B4] fill-[#FF69B4]'
                                            : 'text-gray-200 fill-gray-200'
                                    } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                    <div className="text-[13px] text-gray-600 mb-6">
                        Rating: {rating} stars
                    </div>
                    <button 
                        className="w-full py-2 bg-[#FF1493] text-white rounded-lg text-[13px] font-medium hover:bg-opacity-90 transition-colors"
                    >
                        Send your ratings
                    </button>
                </div>
            </div>
        </div>
    );
} 