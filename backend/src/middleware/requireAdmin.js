import { getSupabaseClient } from '../config/supabaseClient.js';

export function createRequireAdmin(getClient = getSupabaseClient) {
  return async function requireAdmin(req, res, next) {
    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) {
      return res.status(401).json({ success: false, error: 'Login admin diperlukan.' });
    }

    try {
      const supabase = getClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError) {
        if ([400, 401, 403].includes(Number(authError.status))) {
          return res.status(401).json({ success: false, error: 'Sesi login tidak valid.' });
        }
        return next(authError);
      }
      if (!user) {
        return res.status(401).json({ success: false, error: 'Sesi login tidak valid.' });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) return next(profileError);
      if (profile?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Akses hanya untuk admin.' });
      }

      req.authUser = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export const requireAdmin = createRequireAdmin();
