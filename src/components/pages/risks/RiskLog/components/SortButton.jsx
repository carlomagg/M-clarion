import sortIcon from '../../../../../assets/icons/sort.svg';
import ascSortIcon from '../../../../../assets/icons/sort-asc.svg';
import descSortIcon from '../../../../../assets/icons/sort-desc.svg';

export default function SortButton({text, onClick, isActive, sortOrder}) {
    const icon = sortOrder !== null ?
    (sortOrder === 0 ? ascSortIcon : descSortIcon) :
    sortIcon;

    return (
        <button type="button" onClick={onClick} className={`rounded-lg border-2 ${isActive ? 'border-text-pink' : 'border-border-gray'} p-3 flex gap-[10px] items-center text-[#3B3B3B] text-sm`}>
            {text}
            <img src={icon} alt="" />
        </button>
    );
}