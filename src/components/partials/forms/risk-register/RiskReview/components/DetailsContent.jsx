import { useEffect, useRef } from "react";
import { Tag } from "./Elements";
import { SelectedItemsList } from "../../../../SelectedItemsList";

export default function DetailsContent({details}) {
    const descriptionElementRef = useRef(null);
    const noteElementRef = useRef(null);
    
    useEffect(() => {
        if (details) {
            descriptionElementRef.current.innerHTML = details.description || '';
            noteElementRef.current.innerHTML = details.risk_note || '';
        }
    }, [details]);

    // Early return if details is not available
    if (!details) {
        return <div>Loading details...</div>;
    }

    return (
        <div className='flex flex-col gap-9'>
            <div className='flex flex-col gap-6'>
                <h4 className='flex gap-4'>
                    <span className='font-semibold text-lg'>{details.risk_name}</span>
                    <Tag type={'id'} text={details.risk_id} />
                </h4>
                <div className='space-y-3'>
                    <h4 className="font-medium">Description</h4>
                    <div ref={descriptionElementRef} ></div>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-medium">Identification Tools</h4>
                    <SelectedItemsList list={details.identification_tool || []} editable={false} />
                </div>
                <div className='flex gap-5'>
                    <div className='space-y-3 flex-1'>
                        <h4 className="font-medium">Category</h4>
                        <p>{details.Category?.name || 'N/A'}</p>
                    </div>
                    <div className='space-y-3 flex-1'>
                        <h4 className="font-medium">Class</h4>
                        <p>{details.Class?.name || 'N/A'}</p>
                    </div>
                    <div className='space-y-3 flex-1'>
                        <h4 className="font-medium">Date Identified</h4>
                        <p>{details.date_identified || 'N/A'}</p>
                    </div>
                </div>
                <div className='space-y-3 flex-1'>
                    <h4 className="font-medium">Risk Owner</h4>
                    <p>{details.risk_owner?.name || 'N/A'}</p>
                </div>
            </div>
            <div className='flex flex-col gap-6'>
                <h3 className='font-medium text-lg'>Links</h3>
                <div className='space-y-3'>
                    <h4 className="font-medium">Risk Area</h4>
                    <p>{details.risk_area?.name || 'N/A'}</p>
                </div>
                <div className='flex gap-5'>
                    <div className='space-y-3 flex-1'>
                        <h4 className="font-medium">Linked Resources</h4>
                        <SelectedItemsList list={details.linked_resources || []} editable={false} />
                    </div>
                    <div className='space-y-3 flex-1'>
                        <h4 className="font-medium">Risk Triggers</h4>
                        <SelectedItemsList list={details.risk_triggers || []} editable={false} />
                    </div>
                </div>
            </div>
            <div className='flex flex-col gap-6'>
                <div className='space-y-3'>
                    <h4 className="font-medium">Risk Tags</h4>
                    <ul className='flex gap-2 flex-wrap'>
                        {
                            details.risk_tags ? String(details.risk_tags).split(',').map(tag => <li key={tag}><Tag type={'tag'} text={tag.trim()} /></li>) : null
                        }
                    </ul>
                </div>
                <div className='space-y-3'>
                    <h4 className="font-medium">Risk Note</h4>
                    <div ref={noteElementRef}></div>
                </div>
            </div>
        </div>
    );
}