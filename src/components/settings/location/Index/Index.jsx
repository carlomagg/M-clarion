import styles from './Index.module.css';

import countryIcon from '../../../../assets/icons/country.svg';
import stateIcon from '../../../../assets/icons/division-info.svg';
import { NavLink } from 'react-router-dom';
import useUser from '../../../../hooks/useUser';

function Index() {
    const user = useUser();
    const links = [
        {text: 'Add country', link: 'add-country', icon: countryIcon, permission: 'add_country'},
        {text: 'Add state', link: 'add-state', icon: stateIcon, permission: 'add_state'},
        {text: 'Add city', link: 'add-city', icon: stateIcon, permission: 'add_city'},
    ];

    const hasSomePerms = links.some(link => user.hasPermission(link.permission));
    if (!hasSomePerms) return null;
    return (
        <div className='bg-white border border-[#CCC]'>
            <ul>
                {
                    links.map(link => {
                        return (
                            user.hasPermission(link.permission) &&
                            <NavLink key={link.link} to={link.link} className='p-6 border-b-[0.5px] border-b-[#D0D0D0] flex gap-4 items-center'>
                                <img src={link.icon} alt="" />
                                <span>{link.text}</span>
                            </NavLink>
                        );
                    })
                }
            </ul>
        </div>
    );
}

export default Index;