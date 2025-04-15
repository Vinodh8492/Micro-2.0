import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


const Recipes = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    status: "draft",
    created_by: 1,
    created_at : "",
    materials: [],
    no_of_materials: "",
  });

  const [recipes, setRecipes] = useState([]);
  const [barcodeImage, setBarcodeImage] = useState(null);
  const [materials, setMaterials] = useState([]);
  
const MySwal = withReactContent(Swal);
  const [selectedMaterial, setSelectedMaterial] = useState({
    material_id: "",
    quantity: "",
    sequence_number: "",
  });
  const [openDialog, setOpenDialog] = useState(false);


  

  // Fetch recipes from API
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipes");
        setRecipes(response.data);

      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);

  // Handle Recipe Selection
  const handleRecipeChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch materials from API
  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/materials")
      .then((response) => setMaterials(response.data))
      .catch((error) => console.error("Error fetching materials:", error));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle material selection change
  const handleMaterialChange = (e) => {
    // Find the highest recipe_id in the recipes list
    const highestRecipeId = Math.max(...recipes.map((recipe) => recipe.recipe_id), 0);
  
    // Calculate next sequence number by incrementing the highestRecipeId
    const nextSequenceNumber = highestRecipeId + 1;
  
    setSelectedMaterial({
      ...selectedMaterial,
      [e.target.name]: e.target.value,
      sequence_number: nextSequenceNumber, // Automatically assign next sequence number
    });
  };
  

  // Add material to the recipe
  const addMaterial = async () => {
    if (!selectedMaterial.material_id || !selectedMaterial.quantity) {
      alert("Please select a material and enter quantity.");
      return;
    }

    const materialData = {
      recipe_id: formData.recipe_id,
      material_id: selectedMaterial.material_id,
      quantity: selectedMaterial.quantity,
      sequence_number: selectedMaterial.sequence_number || 0,
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/recipe_materials",
        materialData
      );
      console.log("Material added:", response.data);
      alert("Material added successfully!");

      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, materialData],
      }));

      setSelectedMaterial({
        material_id: "",
        quantity: "",
        sequence_number: "", // Reset the sequence number
      });
    } catch (error) {
      console.error("Error adding material:", error);
      alert("Failed to add material.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Basic validation
    if (!formData.name || !formData.code || !formData.barcode_id) {
      alert("Please fill in all required fields (Name, Code, Barcode ID).");
      return;
    }

    const no_of_materials = formData.no_of_materials ? parseInt(formData.no_of_materials, 10) : 0;
  if (isNaN(no_of_materials) || no_of_materials < 0) {
    alert("Please enter a valid number for the number of materials.");
    return;
  }
  
    const recipeData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description: formData.description.trim(),
      version: formData.version.trim(),
      status: formData.status || "Unreleased", // default fallback
      created_by: formData.created_by || 1,
      barcode_id: formData.barcode_id.trim(),
      no_of_materials,
    };
  
    console.log("Submitting Recipe:", recipeData);
  

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/recipes",
        recipeData
      );
  
   
    // ✨ Stylish Popup
    MySwal.fire({
      title: `<span style="color: #4caf50;"> Formula Created Successfully!</span>`,
      html: `
        <div style="font-size: 16px; text-align: left;">
          <p><strong> Name:</strong> ${recipeData.name}</p>
          <p><strong>Code:</strong> ${recipeData.code}</p>
          <p><strong> Barcode ID:</strong> ${recipeData.barcode_id}</p>
        </div>
      `,
      background: "#f0fff0",
      icon: "success",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
      confirmButtonColor: "#4caf50",
      confirmButtonText: "Awesome!",
    });
  
      // Fetch updated recipes
      const recipesResponse = await axios.get("http://127.0.0.1:5000/api/recipes");
      setRecipes(recipesResponse.data);
  
      // Reset form
      setFormData({
        name: "",
        code: "",
        description: "",
        version: "",
        status: "Unreleased",
        created_by: 1,
        barcode_id: "",
        materials: [],
        no_of_materials: "",
      });
  
      setSelectedMaterial({
        material_id: "",
        quantity: "",
        sequence_number: "",
      });
  
      // Close Dialog if open
      handleCloseDialog && handleCloseDialog();
  
    } catch (error) {
      console.error("❌ Error creating recipe:", error.response?.data || error.message);
      alert(
        `Failed to create recipe. ${
          error.response?.data?.error || "Please check input values."
        }`
      );
    }
  };
  
  const handleDelete = async (recipe_id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/recipes/${recipe_id}`);
        setRecipes(recipes.filter((recipe) => recipe.recipe_id !== recipe_id));
        alert("Recipe deleted successfully!");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe.");
      }
    }
  };

  const generateBarcodeId = () => {
    const newBarcode = `RC-${Date.now()}`;
    setFormData({
      ...formData,
      barcode_id: newBarcode,
    });

    const generatedImage = `https://barcode.tec-it.com/barcode.ashx?data=${newBarcode}&code=Code128&translate-esc=true`;
    setBarcodeImage(generatedImage);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  console.log("recipes:", recipes)

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form data when closing
    setFormData({
      name: "",
      code: "",
      description: "",
      version: "",
      status: "draft",
      created_by: 1,
      materials: [],
    });
    setBarcodeImage(null);
  };

  const moveRowUp = (index) => {
    if (index <= 0) return;
    const newRecipes = [...recipes];
    [newRecipes[index - 1], newRecipes[index]] = [newRecipes[index], newRecipes[index - 1]];
    setRecipes(newRecipes);
  };
  
  const moveRowDown = (index) => {
    if (index >= recipes.length - 1) return;
    const newRecipes = [...recipes];
    [newRecipes[index], newRecipes[index + 1]] = [newRecipes[index + 1], newRecipes[index]];
    setRecipes(newRecipes);
  };

  return (
    <Container maxWidth="x2" sx={{ py: 4,height:"100vh" }} component={Paper}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
  Formulas
</Typography>
<Button
  variant="contained"
  color="primary"
  onClick={handleOpenDialog}
  startIcon={<AddCircleOutlineIcon />} // Add the icon before the text
>
  Add Formula
</Button>

      </Box>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table
          sx={{
            border: "1px solid",
            borderColor: "#000",
            borderCollapse: "collapse",
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.100" }}>
              {[
                "ID",
                "Name",
                "Description",
                "Created By",
                "Created Date",
                "Status",
                "Actions",
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    fontWeight: 600,
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
          {recipes.map((recipe, index) => (
  <TableRow key={recipe.recipe_id}>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.recipe_id}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  <Typography
                    color="primary"
                    sx={{ cursor: "pointer", fontWeight: "medium" }}
                  >
                    {recipe.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.description}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.created_by}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  {recipe.created_at}
                </TableCell>
                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
  <Chip
    label={recipe.status}
    color={recipe.status === "Active" ? "success" : "error"}
    size="medium"
    sx={{
      backgroundColor: recipe.status === "released" ? "lightgreen" : "lightyellow", // Set background color conditionally
      color: recipe.status === "released" ? "green" : "black", // Optionally adjust the text color if needed
    }}
  />
</TableCell>

                <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                  

                  <Tooltip title="View" arrow>
                    <IconButton
                      sx={{
                        backgroundColor: "deepskyblue",
                        color: "white",
                        mr: 1,
                      }}
                      size="medium"
                      onClick={() => navigate(`/recipes/${recipe.recipe_id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit" arrow>
                    <IconButton
                      sx={{
                        backgroundColor: "dodgerblue",
                        color: "white",
                        mr: 1,
                      }}
                      size="medium"
                      onClick={() =>
                        navigate(`/recipes/edit/${recipe.recipe_id}`)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete" arrow>
                    <IconButton
                      sx={{ backgroundColor: "red", color: "white" }}
                      size="medium"
                      onClick={() => handleDelete(recipe.recipe_id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Move Up" arrow>
                    <span>
  <IconButton
    onClick={() => moveRowUp(index)}
    disabled={index === 0}
    size="small"
    sx={{ color: "gray" }}
  >
    <ArrowUpwardIcon />
  </IconButton>
  </span>
</Tooltip>

<Tooltip title="Move Down" arrow>
  <span>
  <IconButton
    onClick={() => moveRowDown(index)}
    disabled={index === recipes.length - 1}
    size="small"
    sx={{ color: "gray" }}
  >
    <ArrowDownwardIcon />
  </IconButton>
  </span>
</Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Recipe Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Create New Formula</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {/* Recipe Name */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Formula Name *
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Recipe Code */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Formula Code *
                </Typography>
                <TextField
                  fullWidth
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {/* Version */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Version *
                </Typography>
                <TextField
                  fullWidth
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  required
                />
              </Grid>
              {/* Status */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <FormControl sx={{ minWidth: "250px" }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="Unreleased">Unreleased</MenuItem>
                    <MenuItem value="Released">Released</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  sx={{ minWidth: "450px" }}
                />
              </Grid>

              {/* Barcode Section */}

              {/* Barcode ID + Generate */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Barcode Information
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Barcode ID *
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    value={formData.barcode_id || ""}
                    InputProps={{ readOnly: true }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={generateBarcodeId}
                  >
                    Generate
                  </Button>
                </Box>
              </Grid>

              {/* Barcode Image Preview */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Barcode Preview
                </Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    p: 2,
                    height: 100,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {barcodeImage ? (
                    <Avatar
                      variant="square"
                      src={barcodeImage}
                      sx={{ width: "100%", height: "100%", minWidth: "340px" }}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      No barcode generated
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Number of Materials
                </Typography>
                <TextField
                  fullWidth
                  name="no_of_materials"
                  type="number"
                  value={formData.no_of_materials}
                  onChange={handleChange}
                  sx={{ minWidth: "450px" }}
                />
              </Grid>

              {/* Recipe Selection */}
              {/* <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Formula *
                </Typography>
                <FormControl sx={{ minWidth: "350px" }}>
                  <InputLabel>Recipe</InputLabel>
                  <Select
                    name="recipe_id"
                    value={formData.recipe_id || ""}
                    onChange={handleRecipeChange}
                    label="Recipe"
                  >
                    <MenuItem value="">Select a recipe</MenuItem>
                    {recipes.map((recipe) => (
                      <MenuItem key={recipe.recipe_id} value={recipe.recipe_id}>
                        {recipe.name || "Unnamed Recipe"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}

              {/* Material Selection */}
              {/* Material Selection - Full Row */}
              {/* <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Material *
                </Typography>
                <FormControl sx={{ minWidth: "350px" }}>
                  <InputLabel>Material</InputLabel>
                  <Select
                    name="material_id"
                    value={selectedMaterial.material_id}
                    onChange={handleMaterialChange}
                    label="Material"
                  >
                    <MenuItem value="">Select a material</MenuItem>
                    {materials.map((material) => (
                      <MenuItem
                        key={material.material_id}
                        value={material.material_id}
                      >
                        {material.title || "Unnamed Material"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}

              {/* Force New Line for Quantity + Sequence Number + Add Button */}
              {/* <Grid item xs={12} /> */}

              {/* Quantity */}
              {/* <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Quantity *
                </Typography>
                <TextField
                  fullWidth
                  name="quantity"
                  type="number"
                  value={selectedMaterial.quantity}
                  onChange={handleMaterialChange}
                  sx={{ minWidth: "350px" }}
                />
              </Grid> */}

              {/* Sequence Number */}
              {/* <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" gutterBottom>
  Sequence Number *
</Typography>
<TextField
  fullWidth
  name="sequence_number"
  type="number"
  value={selectedMaterial.sequence_number || 0} // Display sequence number, default to 0 if not set
  onChange={handleMaterialChange} // You may not need this, as the sequence number will be auto-calculated
  sx={{ minWidth: "350px" }}
  InputProps={{
    readOnly: true, // Prevent user from changing the sequence number
  }}
/>

              </Grid> */}

              {/* Add Button */}
              {/* <Grid
                item
                xs={12}
                md={2}
                sx={{ display: "flex", alignItems: "flex-end" }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={addMaterial}
                  sx={{ minWidth: "150px" }}
                >
                  Add
                </Button>
              </Grid> */}

              {/* Selected Materials */}
              {/* {formData.materials.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Selected Materials
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {formData.materials.map((mat, index) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{ typography: "body2" }}
                      >
                        {`Material ID: ${mat.material_id}, Quantity: ${mat.quantity}, Sequence: ${mat.sequence_number}`}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )} */}
            </Grid>
          </Box>
        </DialogContent>


        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Create Formula
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Recipes;
