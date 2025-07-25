import { Play, Edit, Trash2, Eye } from 'lucide-react';

const getStatusColor = status => {
  switch (status) {
    case 'Published': return 'bg-green-100 text-green-800';
    case 'Draft': return 'bg-yellow-100 text-yellow-800';
    case 'Private': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const VideoCard = ({ video }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative">
      {video.thumbnail ? (
        <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <Play className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
        {video.duration || '--:--'}
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-2 truncate">{video.title}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{video.instructor}</span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(video.status)}`}>
          {video.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{video.views ?? 0} views</span>
        <span>{video.uploadDate || ''}</span>
      </div>
      <div className="flex items-center space-x-2">
        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700">
          <Eye className="w-4 h-4 inline mr-1" />
          View
        </button>
        <button className="text-gray-600 hover:text-gray-800 p-2">
          <Edit className="w-4 h-4" />
        </button>
        <button className="text-red-600 hover:text-red-800 p-2">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default VideoCard;
