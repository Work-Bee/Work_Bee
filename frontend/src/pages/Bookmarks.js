import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookmarkAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || user.role !== 'jobseeker') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await bookmarkAPI.getBookmarks();
        setBookmarks(response.data.data || []);
      } catch (err) {
        console.error('Error fetching bookmarks', err);
        setError('Unable to load your bookmarks right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const handleRemoveBookmark = async (jobId) => {
    try {
      setRemovingId(jobId);
      await bookmarkAPI.removeBookmark(jobId);
      setBookmarks(bookmarks.filter(bookmark => bookmark.job._id !== jobId));
    } catch (err) {
      console.error('Error removing bookmark', err);
      alert('Failed to remove bookmark. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner text="Loading your bookmarks..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">My Bookmarks</h1>
          <p className="text-gray-600">Save jobs you're interested in and apply later.</p>
        </div>

        {error ? (
          <div className="bg-white border border-red-100 text-red-700 rounded-xl p-6 text-center">
            {error}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No bookmarks yet</h2>
            <p className="text-gray-600 mb-6">Save jobs you're interested in by clicking the bookmark icon on any job card.</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => {
              const job = bookmark.job || {};
              const companyName = job.company?.name || 'Unknown Company';
              const locationLabel = formatLocation(job.location);
              const salaryLabel = formatSalaryRange(job.salary);
              const bookmarkedDate = formatDate(bookmark.createdAt);

              return (
                <div key={bookmark._id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/jobs/${job._id}`} className="text-xl font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                            {job.title}
                          </Link>
                          <p className="text-primary-600 font-medium mt-1">{companyName}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {locationLabel}
                            {job.jobType && <span className="ml-2">• {job.jobType}</span>}
                            {job.category && <span className="ml-2">• {job.category}</span>}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Bookmarked on {bookmarkedDate}</p>
                        </div>
                      </div>
                      
                      {job.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <p className="text-sm font-semibold text-green-600">{salaryLabel}</p>
                      <div className="flex items-center gap-2">
                        <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                          View Details
                        </Link>
                        <button
                          onClick={() => handleRemoveBookmark(job._id)}
                          disabled={removingId === job._id}
                          className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          title="Remove bookmark"
                        >
                          {removingId === job._id ? (
                            <span className="flex items-center gap-1">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Removing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                              </svg>
                              Remove
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
