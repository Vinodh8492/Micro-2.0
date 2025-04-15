import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Batches = () => {
  const [filters, setFilters] = useState({ status: '', startDate: '' });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch batches from the API
    axios
      .get('http://localhost:5000/api/batches')  // Adjust the URL as needed
      .then(response => {
        setBatches(response.data);  // Assuming the API returns an array of batches
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching batches:', error);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', startDate: '' });
  };

  const filteredBatches = batches.filter(b => {
    const matchesStatus = filters.status === '' || b.status.toLowerCase() === filters.status.toLowerCase();
    
    // Check if batch's created_at includes the selected start date
    const matchesDate = !filters.startDate || b.created_at.includes(filters.startDate);
    
    return matchesStatus && matchesDate;
  });

  const statusStyle = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 py-10">
      <h1 className="text-2xl text-black font-bold p-3">Reports</h1>
      <div className="mb-6 bg-gray-100 p-6 rounded-lg flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex items-end">
          <button onClick={clearFilters} className="border px-4 py-2 rounded bg-gray-300">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Show loading state */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm font-semibold">
              <tr>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Order Number</th>
                <th className="p-3">Status</th>
                <th className="p-3">Start Time</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredBatches.map(batch => (
                <tr key={batch.batch_id} className="border-t">
                  <td className="p-3">{batch.batch_id}</td>
                  <td className="p-3">{batch.order_id}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[batch.status]}`}
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-3">{batch.start_time || batch.created_at}</td>
                  <td className="p-3">{batch.operator_id}</td>
                  <td className="p-3 space-x-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Batches;
