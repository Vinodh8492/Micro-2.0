import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const mockOrder = {
  order_id: 101,
  recipe_name: 'Formula A',
  materials: [
    {
      id: 1,
      title: 'Compound X-23',
      barcode: 'MAT-001-X23',
      setPoint: 10,
      unit: 'g',
      recipe: 'Formula A',
    },
    {
      id: 2,
      title: 'Buffer Y-15',
      barcode: 'MAT-002-Y15',
      setPoint: 5,
      unit: 'ml',
      recipe: 'Formula A',
    }
  ]
};


const ActiveOrders = () => {
  const [order, setOrder] = useState({
    order_id: 101,
    recipe_name: 'Formula A',
    materials: [],
  });

  const barcodeRefs = useRef({});
  const overlayBarcodeRef = useRef(null);


  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false); // To toggle scan mode

  const scannedCodeRef = useRef('');
  const [scannedDisplay, setScannedDisplay] = useState('');

  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [actualValue, setActualValue] = useState(null);
  const [barcodeMatched, setBarcodeMatched] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);




  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/materials');
        const rawMaterials = response.data || [];

        const transformedMaterials = rawMaterials.map((mat, idx) => ({
          id: mat.id || idx + 1,
          title: mat.title,
          barcode: mat.barcode_id,
          setPoint: mat.maximum_quantity,
          actual: mat.current_quantity,
          unit: mat.unit_of_measure,
          recipe: 'Formula A',
          dosed: false,
        }));

        setOrder(prev => ({
          ...prev,
          materials: transformedMaterials,
        }));
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };

    fetchMaterials();
  }, []);

  // Keep currentMaterial in sync with currentIndex
  useEffect(() => {
    if (order.materials.length > 0 && currentIndex < order.materials.length) {
      setCurrentMaterial(order.materials[currentIndex]);
    } else {
      setCurrentMaterial(null);
    }
  }, [order.materials, currentIndex]);

  useEffect(() => {
    Object.entries(barcodeRefs.current).forEach(([barcode, el]) => {
      if (el && window.JsBarcode) {
        window.JsBarcode(el, barcode, {
          format: "CODE128",
          displayValue: false,
          height: 30,
        });
      }
    });
  }, [order.materials]); // Or whatever dependency updates your materials

  useEffect(() => {
    if (scannedDisplay && overlayBarcodeRef.current && window.JsBarcode) {
      window.JsBarcode(overlayBarcodeRef.current, scannedDisplay, {
        format: "CODE128",
        displayValue: true,
        height: 60,
        fontSize: 16,
      });
    }
  }, [scannedDisplay]);
  
  
 

  useEffect(() => {
    if (!scanning || !currentMaterial) return;
  
    const expected = currentMaterial?.barcode?.trim();
    setScannedDisplay(expected); // Show overlay immediately
  
    console.log("Verifying barcode for:", currentMaterial.title);
    console.log("Expected (Material Barcode):", expected);
  
    const timeoutId = setTimeout(() => {
      if (!expected) {
        alert(`⚠️ No barcode present for ${currentMaterial.title}`);
        setBarcodeMatched(false);
        setScannedDisplay('');
        setScanning(false);
        return;
      }
  
      // ✅ REPLACE THIS WITH FORMAT VALIDATION
      const isValidFormat = /^[A-Za-z0-9\-_.]{5,30}$/.test(expected); // Customize pattern if needed
  
      if (isValidFormat) {
        alert(`✅ Barcode is valid for ${currentMaterial.title}`);
        setBarcodeMatched(true);
      } else {
        alert(`❌ Barcode format is invalid for ${currentMaterial.title}`);
        setBarcodeMatched(false);
      }
  
      setScannedDisplay('');
      setScanning(false);
    }, 5000);
  
    return () => clearTimeout(timeoutId);
  }, [scanning, currentMaterial]);
  
  
  
  

  const handleScan = () => {
    if (!currentMaterial) {
      alert('No material selected for scanning.');
      return;
    }
    scannedCodeRef.current = '';
    // Enable scanning mode
    setScanning(true);
    setScannedCode(""); // Reset before new scan
    alert(`Scan the barcode for ${currentMaterial.title}`);
  };
  

  const confirmDosing = () => {
    if (!currentMaterial || !currentMaterial.setPoint) {
      alert("Material or set point is missing.");
      return;
    }
  
    const tolerance = 0.5; // 10% tolerance
    const actualWeight = currentMaterial.actual;
    const minAcceptable = currentMaterial.setPoint * (1 - tolerance);
    const maxAcceptable = currentMaterial.setPoint * (1 + tolerance);

    console.log("actual :", actualWeight)
    console.log("min :", minAcceptable);
    console.log("max :", maxAcceptable)
  
    if (actualWeight < minAcceptable || actualWeight > maxAcceptable) {
      alert(`❌ Dosing out of tolerance!\nEntered: ${actualWeight} ${currentMaterial.unit}\nAcceptable Range: ${minAcceptable} - ${maxAcceptable} ${currentMaterial.unit}`);
      return;
    }
  
    // ✅ Dosing is within range
    setOrder(prev => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[currentIndex] = {
        ...updatedMaterials[currentIndex],
        actual: actualWeight,
        dosed: true,
      };
      return { ...prev, materials: updatedMaterials };
    });
  
    alert("✅ Dosing completed successfully!");
    advanceToNext();
  };
  

  const bypassMaterial = () => {
    setOrder(prev => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[currentIndex] = {
        ...updatedMaterials[currentIndex],
        dosed: true,
        bypassed: true,
      };
      return { ...prev, materials: updatedMaterials };
    });

    advanceToNext();
  };

  const advanceToNext = () => {
    setActualValue('');
    setBarcodeMatched(false);

    if (currentIndex + 1 < order.materials.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert('✅ All materials completed (dosed or bypassed). Order Complete.');
    }
  };



  console.log("order :", order)

  return (
    <div className="p-6 text-black bg-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Active Order: {order.recipe_name}</h2>

      {/* Scan Button */}
      <div className="mb-4 flex gap-4 items-center">
      <button
  onClick={handleScan}
  className="bg-indigo-600 text-white px-6 py-2 rounded shadow-md hover:bg-indigo-700 transition flex items-center gap-2"
>
<i className="fa-solid fa-qrcode"></i> Start Barcode Scan
</button>

        <span className="text-lg font-medium">
          {barcodeMatched ? '✅ Scanned Successfully' : 'Waiting for scan...'}
        </span>
      </div>

      {/* Materials Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border bg-gray-200">
          <thead className="bg-gray-300 text-sm">
            <tr>
              <th className="p-3 border">Material</th>
              <th className="p-3 border">Recipe</th>
              <th className="p-3 border">Barcode</th>
              <th className="p-3 border">Set Point</th>
              <th className="p-3 border">Actual</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {order.materials.map((mat, idx) => (
              <tr
                key={mat.id}
                className={
                  idx === currentIndex
                    ? 'bg-blue-50'
                    : mat.dosed
                    ? 'bg-green-100'
                    : 'bg-white'
                }
              >
                <td className="p-3 border font-semibold">{mat.title}</td>
                <td className="p-3 border">{mat.recipe}</td>
                <td className="p-3 border text-sm">
  <div className="flex flex-col items-start gap-1">
    <span>{mat.barcode}</span>
    {mat.barcode ? (
      <svg ref={(el) => (barcodeRefs.current[mat.barcode] = el)}></svg>
    ) : (
      <span className="text-xs text-gray-400">No Barcode</span>
    )}
  </div>
</td>

                <td className="p-3 border">{mat.setPoint} {mat.unit}</td>
                <td className="p-3 border">
                  {idx === currentIndex && mat.dosed
                    ? actualValue
                      ? `${mat.actual} ${mat.unit}`
                      : '—'
                    : mat.actual
                    ? `${mat.actual} ${mat.unit}`
                    : '—'}
                </td>
                <td className="p-3 border">
                  {mat.dosed
                    ? mat.bypassed
                      ? 'Bypassed'
                      : 'Dosed ✅'
                    : idx === currentIndex
                    ? 'In Progress'
                    : 'Pending'}
                </td>
                <td className="p-3 border">
                  {idx === currentIndex && !mat.dosed && (
                    <div className="flex gap-2">
                      <button
                        onClick={confirmDosing}
                        className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition"
                      >
                        ✅ Confirm
                      </button>
                      <button
                        onClick={bypassMaterial}
                        className="bg-red-600 text-white px-4 py-2 rounded shadow-md hover:bg-red-700 transition"
                      >
                        🚫 Bypass
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {scannedDisplay && (
  <div style={{
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#222',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    fontSize: '18px',
    zIndex: 1000,
    fontWeight: 'bold',
  }}>
    <p style={{ fontSize: '20px', marginBottom: '10px' }}>Verifying Barcode: {scannedDisplay}</p>
    <svg ref={overlayBarcodeRef}></svg>
  </div>
)}


    </div>
  );
};

export default ActiveOrders;
