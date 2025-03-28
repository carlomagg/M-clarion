import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../../partials/buttons/FormButtons/FormButtons";
import ProcessQueue from "./ProcessQueue";

const ImportProcess = () => {
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [formData, setFormData] = useState({ description: "INitiall desc" });

  const [tableData, setTableData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setTableData(jsonData); // Update the table data
      };

      reader.readAsArrayBuffer(file);
    }
  };
  console.log(tableData);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  const handleEvidenceUpload = (event) => {
    setEvidenceFile(event.target.files[0]);
  };

  const handleAttachmentUpload = (event) => {
    setAttachmentFile(event.target.files[0]);
  };

  return (
    <>
      <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
        <h2 className="text-lg font-semibold mb-4">Import Processes</h2>

        <div className=" gap-4 mb-4">
          {/* Evidence Upload */}
          <p>Select Excel file</p>
          <div className="flex flex-col justify-center items-center border-2 border-dashed border-gray-300 p-2 w-1/2 rounded-lg">
            <label className="font-medium mb-2">Evidence</label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="evidenceUpload"
            />
            <label
              htmlFor="evidenceUpload"
              className="cursor-pointer px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
            >
              {evidenceFile ? evidenceFile.name : "Upload File"}
            </label>
            <p className="text-gray-500 text-sm mt-2">Or drop file to upload</p>
          </div>
        </div>
        {/* Table Section */}
        {tableData.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  {Object.keys(tableData[0]).map((key) => (
                    <th key={key} className="px-4 py-2 border border-gray-300">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-100">
                    {Object.values(row).map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-4 py-2 border border-gray-300"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <FormCancelButton text={"Discard"} />
          <FormProceedButton text={"Next"} />
        </div>
      </div>
      <ProcessQueue />
    </>
  );
};

export default ImportProcess;
