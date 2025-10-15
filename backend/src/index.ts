import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { processRouter } from './routes/process.route';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Aumentar limites para aceitar arquivos grandes (500MB)
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', processRouter);

// Servir arquivos estáticos do frontend (React build)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// SPA fallback - redireciona todas as rotas não-API para index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 PDF Processor v2.2.0`);
  console.log(`========================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`========================================`);
});

export { app };
