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
    
    // Ensure items is always an array
    const safeItems = Array.isArray(items) ? items : [];
    const stringItems = safeItems.length > 0 && typeof safeItems[0] === 'string';

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
        if (selected && safeItems.length > 0) {
            const sel = stringItems ? selected : safeItems.find(item => item.id === selected)?.text;
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
    }, [selected, safeItems, stringItems, filterable, setFilterTerm]);

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
        const itemsLength = safeItems.length;
        const toggleFn = onToggleCollapse || onToggleCollpase;

        switch (key) {
            case 'ArrowDown':
                e.preventDefault();
                if (itemsLength > 0) {
                    const nextIndex = selectedIndex !== null ? (selectedIndex + 1) % itemsLength : 0;
                    handleSelect(safeItems[nextIndex], nextIndex);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (itemsLength > 0) {
                    const prevIndex = selectedIndex !== null ? 
                        (selectedIndex - 1 + itemsLength) % itemsLength : 
                        itemsLength - 1;
                    handleSelect(safeItems[prevIndex], prevIndex);
                }
                break;
            case 'Enter':
            case 'Escape':
                e.preventDefault();
                toggleFn && toggleFn(true);
                break;
        }
    }

    const toggleFn = onToggleCollapse || onToggleCollpase;
    const chevron = <svg className={`transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="#A1A1A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

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
                
                {!isCollapsed && safeItems.length > 0 && (
                    <ul className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white border border-border-gray rounded-lg mt-1 shadow-lg">
                        {safeItems.map((item, i) => (
                            <li
                                key={stringItems ? item : item.id}
                                onClick={() => handleSelect(item, i)}
                                className={`
                                    p-3 hover:bg-gray-100 cursor-pointer text-sm
                                    ${stringItems ? 
                                        (item === selected && 'bg-gray-200') : 
                                        (item.id === selected && 'bg-gray-200')
                                    }
                                    ${i !== safeItems.length - 1 ? 'border-b border-border-gray' : ''}
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
