import React from 'react'
import './ExpertGuide.module.css'
import { useParams } from 'react-router-dom';
import { expertGuideOptions } from '../../../../queries/homepage/expert-guide-queries';
import { useQuery } from '@tanstack/react-query';
import { BASE_API_URL } from '../../../../utils/consts';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import PageHeader from '../../../partials/PageHeader/PageHeader';

function ExpertGuide() {
    const {id} = useParams();
    const { isLoading, error, data: expertGuide } = useQuery(expertGuideOptions(id, {enabled: !!id}));

    if (!id) return <div>Invalid ID</div>
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>error</div>

    return (
        <div className='px-8 py-6 flex flex-col gap-6'>
            <PageTitle title={`${expertGuide.title} | Expert Guide`} />
            <PageHeader />
            <div className='flex flex-col gap-8'>
                <h1 className='text-4xl text-[#232536] font-bold font-["Sen"]'>
                    {expertGuide.title}
                </h1>

                <div>
                    <video controls className='bg-black/50 w-full aspect-video'>
                        <source src={`${BASE_API_URL}clarion_users${expertGuide.help_content_video}`} />
                    </video>
                </div>

                <article className='space-y-8'>
                    <h2 className='text-[#414040] font-bold text-3xl'>
                        {expertGuide.content_caption}
                    </h2>
                    <p className='text-sm text-[#373950]'>
                        {expertGuide.content}
                    </p>
                    <div>
                        <img src={`${BASE_API_URL}clarion_users${expertGuide.help_content_image}`} alt="" className='' />
                    </div>
                </article>
            </div>
        </div>
    );
}

export default ExpertGuide;