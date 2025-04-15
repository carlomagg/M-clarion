export function SelectedItemsList({list, editable, onRemove}) {
    return list.length > 0 ?
    <ul className='flex flex-wrap gap-2'>
        {
            list.map((o, i) => {
                return <li key={o.id} className='flex gap-2 items-center text-sm'>
                    <span>{i + 1}.</span>
                    <div className='flex gap-2 py-1 px-4 bg-[#CDF8EB] rounded-full text-[#025D63] items-center'>
                        <span className="">
                            {o.name || o.text}
                        </span>
                        {
                            editable &&
                            <button type="button" onClick={() => onRemove(o)} className='rounded-full w-4 h-4 bg-[#0A0005] text-[#CDF8EB] shrink-0 flex items-center justify-center'>&#215;</button>
                        }
                    </div>
                </li>
            })
        }
    </ul> :
    null
}