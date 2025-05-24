import React, { useState } from 'react';
import { MapPin, Calendar, Eye, EyeOff, Heart, MessageCircle, Trash2, Edit, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const TripCard = ({
  trip,
  onDelete,
  onEdit,
  onToggleVisibility,
  onLike,
  showActions = true,
  isPublic = false
}) => {
  const [isLiked, setIsLiked] = useState(trip.isLiked || false);
  const [likeCount, setLikeCount] = useState(trip.likes || 0);
  const navigate = useNavigate();


  const handleLike = async () => {
    try {
      await onLike(trip._id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking trip:', error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await onToggleVisibility(trip._id);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  console.log("trip", trip);
  // {destination: {…}, dates: {…}, weather: {…}, aiSuggestions: {…}, _id: '6830a83c1ba44063a78dd728', …}
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Trip Image */}
      {trip.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{trip?.destination?.city}</h2>
            {/* <h2 className="text-xl font-bold text-gray-800 mb-2">{trip?.destination?.city}<span className='text-gray-600 '>, {trip?.destination?.country}</span></h2> */}
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{trip?.destination?.country}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {formatDate(trip?.dates?.startDate)} - {formatDate(trip?.dates?.endDate)}
              </span>
            </div>
          </div>

          {/* Visibility Badge */}
          <div className="flex items-center">
            {trip.isPublic ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Public
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center">
                <EyeOff className="w-3 h-3 mr-1" />
                Private
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{trip.description}</p>
        )}

        {/* Weather Info */}
        {trip.weather && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <Cloud className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Weather Forecast</span>
            </div>
            <div className="text-sm text-blue-700">
              <p>Temperature: {trip.weather.temperature}°C</p>
              <p>Condition: {trip.weather.condition}</p>
            </div>
          </div>
        )}

        {/* AI Suggestions Preview */}
        {trip.aiSuggestions && trip.aiSuggestions.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-purple-800 mb-1">AI Packing Suggestions</div>
            <div className="text-sm text-purple-700">
              {trip.aiSuggestions.slice(0, 3).map((suggestion, index) => (
                <span key={index} className="inline-block bg-purple-100 rounded px-2 py-1 mr-1 mb-1">
                  {suggestion}
                </span>
              ))}
              {trip.aiSuggestions.length > 3 && (
                <span className="text-purple-600">+{trip.aiSuggestions.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Stats for Public Trips */}
        {isPublic && (
          <div className="flex items-center justify-between mb-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likeCount}</span>
              </button>

              <div className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{trip.feedbackCount || 0}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              By {trip.author?.name || 'Anonymous'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && !isPublic && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/trips/${trip._id}`)}
                className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => onEdit(trip)}
                className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>

              <button
                onClick={handleToggleVisibility}
                className="flex items-center px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                {trip.isPublic ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {trip.isPublic ? 'Make Private' : 'Make Public'}
              </button>
            </div>

            <button
              onClick={() => onDelete(trip._id)}
              className="flex items-center px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCard;