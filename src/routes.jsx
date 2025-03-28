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
// import BusinessStrategy from './components/pages/strategies/BusinessStrategy/BusinessStrategy.jsx'
import LocationLayout from './components/settings/location/Layout/Layout.jsx'
import LocationIndex from './components/settings/location/Index/Index.jsx'
import AddCountry from './components/settings/location/AddCountry/AddCountry.jsx'
import AddState from './components/settings/location/AddState/AddState.jsx'
import AddCity from './components/settings/location/AddCity/AddCity.jsx'
import ForgotPassword from './components/pages/auth/ForgotPassword/ForgotPassword.jsx'
// import StrategyDashboard from './components/pages/strategies/StrategyDashboard/StrategyDashboard.jsx';
// import StrategyVMC from './components/pages/strategies/StrategyVMC/StrategyVMC.jsx'
// import StrategyThemes from './components/pages/strategies/StrategyThemes/StrategyThemes.jsx'
import UserGroupMembers from './components/pages/user-groups/UserGroupMembers/UserGroupMembers.jsx'
import UserPreferences from './components/profile/UserPreferences/UserPreferences.jsx'
import ManageUsersIndex from './components/pages/users/Index/Index.jsx'
import UserGroupsIndex from './components/pages/user-groups/Index/Index.jsx'
// import BusinessStrategyIndex from './components/pages/strategies/Index/Index.jsx'
// import UpdateStrategyVmc from './components/pages/strategies/UpdateStrategyVMC/UpdateStrategyVMC.jsx'
// import UpdateStrategyThemes from './components/pages/strategies/UpdateStrategyThemes/UpdateStrategyThemes.jsx'
import { RiskDynamicBreadcrumb, StrategyDynamicBreadcrumb } from './components/partials/Breadcrumbs/Breadcrumbs.jsx'
// import AnalysisIndex from "./components/pages/analysis/Index/Index.jsx";
import RiskLayout from './components/pages/risks/Layout.jsx';
import RiskDashboard from './components/pages/risks/RiskDashboard/RiskDashboard.jsx';
import RiskLog from './components/pages/risks/RiskLog/RiskLog.jsx'
import RiskRegister from './components/pages/risks/RiskRegister/RiskRegister.jsx'
import RiskReview from './components/pages/risks/RiskReview/RiskReview.jsx'
import RiskUpdate from './components/pages/risks/RiskUpdate/RiskUpdate.jsx'
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
import ProfileLayout from './components/profile/ProfileLayout/ProfileLayout.jsx'
import ExpertGuide from './components/pages/homepage/ExpertGuide/ExpertGuide.jsx'
import ExpertGuides from './components/pages/homepage/ExpertGuides/ExpertGuides.jsx'
import HelpCategoryTopics from './components/pages/homepage/HelpCategoryTopics/HelpCategoryTopics.jsx'
import HelpGuide from './components/pages/homepage/HelpGuide/HelpGuide.jsx'
import HelpCategories from './components/pages/homepage/HelpCategories/HelpCategories.jsx'
import LicenseManagement from './components/pages/license-management/LicenseManagement'
import { Navigate } from 'react-router-dom';
import useUser from './hooks/useUser';

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
            {path: 'expert-guides', element: <ExpertGuides />},
            {path: 'expert-guides/:id', element: <ExpertGuide />},
            {path: 'help-categories', element: <HelpCategories />},
            {path: 'help-categories/:id', element: <HelpCategoryTopics />},
            {path: 'help-categories/:categoryId/topics/:topicId', element: <HelpGuide />},
            // NOT IMPLEMENTED YET
            {path: 'not-implemented-yet', element: <div className='h-full w-full grid place-items-center'>This page is not implemented yet</div>},
            // USERS
            {
                path: 'users',
                element: <ManageUsers />,
                children: [
                    {index: true, element: <ManageUsersIndex />},
                    {path: 'add-new-user', element: <AddNewUser />},
                    {path: 'add-multiple-users', element: <AddMultipleUsers />},
                    {path: 'add-active-directory', element: <AddActiveDirectory />},
                    {path: 'edit-profile', element: <EditUserProfile />},
                    {path: 'edit-permissions', element: <EditUserPermissions />},
                ]
            },
            // USER GROUPS
            {
                path: 'user-groups',
                element: <UserGroups />,
                children: [
                    {index: true, element: <UserGroupsIndex />},
                    {path: 'create-new', element: <CreateUserGroup />},
                    {path: 'edit-permissions', element: <EditUserGroupPermissions />},
                    {path: 'members', element: <UserGroupMembers />},
                ]
            },
            // STRATEGIES
            // {
            //     path: 'strategies',
            //     element: <BusinessStrategy />,
            //     children: [
            //         {index: true, element: <BusinessStrategyIndex />},
            //         {path: 'dashboard', element: <StrategyDashboard />},
            //         {path: ':id', element: <BusinessStrategyIndex />, breadcrumb: StrategyDynamicBreadcrumb},
            //         {path: ':id/vmc', element: <StrategyVMC />, breadcrumb: 'VMC'},
            //         {path: ':id/vmc/:mode', element: <UpdateStrategyVmc />},
            //         {path: ':id/themes', element: <StrategyThemes />},
            //         {path: ':id/themes/:mode', element: <UpdateStrategyThemes />},
            //         {path: 'analysis', element: <AnalysisIndex /> },
            //     ]
            // },
            // RISKS
            {
                path: 'risks',
                element: <RiskLayout />,
                children: [
                    {index: true, element: <RiskLog />},
                    {path: 'dashboard', element: <RiskDashboard />},
                    {path: 'register/:step?', element: <RiskRegister />},
                    {path: ':id', element: <RiskReview />, breadcrumb: RiskDynamicBreadcrumb},
                    {path: ':id/update', element: <RiskUpdate />},
                ]
            },
            // PROCESS MANAGEMENT
            {
                path: "process-management",
                element: <ProcessManagement />,
                children: [{ index: true, element: <ProcessManagementIndex /> }],
            },
            // {
            //     path: "issues-and-incidents",
            //     element: <IssuesAndIncidents />,
            //     children: [
            //       { index: true, element: <IssuesAndIncidentsIndex /> },
            //       // {path: 'strategy-vmc', element: <StrategyVMC />},
            //       // {path: 'strategy-themes', element: <StrategyThemes />},
            //     ],
            // },
            // PROFILE
            {
                path: "profile",
                element: <ProfileLayout />,
                children: [{index: true, element: <UserPreferences />},],
            },
            // SETTINGS
            {
                path: 'settings',
                element: <SettingsLayout />,
                children: [
                    {index: true, element: <OrganizationalStructureLayout />},
                    {
                        path: 'organizational-structure',
                        element: <OrganizationalStructureLayout />,
                        children: [
                            {path: 'company-info', element: <CompanyInformation />},
                            {path: 'subsidiaries', element: <SubsidiaryInformation />,},
                            {path: 'branches', element: <BranchInformation />},
                            {path: 'divisions', element: <DivisionInformation />},
                            {path: 'departments', element: <DepartmentInformation />},
                            {path: 'units', element: <UnitInformation />},
                        ]
                    },
                    {
                        path: 'location',
                        element: <LocationLayout />,
                        children: [
                            {index: true, element: <LocationIndex />},
                            {path: 'add-country', element: <AddCountry />},
                            {path: 'add-state', element: <AddState />,},
                            {path: 'add-city', element: <AddCity />},
                        ]
                    },
                    {
                        path: 'risk-management',
                        element: <RiskManagementLayout />,
                        children: [
                            {index: true, element: <RiskManagementIndex />},
                            {path: 'risk-matrix', element: <RiskMatrixSetup />},
                            {path: 'risk-boundary', element: <RiskBoundarySetup />,},
                            {path: 'risk-classification', element: <ManageRiskClassification />},
                            {path: 'risk-appetite', element: <ManageRiskAppetite />},
                            {path: 'control-family-types', element: <ControlFamilyTypes />},
                            {path: 'control-effectiveness', element: <ControlEffectiveness />},
                            {path: 'risk-responses', element: <RiskResponses />},
                            {path: 'risk-indicators', element: <ManageRiskIndicators />},
                        ]
                    },
                    {path: 'not-implemented', element: <div className='h-full w-full grid place-items-center'>This page is not implemented yet</div>}
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
