import styles from './OptionsDropdown.module.css';

import optionsIcon from '../../../../assets/icons/options.svg';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

function OptionsDropdown({options, classes = 'relative'}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const menuRef = useRef(null);

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

    return (
        <div ref={menuRef} className={classes}>
            <button type="button" onClick={(e) => {isExpanded && e.stopPropagation(); setIsExpanded(!isExpanded)}} className='hover:bg-[#CCC]/50 rounded-lg transition-colors h-8 w-8'>
                <img src={optionsIcon} alt="" />
            </button>
            {
                isExpanded &&
                <div className='absolute right-full mr-2 top-0'>
                    <ul className='bg-white w-fit rounded-lg border border-border-gray p-2'>
                        {
                            options.map(o => {
                                return (
                                    <li key={o.text} onClick={() => setIsExpanded(false)}>
                                        {
                                            o.type === 'link' ?
                                            <Link to={o.link} className='whitespace-nowrap font-medium text-sm px-4 py-2 hover:bg-[#CCC]/50 rounded-lg transition-colors inline-block w-full'>{o.text}</Link> :
                                            <button type="button" onClick={o.action} className='whitespace-nowrap font-medium text-sm px-4 py-2 hover:bg-[#CCC]/50 rounded-lg transition-colors inline-block w-full text-left'>{o.text}</button>
                                        }
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            }
        </div>
    )
}

export default OptionsDropdown;