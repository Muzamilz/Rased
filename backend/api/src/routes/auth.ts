import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth, type AuthenticatedRequest } from '../midlware/auth';

const router = Router();

router.post('/magic-link', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json({ message: 'Magic link sent' });
});

router.post('/session', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    res.status(400).json({ error: 'Email and token are required' });
    return;
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error || !data.session) {
    res.status(400).json({ error: error?.message || 'Invalid session' });
    return;
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: { id: data.user.id, email: data.user.email },
  });
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', req.user!.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ user: req.user, companies: data });
});

router.post('/logout', async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ message: 'Logged out' });
});

export default router;
