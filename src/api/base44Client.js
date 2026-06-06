// LOCAL HUB SHIM — replaces Base44 SDK, routes to ~/cpp server via /api/*
const TOKEN_KEY = 'vf_token';

function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } }
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch {} }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY); } catch {} }

async function api(path, { method = 'GET', body = null, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) { const e = new Error(data?.error || `Request failed (${res.status})`); e.status = res.status; throw e; }
  return data;
}

const auth = {
  async me() {
    if (!getToken()) { const e = new Error('Not authenticated'); e.status = 401; throw e; }
    const r = await api('/api/auth/me', { method: 'GET' });
    return { email: r.email, full_name: r.email, tier: r.tier, inTrial: r.inTrial, trialDaysLeft: r.trialDaysLeft, paidTier: r.paidTier };
  },
  redirectToLogin() { if (window.location.pathname !== '/login') window.location.href = '/login'; },
  async loginWithEmail(email) {
    const r = await api('/api/auth/login', { method: 'POST', body: { email }, auth: false });
    if (r?.token) setToken(r.token);
    return r;
  },
  logout() { clearToken(); window.location.href = '/login'; },
  async deleteAccount() { try { await api('/api/auth/delete', { method: 'POST' }); } catch {} clearToken(); window.location.href = '/login'; },
  isAuthenticated() { return !!getToken(); },
};

const functions = {
  async invoke(name, payload = {}) {
    if (name === 'createCheckout') return { data: await api('/api/billing/checkout', { method: 'POST', body: payload }) };
    return { data: await api(`/api/fn/${name}`, { method: 'POST', body: payload }) };
  },
};

const integrations = {
  Core: {
    async InvokeLLM(args = {}) {
      const data = await api('/api/ai/invoke', { method: 'POST', body: args });
      return data?.text ?? data;
    },
  },
};

export const base44 = { auth, functions, integrations };
export default base44;
