import { useQuery } from "@tanstack/react-query";
import SearchField from "../../../../partials/SearchField/SearchField";
import riskQueueOptions from "../../../../../queries/risks/risk-queue";
import Table from "../../components/Table";
import { useState } from "react";

export default function RiskQueue({}) {
    const [filterTerm, setFilterTerm] = useState('');

    // queries
    const {isLoading, error, data: risks} = useQuery(riskQueueOptions());

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const filteredRisks = risks.filter(risk => new RegExp(filterTerm, 'i').test(risk['Title']));

    return (
        <section  className='bg-white rounded-lg border border-[#CCC] p-6'>
            <div className='flex flex-col gap-6'>
                <h2 className='text-xl font-medium'>My Queue</h2>
                <SearchField placeholder="Search by ID or risk name" searchTerm={filterTerm} onChange={setFilterTerm} />
                <Table type={'risk'} items={filteredRisks} hasSN={false} createRecordOptions={null} />
            </div>
        </section>
    );
}