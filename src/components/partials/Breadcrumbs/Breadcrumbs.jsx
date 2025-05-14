import React from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useStrategyName } from '../../../queries/strategies/strategy-queries';
import { useRiskName } from '../../../queries/risks/risk-queries';

/**
 * Breadcrumbs component that shows navigation path
 * Specifically ensures "User Dashboard" is shown for users routes
 */
function Breadcrumbs() {
    const location = useLocation();
    const path = location.pathname;
    
    // Create breadcrumb parts based on current path
    let parts = [];
    
    // Always start with Home
    parts.push({ 
        label: 'Home', 
        path: '/' 
    });
    
    // Users section - Administration > User Dashboard
    if (path.startsWith('/users')) {
        parts.push({
            label: 'Administration',
            path: '#'
        });
        
        parts.push({ 
            label: 'User Dashboard', 
            path: '/users' 
        });
        
        // Add specific user page
        if (path === '/users/add-new-user') {
            parts.push({ 
                label: 'Add New User', 
                path: '/users/add-new-user' 
            });
        } else if (path === '/users/add-multiple-users' || path.startsWith('/users/add-multiple-users?')) {
            parts.push({ 
                label: 'Onboarding Multiple Users', 
                path: '/users/add-multiple-users?m=file' 
            });
        } else if (path === '/users/add-active-directory') {
            parts.push({ 
                label: 'Add Active Directory', 
                path: '/users/add-active-directory' 
            });
        } else if (path === '/users/edit-profile') {
            parts.push({ 
                label: 'Edit Profile', 
                path: '/users/edit-profile' 
            });
        } else if (path === '/users/edit-permissions') {
            parts.push({ 
                label: 'Edit Permissions', 
                path: '/users/edit-permissions' 
            });
        }
    }
    // Settings section - Administration > Settings
    else if (path.startsWith('/settings')) {
        parts.push({
            label: 'Administration',
            path: '#'
        });
        
        parts.push({ 
            label: 'Settings', 
            path: '/settings' 
        });
        
        // Organization structure
        if (path.includes('/organizational-structure')) {
            parts.push({ 
                label: 'Organization', 
                path: '/settings/organizational-structure' 
            });
            
            // Specific organization pages
            if (path.includes('/company-info')) {
                parts.push({ 
                    label: 'Company Info', 
                    path: '/settings/organizational-structure/company-info' 
                });
            } else if (path.includes('/subsidiaries')) {
                parts.push({ 
                    label: 'Subsidiaries', 
                    path: '/settings/organizational-structure/subsidiaries' 
                });
            } else if (path.includes('/branches')) {
                parts.push({ 
                    label: 'Branches', 
                    path: '/settings/organizational-structure/branches' 
                });
            } else if (path.includes('/divisions')) {
                parts.push({ 
                    label: 'Divisions', 
                    path: '/settings/organizational-structure/divisions' 
                });
            } else if (path.includes('/departments')) {
                parts.push({ 
                    label: 'Departments', 
                    path: '/settings/organizational-structure/departments' 
                });
            } else if (path.includes('/units')) {
                parts.push({ 
                    label: 'Units', 
                    path: '/settings/organizational-structure/units' 
                });
            }
        }
        
        // Risk management
        else if (path.includes('/risk-management')) {
            parts.push({ 
                label: 'Risk Management', 
                path: '/settings/risk-management' 
            });
            
            // Specific risk management pages
            if (path.includes('/risk-matrix')) {
                parts.push({ 
                    label: 'Risk Matrix', 
                    path: '/settings/risk-management/risk-matrix' 
                });
            } else if (path.includes('/risk-boundary')) {
                parts.push({ 
                    label: 'Risk Boundary', 
                    path: '/settings/risk-management/risk-boundary' 
                });
            } else if (path.includes('/risk-classification')) {
                parts.push({ 
                    label: 'Risk Classification', 
                    path: '/settings/risk-management/risk-classification' 
                });
            }
            
            // Notification Schedules
            if (path.includes('/notification-schedules')) {
                parts.push({ 
                    label: 'Notification Schedules', 
                    path: '/settings/notification-schedules' 
                });
                
                // Specific notification schedules pages
                if (path.includes('/manage')) {
                    parts.push({ 
                        label: 'Manage Schedules', 
                        path: '/settings/notification-schedules/manage' 
                    });
                }
            }
        }
    }
    // License Management - Administration > License Management
    else if (path === '/license-management') {
        parts.push({
            label: 'Administration',
            path: '#'
        });
        
        parts.push({ 
            label: 'License Management', 
            path: '/license-management' 
        });
    }
    // Risks section
    else if (path.startsWith('/risks')) {
        // Check if this is the risk log (index) page
        if (path === '/risks') {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Risk Log', 
                path: '/risks' 
            });
        } else if (path === '/risks/dashboard') {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Dashboard',
                path: '/risks/dashboard'
            });
        } else if (path === '/risks/register') {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Risk Register', 
                path: '/risks/register' 
            });
        } else if (path.includes('/risks/manage')) {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Enrol Risk', 
                path: path 
            });
        } else if (path.includes('/risks/') && path.includes('/update')) {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Update Risk', 
                path: path 
            });
        } else if (path === '/risks/approve') {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Risk Approval',
                path: '/risks/approve'
            });
        } else if (path === '/risks/follow-up') {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
            
            parts.push({
                label: 'Follow Up',
                path: '/risks/follow-up'
            });
        } else {
            parts.push({
                label: 'Risk',
                path: '/risks'
            });
        }
    }
    // Process Management section
    else if (path.startsWith('/process-management')) {
        parts.push({ 
            label: 'Process Management', 
            path: '/process-management' 
        });
        
        if (path === '/process-management/dashboard') {
            parts.push({ 
                label: 'Process Dashboard', 
                path: '/process-management/dashboard' 
            });
        } else if (path === '/process-management/log') {
            parts.push({ 
                label: 'Process Catalog', 
                path: '/process-management/log' 
            });
        } else if (path === '/process-management/enrol') {
            parts.push({ 
                label: 'Enrol Process', 
                path: '/process-management/enrol' 
            });
        } else if (path === '/process-management/assign') {
            parts.push({ 
                label: 'Process Assignment', 
                path: '/process-management/assign' 
            });
        } else if (path.includes('/process-management/') && path.includes('/view')) {
            parts.push({ 
                label: 'Process Details', 
                path: path 
            });
        }
    }
    // Process Task Details route
    else if (path.startsWith('/process/task/')) {
        parts.push({ 
            label: 'Process Management', 
            path: '/process-management' 
        });
        
        parts.push({ 
            label: 'Task Details', 
            path: path 
        });
    }
    
    // Render the breadcrumbs
    return (
        <div className='h-6 bg-[#E5E5E5] text-[#3D3D3D] text-xs py-[2px] px-2 flex gap-2 self-center items-center rounded-[4px]'>
            {parts.map((part, index) => {
                // Generate a unique key using both path and index
                const uniqueKey = `${part.path}-${index}`;
                
                return index < parts.length - 1 ? 
                (<React.Fragment key={uniqueKey}>
                    <NavLink to={part.path}>
                        {part.label}
                    </NavLink>
                    <span className='text-[#3D3D3D]'>-</span>
                </React.Fragment>) :
                <span key={uniqueKey}>{part.label}</span>
            })}
        </div>
    );
}

export function StrategyDynamicBreadcrumb() {
    const {id} = useParams();
    const {isLoading, error, data: name} = useStrategyName(id);

    return isLoading || error ? '...' : name;
}

export function RiskDynamicBreadcrumb() {
    const {id} = useParams();
    const {isLoading, error, data: name} = useRiskName(id);

    return isLoading || error ? '...' : name;
}

export default Breadcrumbs;