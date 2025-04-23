import home from "./assets/icons/home.svg";
import governance from "./assets/icons/governance.svg";
import strategy from "./assets/icons/strategy.svg";
import risk from "./assets/icons/risk.svg";
import internal_controls from "./assets/icons/internal-controls.svg";
import compliance from "./assets/icons/compliance.svg";
import asset_management from "./assets/icons/asset-management.svg";
import task_management from "./assets/icons/task-management.svg";
import third_parties from "./assets/icons/third-parties.svg";
import issues_and_incidents from "./assets/icons/issues-and-incidents.svg";
import change_management from "./assets/icons/change-management.svg";
import requirements_and_standards from "./assets/icons/requirements-and-standards.svg";
import administration from "./assets/icons/administration.svg";
import reporting from "./assets/icons/reporting.svg";

export const SIDEBAR_MENU = [
    {link: '/', text: 'Home', icon: home, permission: null},
    {
        text: 'Administration',
        icon: administration,
        permission: 'administration',
        module: 'administration',
        sub_menu: [
            {
                link: '/users', 
                text: 'User Dashboard', 
                permission: 'manage_users',
                module: 'administration',
                exact: true
            },
            {
                link: '/users/add-new-user',
                text: 'Onboard User',
                permission: 'manage_users',
                module: 'administration'
            },
            {
                link: '/users/add-multiple-users?m=file',
                text: 'Onboard Multiple Users',
                permission: 'manage_users',
                module: 'administration'
            },
            {
                link: '/license-management',
                text: 'Privileges',
                permission: 'administration',
                module: 'administration'
            },
            {
                link: '/settings', 
                text: 'System Settings', 
                permission: 'user_group',
                module: 'administration'
            },
        ]
    },
    // {
    //     link: '/strategies',
    //     text: 'Strategies',
    //     icon: strategy,
    //     permission: 'strategy',
    //     sub_menu: [
    //         {link: 'dashboard', text: 'Dashboard', permission: 'strategy_dashboard'},
    //         {link: 'analysis', text: 'Analysis', permission: 'control-test'},
    //     ]
    // },
    {
        link: '/risks',
        text: 'Risks',
        icon: risk,
        permission: 'risk_management',
        module: 'risk_management',
        sub_menu: [
            {link: 'dashboard', text: 'Dashboard', permission: 'risk_dashboard'},
            {link: 'register', text: 'Register', permission: 'register_risk'},
        ]
    },
    {
        text: "Process Management",
        icon: third_parties,
        permission: "process-management",
        module: 'process_management',
        sub_menu: [
            {
                link: '/process-management/log',
                text: 'Process Log',
                permission: 'process-management',
                module: 'process_management'
            },
            {
                link: '/process-management/enrol',
                text: 'Enrol Process',
                permission: 'process-management',
                module: 'process_management'
            },
            {
                link: '/process-management/assign',
                text: 'Process Assignment',
                permission: 'process-management',
                module: 'process_management'
            },
            {
                link: '/process-management/dashboard',
                text: 'Process Dashboard',
                permission: 'process-management',
                module: 'process_management'
            }
        ]
    },
    // {link: '/not-implemented-yet', text: 'Governance', icon: governance, permission: 'governance'},
    // {link: '/not-implemented-yet', text: 'Internal Controls', icon: internal_controls, permission: 'internal-controls'},
    // {link: '/not-implemented-yet', text: 'Compliance', icon: compliance, permission: 'compliance'},
    // {link: '/not-implemented-yet', text: 'Asset Management', icon: asset_management, permission: 'asset_management'},
    // {link: '/not-implemented-yet', text: 'Task Management', icon: task_management, permission: 'task_management'},
    // {link: '/not-implemented-yet', text: 'Third Parties', icon: third_parties, permission: 'third-parties'},
    // {link: '/not-implemented-yet', text: 'Issues & Incidents', icon: issues_and_incidents, permission: 'issues-and-incidents'},
    // {link: '/not-implemented-yet', text: 'Change Management', icon: change_management, permission: 'change-management'},
    // {link: '/not-implemented-yet', text: 'Requirements & Standards', icon: requirements_and_standards, permission: 'requirements-and-standards'},
    // {link: '/not-implemented-yet', text: 'Reporting', icon: reporting, permission: 'reporting'},
];

export const SETTINGS_MENU = [
    // {link: 'user-preferences', text: 'User preferences', icon: home,},
    {link: 'organizational-structure', text: 'Structure', icon: home, permission: 'organizational_structure'},
    {link: 'risk-management', text: 'RM Parameters', icon: home, permission: 'organizational_structure'},
    // {link: 'not-implemented', text: 'System Preferences', icon: home, permission: 'system_preferences'},
    // {link: 'not-implemented', text: 'Organizational Hierarchy', icon: governance, permission: 'organizational_heirarchy'},
    // {link: 'not-implemented', text: 'Security Policies', icon: strategy, permission: 'security_policies'},
    // {link: 'not-implemented', text: 'User Activity Monitoring', icon: risk, permission: 'user_activity_monitoring'},
    // {link: 'not-implemented', text: 'API Management', icon: internal_controls, permission: 'api_management'},
    // {link: 'not-implemented', text: 'Single Sign-On (SSO)', icon: compliance, permission: 'single_sign-on'},
    // {link: 'not-implemented', text: 'Localization', icon: asset_management, permission: 'localization'},
    // {link: 'not-implemented', text: 'Help and Support', icon: task_management, permission: 'help_and_support'}
];
