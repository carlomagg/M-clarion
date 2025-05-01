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
    
    // Determine color based on weight
    // Include 0 in the lowest risk range (green)
    let color;
    if ([0, 1, 2, 3, 4, 5].includes(weight)) {
        color = '#17A865'; // Green for lowest risk (including 0)
    } else if ([6, 8, 9, 10].includes(weight)) {
        color = '#7BD148'; // Light green for low risk
    } else if ([12, 15].includes(weight)) {
        color = '#FFC25B'; // Yellow for medium risk
    } else if ([16, 20, 25].includes(weight)) {
        color = '#FB3822'; // Red for high risk
    } else {
        color = '#D9D9D9'; // Gray for invalid/unknown
    }
    
    // Enhanced debugging
    console.log('Rendering RiskRating:', {
        originalValue,
        numericRiskRating,
        weight,
        displayValue,
        type: typeof riskRating,
        isNumber: !isNaN(Number(riskRating)),
        isString: typeof riskRating === 'string',
        isEmpty: riskRating === '' || riskRating === null || riskRating === undefined,
        color,
        colorLogic: {
            isLowestRisk: [0, 1, 2, 3, 4, 5].includes(weight),
            isLowRisk: [6, 8, 9, 10].includes(weight),
            isMediumRisk: [12, 15].includes(weight),
            isHighRisk: [16, 20, 25].includes(weight)
        }
    });
    
    return (
        <button 
            style={{backgroundColor: color}} 
            type="button" 
            className='bg-[#D9D9D9] grid place-items-center text-lg w-44 h-12 rounded-md'
        >
            {displayValue}
        </button>
    );
}