import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Tooltip, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Bucket_Batches = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const barcodeRefs = useRef({});
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);

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

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/storage");
        const bucketData = response.data;

        const enrichedBuckets = await Promise.all(
          bucketData.map(async (bucket) => {
            try {
              const matRes = await axios.get(
                `http://127.0.0.1:5000/api/materials/${bucket.material_id}`
              );
              return { ...bucket, material: matRes.data };
            } catch (err) {
              console.error(`Failed to fetch material ${bucket.material_id}`, err);
              return { ...bucket, material: null };
            }
          })
        );

        setBuckets(enrichedBuckets);
      } catch (error) {
        console.error("Error fetching buckets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  console.log("bucktes :", buckets)
  console.log("materails :", materials)

  useEffect(() => {
    buckets.forEach((bucket) => {
      const el = barcodeRefs.current[bucket.barcode];
      if (bucket.barcode && el) {
        JsBarcode(el, bucket.barcode, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true,
          lineColor: "black",
          background: "transparent",
        });
      }
    });
  }, [buckets]);

  const handleDelete = async (bucket_id) => {
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
          await axios.delete(`http://127.0.0.1:5000/api/storage/delete/${bucket_id}`);
          setBuckets(buckets.filter((b) => b.bucket_id !== bucket_id));
          Swal.fire("Deleted!", "The storage bucket has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the storage bucket.", "error");
        }
      }
    });
  };

  const handleEdit = async (bucket) => {
    // Get unique location IDs from materials list
    const uniqueLocationIds = [...new Set(materials.map(b => b.plant_area_location))];
  
    // Generate dropdown options for location_id
    const locationOptions = uniqueLocationIds.map((id) => {
      const selected = String(id) === String(bucket.location_id) ? 'selected' : '';
      return `<option value="${id}" ${selected}>${id}</option>`;
    }).join('');
  
    // Create a container for the modal content
    const container = document.createElement('div');
  
    // Create form elements
    const form = document.createElement('div');
    form.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 15px; padding: 20px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column;">
          <label for="swal-location" style="font-weight: bold; margin-bottom: 5px;">Location ID</label>
          <select id="swal-location" class="swal2-input" style=" background-color : white; padding: 10px; font-size: 14px; border-radius: 5px; border: 1px solid #ccc;">
            <option value="">Select Location</option>
            ${locationOptions}
          </select>
        </div>
        <div style="display: flex; flex-direction: column;">
          <label for="swal-barcode" style="font-weight: bold; margin-bottom: 5px;">Barcode</label>
          <input id="swal-barcode" class="swal2-input" value="${bucket.barcode || ""}" readonly style="padding: 10px; font-size: 14px; border-radius: 5px; border: 1px solid #ccc;">
          <button id="generate-barcode" style="margin-top: 10px; padding: 10px; font-size: 14px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Generate Barcode</button>
          <canvas id="barcode-canvas" style="margin-top: 10px;"></canvas>
        </div>
      </div>
    `;
    container.appendChild(form);
  
    const { value: formValues } = await Swal.fire({
      title: "Edit Bucket",
      html: container,
      focusConfirm: false,
      preConfirm: () => {
        const location = document.getElementById("swal-location").value;
        const barcode = document.getElementById("swal-barcode").value;
        if (!location || !barcode) {
          Swal.showValidationMessage("Both fields are required.");
          return null;
        }
        return { location, barcode };
      },
      didOpen: () => {
        // Add event listener for the generate barcode button
        document.getElementById('generate-barcode').addEventListener('click', () => {
          const newBarcode = generateBarcode();
          const canvas = document.getElementById('barcode-canvas');
          JsBarcode(canvas, newBarcode, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 12,
            background: "#2D3748",
            lineColor: "#FFFFFF",
            margin: 10,
            font: "monospace",
          });
          document.getElementById('swal-barcode').value = newBarcode;
        });
      }
    });
  
    if (formValues) {
      try {
        await axios.put(`http://127.0.0.1:5000/api/storage/update/${bucket.bucket_id}`, {
          location_id: formValues.location,
          barcode: formValues.barcode,
        });
  
        // Update state locally
        setBuckets((prev) =>
          prev.map((b) =>
            b.bucket_id === bucket.bucket_id
              ? { ...b, location_id: formValues.location, barcode: formValues.barcode }
              : b
          )
        );
  
        Swal.fire("Updated!", "Bucket details have been updated.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to update the bucket.", "error");
      }
    }
  };
  
  // Function to generate a random barcode
  function generateBarcode() {
    const prefix = '7'; // Barcode starts with 7
    const firstPart = Math.floor(100000 + Math.random() * 900000);
    const secondPart = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}${firstPart}${secondPart}`;
  }
  
  

  
  const handleView = async (barcode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/storage/${barcode}`);
      const data = response.data;

      console.log("data :", response)

      const materialId = data.material_id;

    // Initialize materialTitle with a default value
    let materialTitle = "-";
    let updatedAt = "-"

    // If materialId exists, make a second API call to get material details
    if (materialId) {
      try {
        const materialResponse = await axios.get(`http://127.0.0.1:5000/api/materials/${materialId}`);
        materialTitle = materialResponse.data.title || "-";
        updatedAt = materialResponse.data.updated_at || "-"
      } catch (materialError) {
        console.error("Error fetching material data:", materialError);
        // Optionally, you can display an error message to the user here
      }
    }



      Swal.fire({
        title: `<strong>Bucket Details</strong>`,
        html: `
          <div style="text-align: left;">
            <p><strong>Bucket ID:</strong> ${data.bucket_id}</p>
            <p><strong>Material ID:</strong> ${data.material_id}</p>
            <p><strong>Material Name:</strong> ${materialTitle|| "-"}</p>
            <p><strong>Location ID:</strong> ${data.location_id || "-"}</p>
            <p><strong>Barcode:</strong> ${data.barcode}</p>
            <p><strong>Created At:</strong> ${data.created_at || "-"}</p>
            <p><strong>Updated At:</strong> ${updatedAt || "-"}</p>
          </div>
        `,
        confirmButtonText: 'Close',
        width: 500
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || "Failed to fetch bucket data",
      });
    }
  };


  const groupedByLocation = buckets.reduce((acc, bucket) => {
    const location = bucket.location_id || "Unknown";
    if (!acc[location]) acc[location] = [];
    acc[location].push(bucket);
    return acc;
  }, {});

  if (loading) return <p>Loading...</p>;

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
                md: "1.5rem",
                lg: "2rem",
              },
            }}
          >
            Bucket Storage
          </Typography>
        </div>
        <div>
          <button
            onClick={() => navigate("/create-storage")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add Storage
          </button>
        </div>
      </div>

      {Object.entries(groupedByLocation).map(([location, bucketList]) => (
        <div key={location} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">{location}</h2>
          </div>

          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200 text-center">
              <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
                <tr>
                  <th className="p-3 border-b">Bucket ID</th>
                  <th className="p-3 border-b">Material ID</th>
                  <th className="p-3 border-b">Material Name</th>
                  <th className="p-3 border-b">Bucket Location</th>
                  <th className="p-3 border-b">Barcode</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {bucketList.map((bucket) => (
                  <tr key={bucket.bucket_id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{bucket.bucket_id}</td>
                    <td className="p-3">{bucket.material_id}</td>
                    <td className="p-3">{bucket.material?.title || "-"}</td>
                    <td className="p-3">{bucket.location_id || "-"}</td>
                    <td className="p-3">
                      <svg
                        className="h-10 w-auto mx-auto"
                        ref={(el) => (barcodeRefs.current[bucket.barcode] = el)}
                      ></svg>
                    </td>
                    <td className="p-3">
                    <Tooltip title="View">
                        <IconButton
                          onClick={() => handleView(bucket.barcode)}
                          sx={{
                            backgroundColor: "#6a1b9a",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#4a148c" },
                            mr: 1,
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEdit(bucket)}
                          sx={{
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#1565c0" },
                            mr: 1,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(bucket.bucket_id)}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#b71c1c" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bucket_Batches;
