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

function Index() {
    const user = useUser();
    const links = [
        {text: 'Risk Matrix Setup', link: 'risk-matrix', icon: companyIcon, permission: 'company_information'},
        {text: 'Risk Boundary Setup', link: 'risk-boundary', icon: subsidiaryIcon, permission: 'subsidiary_information'},
        {text: 'Manage Risk Classification', link: 'risk-classification', icon: branchIcon, permission: 'branch_information'},
        {text: 'Manage Risk Appetite', link: 'risk-appetite', icon: divisionIcon, permission: 'division_information'},
        {text: 'Control Family Types', link: 'control-family-types', icon: departmentIcon, permission: 'department_information'},
        {text: 'Control Effectiveness', link: 'control-effectiveness', icon: departmentIcon, permission: 'department_information'},
        {text: 'Risk Responses', link: 'risk-responses', icon: unitIcon, permission: 'unit_information'},
        {text: 'Manage Risk Indicators', link: 'risk-indicators', icon: unitIcon, permission: 'unit_information'},
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