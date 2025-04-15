import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JsBarcode from "jsbarcode";
import Swal from "sweetalert2";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";




// Material UI
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const MaterialDetails = () => {
  const barcodeRefs = useRef({});
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedBarcodeId, setSelectedBarcodeId] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
  
    const updatedMaterials = Array.from(materials);
    const [movedItem] = updatedMaterials.splice(result.source.index, 1);
    updatedMaterials.splice(result.destination.index, 0, movedItem);
  
    setMaterials(updatedMaterials); // make sure materials is state
  };

  const navigate = useNavigate();
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/materials");
        let fetchedMaterials = response.data || [];
  
        // Get saved order (material_id array) from localStorage
        const savedOrder = JSON.parse(localStorage.getItem("materialOrder"));
  
        if (savedOrder) {
          // Sort fetched materials according to saved order
          fetchedMaterials.sort((a, b) =>
            savedOrder.indexOf(a.material_id) - savedOrder.indexOf(b.material_id)
          );
        }
  
        setMaterials(fetchedMaterials);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMaterials();
  }, []);
  
  // Save order to localStorage
const saveOrderToLocalStorage = (materialsList) => {
  const materialIds = materialsList.map((mat) => mat.material_id);
  localStorage.setItem("materialOrder", JSON.stringify(materialIds));
};


  useEffect(() => {
    if (materials.length > 0) {
      materials.forEach((material) => {
        const barcodeElement = barcodeRefs.current[material.barcode_id];
        if (material?.barcode_id && barcodeElement) {
          JsBarcode(barcodeElement, material.barcode_id, {
            format: "CODE128",
            width: 2,
            height: 40,
            displayValue: true,
            lineColor: "black",
            background: "transparent",
          });
        }
      });
    }
  }, [materials]);

  const handleEdit = (material_id) => {
    navigate(`/material/${material_id}`);
  };

  const handleDelete = async (material_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:5000/api/materials/${material_id}`);
          setMaterials(materials.filter((m) => m.material_id !== material_id));
          Swal.fire("Deleted!", "The material has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Material cannot be deleted until its related Storage Buckets are deleted", "error");
        }
      }
    });
  };

  const handleBarcodeClick = (barcodeId) => {
    setSelectedBarcodeId(barcodeId);
    setBarcodeDialogOpen(true);
  };

  const handlePrint = (material_id) => {
    const barcodeData = materials.find((m) => m.material_id === material_id)?.barcode_id;
    console.log("barcode data:", barcodeData);
    if (!barcodeData) return;
  
    // Create a canvas element to draw barcode first
    const canvas = document.createElement("canvas");
  
    JsBarcode(canvas, barcodeData, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      lineColor: "black",
    });
  
    const barcodeImageUrl = canvas.toDataURL("image/png"); // Get image URL from canvas
  
    // Open new window and insert the barcode image
    const win = window.open("", "PrintWindow", "width=600,height=400");
  
    if (!win) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }
  
    win.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin-top: 50px;
            }
            img {
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <h3>Material Barcode</h3>
          <img src="${barcodeImageUrl}" alt="Barcode" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
  
    win.document.close();
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...materials];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setMaterials(newOrder);
    saveOrderToLocalStorage(newOrder);
  };
  
  const handleMoveDown = (index) => {
    if (index === materials.length - 1) return;
    const newOrder = [...materials];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setMaterials(newOrder);
    saveOrderToLocalStorage(newOrder);
  };
  
  

  console.log("materials :", materials)

  const handleNavigateToCreateForm = () => {
    navigate("/material/create");
  };

  

  if (loading)
    return <CircularProgress sx={{ margin: "2rem auto", display: "block" }} />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Material Details
      </Typography>

      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleNavigateToCreateForm}>
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          Add Material
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate("/material-transactions")}
        >
          Add Material Transaction
        </Button>
        <Button variant="contained" color="warning">
          Export CSV
        </Button>
      </Box>

      {/* Barcode Preview Dialog */}
      <Dialog open={barcodeDialogOpen} onClose={() => setBarcodeDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Barcode Preview
          <IconButton onClick={() => setBarcodeDialogOpen(false)} sx={{ color: "#000" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {selectedBarcodeId && (
            <svg
              ref={(el) => {
                if (el) {
                  JsBarcode(el, selectedBarcodeId, {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: true,
                    lineColor: "#000",
                    background: "transparent",
                  });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Materials Table */}
      <TableContainer component={Paper}>
      <Table sx={{ border: "1px solid #ccc" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow sx={{ "& > th": { border: "1px solid #ccc" } }}>
          <TableCell>Reorder</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Material</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Barcode</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody sx={{ "& > tr": { border: "1px solid #ccc" } }}>
          {materials.map((material, index) => (
            <TableRow key={material.material_id} sx={{ "& > td": { border: "1px solid #ccc" } }}>
               <TableCell>
                <IconButton onClick={() => handleMoveUp(index)} disabled={index === 0}>
                  <ArrowUpwardIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleMoveDown(index)}
                  disabled={index === materials.length - 1}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </TableCell>
              <TableCell>{material.material_id}</TableCell>
              <TableCell>{material.title}</TableCell>
              <TableCell>{material.description}</TableCell>
              <TableCell>{material.unit_of_measure}</TableCell>
              <TableCell>{material.plant_area_location}</TableCell>
              <TableCell>
                {material.barcode_id ? (
                  <svg
                    onClick={() => handleBarcodeClick(material.barcode_id)}
                    style={{ cursor: "pointer" }}
                    ref={(el) => (barcodeRefs.current[material.barcode_id] = el)}
                  />
                ) : (
                  "No Barcode"
                )}
              </TableCell>
             
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => handleEdit(material.material_id)}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#1565c0" },
                      mr: 1,
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => handleDelete(material.material_id)}
                    sx={{
                      backgroundColor: "#d32f2f",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#b71c1c" },
                      mr: 1,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton
                    onClick={() => handlePrint(material.material_id)}
                    sx={{
                      backgroundColor: "#6a1b9a",
                      color: "#fff",
                      "&:hover": { backgroundColor: "#4a148c" },
                    }}
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
};

export default MaterialDetails;
