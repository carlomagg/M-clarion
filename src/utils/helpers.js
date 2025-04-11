export function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) return false;
    return true;
}

// organizePermissions transforms the permissions the returned permission to what is required for the form
export function organizePermissions(permissions, selected = []) {
    const organizedPermissions = [];

    function fetchChildren(permission) {
        let children = permissions.filter(perm => perm['parent_permission_id'] === permission['permission_id']);

        if (children.length == 0) return null;
        else return children.map(child => ({id: child['permission_id'], isSelected: selected?.includes(child['permission_id']), children: fetchChildren(child)}))
    }

    for(let permission of permissions.filter(perm => perm.parent_permission_id === null)) {
        organizedPermissions.push(
            {id: permission['permission_id'], isSelected: selected?.includes(permission['permission_id']), children: fetchChildren(permission)}
        );
    }

    return organizedPermissions;

}

// extract selected permissions into a flat array
export function extractSelectedPermissions(permissions) {
    let selected = new Set();

    function checkChildren(permissions) {
        permissions.forEach(permission => {
            if (permission.isSelected) {
                selected.add(permission.id);
                if (permission.children) checkChildren(permission.children);
            }

        })
    }

    checkChildren(permissions)

    return Array.from(selected);
}


// filter items that match searchTerm
export function filterItems(searchTerm, items = [], filterAttributes) {
    if (!Array.isArray(items)) return [];
    return items.filter(item => filterAttributes.some(attribute => RegExp(searchTerm, 'i').test(item[attribute])));
}


// convert data string to timestamp
export function toTimestamp(dateString) {
    // Parse the date string
    const [dayOfWeek, day, month, year, time] = dateString.split(' ');
    const [hours, minutes] = time.slice(0, -2).split(':');
    const isPM = time.slice(-2) === 'PM';
  
    // Create a date object
    const date = new Date(`${month} ${day} ${year.replace(',', '')}`);
    
    // Set the time
    date.setHours(isPM ? parseInt(hours) + 12 : parseInt(hours));
    date.setMinutes(parseInt(minutes));
  
    // Return the timestamp (in milliseconds)
    return date.getTime();
}

// format amount (insert commas after every group of three digits)
export function formatAmount(amount) {
    // remove decimal if present
    let cleansed = String(amount).split('.')[0];

    // remove all commas in amount
    cleansed = String(cleansed).replace(/\D/g, '');

    // insert commas after every group of 3 digits not followed by another digig
    let formatted = cleansed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted;
}

// convert comma delimited amount to number
export function convertToNumber(input) {
    return Number(String(input).replace(/\D/g, ''));
}


// truncate string to lenght of 40
export function truncateString(string) {
    return string.length > 40 ? string.slice(0,37).padEnd(40, '.') : string;
}

// return range of numbers from start to end (inclusive)
export const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);