import { useState } from "react";
import OptionsDropdown from "../../../../partials/dropdowns/OptionsDropdown/OptionsDropdown";
import Chip from "../../components/Chip";
import chevronDownIcon from '../../../../../assets/icons/chevron-down.svg';

export function Widget({children, classes = ''}) {
    return (
        <div className={`border border-[#CCC] rounded-lg bg-white ${classes}`}>
            {children}
        </div>
    )
}

export function Dropdown({items, selected, onSelect, hasBorder = false}) {
    const [isExpanded, setIsExpanded] = useState(false);

    function handleSelect(item) {
        onSelect(item);
        setIsExpanded(false);
    }

    return (
        <div className="relative">
            <button onClick={() => setIsExpanded(!isExpanded)} className={`flex gap-3 items-center text-sm font-medium cursor-pointer ${hasBorder ? 'border-[.5px] border-[#CFCFCF] py-1 px-3 rounded' : ''}`}>
                {selected}
                <img src={chevronDownIcon} alt="chevron down icon" className={`${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {
                isExpanded &&
                <div className="absolute bg-white z-20 top-full left-0 border border-[#CCC] rounded-md">
                    <ul className="">
                        {
                            items.map(item => {
                                return <li key={item} onClick={() => handleSelect(item)} className="cursor-pointer text-sm py-2 px-4 hover:bg-zinc-200">{item}</li>
                            })
                        }
                    </ul>
                </div>
            }
        </div>
    );
}

export function PeriodsDropdown({selected, onSelect}) {
    return <Dropdown items={['Day', 'Week', 'Month', 'Quarter', 'Year', 'Biannual']} selected={selected} onSelect={onSelect} />
}

export function Card({title, children, selectedPeriod, onSelectPeriod, filterableByPeriod = true, options = null, classes = ''}) {
    // return (
    //     <Widget classes={`flex flex-col gap-3 ${classes}`}>
    //         <div className="flex justify-between items-center pb-2 border-b border-b-[#CCC] self-stretch">
    //             <h4 className="font-medium text-sm whitespace-nowrap">{title}</h4>
    //             {options !== null && <OptionsDropdown options={[]} />}
    //         </div>
    //         {children}
    //         <PeriodsDropdown selected={selectedPeriod} onSelect={onSelectPeriod} />
    //     </Widget>
    // );
    const [isCollapsed, setIsCollapsed] = useState(false);
    const actions = [
        ...(options || []),
        {type: 'action', text: isCollapsed ? 'Expand' : 'Collapse', action: () => setIsCollapsed(!isCollapsed)}
    ]
    return (
        <Widget classes={`flex flex-col gap-3 ${classes}`}>
            <header className="flex justify-between items-center self-stretch">
                <h4 className="font-medium text-sm whitespace-nowrap">{title}</h4>
                {options !== null && <OptionsDropdown options={actions} />}
            </header>
            <hr className={`border border-[#CCC] self-stretch ${isCollapsed ? 'hidden' : ''}`} />
            {
                !isCollapsed &&
                <>
                    {children}
                    {filterableByPeriod && <PeriodsDropdown selected={selectedPeriod} onSelect={onSelectPeriod} />}
                </>
            }
        </Widget>
    );
}

export function CustomCard({title, data, status, selectedPeriod, onSelectPeriod}) {
    return (
        <Card title={title} selectedPeriod={selectedPeriod} onSelectPeriod={onSelectPeriod} classes="px-6 pt-6 pb-4 flex-1 items-start">
            <div className="flex gap-3">
                <span className="font-bold">{data.value}</span>
                <Chip color={status} text={data.comment} />
            </div>
        </Card>
    );
}

// return range of numbers from start to end (inclusive)
const range = (start, end) => Array.from({ length: end - start }, (_, i) => start + i);

export function PaginationBar({presentPage, onSetPage}) {
    const noOfPages = 2;
    return (
        <div className="flex gap-3 items-center">
            <button type="button" onClick={() => onSetPage(Math.max(presentPage - 1, 1))} className="border-[.5px] border-[#CFCFCF] text-sm rounded py-1 px-3 whitespace-nowrap">
                Previous Page
            </button>

            {
                noOfPages > 3 ?
                <>
                    <PaginationButton page={1} presentPage={presentPage} onSetPage={onSetPage} />
                    {presentPage - 1 > 1 && <span className="cursor-pointer">...</span>}

                    <PaginationButton 
                    page={
                        presentPage !== 1 && presentPage !== noOfPages ?
                        presentPage :
                        (
                            presentPage === 1 ?
                            presentPage + 1 :
                            presentPage - 1
                        )
                    }
                    presentPage={presentPage} onSetPage={onSetPage} />

                    {noOfPages - presentPage > 1 && <span className="cursor-pointer">...</span>}
                    <PaginationButton page={noOfPages} presentPage={presentPage} onSetPage={onSetPage} />
                </> :
                range(0,noOfPages).map(i => <PaginationButton key={i} page={i+1} presentPage={presentPage} onSetPage={onSetPage} />)
            }

            <button type="button" onClick={() => onSetPage(Math.min(presentPage + 1, noOfPages))} className="border-[.5px] border-[#CFCFCF] text-sm rounded py-1 px-3 whitespace-nowrap">
                Next Page
            </button>
        </div>
    );
}

export function PaginationButton({page, presentPage, onSetPage}) {
    const isActive = presentPage === page;
    return (
        <button type="button" onClick={() => !isActive && onSetPage(page)} className={`border-[.5px] text-sm rounded-full min-w-[30px] self-stretch ${isActive ? 'bg-[#DD127A1F] border-[#DD127A]' : 'border-[#CFCFCF]'}`}>
            {page}
        </button>
    );
}