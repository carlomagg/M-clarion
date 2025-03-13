import React from 'react';
import styles from './Breadcrumbs.module.css';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

import right_arrow from '../../../assets/icons/small-right-arrow.svg';
import { NavLink, useParams } from 'react-router-dom';
import ROUTES from '../../../routes';
import { useStrategyName } from '../../../queries/strategies/strategy-queries';
import { useRiskName } from '../../../queries/risks/risk-queries';

function Breadcrumbs() {

    const breadcrumbs = useBreadcrumbs(ROUTES);

    return (
        <div className='h-6 bg-[#E5E5E5] text-[#3D3D3D] text-xs py-[2px] px-2 flex gap-2 self-center items-center rounded-[4px]'>
            {breadcrumbs.map( ({breadcrumb, match}, index) => {
                return index < breadcrumbs.length - 1 ? 
                (<React.Fragment key={match.pathname}>
                    <NavLink to={match.pathname}>
                        {breadcrumb}
                    </NavLink>
                    <img src={right_arrow} className='h-2 w-2' />
                </React.Fragment>) :
                <span key={match.pathname}>{breadcrumb}</span>
            })}
        </div>
    );

}

// function DynamicBreadcrumb({type = 'strategy'}) {
//     const {id} = useParams();
//     const {isLoading, error, data: name} = useStrategyName(id);

//     return isLoading || error ? '...' : name;
// }

export function StrategyDynamicBreadcrumb() {
    const {id} = useParams();
    const {isLoading, error, data: name} = useStrategyName(id);

    return isLoading || error ? '...' : name;
}

export function RiskDynamicBreadcrumb() {
    const {id} = useParams();
    const {isLoading, error, data: name} = useRiskName(id);

    return isLoading || error ? '...' : name;
}

export default Breadcrumbs;