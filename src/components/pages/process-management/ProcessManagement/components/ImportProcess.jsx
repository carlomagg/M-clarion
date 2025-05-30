import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import ProcessQueue from "./ProcessQueue";
import { useImportProcesses } from "../../../../../queries/processes/process-queries";
import { useMessage } from "../../../../../contexts/MessageContext.jsx";
import { InformationCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ImportProcess = () => {
  const navigate = useNavigate();
  const [importMethod, setImportMethod] = useState("file"); // "file" or "json"
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const [processesData, setProcessesData] = useState({ processes: [] });
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const { dispatchMessage } = useMessage();

  // Set up import processes mutation
  const { mutate: importProcesses, isPending } = useImportProcesses({
    onSuccess: (data) => {
      // Handling the response with status, created_processes, and errors
      if (data.status === "completed") {
        if (data.created_processes && data.created_processes.length > 0) {
          dispatchMessage('success', `Successfully imported ${data.created_processes.length} processes to catalog`);
        } else {
          dispatchMessage('info', 'Import completed but no processes were created');
        }
      } else {
        if (data.errors && data.errors.length > 0) {
          dispatchMessage('failed', `Import failed with ${data.errors.length} errors`);
        } else {
          dispatchMessage('failed', 'Import failed');
        }
      }
      // Navigate to process catalog
      navigate("/process-management/log");
    },
    onError: (error) => {
      dispatchMessage('failed', error.response?.data?.message || 'Failed to import processes');
    }
  });

  // Function to download the template
  const downloadTemplate = () => {
    try {
      // Create the headers for the template matching the expected API format
      const headers = ['Name', 'Description'];
      
      // Create a worksheet with headers
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      
      // Add some sample data rows that match the processes array format
      const sampleData = [
        ['HR Onboarding Process 1', 'Covers employee onboarding from offer to first day.'],
        ['Procurement Process 1', 'Handles procurement requests and approvals.'],
        ['IT Incident Response 1', 'Tracks and manages IT-related issues and outages.']
      ];
      
      // Append the sample data to the worksheet
      XLSX.utils.sheet_add_aoa(ws, sampleData, { origin: 'A2' });
      
      // Add notes about the template format
      const notes = XLSX.utils.aoa_to_sheet([
        ['Import Template Notes:'],
        [''],
        ['This template is designed to match the expected payload structure:'],
        [''],
        ['{ '],
        ['  "processes": ['],
        ['    {'],
        ['      "name": "HR Onboarding Process 1",'],
        ['      "description": "Covers employee onboarding from offer to first day."'],
        ['    },'],
        ['    {'],
        ['      "name": "Procurement Process 1",'],
        ['      "description": "Handles procurement requests and approvals."'],
        ['    },'],
        ['    ...'],
        ['  ]'],
        ['}'],
        [''],
        ['Fill in Name and Description for each process you want to import.']
      ]);
      
      // Create a new workbook and add the worksheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Process Template');
      XLSX.utils.book_append_sheet(wb, notes, 'Import Notes');
      
      // Generate the Excel file
      XLSX.writeFile(wb, `process-import-template.xlsx`);
      
      dispatchMessage('success', 'Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      dispatchMessage('failed', 'Failed to download template');
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setEvidenceFile(file);

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Process the Excel data to match the required payload format
          // Map the columns correctly based on the new template format
          const processesForDisplay = jsonData.map(row => ({
            name: row['Name'] || row.name || '',
            description: row['Description'] || row.description || ''
          }));
          
          setTableData(processesForDisplay);
          
          // Format the data to match the structure expected by the API
          const processes = jsonData.map(row => ({
            name: row['Name'] || row.name || '',
            description: row['Description'] || row.description || ''
          }));
          
          setProcessesData({ processes });
          setIsPreviewVisible(true);
        } catch (error) {
          dispatchMessage('failed', 'Failed to parse Excel file: ' + error.message);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleJsonInputChange = (e) => {
    setJsonInput(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      
      // Handle different JSON structure options
      
      // If the JSON has the processes array format (the correct format)
      if (parsed.processes && Array.isArray(parsed.processes)) {
        // Use the processes array directly
        setProcessesData(parsed);
        setTableData(parsed.processes);
        setIsPreviewVisible(true);
      }
      // Handle legacy format with created_processes (for backward compatibility)
      else if (parsed.created_processes && Array.isArray(parsed.created_processes)) {
        // Transform to the expected format with name and description
        const processes = parsed.created_processes.map(proc => ({
          name: proc.process_title || '',
          description: ''
        }));
        
        setProcessesData({ processes });
        setTableData(processes);
        setIsPreviewVisible(true);
      } 
      // Invalid format
      else {
        setIsPreviewVisible(false);
      }
    } catch (error) {
      // Don't show an error while typing, just don't update the preview
      setIsPreviewVisible(false);
    }
  };

  const handleImportClick = () => {
    // Validate data structure before importing
    if (!processesData.processes || !Array.isArray(processesData.processes) || processesData.processes.length === 0) {
      dispatchMessage('failed', 'Invalid import data structure. Please ensure you have valid process data.');
      return;
    }

    // Make sure each process has at least a name
    const invalidProcesses = processesData.processes.filter(p => !p.name);
    if (invalidProcesses.length > 0) {
      dispatchMessage('failed', `${invalidProcesses.length} processes are missing a name.`);
      return;
    }

    // Create the payload with the correct format that the API expects
    const apiPayload = {
      processes: processesData.processes.map(process => ({
        name: process.name || "",
        description: process.description || ""
      }))
    };

    // Log the exact data being sent for debugging
    console.log('Sending process import request with data:', JSON.stringify(apiPayload, null, 2));

    // Proceed with import using the correctly structured payload
    importProcesses({ data: apiPayload });
  };

  const handleDiscard = () => {
    // Reset all state variables
    setImportMethod("file");
    setEvidenceFile(null);
    setTableData([]);
    setJsonInput('');
    setProcessesData({ processes: [] });
    setIsPreviewVisible(false);
  };
  
  const handleBack = () => {
    // Go back to process catalog
    navigate("/process-management/log");
  };

  return (
    <>
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
        {/* Back button */}
        <a 
          href="/process-management/log"
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-pink-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Back to Catalog</span>
        </a>
        
        <h2 className="text-lg font-semibold mb-2 mt-6">Import Processes</h2>
        
        {/* Info banner explaining where processes will appear */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 mb-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 text-sm">
            Imported processes will be added directly to your main process catalog where they can be viewed, edited and managed.
          </p>
        </div>

        {/* Import Method Selection */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              importMethod === "file" 
              ? "bg-pink-500 text-white" 
              : "bg-white border border-pink-500 text-pink-500"
            }`}
            onClick={() => {
              setImportMethod("file");
              setIsPreviewVisible(false);
            }}
          >
            Excel File Upload
          </button>
          <button
            className={`px-4 py-2 rounded ${
              importMethod === "json" 
              ? "bg-pink-500 text-white" 
              : "bg-white border border-pink-500 text-pink-500"
            }`}
            onClick={() => {
              setImportMethod("json");
              setIsPreviewVisible(false);
            }}
          >
            JSON Input
          </button>
        </div>

        {/* File Upload Section */}
        {importMethod === "file" && (
          <div className="gap-4 mb-4">
            <p className="mb-2">Upload a XLS worksheet file with process details create from the standard template.</p>
            <p className="mb-4">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  downloadTemplate();
                }}
                className="text-pink-500 hover:text-pink-700 font-medium underline"
              >
                Download template
              </a>
            </p>
            <div className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 p-6 w-full rounded-lg">
              <label className="font-medium mb-2">Process Data</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="processUpload"
                accept=".xlsx,.xls"
              />
              <label
                htmlFor="processUpload"
                className="cursor-pointer px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
              >
                {evidenceFile ? evidenceFile.name : "Upload File"}
              </label>
              <p className="text-gray-500 text-sm mt-2">Or drop file to upload</p>
              <p className="text-gray-500 text-xs mt-4">
                Excel file should contain columns with 'Name' and 'Description' fields
              </p>
            </div>
            
            {/* Show Import button directly under the file upload section when a file is selected */}
            {evidenceFile && !isPreviewVisible && (
              <div className="mt-4 flex justify-end">
                <button 
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                  onClick={() => {
                    if (evidenceFile) {
                      dispatchMessage('info', 'Processing file...');
                      // The file is already being processed in the handleFileUpload function
                    }
                  }}
                >
                  Process File
                </button>
              </div>
            )}
          </div>
        )}

        {/* JSON Input Section */}
        {importMethod === "json" && (
          <div className="gap-4 mb-4">
            <p>Paste JSON data</p>
            <div className="flex flex-col justify-center items-start w-full rounded-lg">
              <textarea
                value={jsonInput}
                onChange={handleJsonInputChange}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder={`{
  "processes": [
    {
      "name": "HR Onboarding Process 1",
      "description": "Covers employee onboarding from offer to first day."
    },
    {
      "name": "Procurement Process 1",
      "description": "Handles procurement requests and approvals."
    },
    {
      "name": "IT Incident Response 1",
      "description": "Tracks and manages IT-related issues and outages."
    }
  ]
}`}
              />
              <p className="text-gray-500 text-xs mt-2">
                JSON must follow the exact structure shown above with <code>processes</code> array containing objects with <code>name</code> and <code>description</code> fields.
              </p>
            </div>
          </div>
        )}

        {/* Preview Table Section */}
        {isPreviewVisible && tableData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h3 className="text-md font-semibold mb-2">Preview: {tableData.length} Processes to Import</h3>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2 border border-gray-300">Name</th>
                  <th className="px-4 py-2 border border-gray-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border border-gray-300">
                      {row.name || ''}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {row.description || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <a 
            href="/process-management/log" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </a>
          
          <button 
            className="px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
            onClick={handleDiscard}
          >
            Reset Form
          </button>
          
          {isPreviewVisible && (
            <button 
              className={`px-4 py-2 rounded ${isPending ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
              onClick={handleImportClick}
              disabled={isPending}
            >
              {isPending ? "Importing..." : "Import to Catalog"}
            </button>
          )}
        </div>
      </div>
      <ProcessQueue />
    </>
  );
};

export default ImportProcess;
