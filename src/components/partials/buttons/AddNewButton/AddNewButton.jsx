import styles from './AddNewButton.module.css';

import plusIcon from '../../../../assets/icons/rounded-plus.svg';
import smallPlusIcon from '../../../../assets/icons/plus.svg';

function AddNewButton({onClick, text, small = false, smallest = false}) {
    return !smallest ?
            <div className='flex-1 flex items-center justify-center'>
                <button type='button' className={`flex ${small ? 'gap-1' : 'flex-col'} items-center cursor-pointer`} onClick={onClick}>
                    <img src={plusIcon} className={`${small && 'w-6 h-6'}`}  />
                    <span className={`${small ? 'font-medium' : 'text-lg font-bold'}`}>{text}</span>
                </button>
            </div> :
            <button type="button" onClick={onClick} className='rounded-lg border border-[#CCCCCC] self-end p-3'>
                <img src={smallPlusIcon} alt="" />
            </button>
}

export default AddNewButton;