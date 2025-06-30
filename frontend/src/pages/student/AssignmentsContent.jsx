import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

const AssignmentsContent = ({ userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost/api/student/get_assignments.php?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAssignments(data.data);
        else console.error(data.message);
      })
      .catch(err => console.error("Error fetching assignments:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Assignments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No assignments uploaded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Task</th>
                <th className="px-4 py-2">Brief</th>
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Grade</th>
                <th className="px-4 py-2">Feedback</th>
                <th className="px-4 py-2">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map((a, index) => (
                <tr key={a.id}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{a.title || 'Untitled course'}</td>
                  <td className="px-4 py-2">{a.task_title || 'Untitled Task'}</td>
                  <td className="px-4 py-2">{a.text_submission}</td>
                  <td className="px-4 py-2">
                    <a 
                      href={`http://localhost/api/student/uploads/${a.file_urls}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  </td>
                  <td className="px-4 py-2">{a.status || ''}</td>
                  <td className="px-4 py-2">{a.grade || ''}</td>
                  <td className="px-4 py-2">{a.feedback || '-'}</td>
                  <td className="px-4 py-2">{new Date(a.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignmentsContent;
