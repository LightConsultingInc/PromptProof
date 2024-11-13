import express from 'express';
import { createTestServer } from './index';
import cors from 'cors';

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const server = createTestServer(app);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 