import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewOrder = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState({
    order_number: '',
    recipe_id: '',
    batch_size: '',
    scheduled_date: '',
    status: '',
    created_by: ''
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/production_orders/${order_id}`)
      .then((response) => {
        setOrder(response.data);
      })
      .catch((error) => console.error('Error fetching order:', error));
  }, [order_id]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">View Order</h1>
      <div className="space-y-4">

        <input
          type="text"
          name="order_number"
          value={order.order_number}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="number"
          name="recipe_id"
          value={order.recipe_id}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="number"
          name="batch_size"
          value={order.batch_size}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <input
          type="date"
          name="scheduled_date"
          value={order.scheduled_date}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <select
          name="status"
          value={order.status}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        >
          <option value="">Select Status</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="number"
          name="created_by"
          value={order.created_by}
          disabled
          className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
        />

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </button>
      </div>
    </div>
  );
};

export default ViewOrder;
