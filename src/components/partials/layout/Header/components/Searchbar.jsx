import { useEffect, useState } from "react";
import searchIcon from "../../../../../assets/icons/search.svg";
import strategiesIcon from "../../../../../assets/icons/strategy-black.svg";
import risksIcon from "../../../../../assets/icons/risk-black.svg";
import settingsIcon from "../../../../../assets/icons/settings-black.svg";
import { LoaderIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { searchOptions } from "../../../../../queries/search-query";

export default function Searchbar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const searchTerm = searchParams.get('q') || '';
    const setSearchTerm = useDebouncedCallback(
        (value) => {
            const newSearchParams = new URLSearchParams(searchParams);

            if (value === '') newSearchParams.delete('q');
            else newSearchParams.set('q', value);

            setSearchParams(newSearchParams);
        },
        300
    );

    useEffect(() => {
        if (searchTerm !== '') setIsExpanded(true);
        else setIsExpanded(false);
    }, [searchTerm, isExpanded]);

    // fetch search result
    const {isLoading, error, data} = useQuery(searchOptions(searchTerm, {enabled: searchTerm !== ''}));

    const searchResults = data?.message;

    const resultSections = [
        {
            title: 'Strategies',
            icon: strategiesIcon,
            items: searchResults ? searchResults['Strategy'] : []
        },
        {
            title: 'Risks',
            icon: risksIcon,
            items: searchResults ? searchResults['Risk'] : []
        },
        {
            title: 'Settings and Preferences',
            icon: settingsIcon,
            items: searchResults ? searchResults['Settings & Preferences'] : []
        },
        {
            title: 'Users',
            icon: settingsIcon,
            items: searchResults ? searchResults['Users'] : []
        }
    ];

    return (
        <div className="self-stretch grow relative">
            <div className='relative h-full'>
                <input type='text' name='text' placeholder='Search' defaultValue={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='h-full w-full rounded-lg px-4 pl-12 border border-[#79747E] outline-text-pink'/>
                <img src={searchIcon}  alt='search icon' className='absolute top-3 left-3'/>
            </div>
            {
                isExpanded &&
                <div className="absolute mt-2 top-full z-50 bg-white w-full rounded-lg border border-[#ccc] p-3">
                    {
                        isLoading ?
                        <div className="w-full h-60 grid place-items-center">
                            <LoaderIcon width={64} height={64} className="animate-spin" />
                        </div> :
                        error ?
                        <div className="w-full h-60 grid place-items-center">
                            <p className="text-red-500">An error occurred while fetching search results.</p>
                        </div> :
                        <ul>
                            {
                                resultSections.map(section => {
                                    return (
                                        <li key={section.title}>
                                            <header className="bg-[#E0E0E0] rounded pl-3 py-2 text-sm font-medium flex gap-2 items-center">
                                                <img src={section.icon} alt="" />
                                                {section.title}
                                            </header>
                                            <ul className="flex flex-col gap-2 py-2 pl-10">
                                                {
                                                    section.items.length === 0 ?
                                                    <li className="text-text-gray">No results found</li> :
                                                    section.items.map(item => {
                                                        return (
                                                            <li key={item}>
                                                                <Item section={section.title} item={item} />
                                                            </li>
                                                        );
                                                    })
                                                }
                                            </ul>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    }
                </div>
            }
        </div>
    );
}

function Item({ section, item }) {
    switch (section) {
        case "Users":
            return (
                <p>
                    {item.name}
                    {" "}
                    <span className="text-text-gray">({item.email})</span>
                </p>
            );
        default:
            return (
                <p>{item}</p>
            );
    }
}