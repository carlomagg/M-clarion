import { FormCustomButton } from "../buttons/FormButtons/FormButtons";
import expertGuideImage from '../../../assets/images/expert-guide.png';

export default function DialogFive({onBackClicked, onNextClicked}) {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col gap-10 flex-1">
                <div className="flex flex-col gap-5 text-[#343434]">
                    <h2 className="font-semibold text-2xl">
                        We’ve Got Your Back
                    </h2>
                    <p>
                        Need help? Here’s where to find support:
                    </p>
                    <ul className="space-y-4">
                        <li>
                            <span className="font-bold">&bull; Expert Guides:</span>
                            {' '}Access to tutorials and best practices.
                        </li>
                        <li>
                            <span className="font-bold">&bull; Help Center:</span>
                            {' '}Access step-by-step guides and FAQs.
                        </li>
                        <li>
                            <span className="font-bold">&bull; Support Chat:</span>
                            {' '}Talk to a specialist anytime.
                        </li>
                    </ul>
                </div>
                <div className="flex gap-4">
                    <FormCustomButton onClick={onBackClicked} text={'Back'} color="white" />
                    <FormCustomButton onClick={onNextClicked} text={'Next'} color="pink" />
                </div>
            </div>
            <div className="flex-1">
                <img src={expertGuideImage} alt="expert guide image" className="h-full" />
            </div>
        </div>
    );
}