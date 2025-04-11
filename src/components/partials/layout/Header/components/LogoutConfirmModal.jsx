import { ChevronLeft } from 'lucide-react';

export default function LogoutConfirmModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-[60px] pr-4">
            <div className="bg-white rounded-2xl w-[280px] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 flex items-start gap-3">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="font-medium text-[15px]">Are you sure?</div>
                        <div className="text-[11px] text-gray-500">
                            By selecting this, you will end your current app session. You must log in next time you want to use the app.
                        </div>
                    </div>
                </div>

                {/* Emoji and Button */}
                <div className="px-4 pb-4 flex flex-col items-center">
                    <div className="text-6xl mb-8">🤔</div>
                    <div className="flex justify-end w-full">
                        <button 
                            onClick={onConfirm}
                            className="px-8 py-2 bg-[#FF1493] text-white rounded-lg text-[13px] font-medium hover:bg-opacity-90 transition-colors"
                        >
                            Proceed
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 