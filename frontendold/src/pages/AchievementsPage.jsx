import React, { useState } from 'react';
import { Award, Trophy, Star, Medal, Plus, Edit, Trash2, Users, Target, Calendar } from 'lucide-react';

const AchievementsPage = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Complete your first course',
      icon: 'star',
      category: 'Getting Started',
      points: 10,
      earnedBy: 1245,
      totalUsers: 2847,
      difficulty: 'Easy',
      createdDate: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Knowledge Seeker',
      description: 'Complete 5 courses in any category',
      icon: 'trophy',
      category: 'Learning',
      points: 50,
      earnedBy: 487,
      totalUsers: 2847,
      difficulty: 'Medium',
      createdDate: '2024-01-20',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Video Master',
      description: 'Watch 100 hours of video content',
      icon: 'medal',
      category: 'Engagement',
      points: 75,
      earnedBy: 123,
      totalUsers: 2847,
      difficulty: 'Hard',
      createdDate: '2024-02-01',
      status: 'Active'
    },
    {
      id: 4,
      title: 'Perfect Score',
      description: 'Get 100% on any assessment',
      icon: 'award',
      category: 'Achievement',
      points: 25,
      earnedBy: 892,
      totalUsers: 2847,
      difficulty: 'Medium',
      createdDate: '2024-02-10',
      status: 'Active'
    },
    {
      id: 5,
      title: 'Programming Pro',
      description: 'Complete all programming courses',
      icon: 'trophy',
      category: 'Specialization',
      points: 100,
      earnedBy: 67,
      totalUsers: 2847,
      difficulty: 'Expert',
      createdDate: '2024-02-15',
      status: 'Draft'
    }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alice Johnson', points: 2450, achievements: 28, avatar: 'AJ' },
    { rank: 2, name: 'Bob Smith', points: 2180, achievements: 25, avatar: 'BS' },
    { rank: 3, name: 'Carol Williams', points: 1950, achievements: 22, avatar: 'CW' },
    { rank: 4, name: 'David Brown', points: 1720, achievements: 19, avatar: 'DB' },
    { rank: 5, name: 'Emily Davis', points: 1680, achievements: 18, avatar: 'ED' },
    { rank: 6, name: 'Frank Wilson', points: 1540, achievements: 16, avatar: 'FW' },
    { rank: 7, name: 'Grace Taylor', points: 1420, achievements: 15, avatar: 'GT' },
    { rank: 8, name: 'Henry Miller', points: 1350, achievements: 14, avatar: 'HM' }
  ];

  const getIconComponent = (iconName) => {
    const icons = {
      star: Star,
      trophy: Trophy,
      medal: Medal,
      award: Award
    };
    return icons[iconName] || Star;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AchievementCard = ({ achievement }) => {
    const IconComponent = getIconComponent(achievement.icon);
    const completionRate = ((achievement.earnedBy / achievement.totalUsers) * 100).toFixed(1);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
              <p className="text-sm text-gray-600">{achievement.category}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="text-gray-600 hover:text-gray-800 p-1">
              <Edit className="w-4 h-4" />
            </button>
            <button className="text-red-600 hover:text-red-800 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{achievement.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{achievement.points}</div>
            <div className="text-xs text-gray-500">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{achievement.earnedBy}</div>
            <div className="text-xs text-gray-500">Earned By</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completion Rate</span>
            <span>{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(achievement.difficulty)}`}>
            {achievement.difficulty}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(achievement.status)}`}>
            {achievement.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Achievements & Leaderboard</h1>
        <p className="text-gray-600 mt-2">Manage achievements and track user progress</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Achievements</p>
              <p className="text-3xl font-bold text-gray-900">{achievements.length}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">2,847</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Points Awarded</p>
              <p className="text-3xl font-bold text-gray-900">45,670</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">34.2%</p>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>

        {activeTab === 'achievements' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Achievement Management</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Achievement
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">User Leaderboard</h2>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Achievements
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((user) => (
                      <tr key={user.rank} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.rank <= 3 ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                user.rank === 1 ? 'bg-yellow-500' : 
                                user.rank === 2 ? 'bg-gray-400' : 'bg-orange-500'
                              }`}>
                                {user.rank}
                              </div>
                            ) : (
                              <span className="text-lg font-semibold text-gray-900">{user.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-medium">{user.avatar}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-blue-600">{user.points.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{user.achievements}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;