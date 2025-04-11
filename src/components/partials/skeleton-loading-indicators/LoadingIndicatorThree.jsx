import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingIndicatorContainer from "./LoadingIndicatorContainer";

export default function LoadingIndicatorThree() {
    return (
        <LoadingIndicatorContainer>
            <div className='p-10 h-full pt-4 max-w-7xl flex flex-col gap-6'>
                <div className='h-9 flex items-center justify-between'>
                    <Skeleton width={200} />
                    <div className="flex gap-4">
                        <Skeleton width={100} height={32} />
                        <Skeleton width={100} height={32} />
                        <Skeleton width={150} height={32} />
                    </div>
                </div>
                <div className=''>
                    <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                        <div className='flex justify-between mb-8'>
                            <Skeleton width={250} height={24} />
                            <div className='flex gap-3 items-center'>
                                <Skeleton width={120} height={32} />
                                <Skeleton width={120} height={32} />
                                <Skeleton width={120} height={32} />
                                <Skeleton width={120} height={32} />
                            </div>
                        </div>
                        <Skeleton count={8} style={{width: '100%', marginBottom: 20}} height={32} />
                    </div>
                </div>
            </div>
        </LoadingIndicatorContainer>
    );  
}