import styles from './ManageRiskClassification.module.css';

import { useState } from 'react';
import { CreateNewItemButton, InfoButton } from '../components/Buttons';
import { createPortal } from 'react-dom';
import Modal from '../components/Modal';
import SearchField from '../../../partials/SearchField/SearchField';
import CategoriesTable from './components/CategoriesTable';
import ClassesTable from './components/ClassesTable';
import { useQueries } from '@tanstack/react-query';
import { riskCategoriesOptions } from '../../../../queries/risks/risk-categories';
import { riskClassesOptions } from '../../../../queries/risks/risk-classes';
import BackButton from '../../components/BackButton';

// return range of numbers from start to end (inclusive)
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

function ManageRiskClassification() {
    const [showModal, setShowModal] = useState(false);
    
    // queries
    const [categoriesQuery, classesQuery] = useQueries({
        queries: [riskCategoriesOptions(), riskClassesOptions()]
    });

    const isLoading = categoriesQuery.isLoading || classesQuery.isLoading;
    const error = categoriesQuery.error || classesQuery.error;

    if (isLoading) return <div>Loading</div>
    if (error) return <div>error</div>

    const categories = categoriesQuery.data;
    const classes = classesQuery.data;

    return (
        <div className='bg-white border border-[#CCC] p-6 flex flex-col gap-8'>
            {
                showModal &&
                createPortal(
                    <Modal 
                        type={showModal.type}
                        context={{mode: 'add'}}
                        onRemove={() => setShowModal(false)}
                    />,
                    document.body
                )
            }
            <header className='flex gap-3'>
                <BackButton />
                <h3 className='font-semibold text-xl'>Risk Classification</h3>
            </header>
            <CategoriesSection categories={categories} onSetShowModal={setShowModal} />
            <ClassesSection classes={classes} onSetShowModal={setShowModal} />
        </div>
    );
}

function CategoriesSection({categories, onSetShowModal}) {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCategories = categories.filter(c => new RegExp(searchTerm, 'i').test(c.category));
    return (
        <section className="flex flex-col gap-3">
            <div className='flex justify-between items-center'>
                <p className='flex gap-3 font-medium'>
                    Categories
                    <InfoButton />
                </p>
                <CreateNewItemButton text='Create New Risk Category' onClick={() => onSetShowModal({type: 'riskCategory'})} />
            </div>
            <SearchField placeholder={'Search categories'} searchTerm={searchTerm} onChange={setSearchTerm} />
            <CategoriesTable items={filteredCategories} />
        </section>
    );
}

function ClassesSection({classes, onSetShowModal}) {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredClasses = classes.filter(c => new RegExp(searchTerm, 'i').test(c.class_name));
    return (
        <section className="flex flex-col gap-3">
            <div className='flex justify-between items-center'>
                <p className='flex gap-3 font-medium'>
                    Classes
                    <InfoButton />
                </p>
                <CreateNewItemButton text='Create New Risk Class' onClick={() => onSetShowModal({type: 'riskClass'})} />
            </div>
            <SearchField placeholder={'Search risk classes'} searchTerm={searchTerm} onChange={setSearchTerm} />
            <ClassesTable items={filteredClasses} />
        </section>
    );
}

export default ManageRiskClassification;