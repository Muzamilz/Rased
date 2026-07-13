import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, type AuthenticatedRequest } from '../midlware/auth';
import { generatePdfReport } from '../lib/pdf';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const companyId = req.query.company_id as string | undefined;
  let query = supabase
    .from('reports')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  res.json(data);
});

router.get('/:id/pdf', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  try {
    const pdf = await generatePdfReport(
      data.summary as any,
      data.narrative_en || '',
      data.narrative_ar || '',
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rased-report-${data.id}.pdf"`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

export default router;
