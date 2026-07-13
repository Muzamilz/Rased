import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { validateCsv } from './csv-validator';
import { analyzeCompliance } from '@rased/rules-engine';
import { generateNarrative } from '@rased/llm-service';
import { supabase } from './lib/supabase';
import authRoutes from './routes/auth';
import companyRoutes from './routes/companies';
import reportRoutes from './routes/reports';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/reports', reportRoutes);

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

    // If authenticated, save report to Supabase
    let savedReport = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        const companyId = req.body.company_id || null;
        const { data: report } = await supabase
          .from('reports')
          .insert({
            user_id: userData.user.id,
            company_id: companyId,
            summary: complianceResult,
            narrative_en,
            narrative_ar,
          })
          .select()
          .single();

        if (report) {
          savedReport = report;
        }
      }
    }

    res.json({
      ...complianceResult,
      validation_errors: errors.length > 0 ? errors : undefined,
      narrative_en,
      narrative_ar,
      report_id: savedReport?.id || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Rased API server running on http://localhost:${PORT}`);
});
