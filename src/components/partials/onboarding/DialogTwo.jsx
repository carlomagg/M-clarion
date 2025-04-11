import { FormCustomButton } from "../buttons/FormButtons/FormButtons";
import navbarImage from '../../../assets/images/navbar.png';

export default function DialogTwo({onBackClicked, onNextClicked}) {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col gap-10 flex-[1.5]">
                <div className="flex flex-col gap-5 text-[#343434]">
                    <h2 className="font-semibold text-2xl">
                        Our system is organized into 3 core modules to simplify your work:
                    </h2>
                    <ul className="space-y-4">
                        <li>
                            <span className="font-bold">1. Strategy:</span>
                            {' '}Define strategic goals and track progress.
                        </li>
                        <li>
                            <span className="font-bold">2. Risk Management:</span>
                            {' '}Identify, assess, and mitigate risks.
                        </li>
                        <li>
                            <span className="font-bold">3. Compliance Tracking:</span>
                            {' '}Stay ahead of audits and regulatory needs.
                        </li>
                    </ul>
                    <p>
                        Switch between modules effortlessly using the main navigation bar.
                    </p>
                </div>
                <div className="flex gap-4">
                    <FormCustomButton onClick={onBackClicked} text={'Back'} color="white" />
                    <FormCustomButton onClick={onNextClicked} text={'Next'} color="pink" />
                </div>
            </div>
            <div className="flex-1">
                <img src={navbarImage} alt="navbar image" className="h-full" />
            </div>
        </div>
    );
}