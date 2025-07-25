import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Download, 
  Eye, 
  CheckCircle, 
  Calendar, 
  User, 
  BookOpen,
  Star,
  Share,
  Loader,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

// Certificate API Service
const certificateService = {
  async getCertificates() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ycspout.umwalimu.com/api/student/certificates.php?action=list&user_id=4', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  },

  async generateCertificate(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ycspout.umwalimu.com/api/student/certificates.php?action=generate&user_id=4', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  },

  async checkCompletion(courseId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ycspout.umwalimu.com/api/student/certificates.php?action=check_completion&user_id=4', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking completion:', error);
      throw error;
    }
  },

  downloadCertificate(certificateId) {
    const token = localStorage.getItem('token');
    window.open(`https://ycspout.umwalimu.com/api/student/certificates.php?action=download&certificate_id=${certificateId}&user_id=4`, '_blank');
  },

  verifyCertificate(certificateNumber) {
    window.open(`https://ycspout.umwalimu.com/verify?cert=${certificateNumber}`, '_blank');
  }
};

// Certificate Card Component
const CertificateCard = ({ certificate, onDownload, onShare }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6" />
            <span className="font-semibold">Certificate of Completion</span>
          </div>
          <span className="text-blue-100 text-sm">#{certificate.certificate_number}</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{certificate.course_title}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Completed on {new Date(certificate.completion_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          {certificate.instructor_name && (
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">Instructor: {certificate.instructor_name}</span>
            </div>
          )}
          
          {certificate.grade && (
            <div className="flex items-center text-green-600">
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Grade: {certificate.grade}%</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => onDownload(certificate.id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          
          {/* <button
            onClick={() => certificateService.verifyCertificate(certificate.certificate_number)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify</span>
          </button> */}
          
          <button
            onClick={() => onShare(certificate)}
            className="bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
          >
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Certificate Generation Button Component
const CertificateGenerationButton = ({ course, onGenerate }) => {
  const [checking, setChecking] = useState(false);
  const [completion, setCompletion] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [existingCertificate, setExistingCertificate] = useState(null);

  useEffect(() => {
    if (course?.id) {
      checkCourseCompletion();
      checkExistingCertificate();
    }
  }, [course?.id]);

  const checkCourseCompletion = async () => {
    setChecking(true);
    try {
      const result = await certificateService.checkCompletion(course.id);
      if (result.success) {
        setCompletion(result.data);
      }
    } catch (error) {
      console.error('Error checking completion:', error);
    } finally {
      setChecking(false);
    }
  };

  const checkExistingCertificate = async () => {
    try {
      const result = await certificateService.getCertificates();
      if (result.success) {
        const certificates = result.data || [];
        const existing = certificates.find(cert => cert.course_id == course.id);
        setExistingCertificate(existing);
      }
    } catch (error) {
      console.error('Error checking existing certificate:', error);
    }
  };

  const handleGenerate = async () => {
    if (!completion?.completed) return;
    
    setGenerating(true);
    try {
      const result = await certificateService.generateCertificate(course.id);
      if (result.success) {
        setExistingCertificate(result.data);
        if (onGenerate) {
          onGenerate(result.data);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (existingCertificate) {
      certificateService.downloadCertificate(existingCertificate.id);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Loader className="w-4 h-4 animate-spin" />
        <span>Checking completion...</span>
      </div>
    );
  }

  // If certificate already exists
  if (existingCertificate) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-green-700 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Certificate Earned!</span>
        </div>
        <p className="text-sm text-green-600 mb-3">
          You have successfully completed this course and earned your certificate.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate</span>
          </button>
          <button
            onClick={() => certificateService.verifyCertificate(existingCertificate.certificate_number)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify</span>
          </button>
        </div>
      </div>
    );
  }

  if (!completion?.completed) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-yellow-700 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Course not completed</span>
        </div>
        <p className="text-sm text-yellow-600 mb-3">
          Complete all modules to earn your certificate
        </p>
        <div className="text-sm text-gray-600">
          Progress: {completion?.completed_modules || 0} of {completion?.total_modules || 0} modules completed
          ({Math.round(completion?.completion_percentage || 0)}%)
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
    >
      {generating ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Generating Certificate...</span>
        </>
      ) : (
        <>
          <Award className="w-5 h-5" />
          <span>Generate Certificate</span>
        </>
      )}
    </button>
  );
};

// Main Certificates Component
const CertificatesContent = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await certificateService.getCertificates();
      
      if (result.success) {
        setCertificates(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load certificates');
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateId) => {
    certificateService.downloadCertificate(certificateId);
  };

  const handleShare = (certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.course_title}`,
        text: `I've completed ${certificate.course_title} on YCSpout!`,
        url: `https://ycspout.umwalimu.com/verify?cert=${certificate.certificate_number}`
      });
    } else {
      // Fallback to clipboard
      const shareText = `I've completed ${certificate.course_title} on YCSpout! Verify at: https://ycspout.umwalimu.com/verify?cert=${certificate.certificate_number}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
  };

  const handleCertificateGenerated = (newCertificate) => {
    setCertificates(prev => [newCertificate, ...prev]);
    alert('Certificate generated successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Certificates</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadCertificates}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const averageGrade = certificates.length > 0 
    ? Math.round(certificates.filter(cert => cert.grade).reduce((sum, cert) => sum + (cert.grade || 0), 0) / certificates.filter(cert => cert.grade).length) || 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Award className="w-8 h-8" />
          <h1 className="text-3xl font-bold">My Certificates</h1>
        </div>
        <p className="text-blue-100">
          View and download your course completion certificates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <Award className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Year</p>
              <p className="text-2xl font-bold text-gray-900">
                {certificates.filter(cert => 
                  new Date(cert.issued_date).getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">{averageGrade}%</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600 mb-6">
            Complete your first course to earn a certificate!
          </p>
          <button
            onClick={() => window.location.href = '#courses'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>Browse Courses</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Export components
export { CertificatesContent, CertificateGenerationButton, certificateService };