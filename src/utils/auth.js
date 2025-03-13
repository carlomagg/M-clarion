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
        this.licenses = attributes['licenses'] || []; // Array of decrypted licenses
    }

    hasPermission(permName) {
        return this.isSuperUser || this.permissions.has(permName);
    }

    // Check if user has license for a specific module
    hasLicense(moduleName) {
        return this.isSuperUser || this.licenses.some(license => 
            license.module_name === moduleName
        );
    }

    // Get license type for a specific module
    getLicenseType(moduleName) {
        if (this.isSuperUser) return 'full_access';
        const license = this.licenses.find(license => license.module_name === moduleName);
        return license ? license.license_type : null;
    }

    // Check if user has full access to a module
    hasFullAccess(moduleName) {
        const licenseType = this.getLicenseType(moduleName);
        return this.isSuperUser || licenseType === 'full_access';
    }

    // Check if user has read-only access to a module
    hasReadOnlyAccess(moduleName) {
        const licenseType = this.getLicenseType(moduleName);
        return licenseType === 'read_only';
    }

    // Combined check for both license and permission
    canAccess(moduleName, permissionName) {
        return this.hasLicense(moduleName) && this.hasPermission(permissionName);
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
    const licenses = jwtPayload['licenses'] || [];

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
    localStorage.removeItem('mc_access');
    localStorage.removeItem('mc_refresh');
    // rm(ACCESS_TOKEN_NAME);
    // rm(REFRESH_TOKEN_NAME);
}

export default {isLoggedIn, getUser, logout};