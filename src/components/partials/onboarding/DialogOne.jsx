import { FormCustomButton } from "../buttons/FormButtons/FormButtons";
import mclarionLogo from '../../../assets/mclarion-logo.svg';

export default function DialogOne({onSkipTourClicked, onStartTourClicked}) {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5 text-[#343434] items-center text-center">
                <img src={mclarionLogo} alt="" />
                <h1 className="font-semibold text-4xl">Welcome To M-Clarion</h1>
                <p>Let’s get you started. Take a quick tour to see how you can set goals, track progress, and make smarter decisions, all in one place. It’ll only take a minute.</p>
            </div>
            <div className="flex gap-4">
                <FormCustomButton onClick={onSkipTourClicked} text={'Skip'} color="white" />
                <FormCustomButton onClick={onStartTourClicked} text={'Start Tour'} color="pink" />
            </div>
        </div>
    );
}