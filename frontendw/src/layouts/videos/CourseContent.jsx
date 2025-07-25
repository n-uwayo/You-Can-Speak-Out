import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, MessageCircle } from 'lucide-react';

const CourseContent = ({ courseData, currentVideo, setCurrentVideo, onSelectTask }) => {
  const [expandedModules, setExpandedModules] = useState({});
  const [comments, setComments] = useState({});

  // Sample comments data
  const sampleComments = {
    1: [
      {
        id: 1,
        user: "John Smith",
        text: "Great introduction! Very clear explanation.",
        timestamp: "2025-01-20 10:30",
        replies: [
          {
            id: 2,
            user: "Sarah Johnson (Instructor)",
            text: "Thank you! Feel free to ask if you have any questions.",
            timestamp: "2025-01-20 11:00"
          }
        ]
      }
    ],
    2: [
      {
        id: 3,
        user: "John Smith",
        text: "I'm having trouble understanding the DOCTYPE declaration. Could you explain more?",
        timestamp: "2025-01-21 14:15",
        replies: []
      }
    ]
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const selectVideo = (video, moduleId) => {
    setCurrentVideo({ ...video, moduleId });
    if (!comments[video.id]) {
      setComments(prev => ({
        ...prev,
        [video.id]: sampleComments[video.id] || []
      }));
    }
  };

  const getModuleProgress = (module) => {
    const completedVideos = module.videos.filter(v => v.completed).length;
    return Math.round((completedVideos / module.videos.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Modules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{courseData.title}</h2>
        
        <div className="space-y-4">
          {courseData.modules.map(module => (
            <div key={module.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {expandedModules[module.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {module.videos.filter(v => v.completed).length}/{module.videos.length} videos
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {getModuleProgress(module)}% complete
                  </div>
                </div>
              </button>

              {expandedModules[module.id] && (
                <div className="border-t border-gray-200 p-4">
                  {/* Videos */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Videos</h4>
                    <div className="grid gap-2">
                      {module.videos.map(video => (
                        <button
                          key={video.id}
                          onClick={() => selectVideo(video, module.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            currentVideo?.id === video.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              video.completed ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {video.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Play className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{video.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">{video.duration}</span>
                            {comments[video.id]?.length > 0 && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{comments[video.id].length}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tasks */}
                  {module.tasks.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Tasks</h4>
                      <div className="space-y-2">
                        {module.tasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{task.title}</h5>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                <span>{task.points} points</span>
                                <span className="capitalize">{task.type}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                              <button
                                onClick={() => onSelectTask(task)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;