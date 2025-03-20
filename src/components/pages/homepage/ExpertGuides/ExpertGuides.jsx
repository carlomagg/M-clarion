import styles from './ExpertGuides.module.css';

import { useQuery } from '@tanstack/react-query';
import { expertGuidesOptions } from '../../../../queries/homepage/expert-guide-queries';
import { Link } from 'react-router-dom';
import { BASE_API_URL } from '../../../../utils/consts';
import chevronRight from "../../../../assets/icons/tiny-icon.svg";

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';

function ExpertGuides() {
    const { isLoading, error, data: expertGuides } = useQuery(expertGuidesOptions());

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>error</div>

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Expert Guides'} />
            <PageHeader />
            <div className='flex flex-col gap-6'> {/* main content container */}
                <h2 className='text-2xl font-semibold border-b border-[#7B7B7B] pb-2'>
                    Expert Guides
                </h2>
                    <ul className='grid grid-cols-2 gap-6 w-full'>
                    {
                        expertGuides.map((guide, i) => {
                            return (
                                <li key={guide.help_content_id}>
                                    <Link to={`/expert-guides/${guide.help_content_id}`} className='bg-white border-[0.5px] border-[#DDD] rounded-lg p-4 flex flex-col gap-4'>
                                        <div className='relative w-full h-72'>
                                            <img 
                                                src={`${BASE_API_URL}clarion_users${guide.help_content_image}`}  
                                                alt={guide.title} 
                                                className='w-full h-full object-cover rounded-md'
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/fallback-image.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className='flex items-center justify-between cursor-pointer'>
                                            <span className=''>{guide.title}</span>
                                            <span className=''>
                                                <img src={chevronRight}  alt='' className=''/>
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

export default ExpertGuides;