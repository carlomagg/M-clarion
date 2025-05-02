import React from 'react';
import { ColorChip } from "./Elements";
import ThreeDotsMenu from './ThreeDotsMenu';

export default function BoundaryLevelsTable({ items = [], checkOverlap }) {
    // Ensure items is always an array
    const boundaries = Array.isArray(items) ? items : [];
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse bg-white shadow-sm rounded-md">
                <thead className="text-left text-sm font-medium text-[#353535] border-b border-[#A0A0A0]">
                    <tr>
                        <th className="py-3 px-5 font-medium">#</th>
                        <th className="py-3 px-5 font-medium">Description</th>
                        <th className="py-3 px-5 font-medium">Lower Bound</th>
                        <th className="py-3 px-5 font-medium">Upper Bound</th>
                        <th className="py-3 px-5 font-medium">Color</th>
                        <th className="py-3 px-5 font-medium">Color Description</th>
                        <th className="py-3 px-5 font-medium"></th> {/* Empty header for actions */}
                    </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-200">
                    {boundaries.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center p-4 text-[#565656]">No process boundaries found</td>
                        </tr>
                    ) : (
                        boundaries.map((boundary, index) => {
                            return (
                                <tr key={boundary.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-5">{index + 1}</td>
                                    <td className="py-3 px-5">{boundary.description}</td>
                                    <td className="py-3 px-5">{boundary.lower_bound}</td>
                                    <td className="py-3 px-5">{boundary.higher_bound}</td>
                                    <td className="py-3 px-5 flex gap-2 items-center"><ColorChip color={boundary.colour} /> {boundary.colour}</td>
                                    <td className="py-3 px-5">{boundary.colour_description || '-'}</td>
                                    <td className="py-3 px-5 text-right relative">
                                        <ThreeDotsMenu 
                                            viewContext={{ 
                                                mode: 'view', 
                                                id: boundary.id,
                                                boundaryData: boundary,
                                                modalType: 'processBoundary' 
                                            }}
                                            editContext={{ 
                                                mode: 'edit', 
                                                id: boundary.id,
                                                boundaryData: boundary,
                                                checkOverlap, 
                                                modalType: 'processBoundary' 
                                            }}
                                            deleteContext={{ 
                                                mode: 'delete', 
                                                id: boundary.id, 
                                                title: boundary.description, 
                                                modalType: 'processBoundary' 
                                            }}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
} 