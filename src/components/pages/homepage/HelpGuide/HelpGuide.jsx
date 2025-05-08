import styles from './HelpGuide.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import BackButton from '../../../settings/components/BackButton';
import { helpGuideOptions } from '../../../../queries/homepage/help-guide-queries copy';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BASE_API_URL } from '../../../../utils/consts';

function HelpGuide() {
    const { categoryId, topicId } = useParams();
    const navigate = useNavigate();
    const { isLoading, error, data: helpGuide } = useQuery(helpGuideOptions(categoryId, topicId, {enabled: !!topicId}));

    if (!topicId) return <div>Invalid ID</div>
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>error</div>

    return (
        <div className='px-8 py-6 flex flex-col gap-6'>
            <PageTitle title={`${helpGuide.help_topic} | Help Guide`} />
            
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
                    {helpGuide.help_topic}
                </h1>

                <div>
                    <video controls className='bg-black/50 w-full aspect-video'>
                        <source src={`${BASE_API_URL}clarion_users${helpGuide.help_topic_video}`} />
                    </video>
                </div>

                <article className='space-y-8'>
                    <p className='text-sm text-[#373950]'>
                        {helpGuide.help_topic_description}
                    </p>
                    <div>
                        <img src={`${BASE_API_URL}clarion_users${helpGuide.help_topic_image}`} alt="" className='' />
                    </div>
                </article>
            </div>
        </div>
    );
}

export default HelpGuide;