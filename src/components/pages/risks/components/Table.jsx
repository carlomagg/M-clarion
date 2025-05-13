import OptionsDropdown from "../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import Chip from "./Chip";

export default function Table({type, items, hasSN, createRecordOptions, activeFilter = null}) {
    return (
        <div className='w-full'>
            <div className='rounded-lg text-[#3B3B3B] text-sm'>
                <header className='px-4 border-b border-b-[#B7B7B7] flex gap-4'>
                    {hasSN && <span className='py-4 flex-[.5_0]'>#</span>}
                    <span className='py-4 flex-[1_0] text-center'>Risk ID</span>
                    <span className='py-4 flex-[3_0]'>Title</span>
                    <span className='py-4 flex-[.5_0] text-center'>Rating</span>
                    <span className='py-4 flex-[1_0] text-center'>Category</span>
                    <span className={`py-4 flex-[1_0] text-center ${activeFilter === 'status' ? 'bg-blue-50 font-semibold rounded-t border-b-2 border-blue-500' : ''}`}>
                        {type === 'risk' ? 'Status' : 'Net Loss'}
                        {activeFilter === 'status' && <span className="ml-1 text-xs text-blue-600">(filtered)</span>}
                    </span>
                    <span className='py-4 flex-[2_0] text-center'>Owner</span>
                    <span className='py-4 flex-[.5_0]'></span>
                </header>
                <ul className='flex flex-col'>
                    {
                        items.map((item, i) => {
                            return (
                                <li key={i}>
                                    <TableRecord showSN={hasSN} record={{...item, sn: i+1}} type={type} options={createRecordOptions && createRecordOptions(item)} activeFilter={activeFilter} />
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        </div>
    );
}

function TableRecord({record, type, showSN, options, activeFilter = null}) {
    return (
        <div className='px-4 flex items-center gap-4'>
            {showSN && <span className='py-2 flex-[.5_0]'>{record['sn']}</span>}
            <span className='py-2 flex-[1_0] text-center'>
                <Chip text={record['risk_id'] || record['id']} color={'#DD127A'} type="risk_id" />
            </span>
            <span className='py-2 flex-[3_0]'>{record['Title'] || record['title']}</span>
            <span className='py-2 flex-[.5_0] text-center'>
                <Chip text={record['risk_rating'] || record['rating']} color={'#A97B03'} type="rating" />
            </span>
            <span className='py-2 flex-[1_0] text-center'>{record['category']}</span>
            <span className={`py-2 flex-[1_0] text-center ${activeFilter === 'status' ? 'bg-blue-50' : ''}`}>
                {
                    type === 'risk' ?
                    <Chip text={record['status']} color={'#1EC04E'} type="status" /> :
                    record['netLoss']
                }
            </span>
            <span className='py-2 flex-[2_0] text-center'>{record['Owner'] || '-'}</span>
            <span className='py-2 flex-[.5_0]'>
                {options && <OptionsDropdown options={options} />}
            </span>
        </div>
    );
}