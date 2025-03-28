import { useNavigate } from "react-router-dom";
import chevronIcon from '../../../assets/icons/chevron-black.svg';
import { FormCancelButton } from "../../partials/buttons/FormButtons/FormButtons";

export default function BackButton({type='small'}) {
    const navigate = useNavigate();
    return type === 'small' ?
        <button type="button" onClick={() => navigate(-1)} className="border border-[#CCC] rounded-full flex items-center justify-center p-[1px]">
            <img src={chevronIcon} alt="" className="-rotate-90" />
        </button> :
        <div className="w-1/3 flex">
            <FormCancelButton text={'Back'} onClick={() => navigate(-1)} />
        </div>
}