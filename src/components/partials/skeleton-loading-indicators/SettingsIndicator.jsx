import Skeleton from "react-loading-skeleton";
import LoadingIndicatorContainer from "./LoadingIndicatorContainer";

export function DetailsLoadingIndicator() {
    return (
        <LoadingIndicatorContainer>
            <div className='p-6 flex flex-col gap-8'>
                <div className='flex justify-between relative'>
                    <Skeleton width={250} height={32} />
                    <Skeleton width={120} height={24} />
                </div>
                <div className='flex flex-col gap-6'>
                    <div className='flex gap-6'>
                        <div className='flex flex-col gap-3 flex-1'>
                            <Skeleton width={180} />
                            <Skeleton width={150} />
                        </div>
                        <div className='flex flex-col gap-3 flex-1'>
                            <Skeleton width={180} />
                            <Skeleton width={150} />
                        </div>
                    </div>
                    <div className='flex gap-6'>
                        <div className='flex flex-col gap-3 flex-1'>
                            <Skeleton width={180} />
                            <Skeleton width={150} />
                        </div>
                        <div className='flex flex-col gap-3 flex-1'>
                            <Skeleton width={180} />
                            <Skeleton width={150} />
                        </div>
                    </div>
                </div>
            </div>
        </LoadingIndicatorContainer>
    );
}

export function ListLoadingIndicator() {
    return (
        <LoadingIndicatorContainer>
            <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-4 min-h-full'>
                <div className='flex flex-col gap-3'>
                    <Skeleton width={200} />
                    <Skeleton height={40} />
                </div>
                <div className=''>
                    {
                        [1,2,3,4,5].map((_, i) => {
                            return (
                                <div key={i} className='flex p-4'>
                                    <span className='flex-[0_1_25rem]'>
                                        <Skeleton width={200} />
                                    </span>
                                    <span className='ml-5'>
                                        <Skeleton width={200} style={{borderRadius: '8px'}} /> 
                                    </span>
                                </div>
                            )
                        })
                    }
                </div>
                <div className='flex justify-end'>
                    <Skeleton width={200} height={36} style={{borderRadius: '8px'}} />
                </div>
            </div>
        </LoadingIndicatorContainer>
    );
}

export function FormLoadingIndicator() {
    return (
        <LoadingIndicatorContainer>
            <div className='p-6 flex flex-col gap-8'>
                <Skeleton width={250} height={32} />
                <div className='flex flex-col gap-8'>
                    <div className='flex gap-6'>
                        <div className='flex flex-col gap-3 flex-1'>
                            <Skeleton width={180} />
                            <Skeleton width={150} />
                        </div>
                        <div className='flex flex-col gap-3 flex-1'>
                            <Skeleton width={180} />
                            <Skeleton width={150} />
                        </div>
                    </div>
                    <div className='flex flex-col gap-3 flex-1'>
                        <Skeleton width={180} />
                        <Skeleton width={'100%'} />
                    </div>
                    <div className='flex gap-3'>
                        <div className='grow' >
                            <Skeleton height={40} />
                        </div>
                        <div className='grow'>
                            <Skeleton height={40} />
                        </div>
                    </div>
                </div>
            </div>
        </LoadingIndicatorContainer>
    );
}