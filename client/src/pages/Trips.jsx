import React, { useState, useEffect } from 'react';
import TripList from '../components/Trips/TripList';
import TripForm from '../components/Trips/TripForm';
import { tripAPI } from '../services/api';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState({
    trips: true,
    publicTrips: false,
    action: false
  });
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('my-trips');
  const [error, setError] = useState(null);

  // Fetch user's trips on component mount
  useEffect(() => {
    fetchUserTrips();
  }, []);

  // Fetch public trips when switching to community tab
  useEffect(() => {
    if (activeTab === 'community') {
      fetchPublicTrips();
    }
  }, [activeTab]);

  const fetchUserTrips = async () => {
    try {
      setLoading(prev => ({ ...prev, trips: true }));
      const response = await tripAPI.getUserTrips();
      console.log("response data trips", response.data.trips);
      setTrips(response.data.trips);
      setError(null);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('Failed to load your trips. Please try again.');
      // toast.error('Failed to load trips');
    } finally {
      setLoading(prev => ({ ...prev, trips: false }));
    }
  };

  const fetchPublicTrips = async () => {
    try {
      setLoading(prev => ({ ...prev, publicTrips: true }));
      const response = await tripAPI.getPublicTrips();
      setPublicTrips(response.data.trips);
    } catch (error) {
      console.error('Error fetching public trips:', error);
      // toast.error('Failed to load community trips');
    } finally {
      setLoading(prev => ({ ...prev, publicTrips: false }));
    }
  };

  const handleCreateTrip = async (tripData) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const response = await tripAPI.createTrip(tripData);
      setTrips(prev => [response.data, ...prev]);
      // toast.success('Trip created successfully!');
      setShowForm(false);
    } catch (error) {
      console.error('Error creating trip:', error);
      // toast.error('Failed to create trip');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleUpdateTrip = async (tripData) => {
    if (!editingTrip) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const response = await tripAPI.updateTrip(editingTrip._id, tripData);
      setTrips(prev => prev.map(trip => 
        trip._id === editingTrip._id ? response.data : trip
      ));
      // toast.success('Trip updated successfully!');
      setShowForm(false);
      setEditingTrip(null);
    } catch (error) {
      console.error('Error updating trip:', error);
      // toast.error('Failed to update trip');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      setLoading(prev => ({ ...prev, action: true }));
      await tripAPI.deleteTrip(tripId);
      setTrips(prev => prev.filter(trip => trip._id !== tripId));
      // toast.success('Trip deleted successfully!');
    } catch (error) {
      console.error('Error deleting trip:', error);
      // toast.error('Failed to delete trip');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleToggleVisibility = async (tripId) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const response = await tripAPI.toggleTripVisibility(tripId);
      setTrips(prev => prev.map(trip => 
        trip._id === tripId ? { ...trip, isPublic: response.data.isPublic } : trip
      ));
      // toast.success(`Trip is now ${response.data.isPublic ? 'public' : 'private'}`);
      
      // Refresh public trips if we're viewing community tab
      if (activeTab === 'community') {
        fetchPublicTrips();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // toast.error('Failed to update trip visibility');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleLikeTrip = async (tripId) => {
    try {
      // This would need to be implemented in your API
      // For now, we'll just show a placeholder
      // toast.success('Trip liked!');
      
      // Update local state
      if (activeTab === 'community') {
        setPublicTrips(prev => prev.map(trip => 
          trip._id === tripId 
            ? { ...trip, likes: (trip.likes || 0) + 1, isLiked: true }
            : trip
        ));
      }
    } catch (error) {
      console.error('Error liking trip:', error);
      // toast.error('Failed to like trip');
    }
  };

  const handleGetWeather = async (destination) => {
    try {
      // Assuming you have a trip ID, but for new trips, you might need a different approach
      // This is a placeholder - you'd need to modify your API to handle weather requests without trip ID
      const response = await fetch(`/api/weather?destination=${encodeURIComponent(destination)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw new Error('Failed to fetch weather data');
    }
  };

  const handleGenerateAISuggestions = async (prompt) => {
    try {
      // This would need to be implemented to work without a specific trip ID for new trips
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      throw new Error('Failed to generate AI suggestions');
    }
  };

  const handleTripAction = (action, data) => {
    switch (action) {
      case 'create':
        setEditingTrip(null);
        setShowForm(true);
        break;
      case 'edit':
        setEditingTrip(data);
        setShowForm(true);
        break;
      case 'delete':
        handleDeleteTrip(data._id||data.id);
        break;
      case 'toggleVisibility':
        handleToggleVisibility(data._id||data.id);
        break;
      case 'like':
        handleLikeTrip(data._id||data.id);
        break;
      case 'loadMore':
        // Implement pagination if needed
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = (tripData) => {
    if (editingTrip) {
      return handleUpdateTrip(tripData);
    } else {
      return handleCreateTrip(tripData);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTrip(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUserTrips}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Planner</h1>
          <p className="text-gray-600">
            Plan your adventures, get weather insights, and receive AI-powered packing suggestions
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-trips')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-trips'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Trips ({trips.length})
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'community'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Community Trips
            </button>
          </nav>
        </div>

        {/* Trip Lists */}
        {activeTab === 'my-trips' && (
          <TripList
            trips={trips}
            loading={loading.trips}
            onTripAction={handleTripAction}
            showCreateButton={true}
            isPublicView={false}
            title="My Trips"
          />
        )}

        {activeTab === 'community' && (
          <TripList
            trips={publicTrips}
            loading={loading.publicTrips}
            onTripAction={handleTripAction}
            showCreateButton={false}
            isPublicView={true}
            title="Community Trips"
          />
        )}

        {/* Trip Form Modal */}
        <TripForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingTrip}
          onGetWeather={handleGetWeather}
          onGenerateAISuggestions={handleGenerateAISuggestions}
        />

        {/* Loading Overlay */}
        {loading.action && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;