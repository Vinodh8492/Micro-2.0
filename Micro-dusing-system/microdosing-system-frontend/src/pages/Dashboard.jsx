import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Package, ClipboardList, Activity, CheckCircle } from 'lucide-react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    materials: 0,
    recipes: 0,
    activeOrders: 0,
    completedBatches: 0
  });

  const [productChart, setProductChart] = useState({
    labels: [],
    data: []
  });

  const location = useLocation();
  const successMessage = location.state?.message;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialRes, recipesRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/materials'),
          axios.get('http://127.0.0.1:5000/api/recipes')
        ]);

        const materials = materialRes.data;

        // Update KPI values
        setStats(prev => ({
          ...prev,
          materials: materials.length,
          recipes: recipesRes.data.length
        }));

        // Extract chart data from materials
        const dynamicLabels = materials.map(m => m.title);
        const dynamicData = materials.map(m => m.current_quantity || 0); // default to 0 if no stock

        setProductChart({
          labels: dynamicLabels,
          data: dynamicData
        });

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const productColors = [
    "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8",
    "#1e40af", "#1e3a8a", "#172554", "#0f172a", "#38bdf8", "#0ea5e9", "#0284c7"
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutBounce'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151'
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: '#D1D5DB'
        },
        ticks: {
          color: '#374151'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#374151'
        }
      }
    }
  };

  const barChartData = {
    labels: productChart.labels,
    datasets: [
      {
        label: 'Product Usage',
        data: productChart.data,
        backgroundColor: productChart.labels.map((_, i) => productColors[i % productColors.length])
      }
    ]
  };

  const pieChartData = {
    labels: productChart.labels,
    datasets: [
      {
        data: productChart.data,
        backgroundColor: productChart.labels.map((_, i) => productColors[i % productColors.length])
      }
    ]
  };

  const historicalKpiData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      {
        label: "Tolerance %",
        data: [96, 89, 94, 90, 92],
        backgroundColor: productColors
      }
    ]
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      {successMessage && (
        <Box className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">
          {successMessage}
        </Box>
      )}

      <Typography variant="h4" className="text-gray-800 font-semibold mb-6">
        Welcome to the Dashboard!
      </Typography>

      {/* KPI CARDS */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Materials', value: stats.materials, icon: <Package className="w-8 h-8 text-blue-600" /> },
          { label: 'Recipes', value: stats.recipes, icon: <ClipboardList className="w-8 h-8 text-blue-600" /> },
          { label: 'Active Orders', value: stats.activeOrders, icon: <Activity className="w-8 h-8 text-blue-600" /> },
          { label: 'Completed Batches', value: stats.completedBatches, icon: <CheckCircle className="w-8 h-8 text-blue-600" /> }
        ].map(({ label, value, icon }) => (
          <Card key={label} className="shadow-md">
            <CardContent className="flex flex-col items-center text-center">
              <Box className="mb-2">{icon}</Box>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="h5" className="font-bold mt-1" sx={{ fontWeight: "bold" }}>{value}</Typography>
              <Link
  to={
    label === 'Materials'
      ? '/material'
      : label === 'Active Orders'
      ? '/activeorders'
      : `/${label.toLowerCase().replace(' ', '-')}`
  }
  className="mt-3 text-blue-600 text-sm underline"
>
  View All
</Link>

            </CardContent>
          </Card>
        ))}
      </Box>

      {/* CHARTS */}
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">Product Distribution</Typography>
            <Box className="h-80">
              <Bar options={chartOptions} data={barChartData} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">By Product</Typography>
            <Box className="h-80">
              <Pie options={chartOptions} data={pieChartData} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* HISTORICAL KPI */}
      <Card className="mt-6">
        <CardContent>
          <Typography variant="h6" className="mb-4">Tolerance Historical KPI</Typography>
          <Box className="h-80">
            <Bar options={chartOptions} data={historicalKpiData} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
