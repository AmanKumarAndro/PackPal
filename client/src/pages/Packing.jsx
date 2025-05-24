// src/pages/Packing.jsx
import React from 'react';
import PackingList from '../components/Packing/PackingList';

const Packing = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <PackingList />
      </div>
    </div>
  );
};

export default Packing;