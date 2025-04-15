import React, { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Select, InputLabel, FormControl
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JsBarcode from 'jsbarcode';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [barcodeImage, setBarcodeImage] = useState(null);

  const [formData, setFormData] = useState({
    order_number: `ORD-${Date.now()}`,
    recipe_id: '',
    batch_size: '',
    scheduled_date: '',
    status: 'planned',
    created_by: '1',
    notes: '',
    barcode_id: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchRecipes();
  }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem("access_token");
    
    
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };
  
  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        'http://127.0.0.1:5000/api/production_orders',
        getAuthConfig()
      );
      console.log("response :", res.data);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err.response?.data || err.message);
    }
  };
  
  const fetchRecipes = async () => {
    try {
      const res = await axios.get(
        'http://127.0.0.1:5000/api/recipes',
        getAuthConfig()
      );
      setRecipes(res.data);
    } catch (err) {
      console.error('Error fetching recipes:', err.response?.data || err.message);
    }
  };
  

  const openDialog = () => {
    setEditingOrder(null);
    setFormData({
      order_number: `ORD-${Date.now()}`,
      recipe_id: '',
      batch_size: '',
      scheduled_date: '',
      status: 'planned',
      created_by: '1',
      notes: '',
      barcode_id: ''
    });
    setDialogOpen(true);
    setBarcodeImage(null);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
  
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      };
  
      await axios.delete(`http://127.0.0.1:5000/api/production_orders/${orderId}`, config);
      await fetchOrders();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete order.');
    }
  };

  const handleSubmit = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      };
  
      if (editingOrder) {
        await axios.put(
          `http://127.0.0.1:5000/api/production_orders/${editingOrder.order_id}`,
          formData,
          config
        );
      } else {
        await axios.post(
          'http://127.0.0.1:5000/api/production_orders',
          formData,
          config
        );
      }
  
      await fetchOrders();
      closeDialog();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order.');
    }
  };
  

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      order_number: order.order_number,
      recipe_id: order.recipe_id,
      batch_size: order.batch_size,
      scheduled_date: order.scheduled_date,
      status: order.status,
      created_by: order.created_by,
      notes: order.notes,
      barcode_id: order.barcode_id || ''
    });
    setDialogOpen(true);
    generateBarcodePreview(order.barcode_id || '');
  };

 
  const generateBarcodePreview = (barcodeId) => {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, barcodeId, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true
      });
      setBarcodeImage(canvas.toDataURL());
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  console.log("oder :", orders)
  

  const generateBarcodeId = () => {
    const barcodeId = (Math.floor(Math.random() * 9000000000000) + 1000000000000).toString();
    setFormData((prev) => ({ ...prev, barcode_id: barcodeId }));
    generateBarcodePreview(barcodeId);
  };

  const statusStyle = {
    completed: { background: '#D1FAE5', color: '#065F46' },
    in_progress: { background: '#DBEAFE', color: '#1E3A8A' },
    planned: { background: '#F3F4F6', color: '#374151' },
    failed: { background: '#FECACA', color: '#991B1B' }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Production Orders</Typography>
        <Button variant="contained" onClick={openDialog}>Create Order</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Recipe</TableCell>
              <TableCell>Batch Size</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.order_id}>
                <TableCell>{order.order_number}</TableCell>
                <TableCell>
                  {recipes.find(r => r.recipe_id === order.recipe_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>{order.batch_size}</TableCell>
                <TableCell>{new Date(order.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.created_by}</TableCell>
                <TableCell>
                  <span style={{ ...statusStyle[order.status], padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                    {order.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => navigate(`/orders/${order.id}`)}>Start</Button>
                  <Button size="small" onClick={() => navigate(`/orders/${order.order_id}`)}>View</Button>
                  <Button size="small" color="warning" onClick={() => handleEdit(order)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(order.order_id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingOrder ? 'Edit Production Order' : 'Create Production Order'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns={{ md: '1fr 1fr' }} gap={2} mt={1}>
            <TextField
              label="Order Number"
              fullWidth
              value={formData.order_number}
              disabled
            />
            <FormControl fullWidth>
              <InputLabel>Recipe</InputLabel>
              <Select
                name="recipe_id"
                value={formData.recipe_id}
                label="Recipe"
                onChange={handleChange}
              >
                {recipes.map((recipe) => (
                  <MenuItem key={recipe.recipe_id} value={recipe.recipe_id}>
                    {recipe.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="batch_size"
              label="Batch Size"
              value={formData.batch_size}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="scheduled_date"
              label="Scheduled Date"
              type="date"
              value={formData.scheduled_date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Barcode ID"
              fullWidth
              value={formData.barcode_id}
              disabled
            />
            <Box display="flex" alignItems="center" gap={2}>
              <Button variant="outlined" onClick={generateBarcodeId}>
                Generate Barcode
              </Button>
              {barcodeImage && (
                <img src={barcodeImage} alt="barcode" style={{ height: 50 }} />
              )}
            </Box>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="notes"
              label="Notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
