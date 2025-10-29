const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
const app = express();
const port = 3000;

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const swapRoutes = require('./routes/swap');

// Connect to MongoDB
connectToMongo();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

app.get('/', (req, res) => {
  res.send('SlotSwapper API is running!');
});

app.listen(port, () => {
  console.log(`SlotSwapper backend listening at http://localhost:${port}`);
});

