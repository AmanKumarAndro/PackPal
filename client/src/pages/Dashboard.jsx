import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripAPI, feedbackAPI } from '../services/api';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Package, 
  Star,
  Users,
  Settings,
  LogOut,
  Luggage,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    packingLists: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tripsResponse, feedbackResponse] = await Promise.all([
        tripAPI.getUserTrips(),
        feedbackAPI.getRecentFeedback()
      ]);
      console.log(feedbackResponse.data);

      setTrips(tripsResponse?.data?.trips.slice(0, 3)); // Show only recent 3 trips
      setRecentFeedback(feedbackResponse?.data?.feedback?.slice(0, 5));
      
      // Calculate stats
      const totalTrips = tripsResponse?.data?.trips?.length;
      const completedTrips = tripsResponse?.data?.trips?.filter(trip => 
        new Date(trip.dates.endDate) < new Date()
      ).length;
      const packingLists = tripsResponse?.data?.trips?.filter(trip => trip.packingList).length;
      
      setStats({ totalTrips, completedTrips, packingLists });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your travels
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Packing Lists</p>
                <p className="text-2xl font-bold text-gray-900">{stats.packingLists}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Trips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
                <Link to="/trips" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {trips.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No trips yet</p>
                  <Link to="/trips" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Plan Your First Trip
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {trip.destination.city}, {trip.destination.country}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(trip.dates.startDate)} - {formatDate(trip.dates.endDate)}
                        </p>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                          {trip.tripType}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {trip.packingList && (
                          <Link
                            to={`/packing/${trip._id}`}
                            className="p-2 text-gray-400 hover:text-primary-600"
                            title="View Packing List"
                          >
                            <Package className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Community Feedback */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Community Feedback</h2>
                <Link to="/feedback" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentFeedback.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No feedback yet</p>
                  <Link to="/feedback" className="btn-primary">
                    <Star className="h-4 w-4 mr-2" />
                    Share Feedback
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {feedback.category.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {feedback.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/trips"
            className="flex items-center justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Plan New Trip</span>
          </Link>
          
          <Link
            to="/feedback"
            className="flex items-center justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Star className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">Share Feedback</span>
          </Link>
          
          <button className="flex items-center justify-center p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-600">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;