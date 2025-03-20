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
        <button type="button" onClick={onClick} className={`border border-[#CCC] py-2 px-4 rounded-lg font-medium text-sm text-text-pink ${classes}`}>
            {text}
        </button>
    );
}