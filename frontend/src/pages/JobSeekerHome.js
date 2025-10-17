import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardJobCard from '../components/DashboardJobCard';

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
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-gradient-to-b from-white via-blue-50/40 to-white overflow-hidden">
        {/* Subtle decorative blobs for purple shading */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in text-gray-900 leading-tight">
              Find Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Opportunity</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto animate-slide-up">
              Discover thousands of entry-level opportunities. Start your journey today with roles that welcome beginners.
            </p>

            {/* Search Card */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-2 shadow-md ring-1 ring-gray-200">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Job title, keywords, or company"
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 rounded-md border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(event) => setSearchCity(event.target.value)}
                    placeholder="City or state"
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 rounded-md border border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 sm:px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Jobs
                </button>
              </div>
            </form>

            {/* Quick actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-bounce-in">
              <Link to="/jobs" className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 ring-1 ring-blue-200">
                Browse All Jobs
              </Link>
              <Link to="/profile" className="btn btn-outline btn-lg border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white">
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats as cards */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active jobs', value: '10k+' },
              { label: 'Job seekers', value: '50k+' },
              { label: 'Companies', value: '5k+' },
              { label: 'Success rate', value: '95%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-gray-600 capitalize">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Jobs Section */}
      <section className="py-16 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="max-w-2xl mx-auto text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
              <svg className="mx-auto h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Your Profile</h3>
              <p className="text-gray-700 mb-6 px-4">
                Help us understand you better! Add your skills, experience, and location preferences 
                to receive personalized job recommendations tailored just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Link to="/profile" className="btn btn-primary btn-lg">
                  Complete Profile Now
                </Link>
                <Link to="/jobs" className="btn btn-outline btn-lg">
                  Browse All Jobs
                </Link>
              </div>
            </div>
          ) : recommendedJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {recommendedJobs.map((job) => (
                  <DashboardJobCard
                    key={job._id}
                    job={job}
                    showStatus={false}
                    showStats={false}
                    tags={[job.employmentType || job.jobType, job.category].filter(Boolean)}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  />
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

      <section className="py-16 bg-blue-50/30">
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
                  <DashboardJobCard
                    key={job._id}
                    job={job}
                    showStatus={false}
                    showStats={false}
                    tags={[job.employmentType || job.jobType, job.category].filter(Boolean)}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  />
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
                className="group p-6 bg-white rounded-xl ring-1 ring-gray-200 hover:ring-blue-400/60 hover:shadow-md transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} jobs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Getting started is easy! Follow these simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Profile',
                description: 'Sign up and create your profile with your skills and experience.',
              },
              {
                step: '2',
                title: 'Search & Apply',
                description: 'Browse jobs that match your interests and apply with one click.',
              },
              {
                step: '3',
                title: 'Get Hired',
                description: 'Connect with employers and start your new career journey.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center bg-white rounded-xl p-6 ring-1 ring-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have found their dream roles through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="btn btn-secondary btn-lg bg-white text-blue-700 hover:bg-blue-50">
              Browse Jobs
            </Link>
            <Link to="/profile" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-blue-700">
              Update Your Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobSeekerHome;
