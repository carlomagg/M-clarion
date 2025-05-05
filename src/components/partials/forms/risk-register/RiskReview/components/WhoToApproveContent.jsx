import { useState, useEffect } from "react";
import SelectDropdown from "../../../../dropdowns/SelectDropdown/SelectDropdown";

export default function WhoToApproveContent({users, selectedId, onSelectUser}) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [filterTerm, setFilterTerm] = useState('');

    // Add some logging to debug the inputs
    useEffect(() => {
        console.log("WhoToApproveContent - Available users:", users);
        console.log("WhoToApproveContent - Selected ID:", selectedId);
    }, [users, selectedId]);

    // Ensure there are users to select from
    if (!users || users.length === 0) {
        return <div className="p-4 text-red-500">No users available to select from. Please contact an administrator.</div>;
    }

    const filteredUsers = users.filter(o => new RegExp(filterTerm, 'i').test(o.text));
    
    // Create a handler to properly process the selection
    const handleSelect = (e) => {
        console.log("WhoToApproveContent - Select event:", e.target.value);
        onSelectUser(e.target.value);
    };
    
    return (
        <div className=''>
            <SelectDropdown 
                placeholder={'Select Who To Approve'} 
                items={filteredUsers} 
                name={'user_id'} 
                selected={selectedId} 
                onSelect={handleSelect} 
                isCollapsed={isCollapsed} 
                onToggleCollpase={setIsCollapsed} 
                filterable={true} 
                filterTerm={filterTerm} 
                setFilterTerm={setFilterTerm} 
            />
        </div>
    );
}