import styles from './LinkButton.module.css';

import { NavLink } from 'react-router-dom';
import useUser from '../../../../hooks/useUser';

function LinkButton({location = null, text, icon, permission, classes = '', onClick = () => {}, bgColor = 'white'}) {
    const user = useUser();

    if (!user.hasPermission(permission)) return null;

    let content;
    if (location) {
        content = (
            <NavLink style={{backgroundColor: bgColor}} to={location} className={`border border-[#CCC] py-2 px-4 rounded-lg whitespace-nowrap flex items-center gap-3 ${classes}`}>
                <img src={icon} alt="" />
                <span className='text-sm font-medium text-[#080808]'>{text}</span>
            </NavLink>
        );
    } else {
        content = (
            <button style={{backgroundColor: bgColor}} onClick={onClick} type='button' className={`border border-[#CCC] py-2 px-4 rounded-lg whitespace-nowrap flex items-center gap-3 ${classes}`}>
                <img src={icon} alt="" />
                <span className='text-sm font-medium text-[#080808]'>{text}</span>
            </button>
        );
    }
    return content;
}

export default LinkButton;