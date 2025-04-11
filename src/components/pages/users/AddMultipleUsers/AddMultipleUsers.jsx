import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import PageHeader from '../../../partials/PageHeader/PageHeader';
import UploadMultipleUsersForm from '../../../partials/forms/manage-users/UploadMultipleUsersForm/UploadMultipleUsersForm';
import { useAddUsers } from '../../../../queries/users-queries';
import PageTitle from '../../../partials/PageTitle/PageTitle';
import useDispatchMessage from '../../../../hooks/useDispatchMessage';

function AddMultipleUsers() {
    const [file, setFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [createdUsers, setCreatedUsers] = useState([]);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const dispatchMessage = useDispatchMessage();
    
    const { mutate, isPending } = useAddUsers({
        onSuccess: (data) => {
            console.log('CSV upload response:', data);
            // Invalidate users query to refresh the list immediately
            queryClient.invalidateQueries({queryKey: ['users']});
            
            if (data.users && data.users.length > 0) {
                // Store created users with their IDs
                const processedUsers = data.users.map(user => ({
                    ...user,
                    user_id: user.id || user.user_id,
                    firstname: user.first_name || user.firstname,
                    lastname: user.last_name || user.lastname,
                    email: user.email_address || user.email
                }));
                console.log('Processed users:', processedUsers);
                setCreatedUsers(processedUsers);
                
                // Show success message with improved text
                dispatchMessage('success', `Successfully created ${processedUsers.length} user${processedUsers.length > 1 ? 's' : ''}`);
                
                // Show the modal with user details
                setShowPasswordModal(true);
            } else {
                dispatchMessage('success', data.message || 'Users created successfully');
                // Redirect to the users list page after a short delay
                setTimeout(() => {
                    navigate('/users');
                }, 1500);
            }
        },
        onError: (error) => {
            console.error('CSV upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add users. Please try again.';
            dispatchMessage('error', errorMessage);
        }
    });

    useEffect(() => {
        if (isPending) {
            dispatchMessage('processing', 'Adding new users...');
        }
    }, [isPending]);

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        queryClient.invalidateQueries({queryKey: ['users']});
        navigate('/users');
    };

    return (
        <div className='p-10 pt-4 max-w-7xl flex flex-col gap-6'>
            <PageTitle title={'Add multiple users'} />
            <PageHeader>
                <div className='flex gap-3 items-center'>
                    {/* Header content goes here if needed */}
                </div>
            </PageHeader>
            <div className='bg-white rounded-lg p-6'>
                <UploadMultipleUsersForm
                    file={file}
                    setFile={setFile}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                    onSuccess={(data) => mutate({ formData: data })}
                    onError={(error) => setValidationErrors({ file: error })}
                />
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
                        <h3 className="text-lg font-semibold mb-4">Users Created Successfully</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                The following users have been created successfully:
                            </p>
                            <div className="bg-blue-50 p-4 rounded mb-4">
                                <p className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Important Email Information:</span>
                                </p>
                                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                    <li>Login credentials are being sent to each user's email address</li>
                                    <li>Email delivery may take a few minutes</li>
                                    <li>Users should check both their inbox and spam/junk folders</li>
                                    <li>If users don't receive their email within 15 minutes:
                                        <ul className="list-disc pl-5 mt-1">
                                            <li>Ask them to check their spam/junk folder again</li>
                                            <li>Verify their email address is correct</li>
                                            <li>Contact your system administrator to verify email delivery</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full mb-4">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left text-sm">Email</th>
                                        <th className="py-2 text-left text-sm">Name</th>
                                        <th className="py-2 text-left text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {createdUsers.map((user, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-2 text-sm">{user.email}</td>
                                            <td className="py-2 text-sm">{`${user.firstname} ${user.lastname}`}</td>
                                            <td className="py-2 text-sm">
                                                <span className="text-green-500">✓</span> Created
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Note: Email delivery status is handled by the email server and may not be immediately available.
                            </p>
                            <button
                                onClick={handleClosePasswordModal}
                                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddMultipleUsers;