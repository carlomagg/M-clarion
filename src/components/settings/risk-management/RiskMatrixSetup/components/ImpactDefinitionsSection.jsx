import { useEffect, useState } from "react";
import { InfoButton } from "../../components/Buttons";
import SearchField from "../../../../partials/SearchField/SearchField";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import chevronIcon from '../../../../../assets/icons/chevron-down.svg';
import ImpactDefinitionsTable from "./ImpactDefinitionsTable";
import { useDeleteRiskImpactFocus } from "../../../../../queries/risks/risk-impact-focus";
import { useQueryClient } from "@tanstack/react-query";
import useDispatchMessage from "../../../../../hooks/useDispatchMessage";

export function ImpactDefinitionsSection({impactDefinitions, onSetFocusedImpact, onSetMode}) {
    const [filterTerm, setFilterTerm] = useState('');

    // mutations
    const {isPending, mutate: deleteFocus} = useDeleteRiskImpactFocus({onSuccess, onError});

    const queryClient = useQueryClient();
    const dispatchMessage = useDispatchMessage();
    useEffect(() => {
        let text = 'Deleting Risk Impact Focus';
        (isPending) && dispatchMessage('processing', text);
    }, [isPending]);

    async function onSuccess(data) {
        await queryClient.invalidateQueries({queryKey: ['risks', 'impact-definitions']});
        await queryClient.invalidateQueries({queryKey: ['risks', 'impact-focii']});
        dispatchMessage('success', data.message);
    }
    function onError(error) {
        dispatchMessage('failed', error.response.data.message);
    }

    function createRecordOptions(impactDefinition) {
        const options = [
            {text: 'Edit', type: 'action', action: () => {onSetMode('edit'), onSetFocusedImpact(impactDefinition)}},
            {text: 'Delete', type: 'action', action: () => deleteFocus({id: impactDefinition.impact_focus.id})},
            {text: 'History', type: 'action', action: () => {}},
        ];
        
        return options;
    }
    
    const filteredDefinitions = impactDefinitions.filter(i => new RegExp(`${filterTerm}`, 'i').test(i.impact_focus.name));

    return (
        <div className="flex flex-col gap-3">
            <div className='flex gap-3 font-medium'>
                Impact Definitions
                <InfoButton />
            </div>
            <SearchField searchTerm={filterTerm} onChange={setFilterTerm} placeholder={'Search for Impact Focus'} />
            <ul className="flex flex-col gap-3">
                {
                    filteredDefinitions.map(impactDefinition => {
                        return (
                            <li key={impactDefinition.impact_focus.id}>
                                <ImpactDefinitionsItem impactDefinition={impactDefinition} options={createRecordOptions(impactDefinition)} />
                            </li>
                        );
                    })
                }
            </ul>
        </div>
    );
}

export function ImpactDefinitionsItem({impactDefinition, options}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <header className="flex items-center gap-4">
                <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="flex flex-1 p-4 rounded-t bg-[#EDEDED]">
                    {impactDefinition.impact_focus.name}
                    <span className="flex-1" />
                    <img src={chevronIcon} alt="" className={`${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <OptionsDropdown options={options} />
            </header>
            <div className={`${isExpanded ? 'max-h-[700px] overflow-auto' : 'max-h-0 overflow-hidden'}`}>
                <div className="mt-3">
                    <ImpactDefinitionsTable items={impactDefinition.impact_matrix} />
                </div>
            </div>
        </div>
    );
}