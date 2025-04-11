import { FormCustomButton } from "../buttons/FormButtons/FormButtons";
import mclarionLogo from '../../../assets/mclarion-logo.svg';

export default function DialogSix({onBackClicked, onDoneClicked}) {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5 text-[#343434] items-center text-center">
                <img src={mclarionLogo} alt="" />
                <h1 className="font-semibold text-4xl">You’re Good to Go!</h1>
                <p>Are Ready to dive in? You can revisit this tour anytime from the Help menu.</p>
            </div>
            <div className="flex gap-4">
                <FormCustomButton onClick={onBackClicked} text={'Back'} color="white" />
                <FormCustomButton onClick={onDoneClicked} text={'Done'} color="pink" />
            </div>
        </div>
    );
}