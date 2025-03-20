import useUser from "../../../hooks/useUser"

export default function AddOrganizationalItemButton({text, onClick, permission}) {
    const user = useUser();

    if (!user.hasPermission(permission)) return null;
    return (
        <button type="button" onClick={onClick} className='bg-text-pink rounded-lg py-3 px-16 flex justify-center text-white font-bold shadow-[0px_1px_3px_1px_#00000026,0px_1px_2px_0px_#0000004D]'>
            {text}
        </button>
    )
}