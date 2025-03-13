import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingIndicatorContainer from "./LoadingIndicatorContainer";

export default function LoadingIndicatorTwo() {
    return (
        <LoadingIndicatorContainer>
            <div className='p-10 h-full pt-4 max-w-7xl flex flex-col gap-6'>
                <div className='h-9 flex items-center justify-between'>
                    <Skeleton width={200} />
                    <Skeleton width={200} height={36} />
                </div>
                <div className=''>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <Skeleton width={250} height={24} />
                        <ul className="flex flex-col gap-6">
                            {
                                [1,1,1,1,1].map((_, i) => {
                                    return (
                                        <li key={i} className="flex gap-4 h-16">
                                            <Skeleton circle width={64} height={64} />
                                            <div className="flex flex-col gap-2">
                                                <Skeleton width={250} height={24} />
                                                <Skeleton width={250} />
                                            </div>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </LoadingIndicatorContainer>
    )   
}