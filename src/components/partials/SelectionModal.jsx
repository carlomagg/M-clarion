import { createPortal } from "react-dom";
import { FormCancelButton, FormProceedButton } from "./buttons/FormButtons/FormButtons";
import SearchField from "./SearchField/SearchField";
import { useState } from "react";

export function SelectionModal({items, selectedIds, texts, onChange, onRemoveModal}) {
    const [searchTerm, setSearchTerm] = useState('');

    function handleChange(e, itemId) {
        onChange(e.target.checked, itemId);
    }
    
    const filteredItems = items.filter(item => new RegExp(searchTerm, 'i').test(item.name));

    return createPortal(
        <div className='fixed z-50 top-0 left-0 h-full w-full bg-black/50 grid place-items-center'>
            <div className='w-[500px] max-h-[600px] z bg-white rounded-lg py-5 px-6 flex flex-col gap-6'>
                <h4 className='font-semibold text-lg'>{texts.heading}</h4>
                <SearchField searchTerm={searchTerm} onChange={setSearchTerm} placeholder={texts.placeholder} />
                <ul className="overflow-auto text-sm">
                    {
                        filteredItems.map(item => {
                            return (
                                <li key={item.id} className='border-b border-b-[#B7B7B7] last:border-b-0'>
                                    <label className='p-4 inline-flex gap-6 items-center'>
                                        <input type="checkbox" name="" id="" checked={selectedIds.includes(item.id)} onChange={(e) => handleChange(e, item.id)} />
                                        <span>{item.name}</span>
                                    </label>
                                </li>
                            );
                        })
                    }
                </ul>
                <div className='flex gap-3'>
                    <FormCancelButton text={'Discard'} onClick={onRemoveModal} />
                    <FormProceedButton text={'Save'} onClick={onRemoveModal} />
                </div>
            </div>
        </div>,
        document.body
    )
}