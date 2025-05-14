import { useQuery } from "@tanstack/react-query";
import { riskBoundariesOptions } from "../../../../queries/risks/risk-boundaries";
import { useState, useEffect } from "react";

// Hook to get the color based on risk rating and boundaries
function useRatingColor(rating) {
    const { data: boundaries = [] } = useQuery(riskBoundariesOptions());
    const [color, setColor] = useState(null);
    
    useEffect(() => {
        if (!boundaries || boundaries.length === 0) {
            console.log('No boundaries available for rating', rating);
            return;
        }
        
        if (!rating) {
            console.log('No rating provided');
            return;
        }
        
        // Convert rating to number for comparison
        const numericRating = Number(rating);
        if (isNaN(numericRating)) {
            console.log('Invalid rating (not a number):', rating);
            return;
        }
        
        // Log all boundaries for debugging
        console.log('Available boundaries for Chip:', JSON.stringify(boundaries));
        
        // Find the matching boundary
        const boundary = boundaries.find(b => 
            numericRating >= b.lower_bound && 
            numericRating <= b.higher_bound
        );
        
        if (boundary) {
            console.log(`Found boundary for rating ${rating}:`, boundary);
            // Check if color is present in the boundary object - prioritize 'color' spelling
            if (boundary.color) {
                setColor(boundary.color);
                console.log(`Using boundary color: ${boundary.color}`);
            } else if (boundary.colour) {
                // Fallback to British spelling if needed
                setColor(boundary.colour);
                console.log(`Using boundary colour: ${boundary.colour}`);
            } else {
                console.log('Boundary found but no color property available:', boundary);
                // Fallback to default colors
                if (numericRating <= 5) {
                    setColor('#17A865'); // Low risk (green)
                } else if (numericRating <= 10) {
                    setColor('#7BD148'); // Medium-low risk (light green)
                } else if (numericRating <= 15) {
                    setColor('#FFC25B'); // Medium risk (yellow/amber)
                } else if (numericRating <= 20) {
                    setColor('#F68D2B'); // Medium-high risk (orange)
                } else {
                    setColor('#FB3822'); // High risk (red)
                }
            }
        } else {
            console.log(`No specific boundary found for rating ${rating}, using default color`);
            // If no boundary is found, fallback to default colors based on risk level
            if (numericRating <= 5) {
                setColor('#17A865'); // Low risk (green)
            } else if (numericRating <= 10) {
                setColor('#7BD148'); // Medium-low risk (light green)
            } else if (numericRating <= 15) {
                setColor('#FFC25B'); // Medium risk (yellow/amber)
            } else if (numericRating <= 20) {
                setColor('#F68D2B'); // Medium-high risk (orange)
            } else {
                setColor('#FB3822'); // High risk (red)
            }
        }
        
        // Log final color decision
        console.log(`Final color for rating ${rating}: ${color}`);
    }, [boundaries, rating]);
    
    return color;
}

export default function Chip({text, color, type}) {
    // For rating type, use the boundary-based color
    const ratingColor = type === 'rating' ? useRatingColor(text) : null;
    
    // Default styling with color parameter
    let style = {};
    
    // Style for risk_id and status types
    if (type === 'risk_id' || type === 'status') {
        style = {
            color: '#000000', // Black font color
            backgroundColor: '#E5E5E5', // Gray background
        };
    }
    // Style for rating type
    else if (type === 'rating') {
        style = {
            color: '#FFFFFF', // White font for better contrast on solid colors
            backgroundColor: ratingColor || color, // Use the full solid color
            border: `1px solid ${ratingColor || color}` // Add border for better visibility
        };
        
        // Enhanced debugging for rating chips
        console.log('Rendering Rating Chip:', {
            text,
            ratingColor,
            fallbackColor: color,
            resultStyle: style
        });
    }
    // Default style for other chip types
    else {
        style = {
            color: color,
            backgroundColor: color + '30',
        };
    }
    
    return (
        <span style={style} className={`py-1 px-2 rounded-full`}>{text}</span>
    );
}