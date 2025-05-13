import Login from './components/pages/auth/Login/Login.jsx'
import ResetPassword from './components/pages/auth/ResetPassword/ResetPassword.jsx'
import Home from './components/pages/homepage/Home/Home.jsx'
import Layout from './components/Layout/Layout.jsx'
import AddNewUser from './components/pages/users/AddNewUser/AddNewUser.jsx'
import AddMultipleUsers from './components/pages/users/AddMultipleUsers/AddMultipleUsers.jsx'
import AddActiveDirectory from './components/pages/users/AddActiveDirectory/AddActiveDirectory.jsx'
import EditUserProfile from './components/pages/users/EditUserProfile/EditUserProfile.jsx'
import EditUserPermissions from './components/pages/users/EditUserPermissions/EditUserPermissions.jsx'
import ManageUsers from './components/pages/users/ManageUsers/ManageUsers.jsx'
import UserGroups from './components/pages/user-groups/UserGroups/UserGroups.jsx'
import CreateUserGroup from './components/pages/user-groups/CreateUserGroup/CreateUserGroup.jsx'
import EditUserGroupPermissions from './components/pages/user-groups/EditUserGroupPermissions/EditUserGroupPermissions.jsx'
import SettingsLayout from './components/settings/SettingsLayout/SettingsLayout.jsx'
import OrganizationalStructureLayout from './components/settings/organizational-structure/Layout/Layout.jsx'
import CompanyInformation from './components/settings/organizational-structure/CompanyInformation/CompanyInformation.jsx'
import ErrorPage from './components/pages/ErrorPage/ErrorPage.jsx'
import SubsidiaryInformation from './components/settings/organizational-structure/SubsidiaryInformation/SubsidiaryInformation.jsx'
import BranchInformation from './components/settings/organizational-structure/BranchInformation/BranchInformation.jsx'
import DivisionInformation from './components/settings/organizational-structure/DivisionInformation/DivisionInformation.jsx'
import DepartmentInformation from './components/settings/organizational-structure/DepartmentInformation/DepartmentInformation.jsx'
import UnitInformation from './components/settings/organizational-structure/UnitInformation/UnitInformation.jsx'
import authGuard from './guards/auth-guard.js'
import ForgotPassword from './components/pages/auth/ForgotPassword/ForgotPassword.jsx'
import UserGroupMembers from './components/pages/user-groups/UserGroupMembers/UserGroupMembers.jsx'
import UserPreferences from './components/profile/UserPreferences/UserPreferences.jsx'
import ManageUsersIndex from './components/pages/users/Index/Index.jsx'
import UserGroupsIndex from './components/pages/user-groups/Index/Index.jsx'
import { RiskDynamicBreadcrumb, StrategyDynamicBreadcrumb } from './components/partials/Breadcrumbs/Breadcrumbs.jsx'
import RiskLayout from './components/pages/risks/Layout.jsx';
import RiskDashboard from './components/pages/risks/RiskDashboard/RiskDashboard.jsx';
import RiskLog from './components/pages/risks/RiskLog/RiskLog.jsx'
import RiskRegister from './components/pages/risks/RiskRegister/RiskRegister.jsx'
import RiskReview from './components/pages/risks/RiskReview/RiskReview.jsx'
import RiskUpdate from './components/pages/risks/RiskUpdate/RiskUpdate.jsx'
import RiskApprove from './components/pages/risks/RiskApprove/RiskApprove.jsx'
import RiskFollowUp from './components/pages/risks/RiskFollowUp/RiskFollowUp.jsx'
import RiskManagementLayout from './components/settings/risk-management/Layout.jsx';
import RiskManagementIndex from './components/settings/risk-management/Index/Index.jsx'
import RiskMatrixSetup from './components/settings/risk-management/RiskMatrixSetup/RiskMatrixSetup.jsx'
import RiskBoundarySetup from './components/settings/risk-management/RiskBoundarySetup/RiskBoundarySetup.jsx'
import ManageRiskClassification from './components/settings/risk-management/ManageRiskClassification/ManageRiskClassification.jsx'
import ManageRiskAppetite from './components/settings/risk-management/ManageRiskAppetite/ManageRiskAppetite.jsx'
import ControlFamilyTypes from './components/settings/risk-management/ControlFamilyTypes/ControlFamilyTypes.jsx'
import RiskResponses from './components/settings/risk-management/RiskResponses/RiskResponses.jsx'
import ManageRiskIndicators from './components/settings/risk-management/ManageRiskIndicators/ManageRiskIndicators.jsx'
import ControlEffectiveness from './components/settings/risk-management/ControlEffectiveness/ControlEffectiveness.jsx'
import ProcessManagement from "./components/pages/process-management/ProcessManagement/ProcessManagement.jsx";
import ProcessManagementIndex from "./components/pages/process-management/Index/Index.jsx";
import ProcessDashboard from "./components/pages/process-management/ProcessDashboard/ProcessDashboard.jsx";
import CreateNewProcess from "./components/pages/process-management/ProcessManagement/components/CreateNewProcess.jsx";
import ProfileLayout from './components/profile/ProfileLayout/ProfileLayout.jsx'
import ExpertGuide from './components/pages/homepage/ExpertGuide/ExpertGuide.jsx'
import ExpertGuides from './components/pages/homepage/ExpertGuides/ExpertGuides.jsx'
import HelpCategoryTopics from './components/pages/homepage/HelpCategoryTopics/HelpCategoryTopics.jsx'
import HelpGuide from './components/pages/homepage/HelpGuide/HelpGuide.jsx'
import HelpCategories from './components/pages/homepage/HelpCategories/HelpCategories.jsx'
import LicenseManagement from './components/pages/license-management/LicenseManagement'
import { Navigate, useNavigate } from 'react-router-dom';
import useUser from './hooks/useUser';
import ProcessView from './components/pages/process-management/ProcessView/ProcessView.jsx'
import ProcessSelector from './components/pages/process-management/ProcessSelector/ProcessSelector.jsx'
import ProcessTaskDetails from './components/pages/process-management/ProcessTaskDetails/ProcessTaskDetails.jsx'
import ProcessManagementLayout from './components/settings/process-management/Layout';
import SettingsProcessManagementIndex from './components/settings/process-management/Index/Index';
import ProcessBoundarySetup from './components/settings/process-management/ProcessBoundarySetup/ProcessBoundarySetup';
import ImportTab from './components/pages/risks/components/ImportTab'

