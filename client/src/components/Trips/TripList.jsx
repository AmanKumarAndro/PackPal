import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, MapPin, Calendar, Users, Plus, Heart } from 'lucide-react';
import TripCard from './TripCard';

const TripList = ({ 
  trips = [], 
  onTripAction,
  showCreateButton = true,
  isPublicView = false,
  title = "My Trips"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [editingTrip, setEditingTrip] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState([]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripAPI.getUserTrips();
      console.log('Trips response:', response.data);
      setTrips(Array.isArray(response?.data?.trips) ? response?.data?.trips : []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError('Failed to load trips. Please try again.');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (tripData) => {
    try {
      const response = await tripAPI.createTrip(tripData);
      setTrips(prev => [response.data, ...prev]);
      // onTripAction('created', response.data);
      setError(null);
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error('Failed to create trip. Please try again.');
    }
  };

  const handleUpdateTrip = async (tripData) => {
    try {
      console.log('Updating trip with ID:', editingTrip._id);
      const response = await tripAPI.updateTrip(editingTrip._id, tripData);
      setTrips(prev => prev.map(trip => 
        trip._id === editingTrip._id ? response.data : trip
      ));
      setEditingTrip(null);
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error('Failed to update trip. Please try again.');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      await tripAPI.deleteTrip(tripId);
      setTrips(prev => prev.filter(trip => trip._id !== tripId));
      setError(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError('Failed to delete trip. Please try again.');
    }
  };

  const handleToggleVisibility = async (tripId) => {
    try {
      const response = await tripAPI.toggleTripVisibility(tripId);
      setTrips(prev => prev.map(trip => 
        trip._id === tripId ? response.data : trip
      ));
      setError(null);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      setError('Failed to update trip visibility. Please try again.');
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTrip(null);
  };

  useEffect(() => {
    let filtered = [...trips];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(trip => 
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filterBy !== 'all') {
      if (filterBy === 'public') {
        filtered = filtered.filter(trip => trip.isPublic);
      } else if (filterBy === 'private') {
        filtered = filtered.filter(trip => !trip.isPublic);
    } else if (filterBy === 'upcoming') {
        const today = new Date();
        filtered = filtered.filter(trip => new Date(trip.startDate) > today);
      } else if (filterBy === 'past') {
        const today = new Date();
        filtered = filtered.filter(trip => new Date(trip.endDate) < today);
      } else if (filterBy === 'current') {
        const today = new Date();
        filtered = filtered.filter(trip => 
          new Date(trip.startDate) <= today && new Date(trip.endDate) >= today
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
        case 'oldest':
          return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
        case 'destination':
          return a.destination.localeCompare(b.destination);
        case 'date':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'popular':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

    setFilteredTrips(filtered);
  }, [trips, searchTerm, sortBy, filterBy]);

  const getStatistics = () => {
    const total = trips.length;
    const publicTrips = trips.filter(trip => trip.isPublic).length;
    const privateTrips = total - publicTrips;
    const totalLikes = trips.reduce((sum, trip) => sum + (trip.likes || 0), 0);
    
    return { total, publicTrips, privateTrips, totalLikes };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {stats.total} trips
            </span>
            {!isPublicView && (
              <>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {stats.publicTrips} public
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {stats.totalLikes} total likes
                </span>
              </>
            )}
            {isPublicView && (
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {stats.totalLikes} total likes
              </span>
            )}
          </div>
        </div>
        
        {showCreateButton && !isPublicView && (
          <button
            onClick={() => onTripAction?.('create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search trips by destination or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* Filter by status */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Trips</option>
            {!isPublicView && (
              <>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </>
            )}
            <option value="upcoming">Upcoming</option>
            <option value="current">Current</option>
            <option value="past">Past</option>
          </select>

          {/* Sort by */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="destination">By Destination</option>
            <option value="date">By Date</option>
            {isPublicView && <option value="popular">Most Popular</option>}
          </select>

          {/* View mode toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Found {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} 
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {/* Trip Grid/List */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {searchTerm ? 'No trips found' : 'No trips yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search or filters'
              : showCreateButton 
                ? 'Create your first trip to start planning your adventures'
                : 'No public trips available at the moment'
            }
          </p>
          {showCreateButton && !isPublicView && !searchTerm && (
            <button
              onClick={() => onTripAction?.('create')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Trip
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip._id || trip.id}
              trip={trip}
              onDelete={() => onTripAction?.('delete', trip)}
              onEdit={() => onTripAction?.('edit', trip)}
              onLike={() => onTripAction?.('like', trip)}
              onToggleVisibility={() => onTripAction?.('toggleVisibility', trip)}
              
              isPublicView={isPublicView}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Load more button (for pagination if needed) */}
      {filteredTrips.length > 0 && trips.length > filteredTrips.length && (
        <div className="text-center">
          <button
            onClick={() => onTripAction?.('loadMore')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Load More Trips
          </button>
        </div>
      )}
    </div>
  );
};

export default TripList;