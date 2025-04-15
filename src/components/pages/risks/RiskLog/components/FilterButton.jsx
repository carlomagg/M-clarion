import filterIcon from '../../../../../assets/icons/filter.svg';

export default function FilterButton({onClick}) {
    return (
        <button type="button" onClick={onClick} className="rounded-lg border border-border-gray p-3">
            <img src={filterIcon} alt="" />
        </button>
    );
}