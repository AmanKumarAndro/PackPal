import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Calendar,
    Clock,
    Cloud,
    Thermometer,
    Wind,
    Droplets,
    Star,
    ArrowLeft,
    Edit,
    Share2,
    Heart,
    MessageCircle,
    Package,
    Map,
    Info
} from 'lucide-react';
import { tripAPI } from '../../services/api';

const TripDetailsView = ({ tripId, onBack, onEdit }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const fetchTripDetails = async () => {
            console.log("tripId", tripId);
            try {
                setLoading(true);
                const response = await tripAPI.getTripById(tripId);
                if (response.data.success) {
                    setTrip(response.data.trip);
                }
            } catch (error) {
                console.error('Error fetching trip details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTripDetails();
        }
    }, [tripId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatShortDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getWeatherIcon = (condition) => {
        if (condition.toLowerCase().includes('rain')) return <Droplets className="w-5 h-5 text-blue-500" />;
        if (condition.toLowerCase().includes('cloud')) return <Cloud className="w-5 h-5 text-gray-500" />;
        return <Cloud className="w-5 h-5 text-yellow-500" />;
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Trip not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Trips
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {trip.destination.city}, {trip.destination.country}
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{formatDate(trip.dates.startDate)} - {formatDate(trip.dates.endDate)}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{trip.dates.duration} days</span>
                            </div>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm capitalize">
                                {trip.tripType}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {trip.isPublic && (
                            <button
                                onClick={handleLike}
                                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{trip.likes + (isLiked ? 1 : 0)}</span>
                            </button>
                        )}
                        <button className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                        <button
                            onClick={() => onEdit(trip)}
                            className="flex items-center space-x-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Description */}
            {trip.description && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-700">{trip.description}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: Info },
                        { id: 'weather', label: 'Weather', icon: Cloud },
                        { id: 'attractions', label: 'Attractions', icon: Map },
                        { id: 'packing', label: 'Packing List', icon: Package },
                        { id: 'ai-tips', label: 'AI Suggestions', icon: Star }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                Destination Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium text-gray-700">City:</span>
                                    <span className="ml-2 text-gray-600">{trip.destination.city}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Country:</span>
                                    <span className="ml-2 text-gray-600">{trip.destination.country}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Trip Type:</span>
                                    <span className="ml-2 text-gray-600 capitalize">{trip.tripType}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Duration:</span>
                                    <span className="ml-2 text-gray-600">{trip.dates.duration} days</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                                Trip Timeline
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="font-medium text-gray-700">Start Date:</span>
                                    <span className="ml-2 text-gray-600">{formatDate(trip.dates.startDate)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">End Date:</span>
                                    <span className="ml-2 text-gray-600">{formatDate(trip.dates.endDate)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Created:</span>
                                    <span className="ml-2 text-gray-600">{formatDate(trip.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'weather' && (
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Cloud className="w-5 h-5 mr-2 text-blue-600" />
                            Weather Forecast
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trip.weather.forecast.map((day, index) => (
                                <div key={index} className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-800">
                                            {formatShortDate(day.date)}
                                        </span>
                                        {getWeatherIcon(day.condition)}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <Thermometer className="w-4 h-4 mr-2 text-red-500" />
                                            <span>{day.temperature.min}°C - {day.temperature.max}°C</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Cloud className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="capitalize">{day.condition}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Droplets className="w-4 h-4 mr-2 text-blue-500" />
                                            <span>{day.humidity}% humidity</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Wind className="w-4 h-4 mr-2 text-gray-400" />
                                            <span>{day.windSpeed} km/h</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'attractions' && (
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Map className="w-5 h-5 mr-2 text-purple-600" />
                            Attractions & Activities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trip.attractions.map((attraction, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-gray-800">{attraction.name}</h4>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="ml-1 text-sm text-gray-600">{attraction.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{attraction.description}</p>
                                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                        {attraction.category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'packing' && trip.packingList && (
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-green-600" />
                            Packing List
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trip.packingList.categories.map((category, index) => (
                                <div key={index}>
                                    <h4 className="font-medium text-gray-800 mb-3">{category.name}</h4>
                                    <div className="space-y-2">
                                        {category.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.packed}
                                                    readOnly
                                                    className="rounded border-gray-300 text-green-600 mr-3"
                                                />
                                                <span className={`${item.packed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ai-tips' && (
                    <div className="space-y-6">
                        {[
                            { title: 'Packing Recommendations', key: 'packingRecommendations', color: 'blue' },
                            { title: 'Travel Tips', key: 'travelTips', color: 'green' },
                            { title: 'Local Attractions', key: 'localAttractions', color: 'purple' }
                        ].map((suggestion, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer bg-${suggestion.color}-50 rounded-lg border border-${suggestion.color}-200 p-6 hover:shadow-md transition`}
                                onClick={async () => {
                                    const existingData = trip?.aiSuggestions?.[suggestion.key];
                                    if (!existingData) {
                                        try {
                                            setLoading(true);
                                            await tripAPI.generateAISuggestions(tripId); // generates all AI suggestions
                                            const response = await tripAPI.getTripById(tripId); // fetch updated data
                                            if (response.data.success) {
                                                setTrip(response.data.trip);
                                            }
                                        } catch (err) {
                                            console.error('Error generating AI suggestions:', err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                            >
                                <h3 className={`text-lg font-semibold mb-4 flex items-center text-${suggestion.color}-800`}>
                                    <Star className="w-5 h-5 mr-2" />
                                    {suggestion.title}
                                </h3>
                                <div className={`text-${suggestion.color}-700 whitespace-pre-line`}>
                                    {trip?.aiSuggestions?.[suggestion.key] || 'Click to generate suggestion...'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TripDetailsView;