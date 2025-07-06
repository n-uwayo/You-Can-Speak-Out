import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Search, 
  Calendar, 
  User, 
  BookOpen, 
  Loader, 
  Shield,
  ExternalLink
} from 'lucide-react';

const CertificateVerificationPage = () => {
  // Get certificate number from URL params manually
  const urlParams = new URLSearchParams(window.location.search);
  const [searchNumber, setSearchNumber] = useState(urlParams.get('cert') || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const certParam = urlParams.get('cert');
    if (certParam) {
      verifyCertificate(certParam);
    }
  }, []);

  const verifyCertificate = async (number) => {
    if (!number.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(
        `https://ycspout.umwalimu.com/api/student/certificates.php?action=verify&certificate_number=${encodeURIComponent(number.trim())}`
      );
      
      const result = await response.json();
      
      if (result.success) {
        setCertificate(result.data);
      } else {
        setError(result.message || 'Certificate not found');
        setCertificate(null);
      }
    } catch (err) {
      setError('Failed to verify certificate. Please try again.');
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    verifyCertificate(searchNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">YCSpout Certificate Verification</h1>
              <p className="text-gray-600">Verify the authenticity of certificates issued by YCSpout</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Verify Certificate</h2>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter certificate number (e.g., YCSP2024123456)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchNumber.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Certificate</h3>
            <p className="text-gray-600">Please wait while we check the certificate details...</p>
          </div>
        )}

        {searched && !loading && error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificate Not Found</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <h4 className="font-medium text-red-800 mb-2">Possible reasons:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• The certificate number was entered incorrectly</li>
                <li>• The certificate has been revoked or is no longer valid</li>
                <li>• The certificate was not issued by YCSpout</li>
              </ul>
            </div>
          </div>
        )}

        {searched && !loading && certificate && (
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8">
            {/* Verification Success Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Certificate Verified</h3>
                <p className="text-green-600 font-medium">This is a valid YCSpout certificate</p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Student Information</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium text-gray-900">{certificate.student_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900">{certificate.student_email}</p>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Course Information</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Course Title:</span>
                      <p className="font-medium text-gray-900">{certificate.course_title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Description:</span>
                      <p className="text-sm text-gray-700">{certificate.course_description}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Certificate Details</span>
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Certificate Number:</span>
                      <p className="font-mono font-medium text-gray-900">{certificate.certificate_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Issue Date:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(certificate.issued_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {certificate.grade && (
                      <div>
                        <span className="text-sm text-gray-600">Grade:</span>
                        <p className="font-medium text-green-600">{certificate.grade}%</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Verification Details</span>
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Verified at YCSpout</span>
                    </div>
                    <div className="text-xs text-green-600">
                      Verified on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Print Verification</span>
                </button>
                
                <a
                  href="https://ycspout.umwalimu.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit YCSpout</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">About Certificate Verification</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              This verification system allows you to confirm the authenticity of certificates issued by YCSpout.
              All valid certificates are stored securely in our database and can be verified using the certificate number.
            </p>
            <p>
              If you have questions about a certificate or need additional verification,
              please contact us at <a href="mailto:support@ycspout.com" className="underline">support@ycspout.com</a>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            © 2024 YCSpout. All rights reserved. Certificate verification system.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CertificateVerificationPage;