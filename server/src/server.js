require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const blockchain = require('./services/blockchain');

const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');
const verifyRoutes = require('./routes/verify');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'TrueDose Blockchain Pharma Supply Chain',
    timestamp: new Date().toISOString(),
    isNodeConnected: blockchain.isNodeRunning(),
    contractInfo: blockchain.getContractInfo()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error"
  });
});

// Initialize blockchain connection and start server
async function startServer() {
  await blockchain.initBlockchain();
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`💊 TrueDose API Server running at http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Public verify endpoint: http://localhost:${PORT}/api/verify/PCM001`);
    console.log(`======================================================\n`);
  });
}

startServer();
