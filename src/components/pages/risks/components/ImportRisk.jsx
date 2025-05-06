import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../partials/buttons/FormButtons/FormButtons";
import { useImportRisks } from "../../../../queries/risks/risk-import-queries";
import { useMessage } from "../../../../contexts/MessageContext.jsx";
import { InformationCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ImportRisk = () => {
  const navigate = useNavigate();
  const [importMethod, setImportMethod] = useState("file"); // "file" or "json"
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const [risksData, setRisksData] = useState({ risks: [] });
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const { dispatchMessage } = useMessage();

  // Set up import risks mutation
  const { mutate: importRisks, isPending } = useImportRisks({
    onSuccess: (data) => {
      // Log the complete response for debugging
      console.log("Import response:", data);

      // Always interpret a HTTP success as a successful import unless explicitly marked as failed
      if (!data || data.status === "failed") {
        console.log("Import explicitly marked as failed");
        if (data?.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map(err => err.message).join(", ");
          dispatchMessage('failed', `Import failed: ${errorMessages}`);
        } else {
          dispatchMessage('failed', 'Import failed with unknown error');
        }
      } else {
        // Any other status or if status is missing but we got a response, treat as success
        console.log("Treating import as successful");
        
        // Try to determine how many risks were created
        let createdCount = 0;
        
        if (data.created_risks && Array.isArray(data.created_risks)) {
          createdCount = data.created_risks.length;
        } else if (Array.isArray(data)) {
          createdCount = data.length;
        } else if (data.risks && Array.isArray(data.risks)) {
          createdCount = data.risks.length;
        } else {
          // If we can't determine, use the number we submitted
          createdCount = tableData.length;
        }
        
        if (createdCount > 0) {
          dispatchMessage('success', `Successfully imported ${createdCount} risks to catalog`);
        } else {
          dispatchMessage('info', 'Import completed but no risks were created');
        }
      }
      
      // Navigate to risk catalog
      navigate("/risks");
    },
    onError: (error) => {
      console.error("Import error:", error);
      dispatchMessage('failed', error.response?.data?.message || 'Failed to import risks');
    }
  });

  // Function to download the template
  const downloadTemplate = () => {
    try {
      // Create the headers for the template matching the expected API format
      const headers = ['Name', 'Description'];
      
      // Create a worksheet with headers
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      
      // Add some sample data rows that match the risks array format
      const sampleData = [
        ['Risk of Data Breach', 'There is a potential risk of unauthorized access to sensitive data.'],
        ['Operational Downtime', 'Unexpected system outage could halt operations temporarily.'],
        ['Vendor Dependency', 'Over-reliance on third-party vendors could affect service delivery.']
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
        ['  "risks": ['],
        ['    {'],
        ['      "name": "Risk of Data Breach",'],
        ['      "description": "There is a potential risk of unauthorized access to sensitive data."'],
        ['    },'],
        ['    {'],
        ['      "name": "Operational Downtime",'],
        ['      "description": "Unexpected system outage could halt operations temporarily."'],
        ['    },'],
        ['    ...'],
        ['  ]'],
        ['}'],
        [''],
        ['Fill in Name and Description for each risk you want to import.']
      ]);
      
      // Create a new workbook and add the worksheets
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Risk Template');
      XLSX.utils.book_append_sheet(wb, notes, 'Import Notes');
      
      // Generate the Excel file
      XLSX.writeFile(wb, `risk-import-template.xlsx`);
      
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
          const risksForDisplay = jsonData.map(row => ({
            name: row['Name'] || row.name || '',
            description: row['Description'] || row.description || ''
          }));
          
          setTableData(risksForDisplay);
          
          // Format the data to match the structure expected by the API
          const risks = jsonData.map(row => ({
            name: row['Name'] || row.name || '',
            description: row['Description'] || row.description || ''
          }));
          
          setRisksData({ risks });
          setIsPreviewVisible(true);
        } catch (error) {
          dispatchMessage('failed', 'Failed to parse Excel file: ' + error.message);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleJsonChange = (e) => {
    const jsonText = e.target.value;
    setJsonInput(jsonText);
    
    try {
      // Parse and validate the JSON input
      const parsed = JSON.parse(jsonText);
      
      // Check if it has the required structure with risks array
      if (!parsed.risks || !Array.isArray(parsed.risks)) {
        throw new Error('Invalid format. JSON must contain a "risks" array.');
      }
      
      // Check each risk has the required properties
      const invalidRisks = parsed.risks.filter(risk => 
        !risk.name || !risk.description
      );
      
      if (invalidRisks.length > 0) {
        throw new Error('Each risk must have "name" and "description" properties.');
      }
      
      // Set the data for display in the preview table
      setTableData(parsed.risks);
      
      // Set the data for the API
      setRisksData(parsed);
      
      // Show the preview
      setIsPreviewVisible(true);
    } catch (error) {
      setIsPreviewVisible(false);
      dispatchMessage('failed', 'Invalid JSON format: ' + error.message);
    }
  };
  
  const handleSubmit = () => {
    if (tableData.length === 0) {
      dispatchMessage('failed', 'No risks data available to import');
      return;
    }
    
    try {
      if (importMethod === "file" && !evidenceFile) {
        dispatchMessage('failed', 'Please upload a file first');
        return;
      } else if (importMethod === "json" && !jsonInput.trim()) {
        dispatchMessage('failed', 'Please enter JSON data first');
        return;
      }
      
      // Call the import mutation
      importRisks({ data: risksData });
    } catch (error) {
      dispatchMessage('failed', 'Error preparing import: ' + error.message);
    }
  };

  return (
    <>
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
        {/* Back button */}
        <a 
          href="/risks"
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-pink-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">Back to Risks</span>
        </a>
        
        <h2 className="text-lg font-semibold mb-2 mt-6">Import Risks</h2>
        
        {/* Info banner explaining where risks will appear */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 mb-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700 text-sm">
            Imported risks will be added directly to your risk register where they can be viewed, edited and managed.
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
            <p className="mb-2">Upload a XLS worksheet file with risk details created from the standard template.</p>
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
              <label className="font-medium mb-2">Risk Data</label>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="riskUpload"
                accept=".xlsx,.xls"
              />
              <label
                htmlFor="riskUpload"
                className="cursor-pointer px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
              >
                {evidenceFile ? evidenceFile.name : "Upload File"}
              </label>
              <p className="text-gray-500 text-sm mt-2">Or drop file to upload</p>
              <p className="text-gray-500 text-xs mt-4">
                Excel file should contain columns with 'Name' and 'Description' fields
              </p>
            </div>
          </div>
        )}
        
        {/* JSON Input Section */}
        {importMethod === "json" && (
          <div className="gap-4 mb-4">
            <p className="mb-2">Enter JSON with the risk data in the expected format.</p>
            <p className="mb-4">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  setJsonInput(JSON.stringify({
                    risks: [
                      {
                        name: "Risk of Data Breach",
                        description: "There is a potential risk of unauthorized access to sensitive data."
                      },
                      {
                        name: "Operational Downtime",
                        description: "Unexpected system outage could halt operations temporarily."
                      },
                      {
                        name: "Vendor Dependency",
                        description: "Over-reliance on third-party vendors could affect service delivery."
                      }
                    ]
                  }, null, 2));
                }}
                className="text-pink-500 hover:text-pink-700 font-medium underline"
              >
                Load example JSON
              </a>
            </p>
            <textarea
              value={jsonInput}
              onChange={handleJsonChange}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{\n  "risks": [\n    {\n      "name": "Risk Name",\n      "description": "Risk Description"\n    }\n  ]\n}'
            />
          </div>
        )}
        
        {/* Preview Table */}
        {isPreviewVisible && tableData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h3 className="text-md font-semibold mb-2">Preview: {tableData.length} Risks to Import</h3>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2 border border-gray-300">Name</th>
                  <th className="px-4 py-2 border border-gray-300">Description</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((risk, idx) => (
                  <tr key={idx} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border border-gray-300">{risk.name}</td>
                    <td className="px-4 py-2 border border-gray-300">{risk.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Import Button */}
        <div className="flex gap-3">
          <a 
            href="/risks" 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </a>
          
          <button 
            className="px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
            onClick={() => {
              setEvidenceFile(null);
              setTableData([]);
              setJsonInput('');
              setRisksData({ risks: [] });
              setIsPreviewVisible(false);
            }}
          >
            Reset Form
          </button>
          
          {isPreviewVisible && (
            <button 
              className={`px-4 py-2 rounded ${isPending ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
              onClick={handleSubmit}
              disabled={isPending || tableData.length === 0}
            >
              {isPending ? "Importing..." : "Import to Catalog"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ImportRisk; 