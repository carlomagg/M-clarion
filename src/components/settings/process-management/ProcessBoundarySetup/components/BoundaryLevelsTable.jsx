import React from 'react';
import { ColorChip } from "./Elements";
import { ViewButton, EditButton, DeleteButton } from "../../../risk-management/components/Buttons";

export default function BoundaryLevelsTable({ items = [], checkOverlap }) {
    // Ensure items is always an array
    const boundaries = Array.isArray(items) ? items : [];
    
    // Helper function to log button actions
    const logAction = (action, boundary) => {
        console.log(`${action} action for boundary:`, {
            id: boundary.id,
            description: boundary.description,
            boundary
        });
    };
    
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
                        <th className="py-3 px-5 font-medium">Actions</th>
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
                                    <td className="py-3 px-5 flex gap-2">
                                        <ViewButton 
                                            context={{ 
                                                mode: 'view', 
                                                id: boundary.id,
                                                boundaryData: boundary,
                                                modalType: 'processBoundary' 
                                            }} 
                                            onClick={() => logAction('View', boundary)}
                                        />
                                        <EditButton 
                                            context={{ 
                                                mode: 'edit', 
                                                id: boundary.id,
                                                boundaryData: boundary,
                                                checkOverlap, 
                                                modalType: 'processBoundary' 
                                            }} 
                                            onClick={() => logAction('Edit', boundary)}
                                        />
                                        <DeleteButton 
                                            context={{ 
                                                mode: 'delete', 
                                                id: boundary.id, 
                                                title: boundary.description, 
                                                modalType: 'processBoundary' 
                                            }} 
                                            onClick={() => logAction('Delete', boundary)}
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