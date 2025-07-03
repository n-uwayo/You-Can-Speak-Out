import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Clock, CheckCircle } from 'lucide-react';

// Add this VideoProgressTracker component to your StudentDashboard file
// Replace the iframe in CourseContent with this component

const VideoProgressTracker = ({ 
  courseId, 
  videoId, 
  youtubeUrl, 
  title, 
  onProgressUpdate,
  initialProgress = 0,
  initialWatchedSeconds = 0 
}) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(initialWatchedSeconds);
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  
  const playerRef = useRef(null);
  const progressTimer = useRef(null);
  const lastUpdateTime = useRef(0);
  const watchTimeTracker = useRef(new Set());

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : url; // Return the original if it's already just an ID
  };

  const videoIdFromUrl = extractVideoId(youtubeUrl);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (!isApiReady || !videoIdFromUrl || player) return;

    const ytPlayer = new window.YT.Player(playerRef.current, {
      height: '400',
      width: '100%',
      videoId: videoIdFromUrl,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        fs: 1,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 0,
        controls: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    setPlayer(ytPlayer);
  }, [isApiReady, videoIdFromUrl]);

  const onPlayerReady = (event) => {
    const playerDuration = event.target.getDuration();
    setDuration(playerDuration);
    
    // Seek to last watched position if available
    if (initialWatchedSeconds > 0) {
      event.target.seekTo(initialWatchedSeconds, true);
    }
  };

  const onPlayerStateChange = (event) => {
    const playerState = event.data;
    
    if (playerState === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (playerState === window.YT.PlayerState.PAUSED || 
               playerState === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopProgressTracking();
      
      if (playerState === window.YT.PlayerState.ENDED) {
        handleVideoCompleted();
      }
    }
    
    setIsMuted(event.target.isMuted());
  };

  const startProgressTracking = () => {
    if (progressTimer.current) return;
    
    progressTimer.current = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function') {
        const current = player.getCurrentTime();
        const videoDuration = player.getDuration();
        
        setCurrentTime(current);
        
        // Track unique seconds watched
        const currentSecond = Math.floor(current);
        if (!watchTimeTracker.current.has(currentSecond)) {
          watchTimeTracker.current.add(currentSecond);
          setWatchedSeconds(prev => prev + 1);
        }
        
        // Calculate progress percentage
        const progressPercent = videoDuration > 0 ? (current / videoDuration) * 100 : 0;
        setProgress(progressPercent);
        
        // Send progress update every 30 seconds
        if (current - lastUpdateTime.current >= 30) {
          sendProgressUpdate(watchTimeTracker.current.size, false);
          lastUpdateTime.current = current;
        }
        
        // Mark as completed if watched 90% or more
        if (progressPercent >= 90 && !isCompleted) {
          handleVideoCompleted();
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
      
      // Send final progress update
      sendProgressUpdate(watchTimeTracker.current.size, isCompleted);
    }
  };

  const sendProgressUpdate = useCallback(async (seconds, completed) => {
    try {
      const response = await fetch('http://localhost/api/student/progress.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'update_video_progress',
          video_id: courseId, // Using courseId as video_id since modules/videos are removed
          watched_seconds: seconds,
          is_completed: completed
        }),
      });
      
      const result = await response.json();
      
      if (result.success && onProgressUpdate) {
        onProgressUpdate({
          watchedSeconds: seconds,
          isCompleted: completed,
          progress: progress
        });
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  }, [courseId, progress, onProgressUpdate]);

  const handleVideoCompleted = () => {
    setIsCompleted(true);
    sendProgressUpdate(watchTimeTracker.current.size, true);
  };

  // Control functions
  const togglePlay = () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const toggleMute = () => {
    if (!player) return;
    
    if (isMuted) {
      player.unMute();
    } else {
      player.mute();
    }
  };

  const handleSeek = (event) => {
    if (!player || !duration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (playerRef.current && playerRef.current.requestFullscreen) {
      playerRef.current.requestFullscreen();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [player]);

  if (!videoIdFromUrl) {
    return (
      <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Video Player */}
      <div className="relative bg-black">
        <div ref={playerRef} className="w-full h-96" />
        
        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          {/* Progress Bar */}
          <div 
            className="w-full bg-gray-600 rounded-full h-1 mb-3 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="bg-red-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isCompleted && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Completed</span>
                </div>
              )}
              
              <button
                onClick={handleFullscreen}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        
        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Watched</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{formatTime(watchedSeconds)}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <div className="w-4 h-4 bg-green-600 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Progress</span>
            </div>
            <p className="text-lg font-bold text-green-600">{Math.round(progress)}%</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Status</span>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {isCompleted ? 'Complete' : 'In Progress'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoProgressTracker;