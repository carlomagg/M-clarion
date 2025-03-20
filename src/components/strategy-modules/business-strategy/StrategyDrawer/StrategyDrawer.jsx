import styles from './StrategyDrawer.module.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { StrategyDrawerContext } from '../../../../pages/strategies/Index/Index';
import Strategy from '../Strategy/Strategy';
import Goal from '../Goal/Goal';
import Objective from '../Objective/Objective';
import Initiative from '../Initiative/Initiative';
import Tactic from '../Tactic/Tactic';
import Metric from '../Metric/Metric';
import ParametersAndIndicators from '../ParametersAndIndicators/ParametersAndIndicators';

function StrategyDrawer() {
    const {type, removeDrawer} = useContext(StrategyDrawerContext);
    const notificationBarHeight = 0;
    const headerHeight = 77;
    const contentAreaRect = document.querySelector('main').getBoundingClientRect();
    const modalRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        if (modalRef && formRef) {
            const handleRemoveDrawer = (e) => {
                if (!formRef.current.contains(e.target)) removeDrawer();
            } 
            modalRef.current.addEventListener('click', handleRemoveDrawer);
            return () => modalRef.current?.removeEventListener('click', handleRemoveDrawer);
        }
    }, [modalRef, formRef])

    let top;

    if (contentAreaRect.top <= 0) top = notificationBarHeight;
    else if (contentAreaRect.top >= 133) top = notificationBarHeight + headerHeight;
    else top = contentAreaRect.top;

    let height = window.innerHeight - top;
    let width = window.innerWidth - 288;

    let form;

    switch (type) {
        case 'strategy':
            form = <Strategy />;
            break;
        case 'goal':
            form = <Goal />;
            break;
        case 'objective':
            form = <Objective />;
            break;
        case 'initiative':
            form = <Initiative />;
            break;
        case 'tactic':
            form = <Tactic />;
            break;
        case 'metric':
            form = <Metric />;
            break;
        case 'parameters-and-indicators':
            form = <ParametersAndIndicators />;
            break;
    }

    return (
        <div ref={modalRef} style={{top: top+'px', width: width+'px', height: height+'px'}} className='bg-black/20 fixed z-10 left-72'>
            <div ref={formRef} className={`bg-white h-full w-[750px] p-4 absolute right-0 top-0 ${styles['slide-in']}`}>
                {form}
            </div>
        </div>
    );
}

export default StrategyDrawer;