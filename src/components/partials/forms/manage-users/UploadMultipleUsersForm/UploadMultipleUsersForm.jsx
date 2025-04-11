import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { parse } from 'papaparse';

function UploadMultipleUsersForm({ file, setFile, validationErrors, setValidationErrors, onSuccess, onError }) {
    const [csvData, setCsvData] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fileTypes = ['CSV'];

    const handleFileChange = (file) => {
        setValidationErrors({});
        setFile(file);
        setCsvData([]);
        setIsDataLoaded(false);
    };

    const handleDisplayContent = async () => {
        if (!file) {
            setValidationErrors({ file: 'Please select a file first' });
            return;
        }

        try {
            const text = await file.text();
            parse(text, {
                complete: (results) => {
                    const parsedData = results.data
                        .filter(row => row.length >= 3 && row.some(cell => cell.trim()))
                        .map(([firstName, lastName, email]) => ({
                            firstName: firstName?.trim() || '',
                            lastName: lastName?.trim() || '',
                            email: email?.trim() || '',
                            isEditable: false
                        }));
                    setCsvData(parsedData);
                    setIsDataLoaded(true);
                },
                error: () => {
                    setValidationErrors({ file: 'Error parsing CSV file' });
                }
            });
        } catch (error) {
            setValidationErrors({ file: 'Error reading file' });
        }
    };

    const handleAddNewField = () => {
        setCsvData([...csvData, { 
            firstName: '', 
            lastName: '', 
            email: '',
            isEditable: true 
        }]);
        if (!isDataLoaded) setIsDataLoaded(true);
    };

    const handleFieldChange = (index, field, value) => {
        const newData = [...csvData];
        newData[index] = { ...newData[index], [field]: value };
        setCsvData(newData);
    };

    const filteredData = csvData.filter(row => {
        const searchLower = searchQuery.toLowerCase();
        return (
            row.firstName.toLowerCase().includes(searchLower) ||
            row.lastName.toLowerCase().includes(searchLower) ||
            row.email.toLowerCase().includes(searchLower)
        );
    });

    const isValidEmail = (email) => {
        return email.includes('@') && email.includes('.');
    };

    const transformUserData = (users) => {
        const transformedData = {
            user_details: users.map(user => ({
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
                require_password_change: true,
                generate_password: true,
                send_email: true,
                verify_email_delivery: true  // Request email delivery verification
            })),
            subsidiary_id: null,
            email_settings: {
                require_email_confirmation: true,  // Request confirmation of email sending
                return_email_status: true,         // Request email status in response
                notification_type: 'password_credentials'  // Specify the type of email to send
            }
        };
        
        // Log the data being sent
        console.log('Sending user data to backend:', JSON.stringify(transformedData, null, 2));
        
        return transformedData;
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-[12px] font-medium mb-2">Multiple User Upload</h2>
                <p className="text-[12px] text-gray-600">
                    Upload a CSV file with user details create from the standard template.{' '}
                    <a href="#" className="text-pink-500 hover:underline">
                        Download template
                    </a>
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="w-64 border border-dashed border-gray-300 rounded p-4" style={{ borderWidth: '1px' }}>
                    <FileUploader
                        handleChange={handleFileChange}
                        name="file"
                        types={fileTypes}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <button className="border border-pink-500 rounded px-4 py-1.5 text-[12px] hover:bg-gray-50">
                                Select File
                            </button>
                            <span className="text-[12px] text-gray-500">
                                Or drop file to upload
                            </span>
                        </div>
                    </FileUploader>
                </div>

                <span className="text-[12px] text-gray-700">
                    {file ? file.name : 'File.CSV'}
                </span>

                <div className="flex-1"></div>
                
                <button
                    onClick={handleDisplayContent}
                    className={`h-9 px-4 rounded text-[12px] ${
                        file 
                        ? 'bg-pink-500 text-white hover:bg-pink-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Display Content
                </button>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by first name, last name or email address"
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded text-[12px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
            </div>

            <div className="border-t border-gray-200">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="py-3 text-left font-medium text-gray-600 text-[12px]">First Name</th>
                            <th className="py-3 text-left font-medium text-gray-600 text-[12px]">Last Name</th>
                            <th className="py-3 text-left font-medium text-gray-600 text-[12px]">Email Address</th>
                            <th className="py-3 text-center font-medium text-gray-600 text-[12px] w-10">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isDataLoaded ? (
                            <>
                                {filteredData.map((row, index) => {
                                    const isComplete = row.firstName.trim() !== '' && 
                                                     row.lastName.trim() !== '' && 
                                                     row.email.trim() !== '' &&
                                                     isValidEmail(row.email);
                                    return (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="py-2">
                                                {row.isEditable ? (
                                                    <input
                                                        type="text"
                                                        value={row.firstName}
                                                        onChange={(e) => handleFieldChange(index, 'firstName', e.target.value)}
                                                        className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded"
                                                        placeholder="First Name"
                                                    />
                                                ) : (
                                                    <span className="text-[12px]">{row.firstName}</span>
                                                )}
                                            </td>
                                            <td className="py-2">
                                                {row.isEditable ? (
                                                    <input
                                                        type="text"
                                                        value={row.lastName}
                                                        onChange={(e) => handleFieldChange(index, 'lastName', e.target.value)}
                                                        className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded"
                                                        placeholder="Last Name"
                                                    />
                                                ) : (
                                                    <span className="text-[12px]">{row.lastName}</span>
                                                )}
                                            </td>
                                            <td className="py-2">
                                                {row.isEditable ? (
                                                    <input
                                                        type="email"
                                                        value={row.email}
                                                        onChange={(e) => handleFieldChange(index, 'email', e.target.value)}
                                                        className="w-full px-2 py-1 text-[12px] border border-gray-300 rounded"
                                                        placeholder="Email Address"
                                                    />
                                                ) : (
                                                    <span className="text-[12px]">{row.email}</span>
                                                )}
                                            </td>
                                            <td className="py-2 text-center">
                                                {isComplete ? (
                                                    <span className="text-green-500 text-lg">✓</span>
                                                ) : (
                                                    <span className="text-red-500 text-lg">✗</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td colSpan="4" className="py-3">
                                        <button 
                                            onClick={handleAddNewField}
                                            className="flex items-center gap-2 text-[12px] text-pink-500 hover:text-pink-600"
                                        >
                                            <span className="text-lg">+</span> Add new field
                                        </button>
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr className="border-b border-gray-100">
                                <td className="py-2 text-[12px]"></td>
                                <td className="py-2 text-[12px]"></td>
                                <td className="py-2 text-[12px]"></td>
                                <td className="py-2 text-center">
                                    <span className="text-red-500 text-lg">✗</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-4 mt-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-[12px]"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSuccess(transformUserData(csvData))}
                    className="flex-1 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-[12px]"
                    disabled={!isDataLoaded}
                >
                    Accept
                </button>
            </div>

            {validationErrors.file && (
                <div className="text-red-500 text-[12px] mt-2">{validationErrors.file}</div>
            )}
        </div>
    );
}

export default UploadMultipleUsersForm;