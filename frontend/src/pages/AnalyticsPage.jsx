import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Video, BookOpen, Clock, ArrowUp, ArrowDown, Calendar, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Sample data for charts
  const userGrowthData = [
    { date: '2024-03-01', users: 1200, newUsers: 45 },
    { date: '2024-03-02', users: 1245, newUsers: 52 },
    { date: '2024-03-03', users: 1297, newUsers: 38 },
    { date: '2024-03-04', users: 1335, newUsers: 61 },
    { date: '2024-03-05', users: 1396, newUsers: 47 },
    { date: '2024-03-06', users: 1443, newUsers: 55 },
    { date: '2024-03-07', users: 1498, newUsers: 42 }
  ];

  const courseCompletionData = [
    { course: 'React Basics', completed: 85, enrolled: 120 },
    { course: 'JavaScript Advanced', completed: 72, enrolled: 95 },
    { course: 'UI/UX Design', completed: 91, enrolled: 110 },
    { course: 'Python Fundamentals', completed: 68, enrolled: 88 },
    { course: 'Database Management', completed: 76, enrolled: 92 }
  ];

  const engagementData = [
    { name: 'Video Views', value: 3420 },
    { name: 'Quiz Attempts', value: 1250 },
    { name: 'Assignments', value: 890 },
    { name: 'Forum Posts', value: 650 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12500, subscriptions: 125 },
    { month: 'Feb', revenue: 15800, subscriptions: 142 },
    { month: 'Mar', revenue: 18200, subscriptions: 158 },
    { month: 'Apr', revenue: 16900, subscriptions: 149 },
    { month: 'May', revenue: 21300, subscriptions: 175 },
    { month: 'Jun', revenue: 24100, subscriptions: 192 }
  ];

  const topCoursesData = [
    { name: 'React Development', students: 245, rating: 4.8 },
    { name: 'Python for Beginners', students: 198, rating: 4.6 },
    { name: 'UI/UX Design', students: 176, rating: 4.9 },
    { name: 'JavaScript Mastery', students: 156, rating: 4.5 },
    { name: 'Database Fundamentals', students: 134, rating: 4.4 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Course Completion Rate',
      value: '78.5%',
      change: '+5.2%',
      changeType: 'increase',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Avg. Session Duration',
      value: '24m 32s',
      change: '-2.1%',
      changeType: 'decrease',
      icon: Clock,
      color: 'bg-purple-500'
    },
    {
      title: 'Monthly Revenue',
      value: '$24,100',
      change: '+18.7%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive platform analytics and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last period
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedMetric('users')}
                className={`px-3 py-1 text-sm rounded-md ${selectedMetric === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Total Users
              </button>
              <button
                onClick={() => setSelectedMetric('newUsers')}
                className={`px-3 py-1 text-sm rounded-md ${selectedMetric === 'newUsers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                New Users
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Completion Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Course Completion Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="course" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10B981" />
              <Bar dataKey="enrolled" fill="#E5E7EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Engagement Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Engagement</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue & Subscriptions</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" />
              <Line yAxisId="right" type="monotone" dataKey="subscriptions" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Courses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Courses</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCoursesData.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.students}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">{course.rating}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(course.rating) ? 'bg-yellow-400' : 'bg-gray-200'} rounded-full mr-1`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Generate Custom Report</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule Report</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">View Advanced Metrics</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;