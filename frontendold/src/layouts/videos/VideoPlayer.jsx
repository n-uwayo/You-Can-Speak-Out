import React, { useState } from 'react';
import { Play, MessageCircle, Send, ChevronDown, ChevronRight } from 'lucide-react';

const VideoPlayer = ({ video, courseData, onVideoSelect }) => {
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

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
    ],
    3: [
      {
        id: 4,
        user: "John Smith",
        text: "The examples are very helpful. Could you show more complex tag combinations?",
        timestamp: "2025-01-22 09:20",
        replies: []
      }
    ]
  };

  React.useEffect(() => {
    if (video && !comments[video.id]) {
      setComments(prev => ({
        ...prev,
        [video.id]: sampleComments[video.id] || []
      }));
    }
  }, [video]);

  const addComment = () => {
    if (!newComment.trim() || !video) return;
    
    const comment = {
      id: Date.now(),
      user: "John Smith",
      text: newComment,
      timestamp: new Date().toLocaleString(),
      replies: []
    };

    setComments(prev => ({
      ...prev,
      [video.id]: [...(prev[video.id] || []), comment]
    }));
    setNewComment('');
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  if (!video) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Video to Watch</h2>
          <p className="text-gray-600">Choose a video from the course content to start learning</p>
        </div>

        {/* Video Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Available Videos</h3>
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
                    <span className="font-medium text-gray-900">{module.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {module.videos.length} videos
                  </span>
                </button>

                {expandedModules[module.id] && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="grid gap-2">
                      {module.videos.map(moduleVideo => (
                        <button
                          key={moduleVideo.id}
                          onClick={() => onVideoSelect({ ...moduleVideo, moduleId: module.id })}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Play className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{moduleVideo.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{moduleVideo.duration}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentModule = courseData.modules.find(m => m.id === video.moduleId);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
            <p className="text-gray-300">Duration: {video.duration}</p>
            {currentModule && (
              <p className="text-blue-300 text-sm mt-2">From: {currentModule.title}</p>
            )}
          </div>
        </div>
        
        {/* Video Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{video.title}</h2>
              {currentModule && (
                <p className="text-gray-600 mt-1">Module: {currentModule.title}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {video.duration}
              </span>
              {video.completed && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Comments ({comments[video.id]?.length || 0})
            </h3>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or ask a question..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Post</span>
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments[video.id]?.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{comment.user}</span>
                    <span className="text-sm text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{comment.text}</p>
                  
                  {/* Replies */}
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="ml-6 mt-3 bg-white rounded-lg p-3 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{reply.user}</span>
                        <span className="text-xs text-gray-500">{reply.timestamp}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{reply.text}</p>
                    </div>
                  ))}
                </div>
              ))}

              {(!comments[video.id] || comments[video.id].length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Other Videos in Module */}
      {currentModule && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Other Videos in "{currentModule.title}"
          </h3>
          <div className="grid gap-2">
            {currentModule.videos
              .filter(v => v.id !== video.id)
              .map(moduleVideo => (
                <button
                  key={moduleVideo.id}
                  onClick={() => onVideoSelect({ ...moduleVideo, moduleId: currentModule.id })}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Play className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{moduleVideo.title}</span>
                    {moduleVideo.completed && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{moduleVideo.duration}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;