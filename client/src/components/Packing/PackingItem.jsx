// src/components/Packing/PackingItem.jsx
import React, { useState } from 'react';
import { Check, Edit, Trash2, Save, X } from 'lucide-react';

const PackingItem = ({ item, onToggle, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editPriority, setEditPriority] = useState(item.priority);

  const handleSave = () => {
    onUpdate({
      name: editName,
      quantity: parseInt(editQuantity) || 1,
      priority: editPriority
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditPriority(item.priority);
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'essential': return 'text-red-600 bg-red-50';
      case 'important': return 'text-yellow-600 bg-yellow-50';
      case 'optional': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'essential': return '🔴';
      case 'important': return '🟡';
      case 'optional': return '🟢';
      default: return '⚪';
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Item name"
        />
        <input
          type="number"
          value={editQuantity}
          onChange={(e) => setEditQuantity(e.target.value)}
          min="1"
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={editPriority}
          onChange={(e) => setEditPriority(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="essential">Essential</option>
          <option value="important">Important</option>
          <option value="optional">Optional</option>
        </select>
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          title="Save"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
      item.isPacked ? 'bg-green-50 opacity-75' : 'bg-gray-50 hover:bg-gray-100'
    }`}>
      <button
        onClick={() => onToggle()}
        className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
          item.isPacked
            ? 'bg-green-600 border-green-600 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {item.isPacked && <Check className="w-3 h-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${item.isPacked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {item.name}
          </span>
          {item.quantity > 1 && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              x{item.quantity}
            </span>
          )}
          {item.aiSuggested && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              AI
            </span>
          )}
        </div>
      </div>

      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
        {getPriorityIcon(item.priority)} {item.priority}
      </span>

      <div className="flex space-x-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit item"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete()}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PackingItem;