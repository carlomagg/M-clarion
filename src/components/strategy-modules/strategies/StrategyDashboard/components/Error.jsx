export function Error({classes=''}) {
    return (
        <div className={`flex items-center justify-center bg-white border border-[#CCCCCC] rounded-lg flex-1 ${classes}`}>
            <p className="italic text-text-gray text-sm">Error fetching data.</p>
        </div> 
    );  
}