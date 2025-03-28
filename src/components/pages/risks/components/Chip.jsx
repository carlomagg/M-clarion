export default function Chip({text, color}) {
    return (
        <span style={{color, backgroundColor: color+'30',}} className={`py-1 px-2 rounded-full`}>{text}</span>
    );
}