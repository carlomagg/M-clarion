import styles from './SearchField.module.css';

import searchIcon from '../../../assets/icons/search.svg';

function SearchField({placeholder, searchTerm, onChange}) {
    return (
        <div className='relative'>
            <img src={searchIcon} alt="search icon" className='absolute top-3 left-3' />
            <input type="text" value={searchTerm} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className='w-full border border-border-gray rounded-lg p-3 pl-11 outline-text-pink placeholder:text-placeholder-gray' />
        </div>
    );
}

export default SearchField;