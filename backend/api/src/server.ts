import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { validateCsv } from './csv-validator';
import { analyzeCompliance } from '@rased/rules-engine';
import { generateNarrative } from '@rased/llm-service';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'CSV file is required. Upload with field name "file".' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    const { employees, errors } = validateCsv(csvContent);

    if (errors.length > 0 && employees.length === 0) {
      res.status(400).json({ error: 'CSV validation failed', validation_errors: errors });
      return;
    }

    const useMock = !process.env.OPENROUTER_API_KEY;
    const complianceResult = analyzeCompliance(employees);
    const { narrative_en, narrative_ar } = await generateNarrative(complianceResult, useMock);

    res.json({
      ...complianceResult,
      validation_errors: errors.length > 0 ? errors : undefined,
      narrative_en,
      narrative_ar,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Rased API server running on http://localhost:${PORT}`);
});
