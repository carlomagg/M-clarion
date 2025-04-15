export default function ImpactDefinitionsTable({items, onItemSave}) {
    return (
        <div className='overflow-x-auto w-full'>
            <div className=' rounded-lg text-[#3B3B3B] text-sm'>
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    <span className='py-4 flex-[.5_0] text-center'>Score</span>
                    <span className='py-4 flex-[1.5_0]'>Description</span>
                    <span className='py-4 flex-[3_0]'>Criteria</span>
                </header>
                <ul className='flex flex-col'>
                    {
                        items.map((item, i) => {
                            return (
                                <li key={i}>
                                    <TableRecord record={item} />
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

function TableRecord({record}) {
    return (
        <div className='px-4 flex items-center gap-4'>
            <span className='py-2 flex-[.5_0] text-center'>{record['score']}</span>
            <span className='py-2 flex-[1.5_0]'>{record['description']}</span>
            <span className='py-2 flex-[3_0]'>{record['criteria']}</span>
        </div>
    );
}