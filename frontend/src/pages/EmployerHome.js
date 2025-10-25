import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const EmployerHome = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await jobAPI.getEmployerJobs({ limit: 3 });
        setJobs(response.data.data || []);
      } catch (err) {
        console.error('Error fetching employer jobs', err);
        setError('Unable to load your recent postings.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-white text-gray-800 py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gray-800/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-800/5 rounded-full blur-3xl"></div>
        
        {/* Floating decorative icons */}
        <div className="absolute top-1/4 right-1/4 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-lg rotate-12"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-pulse" style={{animationDelay: '1s'}}>
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Hero Illustration - Hidden on mobile, shown on larger screens */}
              <div className="hidden lg:block mb-8">
                <svg className="w-full max-w-md mx-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background elements */}
                  <circle cx="320" cy="80" r="60" fill="#F3F4F6" opacity="0.8"/>
                  <circle cx="80" cy="220" r="40" fill="#E5E7EB" opacity="0.8"/>
                  
                  {/* Main illustration - People hiring */}
                  <rect x="100" y="100" width="200" height="140" rx="12" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2"/>
                  
                  {/* Desk */}
                  <rect x="120" y="180" width="160" height="8" rx="4" fill="#6B7280"/>
                  
                  {/* Laptop */}
                  <rect x="150" y="155" width="100" height="60" rx="4" fill="#374151"/>
                  <rect x="155" y="160" width="90" height="45" rx="2" fill="#F3F4F6"/>
                  <line x1="200" y1="160" x2="200" y2="205" stroke="#6B7280" strokeWidth="2"/>
                  
                  {/* Person 1 */}
                  <circle cx="140" cy="140" r="12" fill="#6B7280"/>
                  <rect x="130" y="152" width="20" height="25" rx="4" fill="#9CA3AF"/>
                  
                  {/* Person 2 */}
                  <circle cx="260" cy="140" r="12" fill="#374151"/>
                  <rect x="250" y="152" width="20" height="25" rx="4" fill="#6B7280"/>
                  
                  {/* Documents/Applications flying */}
                  <rect x="80" y="80" width="30" height="40" rx="2" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5"/>
                  <rect x="290" y="60" width="30" height="40" rx="2" fill="#F3F4F6" stroke="#6B7280" strokeWidth="1.5"/>
                  
                  {/* Checkmarks */}
                  <path d="M 90 95 L 95 100 L 105 88" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M 300 75 L 305 80 L 315 68" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  
                  {/* Stars for success */}
                  <path d="M 350 120 L 352 126 L 358 126 L 353 130 L 355 136 L 350 132 L 345 136 L 347 130 L 342 126 L 348 126 Z" fill="#9CA3AF"/>
                  <path d="M 60 100 L 62 104 L 66 104 L 63 107 L 64 111 L 60 108 L 56 111 L 57 107 L 54 104 L 58 104 Z" fill="#9CA3AF"/>
                </svg>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-gray-800">
                Build a reliable workforce with WorkBee.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8">
                Post openings designed for entry-level talent, review candidates in one dashboard, and keep your hiring pipeline organised from start to finish.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/employer/jobs/new" className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post a New Job
                </Link>
                <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-sm">
                  Open Dashboard
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-gray-800/5 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white text-gray-800 rounded-3xl shadow-2xl p-8 space-y-6 border-2 border-gray-800">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Hiring snapshot</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Active postings', value: jobs.length },
                      { label: 'Applicants this week', value: jobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0) },
                      { label: 'Average salary', value: jobs.length ? `₹${Math.round(jobs.reduce((acc, job) => acc + (job.salary?.max || 0), 0) / jobs.length).toLocaleString('en-IN')}` : '—' },
                      { label: 'Time to publish', value: 'Under 5 mins' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border-2 border-gray-800 bg-gray-50 p-4">
                        <p className="text-sm text-gray-600 uppercase tracking-wide">{item.label}</p>
                        <p className="text-2xl font-semibold text-gray-800 mt-2">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-start space-x-2 bg-gray-100 border-2 border-gray-800 rounded-xl p-4">
                  <svg className="w-5 h-5 text-gray-800 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tip:</span> Keep your job descriptions focused on responsibilities and shift timings to attract the right candidates quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Wave Divider */}
      <div className="relative h-16 bg-gray-100">
        <svg className="absolute bottom-0 w-full h-16" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 22L60 26C120 30 240 38 360 36C480 34 600 22 720 18C840 14 960 18 1080 24C1200 30 1320 38 1380 42L1440 46V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" fill="#F9FAFB"/>
        </svg>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Recent job postings</h2>
              <p className="text-gray-600">Keep track of the roles you have live right now.</p>
            </div>
            <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-sm">View all jobs</Link>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
              <LoadingSpinner text="Loading your job postings..." />
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-8 text-center">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="relative bg-white rounded-2xl border-2 border-dashed border-gray-800 p-12 text-center overflow-hidden">
              {/* Decorative background circles */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gray-100 rounded-full opacity-40 blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-200 rounded-full opacity-40 blur-xl translate-y-1/2 -translate-x-1/2"></div>
              
              {/* Decorative floating elements */}
              <div className="absolute top-8 left-1/4 w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="absolute top-16 right-1/3 w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-12 right-1/4 w-2.5 h-2.5 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              
              <div className="relative z-10">
                {/* Icon illustration */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-3">You haven&apos;t posted any jobs yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Publish your first opening to start receiving applications from motivated job seekers.</p>
                
                <Link to="/employer/jobs/new" className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create your first job
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                      <p className="text-sm text-gray-500">{formatLocation(job.location)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.isActive ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {job.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{job.jobType} • {job.experienceLevel}</p>
                    <p>{formatSalaryRange(job.salary)}</p>
                    <p>Applicants: <span className="font-semibold text-gray-800">{job.applicationsCount}</span></p>
                    {job.applicationDeadline && (
                      <p>Apply by {formatDate(job.applicationDeadline)}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/employer/jobs/${job._id}/edit`} className="btn btn-outline btn-sm flex-1">Edit</Link>
                    <Link to="/employer/jobs/new" state={{ duplicateFrom: job }} className="btn btn-outline btn-sm flex-1">
                      Duplicate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Decorative Wave Divider */}
      <div className="relative h-16 bg-gray-50">
        <svg className="absolute bottom-0 w-full h-16" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 22L60 18C120 14 240 6 360 8C480 10 600 22 720 26C840 30 960 26 1080 20C1200 14 1320 6 1380 2L1440 0V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" fill="#FFFFFF"/>
        </svg>
      </div>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Hiring playbook</h2>
            <p className="text-lg text-gray-600">Simple steps to keep your recruitment flow efficient.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Publish clear roles',
                description: 'Share shifts, pay range, and required documents so applicants can respond quickly.',
                icon: (
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                step: '2',
                title: 'Review daily',
                description: 'Check the dashboard each day to shortlist applicants and move fast on interviews.',
                icon: (
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )
              },
              {
                step: '3',
                title: 'Update candidates',
                description: 'Use status updates so applicants stay informed while you finalise hiring.',
                icon: (
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )
              }
            ].map((item, index) => {
              const colors = [
                { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-800' },
                { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-800' },
                { bg: 'bg-gray-300', text: 'text-gray-800', border: 'border-gray-800' }
              ];
              const color = colors[index];
              
              return (
                <div key={item.step} className={`bg-white border-2 ${color.border} rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300`}>
                  {/* Icon */}
                  {item.icon}
                  
                  <div className={`w-16 h-16 rounded-full ${color.bg} ${color.text} flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative`}>
                    {item.step}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 ${color.bg} rounded-full opacity-60`}></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-800/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-800/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <div className="hidden lg:block">
              <svg className="w-full max-w-md mx-auto" viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Clock/Speed illustration */}
                <circle cx="200" cy="175" r="120" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="3"/>
                <circle cx="200" cy="175" r="100" fill="#F3F4F6"/>
                
                {/* Clock hands */}
                <line x1="200" y1="175" x2="200" y2="100" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
                <line x1="200" y1="175" x2="250" y2="175" stroke="#6B7280" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="200" cy="175" r="8" fill="#9CA3AF"/>
                
                {/* Speed lines */}
                <path d="M 280 130 L 320 110" stroke="#6B7280" strokeWidth="3" strokeLinecap="round"/>
                <path d="M 290 190 L 330 200" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
                <path d="M 270 220 L 300 250" stroke="#6B7280" strokeWidth="3" strokeLinecap="round"/>
                
                {/* People icons around */}
                <circle cx="120" cy="80" r="20" fill="#374151"/>
                <rect x="107" y="100" width="26" height="30" rx="5" fill="#6B7280"/>
                
                <circle cx="280" cy="90" r="20" fill="#6B7280"/>
                <rect x="267" y="110" width="26" height="30" rx="5" fill="#9CA3AF"/>
                
                <circle cx="100" cy="260" r="20" fill="#6B7280"/>
                <rect x="87" y="280" width="26" height="30" rx="5" fill="#9CA3AF"/>
                
                <circle cx="300" cy="250" r="20" fill="#374151"/>
                <rect x="287" y="270" width="26" height="30" rx="5" fill="#6B7280"/>
                
                {/* Checkmarks */}
                <path d="M 115 75 L 120 82 L 130 68" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M 275 85 L 280 92 L 290 78" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round"/>
                
                {/* Document/Application icons */}
                <rect x="60" y="140" width="25" height="35" rx="3" fill="#F3F4F6" stroke="#6B7280" strokeWidth="2"/>
                <line x1="67" y1="150" x2="78" y2="150" stroke="#6B7280" strokeWidth="1.5"/>
                <line x1="67" y1="157" x2="78" y2="157" stroke="#6B7280" strokeWidth="1.5"/>
                
                <rect x="315" y="160" width="25" height="35" rx="3" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2"/>
                <line x1="322" y1="170" x2="333" y2="170" stroke="#6B7280" strokeWidth="1.5"/>
                <line x1="322" y1="177" x2="333" y2="177" stroke="#6B7280" strokeWidth="1.5"/>
                
                {/* Lightning bolt for speed */}
                <path d="M 200 40 L 185 60 L 200 60 L 190 85" fill="#9CA3AF" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-6 shadow-lg lg:mx-0 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Need to hire quickly?</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl lg:mx-0 mx-auto">Create a post in minutes and start receiving applications from ready-to-work talent across Kochi.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link to="/employer/jobs/new" className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post a Job Now
                </Link>
                <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-sm">
                  Review Applicants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerHome;
