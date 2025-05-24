import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Plane, Loader, CheckCircle } from 'lucide-react';

const TripForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  onGetWeather,
  onGenerateAISuggestions 
}) => {
  const [formData, setFormData] = useState({
    destination: {
      city: '',
      country: ''
    },
    dates: {
      startDate: '',
      endDate: ''
    },
    tripType: 'leisure'
  });
  
  const [enhancedData, setEnhancedData] = useState({
    weather: null,
    aiSuggestions: null
  });
  
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState({
    weather: false,
    ai: false
  });
  const [errors, setErrors] = useState({});

  const tripTypes = [
    { value: 'leisure', label: 'Leisure' },
    { value: 'business', label: 'Business' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'family', label: 'Family' },
    { value: 'solo', label: 'Solo Travel' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        destination: {
          city: initialData.destination?.city || '',
          country: initialData.destination?.country || ''
        },
        dates: {
          startDate: initialData.dates?.startDate ? new Date(initialData.dates.startDate).toISOString().split('T')[0] : '',
          endDate: initialData.dates?.endDate ? new Date(initialData.dates.endDate).toISOString().split('T')[0] : ''
        },
        tripType: initialData.tripType || 'leisure'
      });
      setEnhancedData({
        weather: initialData.weather?.forecast || null,
        aiSuggestions: initialData.aiSuggestions || null
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      destination: {
        city: '',
        country: ''
      },
      dates: {
        startDate: '',
        endDate: ''
      },
      tripType: 'leisure'
    });
    setEnhancedData({
      weather: null,
      aiSuggestions: null
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.destination.city.trim()) {
      newErrors['destination.city'] = 'City is required';
    }
    
    if (!formData.destination.country.trim()) {
      newErrors['destination.country'] = 'Country is required';
    }
    
    if (!formData.dates.startDate) {
      newErrors['dates.startDate'] = 'Start date is required';
    }
    
    if (!formData.dates.endDate) {
      newErrors['dates.endDate'] = 'End date is required';
    }
    
    if (formData.dates.startDate && formData.dates.endDate && 
        new Date(formData.dates.startDate) > new Date(formData.dates.endDate)) {
      newErrors['dates.endDate'] = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const enhanceTrip = async () => {
    const { city, country } = formData.destination;
    const { startDate, endDate } = formData.dates;
    const { tripType } = formData;

    // Get weather data
    setEnhancing(prev => ({ ...prev, weather: true }));
    try {
      const weatherData = await onGetWeather(`${city}, ${country}`);
      setEnhancedData(prev => ({ ...prev, weather: weatherData }));
    } catch (error) {
      console.error('Weather fetch failed:', error);
    } finally {
      setEnhancing(prev => ({ ...prev, weather: false }));
    }

    // Get AI suggestions
    setEnhancing(prev => ({ ...prev, ai: true }));
    try {
      const aiPrompt = `Generate comprehensive travel suggestions for a ${tripType} trip to ${city}, ${country} from ${startDate} to ${endDate}. Include packing recommendations, travel tips, and local attractions.`;
      const aiData = await onGenerateAISuggestions(aiPrompt);
      setEnhancedData(prev => ({ ...prev, aiSuggestions: aiData }));
    } catch (error) {
      console.error('AI suggestions failed:', error);
    } finally {
      setEnhancing(prev => ({ ...prev, ai: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First enhance the trip data
      await enhanceTrip();
      
      // Calculate duration
      const startDate = new Date(formData.dates.startDate);
      const endDate = new Date(formData.dates.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Prepare final data
      const submitData = {
        ...formData,
        dates: {
          ...formData.dates,
          duration
        },
        weather: enhancedData.weather ? { forecast: enhancedData.weather } : undefined,
        aiSuggestions: enhancedData.aiSuggestions,
        isPublic: false // Default to private
      };
      
      await onSubmit(submitData);
      onClose();
      resetForm();
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Failed to create trip' }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEnhancing = enhancing.weather || enhancing.ai;
  const hasEnhancements = enhancedData.weather || enhancedData.aiSuggestions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Trip' : 'Create New Trip'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="destination.city"
                  value={formData.destination.city}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                    errors['destination.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Delhi"
                />
                {errors['destination.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['destination.city']}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                name="destination.country"
                value={formData.destination.country}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                  errors['destination.country'] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., India"
              />
              {errors['destination.country'] && (
                <p className="text-red-500 text-sm mt-1">{errors['destination.country']}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dates.startDate"
                  value={formData.dates.startDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                    errors['dates.startDate'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['dates.startDate'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['dates.startDate']}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dates.endDate"
                  value={formData.dates.endDate}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 ${
                    errors['dates.endDate'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors['dates.endDate'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['dates.endDate']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trip Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Type *
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                name="tripType"
                value={formData.tripType}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              >
                {tripTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhancement Status */}
          {loading && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-blue-800 font-medium">Enhancing your trip...</p>
                  <div className="text-sm text-blue-600 mt-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      {enhancing.weather ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : enhancedData.weather ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full" />
                      )}
                      <span>Getting weather forecast</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {enhancing.ai ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : enhancedData.aiSuggestions ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-300 rounded-full" />
                      )}
                      <span>Generating AI recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Data Preview */}
          {hasEnhancements && !loading && (
            <div className="space-y-4">
              {enhancedData.weather && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Weather Forecast Added
                  </h4>
                  <p className="text-sm text-blue-700">
                    {enhancedData.weather.length} day forecast ready for your trip
                  </p>
                </div>
              )}
              
              {enhancedData.aiSuggestions && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    AI Recommendations Added
                  </h4>
                  <p className="text-sm text-purple-700">
                    Personalized suggestions for packing, attractions, and travel tips
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating Trip...</span>
                </>
              ) : (
                <span>{initialData ? 'Update Trip' : 'Create Trip'}</span>
              )}
            </button>
          </div>
          
          {errors.submit && (
            <p className="text-red-500 text-sm text-center">{errors.submit}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripForm;