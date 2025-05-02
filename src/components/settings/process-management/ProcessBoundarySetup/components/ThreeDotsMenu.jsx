import { useState, useEffect, useRef } from 'react';

export default function ThreeDotsMenu({ viewContext, editContext, deleteContext }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Setup click outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        // Add event listener when menu is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleMenu = (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        setIsOpen(!isOpen);
    };

    const handleView = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        const modalType = viewContext.modalType || 'processBoundary';
        window.dispatchEvent(new CustomEvent('open-modal', {detail: {type: modalType, context: viewContext}}));
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        const modalType = editContext.modalType || 'processBoundary';
        window.dispatchEvent(new CustomEvent('open-modal', {detail: {type: modalType, context: editContext}}));
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setIsOpen(false);
        const modalType = deleteContext.modalType || 'processBoundary';
        window.dispatchEvent(new CustomEvent('open-modal', {detail: {type: modalType, context: {...deleteContext, mode: 'delete'}}}));
    };

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={toggleMenu} 
                className="p-1.5 rounded-full hover:bg-gray-100 focus:outline-none"
                data-testid="three-dots-button"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="6" r="2" fill="#666666" />
                    <circle cx="12" cy="12" r="2" fill="#666666" />
                    <circle cx="12" cy="18" r="2" fill="#666666" />
                </svg>
            </button>
            
            {isOpen && (
                <div 
                    className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-[120px]"
                    data-testid="three-dots-menu"
                >
                    <button 
                        onClick={handleView} 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        View
                    </button>
                    <button 
                        onClick={handleEdit} 
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
} 