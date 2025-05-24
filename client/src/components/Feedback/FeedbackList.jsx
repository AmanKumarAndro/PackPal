import { useState, useEffect } from 'react';
import { feedbackAPI} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FeedbackList = ({ tripId = null, showPublicOnly = false }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchFeedbacks();
  }, [tripId, showPublicOnly, filter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (tripId) {
        response = await feedbackAPI.getTripFeedback(tripId);
      } else {
        response = await feedbackAPI.getPublicFeedback();
      }
      
      let filteredFeedbacks = response.data.feedback;
      console.log(filteredFeedbacks);

      // Apply category filter
      if (filter !== 'all') {
        filteredFeedbacks = filteredFeedbacks.filter(
          feedback => feedback.category === filter
        );
      }

      setFeedbacks(filteredFeedbacks);
    } catch (err) {
      setError('Failed to load feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (feedbackId) => {
    if (!user) {
      alert('Please login to like feedback');
      return;
    }

    try {
      await feedbackAPI.toggleFeedbackLike(feedbackId);
      // Update the feedback in state
      setFeedbacks(prev => prev.map(feedback => {
        if (feedback._id === feedbackId) {
          const isAlreadyLiked = feedback.likedBy.includes(user._id);
          return {
            ...feedback,
            likes: isAlreadyLiked ? feedback.likes - 1 : feedback.likes + 1,
            likedBy: isAlreadyLiked 
              ? feedback.likedBy.filter(id => id !== user._id)
              : [...feedback.likedBy, user._id]
          };
        }
        return feedback;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
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
        className={`text-lg ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {['packing_suggestions', 'weather_accuracy', 'attractions', 'overall', 'other'].map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No feedback found
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="bg-white rounded-lg shadow-md p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {feedback.user?.name || 'Anonymous'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getCategoryLabel(feedback.category)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(feedback.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-4">{feedback.comment}</p>

              {/* Trip Info */}
              {feedback.trip && !tripId && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Trip:</span>{' '}
                    {feedback.trip.destination?.city}, {feedback.trip.destination?.country}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleLike(feedback._id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    user && feedback.likedBy.includes(user._id)
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  disabled={!user}
                >
                  <span className="text-sm">❤️</span>
                  <span className="text-sm">{feedback.likes}</span>
                </button>

                {feedback.isPublic && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Public
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;