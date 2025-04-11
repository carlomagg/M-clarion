import React from 'react'
import chevronRight from "../../../../assets/icons/tiny-icon.svg"
import './Home.css'
import { useQueries, useQuery } from '@tanstack/react-query'
import { topFourExpertGuidesOptions } from '../../../../queries/homepage/expert-guide-queries'
import { BASE_API_URL } from '../../../../utils/consts'
import { Link } from 'react-router-dom'
import { topFiveCategoriesOptions } from '../../../../queries/homepage/help-guide-queries copy'

function Home() {
    const [expertGuidesQuery, helpCategoriesQuery] = useQueries({
        queries: [topFourExpertGuidesOptions(), topFiveCategoriesOptions()]
    });

    const isLoading = expertGuidesQuery.isLoading || helpCategoriesQuery.isLoading;
    const error = expertGuidesQuery.error || helpCategoriesQuery.error;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-red-600">
                    Error loading data. Please try again later.
                    {error.message && <div className="text-sm mt-2">{error.message}</div>}
                </div>
            </div>
        );
    }

    const expertGuides = expertGuidesQuery.data || [];
    const helpCategories = helpCategoriesQuery.data || [];

    return (
        <div className='px-8 py-6 max-w-7xl flex flex-col gap-6'>
            <div className='flex flex-col gap-6'>
                <h2 className='text-2xl font-semibold border-b border-[#7B7B7B] pb-2'>
                    Expert Guides
                </h2>

                {expertGuides.length > 0 ? (
                    <ul className='grid grid-cols-2 gap-6 w-full'>
                        {expertGuides.map((guide, i) => (
                            <li key={guide.help_content_id}>
                                <Link to={`/expert-guides/${guide.help_content_id}`} className='bg-white border-[0.5px] border-[#DDD] rounded-lg p-4 flex flex-col gap-4'>
                                    <div className=''>
                                        <img src={`${BASE_API_URL}clarion_users${guide.help_content_image}`} alt={guide.title} className='w-full h-72 object-cover'/>
                                    </div>
                                    <div className='flex items-center justify-between cursor-pointer'>
                                        <span className=''>{guide.title}</span>
                                        <span className=''>
                                            <img src={chevronRight} alt='' className=''/>
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4">No expert guides available</div>
                )}

                <Link to={'expert-guides'} className='bg-white cursor-pointer select-none flex gap-4 items-center py-3 px-6 border border-text-pink rounded-lg w-fit'>
                    <span className='font-semibold text-text-pink'>View more guides</span>
                    <span className=''>
                        <img src={chevronRight} alt='' className=''/>
                    </span>
                </Link>
            </div>

            <div className='flex flex-col gap-6'>
                <h2 className='text-2xl font-semibold border-b border-[#7B7B7B] pb-2'>
                    Help and Support
                </h2>

                {helpCategories.length > 0 ? (
                    <ul className='flex flex-col gap-2'>
                        {helpCategories.map(category => (
                            <li key={category.help_category_id}>
                                <Link to={`/help-categories/${category.help_category_id}`} className='bg-white rounded-lg text-[15px] border border-[#DDD] py-4 px-6 cursor-pointer flex items-center justify-between'>
                                    <span className=''>{category.category_title}</span>
                                    <span className=''>
                                        <img src={chevronRight} alt='' className=''/>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4">No help categories available</div>
                )}

                <Link to={'help-categories'} className='bg-white cursor-pointer select-none flex gap-4 items-center py-3 px-6 border border-text-pink rounded-lg w-fit'>
                    <span className='font-semibold text-text-pink'>View more</span>
                    <span className=''>
                        <img src={chevronRight} alt='' className=''/>
                    </span>
                </Link>
            </div>
        </div>
    )
}

export default Home;