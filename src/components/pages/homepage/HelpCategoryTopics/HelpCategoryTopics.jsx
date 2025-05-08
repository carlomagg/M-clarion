import styles from './HelpCategoryTopics.module.css';

import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { helpCategoryTopicsOptions } from '../../../../queries/homepage/help-guide-queries copy';
import { BASE_API_URL } from '../../../../utils/consts';
import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import BackButton from '../../../settings/components/BackButton';

function HelpCategoryTopics() {
    const { id: categoryId } = useParams();
    const navigate = useNavigate();
    const { isLoading, error, data: category } = useQuery(helpCategoryTopicsOptions(categoryId, {enabled: !!categoryId}));

    if (isLoading) return <div>loading</div>;
    if (error) return <div>error</div>;

    return (
        <div className='px-8 py-6 flex flex-col gap-6'>
            <PageTitle title={category.category_title} />
            
            {/* Back button and header */}
            <div className="flex items-center gap-4">
                <BackButton />
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back</span>
                </button>
                <PageHeader />
            </div>
            
            <div className='flex flex-col gap-8'>
                <h1 className='text-4xl text-[#232536] font-bold font-["Sen"]'>
                    {category.category_title}
                </h1>

                <article className='space-y-8'>
                    <p className='text-sm text-[#373950]'>
                    {category.category_note}
                    </p>
                </article>

                <div className='space-y-8'>
                    <ul className='grid grid-cols-3 gap-x-6 gap-y-10'>
                        {
                            category.help_topics.map((topic, i) => {
                                return (
                                    <li key={i}>
                                        <Link to={`topics/${topic.help_topic_id}`} className='flex flex-col gap-4'>
                                            <img src={`${BASE_API_URL}clarion_users${topic.help_topic_image}`} alt={topic.help_topic} className='w-full h-80 object-cover' />
                                            <h3 className='text-[#414040] text-xl font-bold'>{topic.help_topic}</h3>
                                        </Link>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default HelpCategoryTopics;