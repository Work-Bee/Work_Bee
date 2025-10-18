import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import JobSummaryCard from '../components/JobSummaryCard';

const JobSeekerHome = () => {
  const { user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await jobAPI.getFeaturedJobs();
        setFeaturedJobs(response.data.data || []);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (!user) {
        setRecommendedLoading(false);
        return;
      }

      try {
        const response = await jobAPI.getRecommendedJobs({ limit: 6 });
        setRecommendedJobs(response.data.data || []);
        setNeedsProfile(response.data.needsProfile || false);
      } catch (error) {
        console.error('Error fetching recommended jobs:', error);
      } finally {
        setRecommendedLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, [user]);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (searchCity) params.append('city', searchCity);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 text-gray-900 py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-100/50 rounded-full blur-3xl"></div>
        
        {/* Floating decorative icons */}
        <div className="absolute top-1/4 right-1/4 animate-pulse">
          <div className="w-8 h-8 bg-green-200/60 rounded-lg rotate-12"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-pulse" style={{animationDelay: '1s'}}>
          <div className="w-6 h-6 bg-purple-200/60 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in text-gray-900">
              Find Your Next
              <span className="block bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent">Opportunity</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto animate-slide-up">
              Discover thousands of entry-level and unskilled job opportunities. Start your journey today with roles that welcome beginners.
            </p>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-2 shadow-xl border-2 border-purple-100">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Job title, keywords, or company"
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-0 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(event) => setSearchCity(event.target.value)}
                    placeholder="City or state"
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-0 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Jobs
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-bounce-in">
              <Link to="/jobs" className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h3m-3 0h-8m0 0H5" />
                </svg>
                Browse All Jobs
              </Link>
              <Link to="/profile" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Active jobs', value: '10k+' },
              { label: 'Job seekers', value: '50k+' },
              { label: 'Companies', value: '5k+' },
              { label: 'Success rate', value: '95%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-green-600 bg-clip-text text-transparent mb-2">{stat.value}</div>
                <div className="text-gray-600 capitalize">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Jobs Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-purple-100 to-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recommended For You</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Jobs matched to your skills, experience, and preferences
            </p>
          </div>

          {recommendedLoading ? (
            <LoadingSpinner text="Finding your perfect matches..." />
          ) : needsProfile ? (
            <div className="max-w-2xl mx-auto text-center py-12 bg-gradient-to-br from-purple-50 via-white to-green-50 rounded-2xl border-2 border-dashed border-purple-200 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full opacity-40 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-100 rounded-full opacity-40 translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Your Profile</h3>
                <p className="text-gray-700 mb-6 px-4">
                  Help us understand you better! Add your skills, experience, and location preferences 
                  to receive personalized job recommendations tailored just for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                  <Link to="/profile" className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                    Complete Profile Now
                  </Link>
                  <Link to="/jobs" className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                    Browse All Jobs
                  </Link>
                </div>
              </div>
            </div>
          ) : recommendedJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recommendedJobs.map((job) => (
                  <JobSummaryCard key={job._id} job={job} />
                ))}
              </div>
              <div className="text-center">
                <Link to="/jobs" className="btn btn-outline btn-lg">
                  View All Jobs
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
              <p className="text-gray-600 mb-4">Update your profile with more details to get better recommendations!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/profile" className="btn btn-primary">
                  Update Profile
                </Link>
                <Link to="/jobs" className="btn btn-outline">
                  Browse All Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the latest opportunities from employers hiring motivated candidates.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured jobs..." />
          ) : featuredJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredJobs.map((job) => (
                  <JobSummaryCard key={job._id} job={job} />
                ))}
              </div>
              <div className="text-center">
                <Link to="/jobs" className="btn btn-primary btn-lg">
                  View All Jobs
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Jobs Yet</h3>
              <p className="text-gray-600 mb-4">Check back later for new opportunities!</p>
              <Link to="/jobs" className="btn btn-primary">
                Browse All Jobs
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Job Categories</h2>
            <p className="text-xl text-gray-600">Find opportunities in these growing sectors.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: 'Manufacturing', icon: '🏭', count: '2.5k+' },
              { name: 'Retail', icon: '🛒', count: '1.8k+' },
              { name: 'Food Service', icon: '🍽️', count: '1.2k+' },
              { name: 'Warehouse', icon: '📦', count: '950+' },
              { name: 'Construction', icon: '🏗️', count: '720+' },
              { name: 'Transportation', icon: '🚛', count: '640+' },
              { name: 'Cleaning', icon: '🧽', count: '580+' },
              { name: 'Security', icon: '🛡️', count: '420+' },
            ].map((category) => (
              <Link
                key={category.name}
                to={`/jobs?category=${category.name}`}
                className="group p-6 bg-gradient-to-br from-purple-50 to-green-50 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 border border-purple-100"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} jobs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-green-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Getting started is easy! Follow these simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Sign up and create your profile with your skills and experience.',
                icon: (
                  <svg className="w-12 h-12 mx-auto mb-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                color: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
              },
              {
                step: '2',
                title: 'Search & Apply',
                description: 'Browse jobs that match your interests and apply with one click.',
                icon: (
                  <svg className="w-12 h-12 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                color: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' }
              },
              {
                step: '3',
                title: 'Get Hired',
                description: 'Connect with employers and start your new career journey.',
                icon: (
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
              },
            ].map((item) => (
              <div key={item.step} className={`bg-white border-2 ${item.color.border} rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300`}>
                {item.icon}
                <div className={`w-16 h-16 ${item.color.bg} rounded-full flex items-center justify-center mx-auto mb-4 relative`}>
                  <span className={`text-2xl font-bold ${item.color.text}`}>{item.step}</span>
                  <div className={`absolute -top-1 -right-1 w-4 h-4 ${item.color.bg} rounded-full opacity-60`}></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-50 via-green-50 to-blue-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-green-500 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have found their dream roles through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all shadow-md">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h3m-3 0h-8m0 0H5" />
              </svg>
              Browse Jobs
            </Link>
            <Link to="/profile" className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Update Your Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobSeekerHome;
