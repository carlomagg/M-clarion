import styles from './Index.module.css';

import companyIcon from '../../../../assets/icons/company-info.svg';
import subsidiaryIcon from '../../../../assets/icons/subsidiary-info.svg';
import branchIcon from '../../../../assets/icons/branch-info.svg';
import divisionIcon from '../../../../assets/icons/division-info.svg';
import departmentIcon from '../../../../assets/icons/department-info.svg';
import unitIcon from '../../../../assets/icons/unit-info.svg';
import { NavLink } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import useUser from '../../../../hooks/useUser';

function Index({inIndexView}) {
    const user = useUser();
    const links = [
        {text: 'Company information', link: '/settings/organizational-structure/company-info', icon: companyIcon, permission: 'company_information'},
        {text: 'Subsidiary information', link: '/settings/organizational-structure/subsidiaries', icon: subsidiaryIcon, permission: 'subsidiary_information'},
        {text: 'Branch information', link: '/settings/organizational-structure/branches', icon: branchIcon, permission: 'branch_information'},
        {text: 'Division information', link: '/settings/organizational-structure/divisions', icon: divisionIcon, permission: 'division_information'},
        {text: 'Department information', link: '/settings/organizational-structure/departments', icon: departmentIcon, permission: 'department_information'},
        {text: 'Unit information', link: '/settings/organizational-structure/units', icon: unitIcon, permission: 'unit_information'},
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
                            <NavLink data-tooltip-id='icon-desc' data-tooltip-content={link.text} key={link.link} to={link.link} className={`border-b-[0.5px] border-b-[#D0D0D0] flex gap-4 items-center ${inIndexView ? 'p-6' : 'p-4 grow'}`}>
                                {!inIndexView && <Tooltip id='icon-desc' className='z-20' />}
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