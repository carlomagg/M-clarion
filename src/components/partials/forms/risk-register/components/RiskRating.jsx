import { useQuery } from "@tanstack/react-query";
import { riskBoundariesOptions } from "../../../../../queries/risks/risk-boundaries";
import { useState, useEffect } from "react";

export default function RiskRating({riskRating}) {
    // Handle different types of riskRating input (number, string, or object with score property)
    let weight;
    let displayValue;
    
    // Store the original value for debugging
    const originalValue = riskRating;
    
    // Convert string numbers to actual numbers for comparison
    const convertToNumericValue = (value) => {
        // If it's a valid number string like "25", convert it to number
        if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
            return Number(value);
        }
        return value;
    };
    
    const numericRiskRating = convertToNumericValue(riskRating);
    
    if (typeof riskRating === 'object' && riskRating !== null && riskRating.score !== undefined) {
        // If it's an object with a score property
        weight = Number(riskRating.score);
        displayValue = riskRating.score;
    } else if (riskRating === '' || riskRating === null || riskRating === undefined) {
        // Handle empty or null values
        weight = NaN;
        displayValue = 'N/A';
    } else if (numericRiskRating === 0 || numericRiskRating) {
        // If it's a valid number (including zero)
        weight = Number(numericRiskRating);
        // Always show the actual number, including 0
        displayValue = weight.toString();
    } else {
        // For any other type, just use the value as is
        weight = isNaN(Number(riskRating)) ? NaN : Number(riskRating);
        displayValue = riskRating.toString();
    }
    
    // Use the risk boundaries to determine the color
    const { data: boundaries = [] } = useQuery(riskBoundariesOptions());
    
    // Get the boundary-based color
    const [color, setColor] = useState('#D9D9D9'); // Default gray

    useEffect(() => {
        if (!boundaries || boundaries.length === 0) {
            console.log('No boundaries available for risk rating', weight);
            setColor('#D9D9D9');
            return;
        }
        
        if (weight === undefined || isNaN(weight)) {
            console.log('Invalid weight for risk rating', weight);
            setColor('#D9D9D9');
            return;
        }
        
        // Log all boundaries for debugging
        console.log('Available boundaries:', JSON.stringify(boundaries));
        
        // Find the matching boundary
        const boundary = boundaries.find(b => 
            weight >= b.lower_bound && 
            weight <= b.higher_bound
        );
        
        if (boundary) {
            console.log(`Found boundary for rating ${weight}:`, boundary);
            // Check if color is present in the boundary object
            if (boundary.colour) {
                setColor(boundary.colour);
                console.log(`Using boundary color: ${boundary.colour}`);
            } else if (boundary.color) {
                // Some implementations might use 'color' instead of 'colour'
                setColor(boundary.color);
                console.log(`Using boundary color: ${boundary.color}`);
            } else {
                console.log('Boundary found but no color property available:', boundary);
                // Fallback to default color logic
                if (weight <= 5) {
                    setColor('#17A865'); // Low risk (green)
                } else if (weight <= 10) {
                    setColor('#7BD148'); // Medium-low risk (light green)
                } else if (weight <= 15) {
                    setColor('#FFC25B'); // Medium risk (yellow/amber)
                } else if (weight <= 20) {
                    setColor('#F68D2B'); // Medium-high risk (orange)
                } else {
                    setColor('#FB3822'); // High risk (red)
                }
            }
        } else {
            console.log(`No specific boundary found for rating ${weight}, using default color`);
            // If no boundary is found, fallback to default colors based on risk level
            if (weight <= 5) {
                setColor('#17A865'); // Low risk (green)
            } else if (weight <= 10) {
                setColor('#7BD148'); // Medium-low risk (light green)
            } else if (weight <= 15) {
                setColor('#FFC25B'); // Medium risk (yellow/amber)
            } else if (weight <= 20) {
                setColor('#F68D2B'); // Medium-high risk (orange)
            } else {
                setColor('#FB3822'); // High risk (red)
            }
        }
    }, [boundaries, weight]);
    
    // Enhanced debugging
    console.log('Rendering RiskRating:', {
        originalValue,
        numericRiskRating,
        weight,
        displayValue,
        color,
        boundariesCount: boundaries?.length,
        boundariesSample: boundaries?.slice(0, 3)
    });
    
    return (
        <button 
            style={{
                backgroundColor: color,
                color: '#FFFFFF'  // White text for better contrast on solid background
            }} 
            type="button" 
            className='grid place-items-center text-lg w-44 h-12 rounded-md'
        >
            {displayValue}
        </button>
    );
}