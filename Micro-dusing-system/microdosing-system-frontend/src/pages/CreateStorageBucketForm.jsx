import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode';  // Import the barcode component
import { useNavigate } from 'react-router-dom';

const CreateStorageBucketForm = () => {
  const [materialId, setMaterialId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [materialName, setMaterialName] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate()

  // Fetch all materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/materials');
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };
    fetchMaterials();
  }, []);

  // Fetch material details (name) when material_id changes
  useEffect(() => {
    if (materialId) {
      const fetchMaterialName = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:5000/api/materials/${materialId}`);
          setMaterialName(response.data.title); // Assuming your API returns a "title" property
        } catch (error) {
          console.error('Error fetching material name:', error);
        }
      };
      fetchMaterialName();
    }
  }, [materialId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/storage', {
        material_id: materialId,
        location_id: locationId,
      });
      setMessage('Storage bucket created successfully!');
      alert('Storage Bucket created Successfully')
      console.log(response.data);
      navigate(-1)
    } catch (error) {
      setMessage('Error creating storage bucket.');
      console.error('Error creating storage bucket:', error.response?.data || error.message);
      alert(error.response?.data.error)
      navigate('/storage')
    }
  };

  console.log("materials :", materials)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Storage Bucket</h1>
  
      <div className="space-y-4">
  
        <form onSubmit={handleSubmit} className="space-y-4">
  
          <div>
            <label htmlFor="materialId" className="font-bold">Material</label>
            <select
              id="materialId"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select Material</option>
              {materials.map((material) => (
                <option key={material.material_id} value={material.material_id}>
                  {material.title}
                </option>
              ))}
            </select>
          </div>
  
          {materialName && (
            <div>
              <label className="font-bold">Material Name</label>
              <p>{materialName}</p>
            </div>
          )}
  
          <div>
            <label htmlFor="locationId" className="font-bold">Location ID</label>
            <select
            id="locationId"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Location</option>
            {materials.map((location) => (
              <option  value={location.plant_area_location}>
                {location.plant_area_location}
              </option>
            ))}
          </select>
          </div>
  
          {materialId && (
            <div>
              <label className="font-bold">Generated Barcode</label>
              <Barcode 
                value={`STR${materialId}`}  // Prefix 'STR' to materialId
                className="my-4" 
              />
            </div>
          )}
  
          <button 
            type="submit" 
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Storage Bucket
          </button>
        </form>
  
        {message && <p>{message}</p>}
      </div>
    </div>
  );
  
};

export default CreateStorageBucketForm;
