require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const blockchain = require('./services/blockchain');

const authRoutes = require('./routes/auth');
const organRoutes = require('./routes/batches');
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
app.use('/api/organs', organRoutes);
app.use('/api/batches', organRoutes); // backward-compatible alias
app.use('/api/verify', verifyRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'LifeLedger Decentralized Organ Procurement & Transplant Network',
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
    console.log(`🫀 LifeLedger API Server running at http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Public verify endpoint: http://localhost:${PORT}/api/verify/ORG-KID-8041`);
    console.log(`======================================================\n`);
  });
}

startServer();
