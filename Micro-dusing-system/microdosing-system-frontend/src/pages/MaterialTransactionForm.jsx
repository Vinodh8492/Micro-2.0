import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper
} from "@mui/material";

const MaterialTransactionForm = () => {
  const [materials, setMaterials] = useState([]);
  const [transaction, setTransaction] = useState({
    material_id: "",
    transaction_type: "addition",
    quantity: "",
    description: "",
  });

  const navigate = useNavigate();

  // Fetch materials for dropdown
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/materials")
      .then((response) => setMaterials(response.data))
      .catch((error) => console.error("Error fetching materials:", error));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddQuantity = async (material_id) => {
    try {
      const addAmount = parseFloat(transaction.quantity);
      const updatedMaterials = materials.map((material) => {
        if (material.material_id === material_id) {
          const quantityNum = parseFloat(material.current_quantity);
          const maxQuantity = parseFloat(material.maximum_quantity);
  
          if (quantityNum + addAmount > maxQuantity) {
            alert('Cannot exceed maximum quantity.');
            return material; // Don't change this material
          }
  
          const newQuantity = parseFloat((quantityNum + addAmount).toFixed(2));
          return { ...material, current_quantity: newQuantity };
        }
        return material;
      });
  
      // If nothing was updated, skip the PUT request
      const changedMaterial = updatedMaterials.find(mat => mat.material_id === material_id);
      const originalMaterial = materials.find(mat => mat.material_id === material_id);
      if (changedMaterial.current_quantity === originalMaterial.current_quantity) return;
  
      setMaterials(updatedMaterials);
  
      await axios.put(`http://127.0.0.1:5000/api/materials/${material_id}`, {
        current_quantity: changedMaterial.current_quantity,
      });
      alert("Quantity added successfully!");
    } catch (error) {
      console.error('Error adding quantity:', error);
      alert('Failed to add quantity.');
    }
  };
  
  
  
  const handleSubtractQuantity = async (material_id) => {
    try {
      const subtractAmount = parseFloat(transaction.quantity);
      const updatedMaterials = materials.map((material) => {
        if (material.material_id === material_id) {
          const quantityNum = parseFloat(material.current_quantity);
          const minQuantity = parseFloat(material.minimum_quantity);
  
          if (quantityNum - subtractAmount < minQuantity) {
            alert('Cannot go below minimum quantity.');
            return material; // Don't change this material
          }
  
          const newQuantity = parseFloat((quantityNum - subtractAmount).toFixed(2));
          return { ...material, current_quantity: newQuantity };
        }
        return material;
      });
  
      // If nothing was updated, skip the PUT request
      const changedMaterial = updatedMaterials.find(mat => mat.material_id === material_id);
      const originalMaterial = materials.find(mat => mat.material_id === material_id);
      if (changedMaterial.current_quantity === originalMaterial.current_quantity) return;
  
      setMaterials(updatedMaterials);
  
      await axios.put(`http://127.0.0.1:5000/api/materials/${material_id}`, {
        current_quantity: changedMaterial.current_quantity,
      });
      alert("Quantity removed successfully!");
    } catch (error) {
      console.error('Error subtracting quantity:', error);
      alert('Failed to subtract quantity.');
    }
  };
  
  
  

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { material_id, transaction_type } = transaction;
  
      // Perform quantity adjustment based on transaction type
      if (transaction_type === "addition") {
        await handleAddQuantity(material_id);
      } else if (transaction_type === "removal") {
        await handleSubtractQuantity(material_id);
      }
  
      // Save the transaction record
      await axios.post("http://127.0.0.1:5000/api/material-transactions", transaction);
     
      navigate("/material");
    } catch (error) {
      console.error("Error handling transaction:", error);
    }
  };
  

  return (
    <Box className="flex justify-center items-center min-h-screen bg-gray-50">
      <Paper elevation={3} className="p-6 w-full max-w-lg">
        <Typography variant="h5" gutterBottom className="font-semibold text-gray-700">
          Add Material Transaction
        </Typography>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="material-label">Material</InputLabel>
            <Select
              labelId="material-label"
              name="material_id"
              value={transaction.material_id}
              onChange={handleChange}
            >
              <MenuItem value=""><em>Select a material</em></MenuItem>
              {materials.map((mat) => (
                <MenuItem key={mat.material_id} value={mat.material_id}>
                  {mat.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
            <Select
              labelId="transaction-type-label"
              name="transaction_type"
              value={transaction.transaction_type}
              onChange={handleChange}
            >
              <MenuItem value="addition">Addition</MenuItem>
              <MenuItem value="removal">Removal</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Quantity"
            type="number"
            name="quantity"
            value={transaction.quantity}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ step: "0.01" }}
          />

          <TextField
            label="Description"
            name="description"
            value={transaction.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
          >
            Add Transaction
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default MaterialTransactionForm;