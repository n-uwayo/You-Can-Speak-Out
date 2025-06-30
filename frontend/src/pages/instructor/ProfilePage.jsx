import React, { useState } from 'react';
import { 
  Edit, 
  Save, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star 
} from 'lucide-react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Experienced software developer and educator with 10+ years in the industry. Passionate about teaching modern web development technologies.',
    expertise: ['JavaScript', 'React', 'Node.js', 'Python', 'Database Design'],
    experience: '10+ years',
    education: 'M.S. Computer Science'
  });

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile saved:', profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // You could reset to original data here if you had a backup
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your instructor profile</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-16 h-16 text-white" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="text-xl font-bold text-gray-900 text-center border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
              )}

              <p className="text-gray-600 mt-1">Instructor</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="flex-1 border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                ) : (
                  <span>{profileData.email}</span>
                )}
              </div>

              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-3" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="flex-1 border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                ) : (
                  <span>{profileData.phone}</span>
                )}
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-3" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="flex-1 border-b border-gray-300 focus:border-indigo-500 focus:outline-none"
                  />
                ) : (
                  <span>{profileData.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Courses Created</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Videos Uploaded</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">About</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profileData.bio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profileData.experience}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-600">{profileData.education}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Expertise</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Add skills separated by commas"
                    value={profileData.expertise.join(', ')}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        expertise: e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive email updates about your courses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Get notified about new submissions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <button className="w-full mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;