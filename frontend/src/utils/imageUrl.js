export const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // If URL starts with /uploads, prepend the backend URL
  if (url.startsWith('/uploads')) {
    const apiUrl = process.env.REACT_APP_API_URL || '';
    return `${apiUrl}${url}`;
  }
  
  try {
    const u = new URL(url);
    // Handle freeimage.host page links -> convert to direct CDN link (best-effort)
    // Examples:
    //  - https://freeimage.host/i/K4YcCpS -> https://iili.io/K4YcCpS.jpg
    //  - https://freeimage.host/i/K4YcCpS.png -> keep as is
    if (/freeimage\.host$/.test(u.hostname)) {
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'i' && parts[1]) {
        const id = parts[1].split('.')[0];
        // Default to .jpg if no extension present
        const hasExt = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(parts[1]);
        return hasExt ? url : `https://iili.io/${id}.jpg`;
      }
    }
    return url;
  } catch {
    // If URL parsing fails, it might be a relative URL
    // Prepend backend URL if it looks like a relative path
    if (url.startsWith('/')) {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      return `${apiUrl}${url}`;
    }
    return url;
  }
};
