import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-600">
          © 2025 YCSpout. All rights reserved.
        </div>
        <div className="flex space-x-6 mt-2 md:mt-0">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;