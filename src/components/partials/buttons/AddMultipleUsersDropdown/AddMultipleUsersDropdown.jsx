import { NavLink } from 'react-router-dom';

function AddMultipleUsersDropdown() {
    return (
        <NavLink to="/users/add-multiple-users" className='inline-flex bg-white rounded-lg cursor-pointer text-sm text-[#080808] absolute z-[1] top-0 right-0 select-none'>
            <button type='button' className='py-2 px-4'>
                Add multiple users
            </button>
        </NavLink>
    );
}

export default AddMultipleUsersDropdown;