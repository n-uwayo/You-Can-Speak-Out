import React, { useState } from 'react';

const AssignmentUpload = ({ userId, courseId, onSubmit, isSubmitting }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [brief, setBrief] = useState('');
  const [uploading, setUploading] = useState(false);

  const popUpformToUploadFile = () => {
    setShowPopup(true);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleBriefChange = (e) => {
    setBrief(e.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file");

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('brief', brief); // Attach the brief to form data    
    formData.append('user_id', userId);
    formData.append('course_id', courseId);

    for (let [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}


    try {
      setUploading(true);

      const res = await fetch("https://ycspout.umwalimu.com/api/student/upload_assignment.php", {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        alert("Upload successful!");
        setShowPopup(false);
        setSelectedFile(null);
        setBrief('');
        if (onSubmit) onSubmit(result);
      } else {
        alert("Upload failed: " + result.message);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        onClick={popUpformToUploadFile}
        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Upload your work
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Upload your work</h2>

            <input
              type="file"
              onChange={handleFileChange}
              className="mb-4 w-full"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief
            </label>
            <input
              type="text"
              value={brief}
              onChange={handleBriefChange}
              className="mb-4 w-full border border-gray-300 p-2 rounded"
              placeholder="Enter a brief description"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentUpload;
