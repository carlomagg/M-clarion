import React, { useState, useRef, useEffect } from 'react';

const MultiSelectorDropdown = ({
    allItems = [],
    selectedItems = [],
    onSetItems,
    placeholder = 'Select items',
    label = '',
    name = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleItem = (item) => {
        const isSelected = selectedItems.some(selected => selected.id === item.id);
        if (isSelected) {
            onSetItems(selectedItems.filter(selected => selected.id !== item.id));
        } else {
            onSetItems([...selectedItems, item]);
        }
    };

    return (
        <div className="flex flex-col gap-3" ref={dropdownRef}>
            {label && <label className="text-[12px] font-normal">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full p-3 flex justify-between items-center outline-none focus:outline-none border rounded-lg ${isOpen ? 'border-text-pink' : 'border-border-gray'}`}
                >
                    <span className="text-sm text-text-gray">
                        {selectedItems.length > 0 
                            ? `${selectedItems.length} selected`
                            : placeholder}
                    </span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && allItems.length > 0 && (
                    <ul className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-border-gray rounded-lg mt-1 shadow-lg">
                        {allItems.map((item) => {
                            const isSelected = selectedItems.some(selected => selected.id === item.id);
                            return (
                                <li
                                    key={item.id}
                                    onClick={() => toggleItem(item)}
                                    className={`
                                        p-3 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between
                                        ${isSelected ? 'bg-gray-200' : ''}
                                    `}
                                >
                                    <span>{item.text}</span>
                                    {isSelected && (
                                        <svg className="w-4 h-4 text-text-pink" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            {selectedItems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                        >
                            <span>{item.text}</span>
                            <button
                                type="button"
                                onClick={() => toggleItem(item)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectorDropdown; 