import { FormCustomButton } from "../buttons/FormButtons/FormButtons";
import dashboardImage from '../../../assets/images/dashboard.png';

export default function DialogThree({onBackClicked, onNextClicked}) {
    return (
        <div className="flex gap-8">
            <div className="flex flex-col gap-10 flex-1">
                <div className="flex flex-col gap-5 text-[#343434]">
                    <h2 className="font-semibold text-2xl">
                        The Power of Your Dashboards
                    </h2>
                    <ul className="space-y-4">
                        <li>
                            1. Track Key Metrics for goals, risks, and compliance.
                        </li>
                        <li>
                            2. Quick Actions let you add tasks or reports instantly.
                        </li>
                        <li>
                            3. Alerts & Notifications keep you informed about critical updates.
                        </li>
                    </ul>
                </div>
                <div className="flex gap-4">
                    <FormCustomButton onClick={onBackClicked} text={'Back'} color="white" />
                    <FormCustomButton onClick={onNextClicked} text={'Next'} color="pink" />
                </div>
            </div>
            <div className="flex-1">
                <img src={dashboardImage} alt="dashboard image" className="h-full" />
            </div>
        </div>
    );
}