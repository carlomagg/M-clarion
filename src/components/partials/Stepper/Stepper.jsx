import styles from './Stepper.module.css';

import rightArrowIcon from '../../../assets/icons/small-right-arrow.svg';
import { Fragment } from 'react';

function Stepper({steps, currentStep}) {
    return (
        <div className='bg-white p-1 rounded-lg border border-[#CCC]'>
            <ul className='flex gap-6 relative'>
                {
                    steps.map((step, i) => {
                        return (
                            <Fragment key={step.name}>
                                <li onClick={step.show} className={`font-medium text-center text-sm p-2 rounded-md grow cursor-default ${currentStep === step.name ? 'text-text-pink bg-text-pink/15' : 'text-[#656565]'}`}>
                                    {step.name}
                                </li>
                                {
                                    i < steps.length -1 &&
                                    <img src={rightArrowIcon} alt="" className='shrink' />
                                }
                            </Fragment>
                        )
                    })
                }
            </ul>
        </div>
    )
}

export default Stepper;