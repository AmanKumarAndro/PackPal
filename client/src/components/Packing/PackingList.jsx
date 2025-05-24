import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Sparkles, 
  Trash2, 
  Package,
  CheckCircle,
  Circle,
  FolderPlus
} from 'lucide-react';
import PackingItem from './PackingItem';
import { packingAPI } from '../../services/api';

const PackingList = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [packingList, setPackingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newItems, setNewItems] = useState({});

  useEffect(() => {
    if (tripId) {
      fetchPackingList();
    }
  }, [tripId]);

  const fetchPackingList = async () => {
    try {
      setLoading(true);
      const response = await packingAPI.getPackingList(tripId);
      // Handle the nested response structure
      setPackingList(response.data.packingList || response.data);
    } catch (error) {
      console.error('Error fetching packing list:', error);
      // If no packing list exists, create one
      if (error.response?.status === 404) {
        try {
          const createResponse = await packingAPI.createPackingList(tripId);
          setPackingList(createResponse.data.packingList || createResponse.data);
        } catch (createError) {
          console.error('Error creating packing list:', createError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const generateAIPackingList = async () => {
    try {
      setLoadingAI(true);
      const response = await packingAPI.generateAIPackingList(tripId);
      setPackingList(response.data.packingList || response.data);
    } catch (error) {
      console.error('Error generating AI packing list:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const response = await packingAPI.addCategory(tripId, { name: newCategoryName });
      setPackingList(response.data.packingList || response.data);
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category and all its items?')) {
      return;
    }

    try {
      const response = await packingAPI.deleteCategory(tripId, categoryId);
      setPackingList(response.data.packingList || response.data);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addItem = async (categoryId, itemName) => {
    if (!itemName.trim()) return;

    try {
      const response = await packingAPI.addItem(tripId, categoryId, {
        name: itemName,
        quantity: 1,
        priority: 'important'
      });
      setPackingList(response.data.packingList || response.data);
      setNewItems(prev => ({ ...prev, [categoryId]: '' }));
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const toggleItemPacked = async (categoryId, itemId) => {
    try {
      const response = await packingAPI.toggleItemPacked(tripId, categoryId, itemId);
      setPackingList(response.data.packingList || response.data);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const updateItem = async (categoryId, itemId, itemData) => {
    try {
      const response = await packingAPI.updateItem(tripId, categoryId, itemId, itemData);
      setPackingList(response.data.packingList || response.data);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (categoryId, itemId) => {
    try {
      const response = await packingAPI.deleteItem(tripId, categoryId, itemId);
      setPackingList(response.data.packingList || response.data);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleNewItemKeyPress = (e, categoryId) => {
    if (e.key === 'Enter') {
      addItem(categoryId, newItems[categoryId] || '');
    }
  };

  const getCompletionStats = () => {
    if (!packingList?.categories) return { packed: 0, total: 0, percentage: 0 };
    
    let packed = 0;
    let total = 0;
    
    packingList.categories.forEach(category => {
      category.items.forEach(item => {
        total++;
        if (item.isPacked) packed++;
      });
    });

    return {
      packed,
      total,
      percentage: total > 0 ? Math.round((packed / total) * 100) : 0
    };
  };

  const getTripInfo = () => {
    if (!packingList?.trip) return null;
    const { destination, dates } = packingList.trip;
    return {
      destination: `${destination?.city}, ${destination?.country}`,
      duration: dates?.duration
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getCompletionStats();
  const tripInfo = getTripInfo();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/trips/${tripId}`)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Packing List
            </h1>
            <div className="text-gray-600 space-y-1">
              {tripInfo && (
                <p className="text-sm">
                  {tripInfo.destination} • {tripInfo.duration} days
                </p>
              )}
              <p>
                {stats.packed} of {stats.total} items packed ({stats.percentage}%)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={generateAIPackingList}
          disabled={loadingAI}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loadingAI ? 'Generating...' : 'AI Generate'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Packing Progress</span>
          <span className="text-sm text-gray-500">{stats.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{stats.packed} packed</span>
          <span>{stats.total - stats.packed} remaining</span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {packingList?.categories?.map(category => (
          <div key={category._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {category.name}
                <span className="ml-2 text-sm text-gray-500">
                  ({category.items.filter(item => item.isPacked).length}/{category.items.length})
                </span>
              </h2>
              <button
                onClick={() => deleteCategory(category._id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {category.items.map(item => (
                <PackingItem
                  key={item._id}
                  item={item}
                  onToggle={() => toggleItemPacked(category._id, item._id)}
                  onUpdate={(itemData) => updateItem(category._id, item._id, itemData)}
                  onDelete={() => deleteItem(category._id, item._id)}
                />
              ))}
            </div>

            {/* Add new item */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add new item..."
                value={newItems[category._id] || ''}
                onChange={(e) => setNewItems(prev => ({ ...prev, [category._id]: e.target.value }))}
                onKeyPress={(e) => handleNewItemKeyPress(e, category._id)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => addItem(category._id, newItems[category._id] || '')}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add new category */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {showAddCategory ? (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              <span>Add New Category</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackingList;