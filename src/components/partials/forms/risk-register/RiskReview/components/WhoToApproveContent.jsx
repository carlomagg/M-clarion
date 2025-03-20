import { useState } from "react";
import SelectDropdown from "../../../../dropdowns/SelectDropdown/SelectDropdown";

export default function WhoToApproveContent({users, selectedId, onSelectUser}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    const filteredUsers = users.filter(o => new RegExp(filterTerm, 'i').test(o.text));
    return (
        <div className=''>
            <SelectDropdown placeholder={'Select Who To Approve'} items={filteredUsers} name={'user_id'} selected={selectedId} onSelect={(e) => onSelectUser(e.target.value)} isCollapsed={isCollapsed} onToggleCollpase={setIsCollapsed} filterable={true} filterTerm={filterTerm} setFilterTerm={setFilterTerm} />
        </div>
    );
}