export const getImageUrl = (url) => {
  if (!url) return '';

  // External URLs (Unsplash, external HTTPS/HTTP) remain untouched
  if (url.startsWith('https://') || (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('192.168.'))) {
    return url;
  }

  // Determine active backend API origin (e.g., "http://192.168.100.8:5000")
  let rawApiUrl = import.meta.env.VITE_API_URL || '';
  
  if (!rawApiUrl || rawApiUrl.includes('localhost')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    rawApiUrl = `http://${currentHost}:5000/api`;
  }

  const apiOrigin = rawApiUrl.replace(/\/api\/?$/, '');

  // Handle relative uploads path
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${apiOrigin}${path}`;
  }

  // Handle local uploaded files with hardcoded local domains/IPs
  if (url.includes('/uploads/')) {
    const relativePath = url.substring(url.indexOf('/uploads/'));
    return `${apiOrigin}${relativePath}`;
  }

  return url;
};
