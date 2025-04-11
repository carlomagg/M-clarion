import useUser from "../../../hooks/useUser"

export default function AddOrganizationalItemButton({text, onClick, permission}) {
    const user = useUser();

    if (!user.hasPermission(permission)) return null;
    return (
        <button 
            type="button" 
            onClick={onClick} 
            className="flex items-center gap-2 py-2 px-6 bg-white border border-[#EBEBEB] rounded-lg shadow-sm hover:bg-gray-50 text-sm min-w-[140px] justify-center"
        >
            <span className="text-[#E44195] font-bold text-lg">+</span>
            {text}
        </button>
    )
}