import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, type AuthenticatedRequest } from '../midlware/auth';

const router = Router();

router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Company name is required' });
    return;
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({ user_id: req.user!.id, name })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user!.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }

  res.json(data);
});

export default router;
