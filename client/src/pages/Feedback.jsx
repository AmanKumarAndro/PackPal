// src/pages/Feedback.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import FeedbackList from '../components/Feedback/FeedbackList';
import { feedbackAPI} from '../services/api';
import { useAuth } from '../context/AuthContext';

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [activeTab, setActiveTab] = useState('public');
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'my-feedback' && user) {
      fetchUserFeedback();
    } else if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'top-rated') {
      fetchTopRated();
    } else if (activeTab === 'recent') {
      fetchRecent();
    }
  }, [activeTab, user]);

  const fetchUserFeedback = async () => {
    setLoading(true);
    try {
      const response = await feedbackAPI.getUserFeedback();
      // console.log(response.data);
      setUserFeedbacks(response.data.feedback);
    } catch (error) {
      console.error('Error fetching user feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await feedbackAPI.getFeedbackStats();
      // console.log(response.data.stats);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopRated = async () => {
    setLoading(true);
    try {
      const response = await feedbackAPI.getTopRatedFeedback();
      setTopRated(response.data);
    } catch (error) {
      console.error('Error fetching top rated:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const response = await feedbackAPI.getRecentFeedback();
      setRecent(response.data);
    } catch (error) {
      console.error('Error fetching recent:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'packing_suggestions': 'Packing Suggestions',
      'weather_accuracy': 'Weather Accuracy',
      'attractions': 'Attractions',
      'overall': 'Overall Experience',
      'other': 'Other'
    };
    return labels[category] || category;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  const tabs = [
    { id: 'public', label: 'Public Feedback', requiresAuth: false },
    { id: 'my-feedback', label: 'My Feedback', requiresAuth: true },
    { id: 'stats', label: 'Statistics', requiresAuth: false },
    { id: 'top-rated', label: 'Top Rated', requiresAuth: false },
    { id: 'recent', label: 'Recent', requiresAuth: false }
  ];

  const visibleTabs = tabs.filter(tab => !tab.requiresAuth || user);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {tripId ? 'Trip Feedback' : 'Community Feedback'}
        </h1>
        <p className="text-gray-600">
          {tripId 
            ? 'Share your experience and read feedback for this trip'
            : 'Discover what other travelers are saying about their experiences'
          }
        </p>
      </div>

      {/* Create Feedback Form for specific trip */}
      {tripId && user && (
        <div className="mb-8">
          <FeedbackForm 
            tripId={tripId} 
            onFeedbackCreated={() => window.location.reload()} 
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'public' && (
          <FeedbackList tripId={tripId} showPublicOnly={true} />
        )}

        {activeTab === 'my-feedback' && user && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't submitted any feedback yet.</p>
                <p className="mt-2">Create a trip and share your experience!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getCategoryLabel(feedback.category)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(feedback.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{feedback.comment}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {feedback.likes} likes
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        feedback.isPublic 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {feedback.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Feedback</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-yellow-500">
                      {stats.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                    <div className="flex">
                      {renderStars(Math.round(stats.averageRating || 0))}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Most Popular Category</h3>
                  <p className="text-lg font-medium text-gray-700">
                    {stats.topCategory ? getCategoryLabel(stats.topCategory) : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No statistics available
              </div>
            )}
          </div>
        )}

        {activeTab === 'top-rated' && (
          <FeedbackList showPublicOnly={true} />
        )}

        {activeTab === 'recent' && (
          <FeedbackList showPublicOnly={true} />
        )}
      </div>
    </div>
  );
};

export default Feedback;