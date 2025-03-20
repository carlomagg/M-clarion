import styles from './HelpCategories.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { helpCategoriesOptions } from '../../../../queries/homepage/help-guide-queries copy';
import { useQuery } from '@tanstack/react-query';
import { BASE_API_URL } from '../../../../utils/consts';
import { Link } from 'react-router-dom';
import chevronRight from "../../../../assets/icons/tiny-icon.svg"

function HelpCategories() {
    const { isLoading, error, data: helpCategories } = useQuery(helpCategoriesOptions());

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>error</div>

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Help Support Categories'} />
            <PageHeader />
            <div className='flex flex-col gap-6'> {/* main content container */}
                <h2 className='text-2xl font-semibold border-b border-[#7B7B7B] pb-2'>
                    Help Support Categories
                </h2>
                    <ul className='grid grid-cols-2 gap-6 w-full'>
                    {
                        helpCategories.map((category, i) => {
                            return (
                                <li key={category.help_category_id}>
                                    <Link to={`${category.help_category_id}`} className='bg-white border-[0.5px] border-[#DDD] rounded-lg p-4 flex flex-col gap-4'>
                                        <div className=''>
                                            <img src={`${BASE_API_URL}clarion_users${category.category_image}`}  alt={category.category_title} className='w-full h-72 object-cover'/>
                                        </div>
                                        <div className='flex items-center justify-between cursor-pointer'>
                                            <span className=''>{category.category_title}</span>
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

export default HelpCategories;