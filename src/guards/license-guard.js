import { Navigate } from 'react-router-dom';
import useUser from '../hooks/useUser';

export function withLicenseGuard(WrappedComponent, moduleName) {
    return function LicenseGuardedComponent(props) {
        const user = useUser();

        if (!user) {
            return <Navigate to="/login" />;
        }

        if (!user.hasLicense(moduleName)) {
            return <Navigate to="/" />;
        }

        // If user has read-only access, pass that information to the component
        const isReadOnly = user.hasReadOnlyAccess(moduleName);
        
        return <WrappedComponent {...props} isReadOnly={isReadOnly} />;
    };
}

// Example usage in a route:
// export default withLicenseGuard(RiskManagement, 'risk'); 