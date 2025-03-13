import { FormCustomButton } from "../buttons/FormButtons/FormButtons";
import searchResultImage from '../../../assets/images/search-result.png';

export default function DialogFour({onBackClicked, onNextClicked}) {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col gap-10 flex-1">
                <div className="flex flex-col gap-5 text-[#343434]">
                    <h2 className="font-semibold text-2xl">
                        Find everything from one place
                    </h2>
                    <ul className="space-y-4">
                        <li>
                            1. Search anything using our Global Search Bar.
                        </li>
                        <li>
                            2. Use Filters to drill down to exactly what you need.
                        </li>
                        <li>
                            3. Quickly access recent activities and saved views.
                        </li>
                    </ul>
                </div>
                <div className="flex gap-4">
                    <FormCustomButton onClick={onBackClicked} text={'Back'} color="white" />
                    <FormCustomButton onClick={onNextClicked} text={'Next'} color="pink" />
                </div>
            </div>
            <div className="flex-1">
                <img src={searchResultImage} alt="search result image" className="h-full" />
            </div>
        </div>
    );
}