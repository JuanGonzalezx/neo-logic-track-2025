import React from 'react';
import { DeliveryWorkerList } from './DeliveryWorkerList';
import './styles.css';

/**
 * Main component that serves as an entry point for the Delivery Workers management section
 */
const DeliveryList = () => {
  return (
    <div className="delivery-list-container">
      <DeliveryWorkerList />
    </div>
  );
};

export default DeliveryList;