import React, { useState } from "react";
import {
  FormCancelButton,
  FormCustomButton,
  FormProceedButton,
} from "../../../partials/buttons/FormButtons/FormButtons";

const Evidence = () => {
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [formData, setFormData] = useState({ description: "INitiall desc" });

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
    <div className="bg-white mt-4 p-7 pt-4 border border-[#CCC] w-full flex flex-col gap-6 rounded-lg relative">
      <h2 className="text-lg font-semibold mb-4">Incidence ID: 32930</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Evidence Upload */}
        <div className="flex flex-col items-center border-2 border-dashed border-gray-300 p-4 rounded-lg">
          <label className="font-medium mb-2">Evidence</label>
          <input
            type="file"
            onChange={handleEvidenceUpload}
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

        {/* Other Relevant Attachments Upload */}
        <div className="flex flex-col items-center border-2 border-dashed border-gray-300 p-4 rounded-lg">
          <label className="font-medium mb-2">Other Relevant Attachments</label>
          <input
            type="file"
            onChange={handleAttachmentUpload}
            className="hidden"
            id="attachmentUpload"
          />
          <label
            htmlFor="attachmentUpload"
            className="cursor-pointer px-4 py-2 bg-white border border-pink-500 text-pink-500 rounded hover:bg-pink-50"
          >
            {attachmentFile ? attachmentFile.name : "Upload File"}
          </label>
          <p className="text-gray-500 text-sm mt-2">Or drop file to upload</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <FormCancelButton text={"Discard"} />
        <FormCustomButton text={"Previous"} />
        <FormProceedButton text={"Next"} />
      </div>
    </div>
  );
};

export default Evidence;
