import { useEffect, useRef, useState } from "react";
import styles from "./SelectDropdown.module.css";
import { filterItems } from "../../../../utils/helpers";

function SelectDropdown({
    label, 
    placeholder, 
    items = [], 
    name, 
    selected = null, 
    onSelect, 
    isCollapsed = true, 
    onToggleCollapse,
    onToggleCollpase, // Support old prop name for backward compatibility
    filterable = false, 
    customAction = null, 
    contentAfterLabel = null, 
    filterTerm = '', 
    setFilterTerm = () => {}
}) {
    const dropdownRef = useRef(null);
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(null);
    const stringItems = Array.isArray(items) && items.length > 0 && typeof items[0] === 'string';

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const toggleFn = onToggleCollapse || onToggleCollpase;
                toggleFn && toggleFn(true);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onToggleCollapse, onToggleCollpase]);

    // Update selected value when selected prop changes
    useEffect(() => {
        if (selected && items.length > 0) {
            const sel = stringItems ? selected : items.find(item => item.id === selected)?.text;
            if (filterable && setFilterTerm) {
                setFilterTerm(sel || '');
            } else {
                setSelectedValue(sel || '');
            }
        } else {
            if (filterable && setFilterTerm) {
                setFilterTerm('');
            } else {
                setSelectedValue('');
            }
        }
    }, [selected, items, stringItems, filterable, setFilterTerm]);

    function handleSelect(item, i) {
        if (customAction && typeof customAction === 'function') {
            customAction(item);
            return;
        }
        
        const value = stringItems ? item : item.id;
        onSelect({ target: { name, value } });
        setSelectedIndex(i);
        const toggleFn = onToggleCollapse || onToggleCollpase;
        toggleFn && toggleFn(true);
    }

    function handleKeyStroke(e) {
        const { key } = e;
        const itemsLength = items.length;
        const toggleFn = onToggleCollapse || onToggleCollpase;

        switch (key) {
            case 'ArrowDown':
                e.preventDefault();
                if (itemsLength > 0) {
                    const nextIndex = selectedIndex !== null ? (selectedIndex + 1) % itemsLength : 0;
                    handleSelect(items[nextIndex], nextIndex);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (itemsLength > 0) {
                    const prevIndex = selectedIndex !== null ? 
                        (selectedIndex - 1 + itemsLength) % itemsLength : 
                        itemsLength - 1;
                    handleSelect(items[prevIndex], prevIndex);
                }
                break;
            case 'Enter':
            case 'Escape':
                e.preventDefault();
                toggleFn && toggleFn(true);
                break;
        }
    }

    const chevron = (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.2s ease-in-out'
            }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.35853 8.75857C6.58356 8.53361 6.88873 8.40723 7.20693 8.40723C7.52513 8.40723 7.8303 8.53361 8.05533 8.75857L12.0069 12.7102L15.9585 8.75857C16.1849 8.53998 16.488 8.41903 16.8026 8.42176C17.1173 8.4245 17.4182 8.5507 17.6407 8.77319C17.8632 8.99568 17.9894 9.29665 17.9921 9.61129C17.9949 9.92593 17.8739 10.229 17.6553 10.4554L12.8553 15.2554C12.6303 15.4803 12.3251 15.6067 12.0069 15.6067C11.6887 15.6067 11.3836 15.4803 11.1585 15.2554L6.35853 10.4554C6.13357 10.2303 6.00719 9.92517 6.00719 9.60697C6.00719 9.28877 6.13357 8.9836 6.35853 8.75857Z"
                fill="#000"
            />
        </svg>
    );

    const toggleFn = onToggleCollapse || onToggleCollpase;

    return (
        <div className="flex flex-col gap-3" ref={dropdownRef}>
            {label && <label className="text-[12px] font-normal">{label}</label>}
            {contentAfterLabel}
            <div 
                onKeyDown={e => !isCollapsed && handleKeyStroke(e)} 
                className={`relative border rounded-lg ${isCollapsed ? 'border-border-gray' : 'border-text-pink'}`}
            >
                <button
                    type="button"
                    className="w-full p-3 flex justify-between items-center outline-none focus:outline-none"
                    onClick={() => toggleFn && toggleFn(!isCollapsed)}
                >
                    {filterable ? (
                        <input
                            type="text"
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                            placeholder={placeholder}
                            className="w-full outline-none text-sm text-text-gray"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="text-sm text-text-gray">
                            {selectedValue || placeholder}
                        </span>
                    )}
                    {chevron}
                </button>
                
                {!isCollapsed && items.length > 0 && (
                    <ul className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-border-gray rounded-lg mt-1 shadow-lg">
                        {items.map((item, i) => (
                            <li
                                key={stringItems ? item : item.id}
                                onClick={() => handleSelect(item, i)}
                                className={`
                                    p-3 hover:bg-gray-100 cursor-pointer text-sm
                                    ${stringItems ? 
                                        (item === selected && 'bg-gray-200') : 
                                        (item.id === selected && 'bg-gray-200')
                                    }
                                    ${i !== items.length - 1 ? 'border-b border-border-gray' : ''}
                                `}
                            >
                                {stringItems ? item : item.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default SelectDropdown;
