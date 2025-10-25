import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Contact Support</h1>
          <p className="text-gray-600 mb-6">
            Need help with an application, posting a job, or using WorkBee? Reach us using the details below.
          </p>

          <div className="space-y-4 text-gray-700">
            <p>
              <span className="font-semibold">Email:</span> support@workbee.example
            </p>
            <p>
              <span className="font-semibold">Phone:</span> +91 00000 00000
            </p>
            <p className="text-sm text-gray-500">
              Our team is available Monday–Friday, 9:00–18:00 IST.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
