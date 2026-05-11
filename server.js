const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Rutas de la API
const API_PREFIX = '/api';

// --- PRODUCTOS ---
// Obtener todos los productos
app.get(`${API_PREFIX}/productos`, (req, res) => {
  const productos = leerJson('productos.json');
  res.json(productos);
});

// Agregar producto
app.post(`${API_PREFIX}/productos`, (req, res) => {
  const productos = leerJson('productos.json');
  const nuevoProducto = req.body;
  
  // Generar ID automático
  nuevoProducto.id = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  
  productos.push(nuevoProducto);
  escribirJson('productos.json', productos);
  
  res.json({ success: true, producto: nuevoProducto });
});

// Actualizar producto
app.put(`${API_PREFIX}/productos/:id`, (req, res) => {
  const productos = leerJson('productos.json');
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);
  
  if (index !== -1) {
    productos[index] = { ...productos[index], ...req.body };
    escribirJson('productos.json', productos);
    res.json({ success: true, producto: productos[index] });
  } else {
    res.status(404).json({ success: false, message: 'Producto no encontrado' });
  }
});

// Eliminar producto
app.delete(`${API_PREFIX}/productos/:id`, (req, res) => {
  let productos = leerJson('productos.json');
  const id = parseInt(req.params.id);
  productos = productos.filter(p => p.id !== id);
  escribirJson('productos.json', productos);
  
  res.json({ success: true });
});

// --- RECLAMACIONES ---
// Obtener todas las reclamaciones
app.get(`${API_PREFIX}/reclamaciones`, (req, res) => {
  const reclamaciones = leerJson('reclamaciones.json');
  res.json(reclamaciones);
});

// Guardar reclamación
app.post(`${API_PREFIX}/reclamaciones`, (req, res) => {
  const reclamaciones = leerJson('reclamaciones.json');
  const nuevaReclamacion = req.body;
  
  // Generar ID y código de seguimiento
  nuevaReclamacion.id = reclamaciones.length > 0 ? Math.max(...reclamaciones.map(r => r.id)) + 1 : 1;
  nuevaReclamacion.codigo = 'NET-2026-' + String(nuevaReclamacion.id).padStart(4, '0');
  nuevaReclamacion.fecha = new Date().toISOString();
  nuevaReclamacion.estado = 'pendiente';
  
  reclamaciones.push(nuevaReclamacion);
  escribirJson('reclamaciones.json', reclamaciones);
  
  res.json({ success: true, codigo: nuevaReclamacion.codigo });
});

// --- FUNCIONES AUXILIARES ---

function leerJson(nombreArchivo) {
  const ruta = path.join(__dirname, 'data', nombreArchivo);
  try {
    const datos = fs.readFileSync(ruta, 'utf8');
    return JSON.parse(datos);
  } catch (error) {
    return [];
  }
}

function escribirJson(nombreArchivo, datos) {
  const ruta = path.join(__dirname, 'data', nombreArchivo);
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor NetCraft corriendo en: http://localhost:${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}${API_PREFIX}`);
});