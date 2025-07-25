import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ChevronLeft,
  List,
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  Lock,
  PlayCircle,
  X,
  Clock,
  Check,
  Video,
  User,
  Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const CourseLearningInterface = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState(new Set());
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) throw new Error('Failed to fetch course');
        const courseData = await courseResponse.json();
        
        // Fetch modules for this course
        const modulesResponse = await fetch(`/api/courses/${courseId}/modules`);
        if (!modulesResponse.ok) throw new Error('Failed to fetch modules');
        const modulesData = await modulesResponse.json();
        
        // For each module, fetch its videos
        const modulesWithVideos = await Promise.all(
          modulesData.map(async module => {
            const videosResponse = await fetch(`/api/modules/${module.id}/videos`);
            if (!videosResponse.ok) throw new Error('Failed to fetch videos');
            const videosData = await videosResponse.json();
            return { ...module, videos: videosData };
          })
        );
        
        // Fetch user progress
        const progressResponse = await fetch(`/api/users/${userId}/progress?courseId=${courseId}`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const completed = new Set(progressData.completedVideos.map(v => `${v.moduleId}-${v.videoId}`));
          setCompletedVideos(completed);
          setProgress(progressData.overallProgress);
        }
        
        setCourse({
          ...courseData,
          modules: modulesWithVideos
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);

  // Save video progress
  const saveVideoProgress = async (moduleId, videoId, isCompleted) => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          moduleId,
          videoId,
          isCompleted
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save progress');
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  // Handle video completion
  const handleVideoComplete = async () => {
    const videoId = currentModule.videos[currentVideoIndex].id;
    const moduleId = currentModule.id;
    
    // Update local state
    const videoKey = `${currentModuleIndex}-${currentVideoIndex}`;
    const newCompletedVideos = new Set([...completedVideos, videoKey]);
    setCompletedVideos(newCompletedVideos);
    
    // Save to backend
    await saveVideoProgress(moduleId, videoId, true);
    
    // Calculate new progress
    const totalVideos = course.modules.reduce((total, module) => total + module.videos.length, 0);
    const newProgress = (newCompletedVideos.size / totalVideos) * 100;
    setProgress(newProgress);
    
    // Auto-advance to next video
    if (currentVideoIndex < currentModule.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentVideoIndex(0);
    }
    
    setIsPlaying(false);
  };

  // Navigate to specific video
  const navigateToVideo = (moduleIndex, videoIndex) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentVideoIndex(videoIndex);
    setIsPlaying(false);
    
    // Save viewing progress (not completed)
    const moduleId = course.modules[moduleIndex].id;
    const videoId = course.modules[moduleIndex].videos[videoIndex].id;
    saveVideoProgress(moduleId, videoId, false);
  };

  // Check if video is completed
  const isVideoCompleted = (moduleIndex, videoIndex) => {
    return completedVideos.has(`${moduleIndex}-${videoIndex}`);
  };

  // Check if video is locked (previous video not completed)
  const isVideoLocked = (moduleIndex, videoIndex) => {
    // First video is always unlocked
    if (moduleIndex === 0 && videoIndex === 0) return false;
    
    // Check if previous video in same module is completed
    if (videoIndex > 0) {
      return !isVideoCompleted(moduleIndex, videoIndex - 1);
    }
    
    // Check if last video of previous module is completed
    if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1];
      return !isVideoCompleted(moduleIndex - 1, prevModule.videos.length - 1);
    }
    
    return false;
  };

  // Save notes
  const saveNotes = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          courseId,
          moduleId: currentModule.id,
          videoId: currentVideo.id,
          content: notes
        }),
      });
      
      if (!response.ok) throw new Error('Failed to save notes');
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Course not found</div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const currentVideo = currentModule?.videos?.[currentVideoIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Learning Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                <span>Back to Courses</span>
              </button>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-lg">
                  {course.title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col ${showSidebar ? 'lg:mr-80' : ''}`}>
          {/* Video Player Area */}
          <div className="bg-black flex-1 flex items-center justify-center relative">
            {currentVideo ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                {/* Video Player - Replace with your actual video player component */}
                <div className="text-center">
                  <div className="bg-gray-900 rounded-lg p-8 mb-6 max-w-2xl mx-auto">
                    <div className="relative">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-32 h-32 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 transition-all transform hover:scale-105"
                      >
                        {isPlaying ? (
                          <div className="flex space-x-1">
                            <div className="w-3 h-12 bg-white"></div>
                            <div className="w-3 h-12 bg-white"></div>
                          </div>
                        ) : (
                          <PlayCircle className="w-20 h-20 text-white ml-2" />
                        )}
                      </button>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-700 h-2 rounded-full mb-4">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      
                      <h2 className="text-white text-2xl font-semibold mb-2">{currentVideo.title}</h2>
                      <p className="text-gray-400 mb-4">Duration: {currentVideo.duration}</p>
                      
                      {/* Video controls */}
                      <div className="flex items-center justify-center space-x-4 text-gray-400">
                        <button className="hover:text-white">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.653 16.915l-.005-.003-.019-.012a20.759 20.759 0 01-1.162-.753 21.768 21.768 0 01-2.582-2.094C3.918 12.038 2 9.068 2 5.5 2 3.015 4.015 1 6.5 1 8.069 1 9.448 1.766 10 2.91 10.552 1.766 11.931 1 13.5 1 15.985 1 18 3.015 18 5.5c0 3.568-1.918 6.538-3.885 8.553a21.768 21.768 0 01-2.582 2.094 20.759 20.759 0 01-1.18.765l-.003.002z"/>
                          </svg>
                        </button>
                        <button className="hover:text-white">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9 9 0 10-13.432 0m13.432 0A9 9 0 0112 21a9 9 0 01-5.432-1.974m10.864 0l-3.788-3.788m-1.287 1.288L8.569 14.74"/>
                          </svg>
                        </button>
                        <button className="hover:text-white">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleVideoComplete}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                      isVideoCompleted(currentModuleIndex, currentVideoIndex)
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isVideoCompleted(currentModuleIndex, currentVideoIndex) ? (
                      <>
                        <Check className="w-5 h-5 inline mr-2" />
                        Completed
                      </>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                  
                  {/* Navigation buttons */}
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <button
                      onClick={() => {
                        if (currentVideoIndex > 0) {
                          setCurrentVideoIndex(currentVideoIndex - 1);
                        } else if (currentModuleIndex > 0) {
                          const prevModule = course.modules[currentModuleIndex - 1];
                          setCurrentModuleIndex(currentModuleIndex - 1);
                          setCurrentVideoIndex(prevModule.videos.length - 1);
                        }
                      }}
                      disabled={currentModuleIndex === 0 && currentVideoIndex === 0}
                      className="text-white hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    
                    <button
                      onClick={() => {
                        if (currentVideoIndex < currentModule.videos.length - 1) {
                          setCurrentVideoIndex(currentVideoIndex + 1);
                        } else if (currentModuleIndex < course.modules.length - 1) {
                          setCurrentModuleIndex(currentModuleIndex + 1);
                          setCurrentVideoIndex(0);
                        }
                      }}
                      disabled={
                        currentModuleIndex === course.modules.length - 1 && 
                        currentVideoIndex === currentModule.videos.length - 1
                      }
                      className="text-white hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a video to start learning</p>
              </div>
            )}
          </div>

          {/* Video Info & Tabs */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              {currentVideo && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentVideo.title}</h2>
                  <p className="text-gray-600 mb-4">
                    Module {currentModuleIndex + 1}: {currentModule.title}
                  </p>
                  
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      <button 
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'overview' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Overview
                      </button>
                      <button 
                        onClick={() => setActiveTab('resources')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'resources' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Resources
                      </button>
                      <button 
                        onClick={() => setActiveTab('qa')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'qa' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Q&A
                      </button>
                      <button 
                        onClick={() => setActiveTab('notes')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'notes' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Notes
                      </button>
                    </nav>
                  </div>
                  
                  {/* Tab Content */}
                  {activeTab === 'overview' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-4">
                        {currentVideo.description || `In this lesson, you'll learn the fundamental concepts of ${currentVideo.title.toLowerCase()}. 
                        This is an essential part of mastering ${course.title}.`}
                      </p>
                      
                      <h3 className="text-lg font-semibold mb-2">What you'll learn:</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 mb-6">
                        <li>Core concepts and terminology</li>
                        <li>Best practices and common patterns</li>
                        <li>Hands-on examples and exercises</li>
                        <li>Real-world applications</li>
                      </ul>
                      
                      <div className="mt-6 flex flex-wrap gap-4">
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                          <span>Download Resources</span>
                        </button>
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                          <FileText className="w-4 h-4" />
                          <span>View Transcript</span>
                        </button>
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                          <MessageSquare className="w-4 h-4" />
                          <span>Ask Question</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'resources' && (
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">Course Slides</p>
                              <p className="text-sm text-gray-500">PDF, 2.5 MB</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-900">Exercise Files</p>
                              <p className="text-sm text-gray-500">ZIP, 1.8 MB</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'qa' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800">
                          Have questions about this lesson? Post them here and get help from the community and instructors.
                        </p>
                        <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                          Ask a Question
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">John Doe</p>
                              <p className="text-sm text-gray-500 mb-2">2 hours ago</p>
                              <p className="text-gray-700">
                                How do I handle state updates in React when dealing with nested objects?
                              </p>
                              <button className="text-sm text-blue-600 hover:text-blue-800 mt-2">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'notes' && (
                    <div>
                      <textarea
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Take notes while watching the video..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                      <button 
                        onClick={saveNotes}
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Save Notes
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Course Content Sidebar */}
        <div className={`${showSidebar ? 'fixed inset-y-0 right-0 w-80' : 'hidden'} bg-white border-l border-gray-200 overflow-y-auto z-40 top-16`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {completedVideos.size} of {course.modules.reduce((total, module) => total + module.videos.length, 0)} videos completed
              </div>
            </div>
            
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {module.videos.filter((_, vIndex) => isVideoCompleted(moduleIndex, vIndex)).length} of {module.videos.length} completed
                    </p>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    {module.videos.map((video, videoIndex) => {
                      const isCompleted = isVideoCompleted(moduleIndex, videoIndex);
                      const isCurrent = moduleIndex === currentModuleIndex && videoIndex === currentVideoIndex;
                      const isLocked = isVideoLocked(moduleIndex, videoIndex);
                      
                      return (
                        <button
                          key={video.id}
                          onClick={() => !isLocked && navigateToVideo(moduleIndex, videoIndex)}
                          disabled={isLocked}
                          className={`w-full text-left p-2 rounded-lg transition-all ${
                            isCurrent
                              ? 'bg-blue-50 border border-blue-200'
                              : isLocked
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {isLocked ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                              ) : isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : isCurrent ? (
                                <PlayCircle className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Play className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${
                                isCurrent ? 'text-blue-900 font-medium' : 
                                isLocked ? 'text-gray-400' : 'text-gray-700'
                              }`}>
                                {video.title}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500">{video.duration}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Course completion certificate */}
            {progress === 100 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-900 mb-2">Course Completed!</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Get Certificate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningInterface;