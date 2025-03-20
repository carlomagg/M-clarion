export default function RiskRating({riskRating}) {
    const weight = Number(riskRating);
    const color = [1,2,3,4,5].includes(weight) ? '#17A865' : ([6,8,9,10].includes(weight) ? '#7BD148' : ([12,15].includes(weight) ? '#FFC25B' : ([16,20,25].includes(weight) ? '#FB3822' : '#D9D9D9')));
    return (
        <button style={{backgroundColor: color}} type="button" className='bg-[#D9D9D9] grid place-items-center text-lg w-44 h-12 rounded-md'>{weight || 'undefined'}</button>
    );
}