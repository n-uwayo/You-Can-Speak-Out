import React from 'react';
import { 
  Users,
  BookOpen,
  Award,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp
} from 'lucide-react';

const AnalyticsPage = () => {
  const stats = [
    { title: 'Total Students', value: '127', change: '+8%', icon: Users, color: 'text-blue-600' },
    { title: 'Course Completion', value: '76%', change: '+12%', icon: BookOpen, color: 'text-green-600' },
    { title: 'Average Grade', value: 'B+', change: '+5%', icon: Award, color: 'text-purple-600' },
    { title: 'Engagement Rate', value: '84%', change: '+3%', icon: Activity, color: 'text-orange-600' }
  ];

  const topStudents = [
    { name: 'Carol Wilson', score: 92, trend: 'up' },
    { name: 'Emma Davis', score: 88, trend: 'up' },
    { name: 'Alice Johnson', score: 85, trend: 'stable' },
    { name: 'Bob Smith', score: 78, trend: 'down' },
    { name: 'Frank Miller', score: 73, trend: 'up' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track performance and engagement metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.color}`}>{stat.change} from last month</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Engagement</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <BarChart3 className="w-16 h-16 text-gray-400" aria-hidden="true" />
            <span className="ml-2 text-gray-500">Chart Placeholder</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <PieChart className="w-16 h-16 text-gray-400" aria-hidden="true" />
            <span className="ml-2 text-gray-500">Chart Placeholder</span>
          </div>
        </div>
      </div>

      {/* Top Performing Students */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Performing Students</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                    <span className="text-indigo-600 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">Overall Score: {student.score}%</p>
                  </div>
                </div>
                <TrendingUp 
                  className={`w-5 h-5 ${
                    student.trend === 'up' ? 'text-green-500' : 
                    student.trend === 'down' ? 'text-red-500' : 
                    'text-gray-400'
                  }`} 
                  title={`Performance trend: ${student.trend}`} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;