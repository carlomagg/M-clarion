import { useEffect, useState } from 'react';
import SelectDropdown from '../SelectDropdown/SelectDropdown';
import styles from './StateSelector.module.css';

function StateSelector({states, selected = null, onSelect}) {

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [items, setItems] = useState(states.length > 0 ? states.map(s => ({id: s.state_id, text: s.state_name})) : []);

    useEffect(() => {
        if (states) setItems(states.map(state => ({id: state.state_id, text: state.state_name})));
    }, [states]);
    
    return <SelectDropdown items={items} name={'company_state_id'} selected={selected} onSelect={onSelect} label={'State'} placeholder={'Select state'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

export default StateSelector;