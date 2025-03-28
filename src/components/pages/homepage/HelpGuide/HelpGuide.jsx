import styles from './HelpGuide.module.css';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import { helpGuideOptions } from '../../../../queries/homepage/help-guide-queries copy';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BASE_API_URL } from '../../../../utils/consts';

function HelpGuide() {
    const { categoryId, topicId } = useParams();
    const { isLoading, error, data: helpGuide } = useQuery(helpGuideOptions(categoryId, topicId, {enabled: !!topicId}));

    if (!topicId) return <div>Invalid ID</div>
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>error</div>

    return (
        <div className='px-8 py-6 flex flex-col gap-6'>
            <PageTitle title={`${helpGuide.help_topic} | Help Guide`} />
            <PageHeader />
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