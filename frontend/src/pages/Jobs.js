import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import JobSummaryCard from '../components/JobSummaryCard';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Manufacturing',
  'Construction',
  'Retail',
  'Food Service',
  'Hospitality',
  'Transportation',
  'Warehouse',
  'Agriculture',
  'Cleaning',
  'Security',
  'Delivery',
  'Customer Service',
  'General Labor',
  'Other',
];

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal'];

const Jobs = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formValues, setFormValues] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    jobType: searchParams.get('jobType') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    setFormValues({
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      category: searchParams.get('category') || '',
      jobType: searchParams.get('jobType') || '',
      minSalary: searchParams.get('minSalary') || '',
      maxSalary: searchParams.get('maxSalary') || '',
    });

    // Open filters automatically if any are active; otherwise keep collapsed
    {
      const params = Object.fromEntries(searchParams.entries());
      const keys = ['search', 'city', 'category', 'jobType', 'minSalary', 'maxSalary'];
      const anyActive = keys.some((k) => params[k] && String(params[k]).trim() !== '');
      setIsFiltersOpen(anyActive);
    }

    const fetchJobs = async () => {
      if (user?.role === 'employer') {
        setJobs([]);
        setTotal(0);
        setPagination({});
        setError('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const params = Object.fromEntries(searchParams.entries());
        if (!params.limit) {
          params.limit = 9;
        }
        const response = await jobAPI.getJobs(params);
        setJobs(response.data.data || []);
        setTotal(response.data.total || 0);
        setPagination(response.data.pagination || {});
      } catch (err) {
        console.error('Error fetching jobs', err);
        setError('Unable to load job listings right now. Please try again soon.');
        setJobs([]);
        setTotal(0);
        setPagination({});
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams, user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    // Preserve current search; update only filter fields
    const params = Object.fromEntries(searchParams.entries());
    if (formValues.search) params.search = formValues.search; else delete params.search;
    if (formValues.city) params.city = formValues.city; else delete params.city;
    if (formValues.category) params.category = formValues.category; else delete params.category;
    if (formValues.jobType) params.jobType = formValues.jobType; else delete params.jobType;
    if (formValues.minSalary) params.minSalary = formValues.minSalary; else delete params.minSalary;
    if (formValues.maxSalary) params.maxSalary = formValues.maxSalary; else delete params.maxSalary;
    params.page = '1';
    params.limit = '9';
    setSearchParams(params);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    // Clear only filter fields; keep search as-is
    setFormValues((prev) => ({ ...prev, city: '', category: '', jobType: '', minSalary: '', maxSalary: '' }));
    const params = Object.fromEntries(searchParams.entries());
    delete params.city;
    delete params.category;
    delete params.jobType;
    delete params.minSalary;
    delete params.maxSalary;
    params.page = '1';
    params.limit = '9';
    setSearchParams(params);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = Object.fromEntries(searchParams.entries());
    if (formValues.search) params.search = formValues.search; else delete params.search;
    params.page = '1';
    params.limit = '9';
    setSearchParams(params);
  };

  const handlePagination = (page) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = String(page);
    if (!params.limit) {
      params.limit = '9';
    }
    setSearchParams(params);
  };

  const currentPage = Number(searchParams.get('page') || 1);
  const totalResultsLabel = total === 1 ? '1 job' : `${total} jobs`;

  if (user?.role === 'employer') {
    return (
      <div className="bg-gray-50 py-8 md:py-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-sm p-6 md:p-10 text-center space-y-4 md:space-y-6">
            <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-100 border-2 border-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 md:w-7 md:h-7 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v-1a4 4 0 00-4-4H5m11 5l3 3m-3-3l3-3M5 7h14" />
              </svg>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">Manage your own postings</h1>
            <p className="text-sm md:text-base text-gray-600">
              Employer accounts don’t have access to the public job board. Head to your dashboard to review your listings or create a new opportunity for job seekers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
              <Link to="/dashboard" className="btn btn-primary btn-sm md:btn-md min-w-[160px]">
                Go to Dashboard
              </Link>
              <Link to="/employer/jobs/new" className="btn btn-outline btn-sm md:btn-md min-w-[160px]">
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6 md:py-10 lg:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 md:mb-6">
          <div className="w-full">
            {/* Primary search and filters trigger */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 md:p-4">
              {/* Mobile: Stacked layout */}
              <div className="md:hidden space-y-2">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    value={formValues.search}
                    onChange={handleInputChange}
                    className="form-input flex-1 text-sm"
                    placeholder="Search jobs..."
                  />
                  <button type="submit" className="btn btn-primary btn-sm whitespace-nowrap px-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen((v) => !v)}
                  className="btn btn-outline btn-sm w-full relative"
                  aria-expanded={isFiltersOpen}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Filters
                  {(() => {
                    const params = Object.fromEntries(searchParams.entries());
                    const keys = ['city', 'category', 'jobType', 'minSalary', 'maxSalary'];
                    const active = keys.some((k) => params[k] && String(params[k]).trim() !== '');
                    return active ? (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-[10px]">•</span>
                    ) : null;
                  })()}
                </button>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden md:flex flex-row items-center gap-2">
                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                  <div>
                    <label className="sr-only">Search</label>
                  </div>
                  <input
                    type="text"
                    name="search"
                    value={formValues.search}
                    onChange={handleInputChange}
                    className="form-input flex-1"
                    placeholder="Search jobs or companies"
                  />
                  <button type="submit" className="btn btn-primary whitespace-nowrap">Search</button>
                </form>

                <button
                  type="button"
                  onClick={() => setIsFiltersOpen((v) => !v)}
                  className="btn btn-outline btn-sm relative whitespace-nowrap"
                  aria-expanded={isFiltersOpen}
                >
                  Filters
                  {(() => {
                    const params = Object.fromEntries(searchParams.entries());
                    const keys = ['city', 'category', 'jobType', 'minSalary', 'maxSalary'];
                    const active = keys.some((k) => params[k] && String(params[k]).trim() !== '');
                    return active ? (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-800 text-white text-[10px]">•</span>
                    ) : null;
                  })()}
                </button>
              </div>
            </div>

            {isFiltersOpen && (
              <div className="mt-3 bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-5">
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" onSubmit={handleFilterSubmit}>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-semibold block mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      className="form-input text-sm"
                      placeholder="e.g. Kochi"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-semibold block mb-2">Category</label>
                    <select
                      name="category"
                      value={formValues.category}
                      onChange={handleInputChange}
                      className="form-select text-sm"
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option value={category} key={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-semibold block mb-2">Job Type</label>
                    <select
                      name="jobType"
                      value={formValues.jobType}
                      onChange={handleInputChange}
                      className="form-select text-sm"
                    >
                      <option value="">All types</option>
                      {jobTypes.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-semibold block mb-2">Min Salary</label>
                    <input
                      type="number"
                      name="minSalary"
                      value={formValues.minSalary}
                      onChange={handleInputChange}
                      className="form-input text-sm"
                      placeholder="e.g. 100"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-500 font-semibold block mb-2">Max Salary</label>
                    <input
                      type="number"
                      name="maxSalary"
                      value={formValues.maxSalary}
                      onChange={handleInputChange}
                      className="form-input text-sm"
                      placeholder="e.g. 500"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4 flex flex-col sm:flex-row gap-2 md:gap-3">
                    <button type="submit" className="btn btn-primary btn-sm md:btn-md flex-1 min-w-[120px]">
                      Apply filters
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="btn btn-outline btn-sm md:btn-md flex-1 min-w-[120px]"
                    >
                      Clear filters
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading jobs..." />
        ) : error ? (
          <div className="bg-white border-2 border-gray-800 text-gray-800 rounded-xl p-4 md:p-6 text-center">
            <p className="text-sm md:text-base">{error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-12 text-center">
            <svg className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No jobs match your search yet</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">Try expanding your filters or check back again soon for new openings.</p>
            <button onClick={handleResetFilters} className="btn btn-primary btn-sm md:btn-md">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
              <span>
                Showing page {currentPage} • {totalResultsLabel}
              </span>
            </div>

            {/* Mobile: Vertical list with cards */}
            <div className="md:hidden space-y-4">
              {jobs.map((job) => (
                <JobSummaryCard key={job._id} job={job} />
              ))}
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobSummaryCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {(pagination.prev || pagination.next) && (
              <div className="flex justify-center items-center gap-3 md:gap-4 mt-6 md:mt-10">
                <button
                  onClick={() => handlePagination(currentPage - 1)}
                  disabled={!pagination.prev}
                  className="btn btn-outline btn-sm md:btn-md"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </span>
                </button>
                <span className="text-xs md:text-sm text-gray-500">Page {currentPage}</span>
                <button
                  onClick={() => handlePagination(currentPage + 1)}
                  disabled={!pagination.next}
                  className="btn btn-outline btn-sm md:btn-md"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;