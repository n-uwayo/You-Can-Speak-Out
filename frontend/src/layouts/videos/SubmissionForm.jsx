import React, { useState } from 'react';
import { X, Upload, FileText, Link, Calendar, Clock, AlertCircle } from 'lucide-react';

const SubmissionForm = ({ task, onClose }) => {
  const [submissionType, setSubmissionType] = useState('file');
  const [textSubmission, setTextSubmission] = useState('');
  const [linkSubmission, setLinkSubmission] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically send the data to your backend
    console.log('Submitting:', {
      taskId: task.id,
      type: submissionType,
      files: selectedFiles,
      text: textSubmission,
      link: linkSubmission,
      comments
    });
    
    setIsSubmitting(false);
    onClose();
  };

  const formatDueDate = (dueDate, dueTime) => {
    const date = new Date(`${dueDate} ${dueTime}`);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate, dueTime) => {
    const now = new Date();
    const due = new Date(`${dueDate} ${dueTime}`);
    return now > due;
  };

  const getTimeRemaining = (dueDate, dueTime) => {
    const now = new Date();
    const due = new Date(`${dueDate} ${dueTime}`);
    const diff = due - now;
    
    if (diff <= 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  };

  const canSubmit = () => {
    if (submissionType === 'file' && selectedFiles.length === 0) return false;
    if (submissionType === 'text' && !textSubmission.trim()) return false;
    if (submissionType === 'link' && !linkSubmission.trim()) return false;
    return !isSubmitting;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
            <p className="text-gray-600 mt-1">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {task.points} points
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDueDate(task.dueDate, task.dueTime)}</span>
                </div>
              </div>
              
              <div className={`flex items-center space-x-1 ${
                isOverdue(task.dueDate, task.dueTime) 
                  ? 'text-red-600' 
                  : 'text-orange-600'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-medium">{getTimeRemaining(task.dueDate, task.dueTime)}</span>
              </div>
            </div>

            {isOverdue(task.dueDate, task.dueTime) && (
              <div className="mt-3 flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">This assignment is overdue</span>
              </div>
            )}
          </div>

          {/* Submission Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Submission Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSubmissionType('file')}
                className={`p-3 rounded-lg border-2 text-center ${
                  submissionType === 'file'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">File Upload</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSubmissionType('text')}
                className={`p-3 rounded-lg border-2 text-center ${
                  submissionType === 'text'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Text Entry</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSubmissionType('link')}
                className={`p-3 rounded-lg border-2 text-center ${
                  submissionType === 'link'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Link className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Website URL</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          {submissionType === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload files or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOC, DOCX, TXT, ZIP (Max 10MB per file)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  Choose Files
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text Entry */}
          {submissionType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Submission
              </label>
              <textarea
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your assignment submission here..."
              />
            </div>
          )}

          {/* Link Entry */}
          {submissionType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={linkSubmission}
                onChange={(e) => setLinkSubmission(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-project-url.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure your project is publicly accessible for grading
              </p>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any comments or notes for your instructor..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{task.submitted ? 'Resubmit' : 'Submit Assignment'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;