// Create a wrapper component for admin-only routes
function AdminRoute({ children }) {
    const user = useUser();
    
    if (!user || !user.hasPermission('administration')) {
        return <Navigate to="/" />;
    }
    
    return children;
}

const ROUTES = [
    {path: '/login', element: <Login />},
    {path: '/reset-password', element: <ResetPassword />,},
    {path: '/forgot-password', element: <ForgotPassword />,},
    {
        path: '/', //portal
        element: <Layout />,
        errorElement: <ErrorPage />,
        loader: () => {authGuard(); return null;},
        children: [
            {index: true, element: <Home />, breadcrumb: 'Home'},
            {path: 'expert-guides', element: <ExpertGuides />, breadcrumb: 'Expert Guides'},
            {path: 'expert-guides/:id', element: <ExpertGuide />, breadcrumb: 'Guide Details'},
            {path: 'help-categories', element: <HelpCategories />, breadcrumb: 'Help Categories'},
            {path: 'help-categories/:id', element: <HelpCategoryTopics />, breadcrumb: 'Category Topics'},
            {path: 'help-categories/:categoryId/topics/:topicId', element: <HelpGuide />, breadcrumb: 'Guide'},
            // NOT IMPLEMENTED YET
            {path: 'not-implemented-yet', element: <div className='h-full w-full grid place-items-center'>This page is not implemented yet</div>, breadcrumb: 'Not Implemented'},
            // USERS - Updated for breadcrumb refresh
            {
                path: 'users',
                element: <ManageUsers />,
                breadcrumb: () => "User Dashboard",
                children: [
                    {index: true, element: <ManageUsersIndex />, breadcrumb: 'User Dashboard'},
                    {path: 'add-new-user', element: <AddNewUser />, breadcrumb: 'Add New User'},
                    {path: 'add-multiple-users', element: <AddMultipleUsers />, breadcrumb: 'Add Multiple Users'},
                    {path: 'add-active-directory', element: <AddActiveDirectory />, breadcrumb: 'Add Active Directory'},
                    {path: 'edit-profile', element: <EditUserProfile />, breadcrumb: 'Edit Profile'},
                    {path: 'edit-permissions', element: <EditUserPermissions />, breadcrumb: 'Edit Permissions'},
                ]
            },
            // USER GROUPS
            {
                path: 'user-groups',
                element: <UserGroups />,
                breadcrumb: 'User Groups',
                children: [
                    {index: true, element: <UserGroupsIndex />, breadcrumb: 'Manage Groups'},
                    {path: 'create-new', element: <CreateUserGroup />, breadcrumb: 'Create New Group'},
                    {path: 'edit-permissions', element: <EditUserGroupPermissions />, breadcrumb: 'Edit Group Permissions'},
                    {path: 'members', element: <UserGroupMembers />, breadcrumb: 'Group Members'},
                ]
            },
            // STRATEGIES
            // {
            //     path: 'strategies',
            //     element: <BusinessStrategy />,
            //     breadcrumb: 'Strategies',
            //     children: [
            //         {index: true, element: <BusinessStrategyIndex />, breadcrumb: 'Business Strategy'},
            //         {path: 'dashboard', element: <StrategyDashboard />, breadcrumb: 'Dashboard'},
            //         {path: ':id', element: <BusinessStrategyIndex />, breadcrumb: StrategyDynamicBreadcrumb},
            //         {path: ':id/vmc', element: <StrategyVMC />, breadcrumb: 'VMC'},
            //         {path: ':id/vmc/:mode', element: <UpdateStrategyVmc />, breadcrumb: 'Update VMC'},
            //         {path: ':id/themes', element: <StrategyThemes />, breadcrumb: 'Themes'},
            //         {path: ':id/themes/:mode', element: <UpdateStrategyThemes />, breadcrumb: 'Update Themes'},
            //         {path: 'analysis', element: <AnalysisIndex />, breadcrumb: 'Analysis' },
            //     ]
            // },
            // RISKS
            {
                path: 'risks',
                element: <RiskLayout />,
                breadcrumb: 'Risk',
                children: [
                    {index: true, element: <RiskLog />, breadcrumb: 'Risk Log'},
                    {path: 'dashboard', element: <RiskDashboard />, breadcrumb: 'Dashboard'},
                    {path: 'register/:step?', element: <RiskRegister />, breadcrumb: 'Manage Risk'},
                    {path: 'approve', element: <RiskApprove />, breadcrumb: 'Risk Approval'},
                    {path: 'approve/:id', element: <RiskApprove />, breadcrumb: 'Approve Risk'},
                    {path: 'approve-table', element: <RiskLog approvalMode={true} />, breadcrumb: 'Risk Approval Table'},
                    {path: 'follow-up', element: <RiskFollowUp />, breadcrumb: 'Follow Up'},
                    {path: 'import', element: <ImportTab />, breadcrumb: 'Import Risks'},
                    {path: ':id', element: <RiskReview />, breadcrumb: RiskDynamicBreadcrumb},
                    {path: ':id/update', element: <RiskUpdate />, breadcrumb: 'Update Risk'},
                ]
            },
            // PROCESS MANAGEMENT
            {
                path: "process-management",
                element: <ProcessManagement />,
                breadcrumb: 'Process Log',
                children: [
                    { index: true, element: <ProcessManagementIndex />, breadcrumb: 'Process Log' },
                    { path: "log", element: <ProcessManagementIndex />, breadcrumb: 'Process Log' },
                    { 
                        path: "enrol", 
                        element: <CreateNewProcess setShowItemForm={null} setProcesses={null} />, 
                        breadcrumb: 'Enrol Process' 
                    },
                    { 
                        path: "assign", 
                        element: <ProcessSelector />, 
                        breadcrumb: 'Process Assignment' 
                    },
                    { path: "dashboard", element: <ProcessDashboard />, breadcrumb: 'Dashboard' },
                    { path: ":id/view", element: <ProcessView />, breadcrumb: 'Details' }
                ],
            },
            // Process Task Details route
            {
                path: "process/task/:processId/:taskId",
                element: <ProcessTaskDetails />,
                breadcrumb: 'Task Details'
            },
            // {
            //     path: "issues-and-incidents",
            //     element: <IssuesAndIncidents />,
            //     breadcrumb: 'Issues & Incidents',
            //     children: [
            //       { index: true, element: <IssuesAndIncidentsIndex />, breadcrumb: 'Issues Index' },
            //       // {path: 'strategy-vmc', element: <StrategyVMC />, breadcrumb: 'Strategy VMC'},
            //       // {path: 'strategy-themes', element: <StrategyThemes />, breadcrumb: 'Strategy Themes'},
            //     ],
            // },
            // PROFILE
            {
                path: "profile",
                element: <ProfileLayout />,
                breadcrumb: 'Profile',
                children: [{index: true, element: <UserPreferences />, breadcrumb: 'User Preferences'},],
            },
            // SETTINGS
            {
                path: 'settings',
                element: <SettingsLayout />,
                breadcrumb: 'Settings',
                children: [
                    {index: true, element: <OrganizationalStructureLayout />, breadcrumb: 'Organization'},
                    {
                        path: 'organizational-structure',
                        element: <OrganizationalStructureLayout />,
                        breadcrumb: 'Organization',
                        children: [
                            {path: 'company-info', element: <CompanyInformation />, breadcrumb: 'Company Info'},
                            {path: 'subsidiaries', element: <SubsidiaryInformation />, breadcrumb: 'Subsidiaries'},
                            {path: 'branches', element: <BranchInformation />, breadcrumb: 'Branches'},
                            {path: 'divisions', element: <DivisionInformation />, breadcrumb: 'Divisions'},
                            {path: 'departments', element: <DepartmentInformation />, breadcrumb: 'Departments'},
                            {path: 'units', element: <UnitInformation />, breadcrumb: 'Units'},
                        ]
                    },
                    {
                        path: 'risk-management',
                        element: <RiskManagementLayout />,
                        breadcrumb: 'Risk Management',
                        children: [
                            {index: true, element: <RiskManagementIndex />, breadcrumb: 'Risk Management'},
                            {path: 'risk-matrix', element: <RiskMatrixSetup />, breadcrumb: 'Risk Matrix'},
                            {path: 'risk-boundary', element: <RiskBoundarySetup />, breadcrumb: 'Risk Boundary'},
                            {path: 'risk-classification', element: <ManageRiskClassification />, breadcrumb: 'Risk Classification'},
                            {path: 'risk-appetite', element: <ManageRiskAppetite />, breadcrumb: 'Risk Appetite'},
                            {path: 'control-family-types', element: <ControlFamilyTypes />, breadcrumb: 'Control Family Types'},
                            {path: 'control-effectiveness', element: <ControlEffectiveness />, breadcrumb: 'Control Effectiveness'},
                            {path: 'risk-responses', element: <RiskResponses />, breadcrumb: 'Risk Responses'},
                            {path: 'risk-indicators', element: <ManageRiskIndicators />, breadcrumb: 'Risk Indicators'},
                        ]
                    },
                    {
                        path: 'process-management',
                        element: <ProcessManagementLayout />,
                        breadcrumb: 'Process Management',
                        children: [
                            {index: true, element: <SettingsProcessManagementIndex />, breadcrumb: 'Process Management'},
                            {path: 'process-boundary', element: <ProcessBoundarySetup />, breadcrumb: 'Process Boundary'},
                        ]
                    },
                    {path: 'not-implemented', element: <div className='h-full w-full grid place-items-center'>This page is not implemented yet</div>, breadcrumb: 'Not Implemented'}
                ]
            },
            {
                path: 'license-management',
                element: <AdminRoute><LicenseManagement /></AdminRoute>,
                breadcrumb: 'License Management'
            },
        ]
    },
    // Catch-all route for 404s
    {
        path: '*',
        element: <ErrorPage />
    }
]

export default ROUTES;
