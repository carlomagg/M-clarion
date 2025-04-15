import styles from './RiskMatrixSetup.module.css';

import { useState } from 'react';
import SelectDropdown from '../../../partials/dropdowns/SelectDropdown/SelectDropdown';
import Stepper from '../../../partials/Stepper/Stepper';
import LikelihoodDefinitionsTable from './components/LikelihoodDefinitionsTable';
import { InfoButton } from '../components/Buttons';
import ImpactDefinitionsForm from './components/ImpactDefinitionsForm';
import BackButton from '../../components/BackButton';

function RiskMatrixSetup() {
    const [matrixStandard, setMatrixStandard] = useState(5);
    const matrices = [
        {id: 6, text: '6 x 6'},
        {id: 5, text: '5 x 5'},
        {id: 4, text: '4 x 4'},
        {id: 3, text: '3 x 3'},
    ];
    const [likelihoodDefinitions, setLikelihoodDefinitions] = useState([
        {score: 1, description: 'Very Low', criteria: ''},
        {score: 2, description: 'Low', criteria: ''},
        {score: 3, description: 'Medium', criteria: ''},
        {score: 4, description: 'High', criteria: ''},
        {score: 5, description: 'Very High', criteria: ''},
    ]);
    const [currentTab, setCurrentTab] = useState('Likelihood');
    const tabs = [
        {name: 'Likelihood', show: () => setCurrentTab('Likelihood')},
        {name: 'Impact Focus', show: () => setCurrentTab('Impact Focus')},
    ];

    // function handleLikelihoodItemSave(score) {
    //     return (data) => {
    //         setFormData({
    //             ...formData,
    //             likelihoodDefinition: formData.likelihoodDefinition.map(i => {
    //                 if (i.score === score) {
    //                     return {...i, ...data};
    //                 } else return i;
    //             })
    //         });
    //     }
    // }

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Risk Matrix Setup</h3>
            </header>
            <form className="flex flex-col gap-8">
                <div className='flex flex-col gap-3 w-1/2'>
                    <div className='flex gap-3 font-medium'>
                        Risk Matrix Standard
                        <InfoButton />
                    </div>
                    {
                        currentTab === 'Likelihood' ?
                        <MatricesDropdown matrices={matrices} selected={matrixStandard} onSelect={(e) => setMatrixStandard(e.target.value)} /> :
                        <p>Matrix Standard: {matrixStandard}</p>
                    }
                </div>
                <Stepper steps={tabs} currentStep={currentTab} />
                <section>
                    {
                        currentTab === 'Likelihood' &&
                        <div className='flex flex-col gap-8'>
                            <LikelihoodDefinitionsTable matrixStandard={matrixStandard} likelihoodDefinitions={likelihoodDefinitions} onSetLikelihoodDefinitions={setLikelihoodDefinitions} />
                        </div>
                    }
                    {
                        currentTab === 'Impact Focus' &&
                        <div className='flex flex-col gap-8'>
                            <ImpactDefinitionsForm likelihoodDefinitions={likelihoodDefinitions} />
                        </div>
                    }
                </section>
            </form>
        </div>
    );
}

function MatricesDropdown({matrices, selected, onSelect}) {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <SelectDropdown name={'matrixStandard'} selected={selected} items={matrices} placeholder={'Select Matrix Standard'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} onSelect={onSelect} />
    );
}

export default RiskMatrixSetup;