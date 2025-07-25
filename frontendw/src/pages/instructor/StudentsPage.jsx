import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Search, 
  MessageSquare 
} from 'lucide-react';

const StudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', progress: 85, tasksCompleted: 12, tasksTotal: 15, joinDate: '2025-01-01' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', progress: 78, tasksCompleted: 10, tasksTotal: 15, joinDate: '2025-01-01' },
    { id: 3, name: 'Carol Wilson', email: 'carol@example.com', progress: 92, tasksCompleted: 14, tasksTotal: 15, joinDate: '2025-01-01' },
    { id: 4, name: 'David Brown', email: 'david@example.com', progress: 67, tasksCompleted: 8, tasksTotal: 15, joinDate: '2025-01-02' },
    { id: 5, name: 'Emma Davis', email: 'emma@example.com', progress: 88, tasksCompleted: 13, tasksTotal: 15, joinDate: '2025-01-02' },
    { id: 6, name: 'Frank Miller', email: 'frank@example.com', progress: 73, tasksCompleted: 9, tasksTotal: 15, joinDate: '2025-01-03' }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage your enrolled students</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-indigo-600 font-semibold text-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{student.progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Tasks: {student.tasksCompleted}/{student.tasksTotal}</span>
              <span>Joined: {student.joinDate}</span>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                View Profile
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsPage;