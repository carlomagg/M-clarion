import styles from './Index.module.css';

import countryIcon from '../../../../assets/icons/country.svg';
import stateIcon from '../../../../assets/icons/division-info.svg';
import cityIcon from '../../../../assets/icons/branch-info.svg';
import { NavLink } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import useUser from '../../../../hooks/useUser';

function Index({ inIndexView = true }) {
    const user = useUser();
    const links = [
        {text: 'Manage country', link: '/settings/location/add-country', icon: countryIcon, permission: 'add_country'},
        {text: 'Manage state', link: '/settings/location/add-state', icon: stateIcon, permission: 'add_state'},
        {text: 'Manage city', link: '/settings/location/add-city', icon: cityIcon, permission: 'add_city'},
    ];

    const hasSomePerms = links.some(link => user.hasPermission(link.permission));
    if (!hasSomePerms) return null;
    
    return (
        <div className={`bg-white border border-[#CCC] transition-all ${inIndexView ? 'w-full' : 'min-w-max h-full'}`}>
            <ul className={`${!inIndexView && 'flex flex-col h-full'}`}>
                {
                    links.map(link => {
                        return (
                            user.hasPermission(link.permission) &&
                            <NavLink 
                                data-tooltip-id='location-icon-desc' 
                                data-tooltip-content={link.text} 
                                key={link.link} 
                                to={link.link} 
                                className={`border-b-[0.5px] border-b-[#D0D0D0] flex gap-4 items-center ${inIndexView ? 'p-6' : 'p-4 grow'}`}
                            >
                                {!inIndexView && <Tooltip id='location-icon-desc' className='z-20' />}
                                <img src={link.icon} alt="" />
                                <span className={`${!inIndexView && 'hidden'}`}>{link.text}</span>
                            </NavLink>
                        );
                    })
                }
            </ul>
        </div>
    );
}

export default Index;