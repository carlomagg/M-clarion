import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingIndicatorContainer from "./LoadingIndicatorContainer";

export default function DashboardWidgetLoadingIndicator({height='', classes=''}) {
    return (
        <LoadingIndicatorContainer>
            <div className={`flex-1 flex flex-col gap-3 bg-white border border-[#CCCCCC] rounded-lg ${classes}`}>
                <Skeleton style={{width: '100%'}} />
                <Skeleton style={{width: '100%', minHeight: height}} />
                <Skeleton style={{width: '33%'}} />
            </div>
        </LoadingIndicatorContainer>
    );  
}