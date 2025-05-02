import minimizeIcon from '../../../../assets/icons/minimize.svg';
import infoIcon from '../../../../assets/icons/info.svg';

export function CloseButton({onClose}) {
    return (
        <button type="button" onClick={onClose} className='rounded-[4px] border border-[#CFCFCF]/50 py-1 px-3 flex gap-2 text-xs items-center'>
            <img src={minimizeIcon} alt="" />
            Close
        </button>
    );
}

export function InfoButton({info}) {
    return (
        <button type="button">
            <img src={infoIcon} alt="info icon" />
        </button>
    );
}

export function CreateNewItemButton({text, onClick, classes = ''}) {
    return (
        <button 
            type="button" 
            onClick={onClick} 
            className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e0e0e0] rounded-[4px] hover:bg-gray-50 ${classes}`}
        >
            <span className="text-[#fd3db5] font-normal">+</span>
            <span className="text-sm font-normal text-[#333333]">{text}</span>
        </button>
    );
}

export function ViewButton({context}) {
    const handleClick = () => {
        const modalType = context.modalType || 'processBoundary';
        window.dispatchEvent(new CustomEvent('open-modal', {detail: {type: modalType, context}}));
    };

    return (
        <button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs" onClick={handleClick}>
            View
        </button>
    );
}

export function EditButton({context}) {
    const handleClick = () => {
        const modalType = context.modalType || 'processBoundary';
        window.dispatchEvent(new CustomEvent('open-modal', {detail: {type: modalType, context}}));
    };

    return (
        <button type="button" className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md text-xs" onClick={handleClick}>
            Edit
        </button>
    );
}

export function DeleteButton({context}) {
    const handleClick = () => {
        const modalType = context.modalType || 'processBoundary';
        window.dispatchEvent(new CustomEvent('open-modal', {detail: {type: modalType, context: {...context, mode: 'delete'}}}));
    };

    return (
        <button type="button" className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md text-xs" onClick={handleClick}>
            Delete
        </button>
    );
}