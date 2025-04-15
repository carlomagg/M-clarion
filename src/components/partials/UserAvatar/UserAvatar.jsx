import { UserIcon } from '@heroicons/react/24/outline';

function UserAvatar({ firstName, lastName, email, imageUrl, size = 'md' }) {
    const getInitials = () => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (email) {
            return email[0].toUpperCase();
        }
        return null;
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base'
    };

    const initials = getInitials();

    return (
        <div className={`${sizeClasses[size]} bg-[#F5F5F5] rounded-full flex items-center justify-center text-gray-600 overflow-hidden`}>
            {imageUrl ? (
                <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : initials ? (
                <span className="font-medium">{initials}</span>
            ) : (
                <UserIcon className="w-5 h-5" />
            )}
        </div>
    );
}

export default UserAvatar;
