// src/hooks/useAuth.js
// Session timeout: auto-logout after 15 min inactivity + 2 min warning

import { useState, useCallback, useEffect, useRef } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const WARNING_BEFORE     =  2 * 60 * 1000;

export function useAuth() {
  const [currentUser,    setCurrentUser]    = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('hf_user')); } catch { return null; }
  });
  const [isLoggedIn,     setIsLoggedIn]     = useState(() => !!sessionStorage.getItem('hf_user'));
  const [authError,      setAuthError]      = useState('');
  const [authLoading,    setAuthLoading]    = useState(false);
  const [showTimeout,    setShowTimeout]    = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(120);

  const timeoutRef   = useRef(null);
  const warningRef   = useRef(null);
  const countdownRef = useRef(null);

  const performLogout = useCallback(async (timedOut = false) => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);
    setShowTimeout(false);
    const refreshToken = sessionStorage.getItem('hf_refresh_token');
    if (refreshToken) await supabase.from('sessions').delete().eq('refresh_token', refreshToken);
    sessionStorage.clear();
    setCurrentUser(null);
    setIsLoggedIn(false);
    // No alert shown — user is silently redirected to landing page on timeout
  }, []);

  const resetTimer = useCallback(() => {
    if (!sessionStorage.getItem('hf_user')) return;
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);
    setShowTimeout(false);

    warningRef.current = setTimeout(() => {
      setShowTimeout(true);
      setTimeoutSeconds(120);
      countdownRef.current = setInterval(() => {
        setTimeoutSeconds(s => { if (s <= 1) { clearInterval(countdownRef.current); return 0; } return s - 1; });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    timeoutRef.current = setTimeout(() => performLogout(true), INACTIVITY_TIMEOUT);
  }, [performLogout]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const events  = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handler = () => resetTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      clearInterval(countdownRef.current);
    };
  }, [isLoggedIn, resetTimer]);

  const login = useCallback(async (username, password, role) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count } = await supabase.from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('username', username).eq('success', false).gte('attempted_at', tenMinsAgo);

      if (count >= 5) { setAuthError('Account temporarily locked. Try again in 10 minutes.'); return false; }

      const { data: users } = await supabase.from('users')
        .select('id, username, password, role, full_name').eq('username', username).limit(1);

      const user          = users?.[0];
      const dummyHash     = '$2a$12$invalidhashfortimingprotectiononly000000000000000000000'; /* Dummy hash for timing protection */
      const passwordMatch = await bcrypt.compare(password, user?.password ?? dummyHash);/* Comparing the hashes  */

      if (!user || !passwordMatch || user.role !== role) {
        await supabase.from('login_attempts').insert({ username, success: false });
        setAuthError('Invalid credentials.');
        return false;
      }

      await supabase.from('login_attempts').insert({ username, success: true });
      const refreshToken = crypto.randomUUID();
      await supabase.from('sessions').insert({
        user_id: user.id, refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      });

      const userData = { id: user.id, fullName: user.full_name, role: user.role };
      sessionStorage.setItem('hf_user',          JSON.stringify(userData));
      sessionStorage.setItem('hf_refresh_token', refreshToken);
      setCurrentUser(userData);
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.error(err);
      setAuthError('Something went wrong. Please try again.');
      return false;
    } finally { setAuthLoading(false); }
  }, []);

  const logout = useCallback(() => performLogout(false), [performLogout]);

  return { currentUser, isLoggedIn, authError, authLoading, login, logout, showTimeout, timeoutSeconds, stayLoggedIn: resetTimer };
}