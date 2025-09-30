import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import JobSummaryCard from '../components/JobSummaryCard';

const JobSeekerHome = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (searchCity) params.append('city', searchCity);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div>
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in">
              Find Your Next
              <span className="block text-yellow-300">Opportunity</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-slide-up">
              Discover thousands of entry-level and unskilled job opportunities. Start your journey today with roles that welcome beginners.
            </p>

            <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg p-2 shadow-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Job title, keywords, or company"
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-0 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(event) => setSearchCity(event.target.value)}
                    placeholder="City or state"
                    className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border-0 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Jobs
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-bounce-in">
              <Link to="/jobs" className="btn btn-secondary btn-lg bg-white text-primary-600 hover:bg-gray-100">
                Browse All Jobs
              </Link>
              <Link to="/profile" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600">
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
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 capitalize">{stat.label}</div>
              </div>
            ))}
          </div>
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
                className="group p-6 bg-gray-50 rounded-lg hover:bg-primary-50 hover:shadow-md transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} jobs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-300">Getting started is easy! Follow these simple steps.</p>
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
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have found their dream roles through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="btn btn-secondary btn-lg bg-white text-primary-600 hover:bg-gray-100">
              Browse Jobs
            </Link>
            <Link to="/profile" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600">
              Update Your Profile
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobSeekerHome;
