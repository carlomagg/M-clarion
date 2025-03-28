import { useEffect, useState } from 'react';
import SelectDropdown from '../SelectDropdown/SelectDropdown';
import styles from './CitySelector.module.css';

function CitySelector({selectedState, cities, selected = null, onSelect}) {

    const [isCollapsed, setIsCollapsed] = useState(true);
    const [items, setItems] = useState(cities.length > 0 ? cities.map(c => ({id: c.id, text: c.name})) : []);
    const [isFirstMount, setIsFirstMount] = useState(true);

    useEffect(() => {
        if (cities) setItems(cities.map(city => ({id: city.id, text: city.name})));
    }, [cities]);

    useEffect(() => {
        if (isFirstMount) {
            setIsFirstMount(false);
            return;
        }
        onSelect({target: {name: 'company_city_id', value: ''}})
    }, [selectedState])
    
    return <SelectDropdown items={items} name={'company_city_id'} selected={selected} onSelect={onSelect} label={'City'} placeholder={'Select city'} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} />
}

export default CitySelector;