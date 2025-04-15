import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const EditMaterial = () => {
  const { material_id } = useParams();
  const navigate = useNavigate();

  const [material, setMaterial] = useState({
    title: '',
    description: '',
    unit_of_measure: '',
    plant_area_location: ''
  });

  useEffect(() => {
    axios.get(`http://127.0.0.1:5000/api/materials/${material_id}`)
      .then((response) => {
        setMaterial(response.data);
      })
      .catch((error) => console.error('Error fetching material:', error));
  }, [material_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/api/materials/${material_id}`, material);
      Swal.fire('Updated!', 'Material updated successfully.', 'success');
      navigate(-1);
    } catch (error) {
      Swal.fire('Error!', 'Failed to update material.', 'error');
    }
  };

  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-50">
      <Paper elevation={3} className="p-6 w-full max-w-md">
        <Typography variant="h5" className="mb-4 font-semibold text-gray-700">
          Edit Material
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            value={material.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Description"
            name="description"
            value={material.description}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Unit of Measure"
            name="unit_of_measure"
            value={material.unit_of_measure}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Plant Area Location"
            name="plant_area_location"
            value={material.plant_area_location}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="mt-4"
            fullWidth
          >
            Update Material
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EditMaterial;
