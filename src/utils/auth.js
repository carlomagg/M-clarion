import CryptoJS from "crypto-js";
import { get, rm } from "lockr";
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME, SECRET_KEY } from "./consts";

class User {
    constructor(attributes) {
        this.id = attributes['id'];
        this.firstName = attributes['firstName'];
        this.lastName = attributes['lastName'];
        this.email = attributes['email'];
        this.companyName = attributes['companyName'];
        this.companyLogo = attributes['companyLogo'];
        this.isSuperUser = attributes['isSuperUser'];
        this.isFirstLogin = attributes['isFirstLogin'];
        this.permissions = new Set(attributes['permissions'].map(perm => perm.name));
        this.licenses = attributes['licenses'] || [];
        console.log('User constructed with licenses:', this.licenses);
        console.log('User constructed with permissions:', Array.from(this.permissions));
    }

    hasPermission(permName) {
        return this.isSuperUser || this.permissions.has(permName);
    }

    hasLicense(moduleName) {
        if (this.isSuperUser) return true;
        
        // Special handling for administration module
        if (moduleName.toLowerCase() === 'administration') {
            // Only users with full_access to any module can access administration
            return this.licenses.some(license => license.license_type === 'full_access');
        }

        return this.licenses.some(license => 
            license.module_name.toLowerCase() === moduleName.toLowerCase() && 
            (license.license_type === 'full_access' || license.license_type === 'read_only')
        );
    }

    getLicenseType(moduleName) {
        if (this.isSuperUser) return 'full_access';
        
        // Special handling for administration module
        if (moduleName.toLowerCase() === 'administration') {
            // Check if user has any full_access license
            return this.licenses.some(license => license.license_type === 'full_access') 
                ? 'full_access' 
                : null;
        }

        const license = this.licenses.find(license => 
            license.module_name.toLowerCase() === moduleName.toLowerCase()
        );
        return license ? license.license_type : null;
    }

    hasFullAccess(moduleName) {
        if (this.isSuperUser) return true;

        // Special handling for administration module
        if (moduleName.toLowerCase() === 'administration') {
            // Only users with at least one full_access license can access administration
            return this.licenses.some(license => license.license_type === 'full_access');
        }

        const license = this.licenses.find(license => 
            license.module_name.toLowerCase() === moduleName.toLowerCase()
        );
        return license && license.license_type === 'full_access';
    }

    hasReadOnlyAccess(moduleName) {
        if (this.isSuperUser) return true;

        // Administration module never has read-only access
        if (moduleName.toLowerCase() === 'administration') {
            return false;
        }

        const license = this.licenses.find(license => 
            license.module_name.toLowerCase() === moduleName.toLowerCase()
        );
        return license && license.license_type === 'read_only';
    }

    canAccess(moduleName, permissionName) {
        // First check if user has the module license and permission
        const hasAccess = (this.isSuperUser || this.hasLicense(moduleName)) && this.hasPermission(permissionName);
        if (!hasAccess) return false;

        // Special handling for administration module
        if (moduleName.toLowerCase() === 'administration') {
            // Only users with full_access to any module can access administration features
            return this.licenses.some(license => license.license_type === 'full_access');
        }

        // For other modules, if this is an edit action, check if user has full access
        const isEditAction = permissionName.match(/^(edit|create|delete|update|modify|add|remove|assign|manage)/i);
        if (isEditAction) {
            return this.hasFullAccess(moduleName);
        }

        // For view/read actions, either license type is fine
        return true;
    }
}


const _getJWTPayload = () => {
    const accessToken = get(ACCESS_TOKEN_NAME, null);
    if (!accessToken) return null;
    
    try {
        const parts = accessToken.split('.');
        if (parts.length !== 3) return null;
        
        return JSON.parse(atob(parts[1]));
    } catch (error) {
        console.error('Error parsing JWT:', error);
        return null;
    }
}

function _decryptUserPermsissions({encrypted_permissions_string, encoded_iv}) {
    try {
        // Convert the base64 encoded IV back to bytes
        const iv = CryptoJS.enc.Base64.parse(encoded_iv);
        
        // Convert the base64 encoded encrypted data to bytes
        const encrypted = CryptoJS.enc.Base64.parse(encrypted_permissions_string);
        
        // Create decryption configuration
        const config = {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        };

        // Create the key from the secret
        const key = CryptoJS.enc.Base64.parse(SECRET_KEY);
        
        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encrypted },
            key,
            config
        );
        
        // Convert to string
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Error decrypting permissions:', error);
        return '[]';
    }
}

function _getUserPermssions({encrypted_permissions_string, encoded_iv}) {
    try {
        const decrypted_permissions_string = _decryptUserPermsissions({encrypted_permissions_string, encoded_iv});
        return JSON.parse(decrypted_permissions_string);
    } catch (error) {
        console.error('Error parsing permissions:', error);
        return [];
    }
}

function _decryptUserLicenses({data, iv}) {
    try {
        // Convert the base64 encoded IV back to bytes
        const ivBytes = CryptoJS.enc.Base64.parse(iv);
        
        // Convert the base64 encoded encrypted data to bytes
        const encrypted = CryptoJS.enc.Base64.parse(data);
        
        // Create decryption configuration
        const config = {
            iv: ivBytes,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        };

        // Create the key from the secret
        const key = CryptoJS.enc.Base64.parse(SECRET_KEY);
        
        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: encrypted },
            key,
            config
        );
        
        // Convert to string and parse JSON
        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
        console.error('Error decrypting licenses:', error);
        return [];
    }
}

const isLoggedIn = () => {
    const accessToken = get(ACCESS_TOKEN_NAME, null);
    const refreshToken = get(REFRESH_TOKEN_NAME, null);
    // session is authenticated if access token and refresh token exist and refresh token is not expired
    // return !!accessToken && !!refreshToken && new Date().getTime()/1000 > refreshToken['expiry'];

    // console.log(get('mc_access'))

    return !!accessToken && !!refreshToken;
}


const getUser = () => {
    if (!isLoggedIn()) return null;

    const jwtPayload = _getJWTPayload();
    const id = Number(jwtPayload['user_id']);
    const email = jwtPayload['email'];
    const first_name = jwtPayload['firstname'];
    const last_name = jwtPayload['lastname'];
    const company_name = jwtPayload['company_name'];
    const company_logo = jwtPayload['company_logo'];
    const isFirstLogin = !!jwtPayload['isfirst'];
    const isSuperUser = jwtPayload['activation_status'] === 'activate!';
    
    const {iv: encoded_iv, data: encrypted_permissions_string} = jwtPayload['permissions'];
    const permissions = _getUserPermssions({encrypted_permissions_string, encoded_iv});
    
    // Decrypt licenses if they exist
    const licenses = jwtPayload['licenses'] ? 
        _decryptUserLicenses(jwtPayload['licenses']) : 
        [];

    const attributes = {
        id,
        firstName: first_name,
        lastName: last_name,
        email,
        companyName: company_name,
        companyLogo: company_logo,
        isSuperUser,
        isFirstLogin,
        permissions,
        licenses
    };

    return new User(attributes);
}

const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('mc_access');
    localStorage.removeItem('mc_refresh');
    
    // Clear tokens using lockr
    rm(ACCESS_TOKEN_NAME);
    rm(REFRESH_TOKEN_NAME);
    
    // Clear any other session-related data
    localStorage.clear();
    sessionStorage.clear();
}

export default {isLoggedIn, getUser, logout};