import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingIndicatorContainer from "../../../partials/skeleton-loading-indicators/LoadingIndicatorContainer";

export function ContentPlaceholder() {
    return (
        <LoadingIndicatorContainer>
            <div className='p-10 h-full pt-4 max-w-7xl flex flex-col gap-6'>
                <div className='h-9 flex items-center'>
                    <Skeleton width={200} />
                </div>
                <div className=''>
                    <h2 className='text-2xl font-semibold'>
                        <Skeleton width={250} />
                    </h2>
                    <div className='mt-4 flex flex-col gap-6'>
                        <div className='bg-white rounded-lg flex flex-col gap-6 p-6'>
                            <div className='text-sm text-text-gray flex items-center justify-stretch gap-6'>
                                <div className='grow'>
                                    <Skeleton />
                                </div>
                                {/* { link_element } */}
                                <div className='grow'>
                                    <Skeleton />
                                </div>
                                {/* { link_element } */}
                                <div className='grow'>
                                    <Skeleton />
                                </div>
                            </div>
                            <div className="grow">
                                <Skeleton height={250} />
                            </div>
                        </div>
                        <div className='flex gap-3'>
                            <button type="button" className='grow' >
                                <Skeleton height={40} />
                            </button>
                            <button type="button" className='grow'>
                                <Skeleton height={40} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LoadingIndicatorContainer>
    )   
}