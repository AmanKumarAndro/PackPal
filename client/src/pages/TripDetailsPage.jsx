
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TripDetailsView from '../components/Trips/TripDetails';

const TripDetailsPage = () => {
    const { id } = useParams();
    console.log(id);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/trips');
  };

  const handleEdit = (trip) => {
    navigate(`/trips/${trip._id}/edit`);
  };

  return (
    <TripDetailsView 
      tripId={id}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
};

export default TripDetailsPage;