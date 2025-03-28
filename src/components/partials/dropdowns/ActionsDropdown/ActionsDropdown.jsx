import { useEffect, useRef, useState } from 'react';
import styles from './ActionsDropdown.module.css';

import chevronIcon from '../../../../assets/icons/chevron-pink.svg';
import { NavLink } from 'react-router-dom';
import useUser from '../../../../hooks/useUser';

function ActionsDropdown({label, items, classes}) {
    const user = useUser();

    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef(null);

    // collapse dropdown when external area clicked
    useEffect(() => {
        function removeMenu(e) {
            if (!menuRef.current.contains(e.target)) setIsExpanded(false);
        }

        // when menu is expanded, collpase it when a part of the window without it is clicked
        if (isExpanded) document.addEventListener('click', removeMenu)
        return () => {
            document.removeEventListener('click', removeMenu);
        }
    }, [isExpanded, menuRef.current]);

    function collapseAfterAction(action) {
        action();
        setIsExpanded(false);
    }

    const hasSomePermissions = items.some(item => !item.permission || user.hasPermission(item.permission));

    if (!hasSomePermissions) return null;

    return (
        <div ref={menuRef} className={`inline-flex min-w-32 bg-white cursor-pointer text-sm text-[#080808] font-medium relative select-none ${classes}}`}>
            <button type='button' onClick={() => setIsExpanded(!isExpanded)} className={`p-2 w-full flex justify-between gap-3 border border-[#CCC] ${isExpanded ? 'rounded-t-lg border-b-transparent' : 'rounded-lg'}`}>
                <span>{label}</span>
                <img src={chevronIcon} alt="" className={`${isExpanded && 'rotate-180'}`} />
            </button>
            {
                isExpanded &&
                <ul className='absolute z-[1] w-full bg-white top-full left-0 rounded-b-lg border border-[#CCC] border-t-0'>
                    {
                        items.map(item => {
                            return (!item.permission || user.hasPermission(item.permission)) &&
                            <li key={item.text} className='m-1'>
                                {
                                    item.type === 'link' ?
                                    (
                                        <NavLink to={item.link} className='p-2 rounded-lg flex gap-3 hover:bg-zinc-200 whitespace-nowrap'>
                                            {item.icon && <img src={item.icon} />}
                                            {item.text}
                                        </NavLink>
                                    ) :
                                    (
                                        <span onClick={() => collapseAfterAction(item.onClick)} className='p-2 rounded-lg flex gap-3 hover:bg-zinc-200 whitespace-nowrap'>
                                            {item.icon && <img src={item.icon} />}
                                            {item.text}
                                        </span>
                                    )
                                }
                            </li>
                        })
                    }
                </ul>
            }
        </div>
    );
}

export default ActionsDropdown;