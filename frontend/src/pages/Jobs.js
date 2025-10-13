import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobAPI, savedFiltersAPI } from '../utils/api';
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

const employmentTypes = ['Full-time', 'Part-time'];
const durations = ['Permanent', 'Contract', 'Temporary', 'Seasonal'];

const Jobs = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formValues, setFormValues] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    employmentType: searchParams.get('employmentType') || '',
    duration: searchParams.get('duration') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    salaryUnit: searchParams.get('salaryUnit') || 'hour',
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isOverlayCollapsed, setIsOverlayCollapsed] = useState(false);

  // Saved filters state
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [saveFilterLoading, setSaveFilterLoading] = useState(false);
  const [saveFilterError, setSaveFilterError] = useState('');
  const [saveFilterSuccess, setSaveFilterSuccess] = useState('');

  const isJobseeker = user?.role === 'jobseeker';

  useEffect(() => {
    setFormValues({
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      category: searchParams.get('category') || '',
      employmentType: searchParams.get('employmentType') || '',
      duration: searchParams.get('duration') || '',
      minSalary: searchParams.get('minSalary') || '',
      maxSalary: searchParams.get('maxSalary') || '',
      salaryUnit: searchParams.get('salaryUnit') || 'hour',
    });

    // Open filters automatically if any are active; otherwise keep collapsed
    {
  const params = Object.fromEntries(searchParams.entries());
      const keys = ['search', 'city', 'category', 'employmentType', 'duration', 'minSalary', 'maxSalary'];
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

  // Load saved filters for jobseekers
  useEffect(() => {
    const loadSavedFilters = async () => {
      if (isJobseeker) {
        try {
          const response = await savedFiltersAPI.getSavedFilters();
          setSavedFilters(response.data.data || []);
        } catch (err) {
          console.error('Error loading saved filters:', err);
        }
      }
    };
    loadSavedFilters();
  }, [isJobseeker]);

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
    if (formValues.employmentType) params.employmentType = formValues.employmentType; else delete params.employmentType;
    if (formValues.duration) params.duration = formValues.duration; else delete params.duration;
  if (formValues.minSalary) params.minSalary = formValues.minSalary; else delete params.minSalary;
  if (formValues.maxSalary) params.maxSalary = formValues.maxSalary; else delete params.maxSalary;
  if (formValues.salaryUnit) params.salaryUnit = formValues.salaryUnit; else delete params.salaryUnit;
    params.page = '1';
    params.limit = '9';
    setSearchParams(params);
    setIsFiltersOpen(false);
  };

  const handleResetFilters = () => {
    // Clear only filter fields; keep search as-is
  setFormValues((prev) => ({ ...prev, city: '', category: '', employmentType: '', duration: '', minSalary: '', maxSalary: '', salaryUnit: 'hour' }));
    const params = Object.fromEntries(searchParams.entries());
    delete params.city;
    delete params.category;
    delete params.employmentType;
    delete params.duration;
    delete params.minSalary;
  delete params.maxSalary;
  delete params.salaryUnit;
    params.page = '1';
    params.limit = '9';
    setSearchParams(params);
  };

  // Remove a single active filter from query params (used by overlay chips)
  const handleRemoveFilter = (key) => {
    const params = Object.fromEntries(searchParams.entries());
    delete params[key];
    // If removing one of salary bounds and no other bound remains, also clear salaryUnit
    if ((key === 'minSalary' || key === 'maxSalary') && !params.minSalary && !params.maxSalary) {
      delete params.salaryUnit;
    }
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

  const handleSaveFilters = async () => {
    if (!filterName.trim()) {
      setSaveFilterError('Please enter a name for this filter');
      return;
    }

    try {
      setSaveFilterLoading(true);
      setSaveFilterError('');
          const filterData = {
        name: filterName.trim(),
        filters: {
          search: formValues.search,
          city: formValues.city,
          category: formValues.category,
          employmentType: formValues.employmentType,
          duration: formValues.duration,
          minSalary: formValues.minSalary,
              maxSalary: formValues.maxSalary,
              salaryUnit: formValues.salaryUnit,
        },
      };

      await savedFiltersAPI.createSavedFilter(filterData);
      setSaveFilterSuccess('Filter saved successfully!');
      setFilterName('');
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveFilterSuccess('');
      }, 1500);

      // Reload saved filters
      const response = await savedFiltersAPI.getSavedFilters();
      setSavedFilters(response.data.data || []);
    } catch (err) {
      console.error('Error saving filter:', err);
      setSaveFilterError(err.response?.data?.message || 'Failed to save filter');
    } finally {
      setSaveFilterLoading(false);
    }
  };

  const handleApplyFilter = (filter) => {
    const params = Object.fromEntries(searchParams.entries());
    const filters = filter.filters || {};
    
    if (filters.search) params.search = filters.search; else delete params.search;
    if (filters.city) params.city = filters.city; else delete params.city;
    if (filters.category) params.category = filters.category; else delete params.category;
    if (filters.employmentType) params.employmentType = filters.employmentType; else delete params.employmentType;
    if (filters.duration) params.duration = filters.duration; else delete params.duration;
  if (filters.minSalary) params.minSalary = filters.minSalary; else delete params.minSalary;
  if (filters.maxSalary) params.maxSalary = filters.maxSalary; else delete params.maxSalary;
  if (filters.salaryUnit) params.salaryUnit = filters.salaryUnit; else delete params.salaryUnit;
    
    params.page = '1';
    params.limit = '9';
    setSearchParams(params);
  };

  const handleDeleteFilter = async (filterId) => {
    if (!window.confirm('Are you sure you want to delete this saved filter?')) {
      return;
    }

    try {
      await savedFiltersAPI.deleteSavedFilter(filterId);
      // Reload saved filters
      const response = await savedFiltersAPI.getSavedFilters();
      setSavedFilters(response.data.data || []);
    } catch (err) {
      console.error('Error deleting filter:', err);
      alert('Failed to delete filter');
    }
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
      <div className="bg-gray-50 py-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center space-y-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17v-1a4 4 0 00-4-4H5m11 5l3 3m-3-3l3-3M5 7h14" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Manage your own postings</h1>
            <p className="text-gray-600 text-base">
              Employer accounts don’t have access to the public job board. Head to your dashboard to review your listings or create a new opportunity for job seekers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard" className="btn btn-primary min-w-[160px]">
                Go to Dashboard
              </Link>
              <Link to="/employer/jobs/new" className="btn btn-outline min-w-[160px]">
                Post a Job
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10 lg:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="w-full">
            {/* Primary search and filters trigger */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-row items-center gap-2">
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
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-[10px]">•</span>
                  ) : null;
                })()}
              </button>
            </div>

            {isFiltersOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
                role="dialog"
                aria-modal="true"
              >
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsFiltersOpen(false)}
                />
                <div className="relative bg-white w-full max-w-xl md:max-w-5xl rounded-2xl shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col overflow-hidden">
                  <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a2 2 0 01-.586 1.414L15 11.828V20a1 1 0 01-1.447.894l-4-2A1 1 0 019 18v-6.172L3.586 7.414A2 2 0 013 6V4z" />
                      </svg>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">Filter jobs</h3>
                    </div>
                    <button
                      onClick={() => setIsFiltersOpen(false)}
                      className="text-gray-500 hover:text-gray-700 p-2"
                      aria-label="Close filters"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 8.586l3.536-3.536a1 1 0 111.415 1.414L11.414 10l3.536 3.536a1 1 0 01-1.415 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.414-1.414L8.586 10 5.05 6.464A1 1 0 116.464 5.05L10 8.586z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleFilterSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto overscroll-contain">
                      {/* City */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">City</h4>
                        <input
                          type="text"
                          name="city"
                          value={formValues.city}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="e.g. Kochi"
                        />
                      </div>

                      {/* Category */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Category</h4>
                        <select
                          name="category"
                          value={formValues.category}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">All categories</option>
                          {categories.map((category) => (
                            <option value={category} key={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Employment Type */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Employment Type</h4>
                        <select
                          name="employmentType"
                          value={formValues.employmentType}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">All employment types</option>
                          {employmentTypes.map((type) => (
                            <option value={type} key={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Duration</h4>
                        <select
                          name="duration"
                          value={formValues.duration}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="">All durations</option>
                          {durations.map((duration) => (
                            <option value={duration} key={duration}>
                              {duration}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Salary Range */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4 md:col-span-2 lg:col-span-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Salary Range</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold mb-2">Min</label>
                            <input
                              type="number"
                              name="minSalary"
                              value={formValues.minSalary}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="e.g. 12000"
                              min="0"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold mb-2">Max</label>
                            <input
                              type="number"
                              name="maxSalary"
                              value={formValues.maxSalary}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="e.g. 25000"
                              min="0"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 uppercase font-semibold mb-2">Unit</label>
                            <select
                              name="salaryUnit"
                              value={formValues.salaryUnit}
                              onChange={handleInputChange}
                              className="form-select"
                            >
                              <option value="hour">Per hour</option>
                              <option value="day">Per day</option>
                              <option value="week">Per week</option>
                              <option value="month">Per month</option>
                              <option value="year">Per year</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 md:px-5 py-3 md:py-4 border-t border-gray-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-gray-50 rounded-b-2xl sticky bottom-0">
                      <div className="flex gap-3 order-2 md:order-1">
                        <button type="button" className="btn btn-outline" onClick={() => setIsFiltersOpen(false)}>
                          Cancel
                        </button>
                        <button type="button" className="btn btn-outline" onClick={handleResetFilters}>
                          Clear filters
                        </button>
                      </div>
                      <div className="order-1 md:order-2 flex items-center gap-3">
                        {isJobseeker && (
                          <button
                            type="button"
                            onClick={() => setShowSaveModal(true)}
                            className="btn btn-outline"
                          >
                            Save
                          </button>
                        )}
                        <button type="submit" className="btn btn-primary min-w-[160px]">
                          Apply filters
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Overlay Card */}
        {(() => {
          const params = Object.fromEntries(searchParams.entries());
          const salaryUnit = params.salaryUnit || 'hour';
          const unitLabelMap = { hour: 'per hour', day: 'per day', week: 'per week', month: 'per month', year: 'per year' };
          const activeEntries = [
            params.city ? { key: 'city', label: 'City', value: params.city } : null,
            params.category ? { key: 'category', label: 'Category', value: params.category } : null,
            params.employmentType ? { key: 'employmentType', label: 'Type', value: params.employmentType } : null,
            params.duration ? { key: 'duration', label: 'Duration', value: params.duration } : null,
            params.minSalary ? { key: 'minSalary', label: `Min (${unitLabelMap[salaryUnit] || salaryUnit})`, value: params.minSalary } : null,
            params.maxSalary ? { key: 'maxSalary', label: `Max (${unitLabelMap[salaryUnit] || salaryUnit})`, value: params.maxSalary } : null,
          ].filter(Boolean);

          // Only show the overlay if there is at least one active filter
          if (activeEntries.length === 0) return null;

          return (
            <div className="fixed left-4 right-4 md:left-auto md:right-6 bottom-6 z-40">
              <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a2 2 0 01-.586 1.414L15 11.828V20a1 1 0 01-1.447.894l-4-2A1 1 0 019 18v-6.172L3.586 7.414A2 2 0 013 6V4z" />
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800">Active filters</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOverlayCollapsed((v) => !v)}
                      className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      {isOverlayCollapsed ? 'Show' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                {!isOverlayCollapsed && (
                  <div className="px-4 py-3 flex flex-wrap gap-2">
                    {activeEntries.map(({ key, label, value }) => (
                      <span key={key} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-sm">
                        <span className="font-medium">{label}:</span>
                        <span className="truncate max-w-[140px]" title={String(value)}>{String(value)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(key)}
                          className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-primary-100"
                          aria-label={`Remove ${label} filter`}
                          title={`Remove ${label}`}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 8.586l3.536-3.536a1 1 0 111.415 1.414L11.414 10l3.536 3.536a1 1 0 01-1.415 1.414L10 11.414l-3.536 3.536a1 1 0 01-1.414-1.414L8.586 10 5.05 6.464A1 1 0 116.464 5.05L10 8.586z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {loading ? (
          <LoadingSpinner text="Loading jobs..." />
        ) : error ? (
          <div className="bg-white border border-red-100 text-red-700 rounded-xl p-6 text-center">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No jobs match your search yet</h2>
            <p className="text-gray-600 mb-6">Try expanding your filters or check back again soon for new openings.</p>
            <button onClick={handleResetFilters} className="btn btn-primary">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <span>
                Showing page {currentPage} • {totalResultsLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobSummaryCard key={job._id} job={job} />
              ))}
            </div>

            {(pagination.prev || pagination.next) && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => handlePagination(currentPage - 1)}
                  disabled={!pagination.prev}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {currentPage}</span>
                <button
                  onClick={() => handlePagination(currentPage + 1)}
                  disabled={!pagination.next}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Save Filter Modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowSaveModal(false);
            setFilterName('');
            setSaveFilterError('');
            setSaveFilterSuccess('');
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Save Filter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Give this filter combination a name so you can quickly apply it later.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Name
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="e.g., Full-time Kochi jobs"
                className="form-input w-full"
                maxLength={50}
                autoFocus
              />
            </div>

            {saveFilterError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {saveFilterError}
              </div>
            )}

            {saveFilterSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {saveFilterSuccess}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSaveFilters}
                disabled={saveFilterLoading || !filterName.trim()}
                className="btn btn-primary flex-1"
              >
                {saveFilterLoading ? 'Saving...' : 'Save Filter'}
              </button>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setFilterName('');
                  setSaveFilterError('');
                  setSaveFilterSuccess('');
                }}
                className="btn btn-outline flex-1"
                disabled={saveFilterLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;