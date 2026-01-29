export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name, phone } = req.query;

  if (!name && !phone) {
    return res.status(400).json({ error: 'Missing name or phone parameter' });
  }

  const searchTerm = name || phone;
  const results = [];

  try {
    // Search Google
    const googleResult = await searchGoogle(searchTerm);
    if (googleResult.found) {
      results.push(googleResult);
    }

    // Search Google News
    const newsResult = await searchGoogleNews(searchTerm);
    if (newsResult.found) {
      results.push(newsResult);
    }

    // Search for legal issues
    const legalResult = await searchLegal(searchTerm);
    if (legalResult.found) {
      results.push(legalResult);
    }

    // Search Facebook via Google
    const facebookResult = await searchFacebook(searchTerm);
    if (facebookResult.found) {
      results.push(facebookResult);
    }

    // Search Instagram via Google
    const instagramResult = await searchInstagram(searchTerm);
    if (instagramResult.found) {
      results.push(instagramResult);
    }

    // Search LinkedIn via Google
    const linkedinResult = await searchLinkedIn(searchTerm);
    if (linkedinResult.found) {
      results.push(linkedinResult);
    }

    return res.status(200).json({
      searchTerm,
      totalResults: results.length,
      results
    });

  } catch (error) {
    return res.status(500).json({ error: 'Search failed', message: error.message });
  }
}

async function searchGoogle(term) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const hasResults = !html.includes('did not match any documents') && html.includes('<div class="g"');
    
    return {
      source: 'Google',
      icon: '🔍',
      found: hasResults,
      url: url,
      description: hasResults ? 'נמצאו תוצאות בגוגל' : null
    };
  } catch (e) {
    return { source: 'Google', found: false };
  }
}

async function searchGoogleNews(term) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(term)}&tbm=nws`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const hasResults = html.includes('class="SoaBEf"') || html.includes('class="WlydOe"');
    
    return {
      source: 'חדשות',
      icon: '📰',
      found: hasResults,
      url: url,
      description: hasResults ? 'נמצאו כתבות חדשות' : null
    };
  } catch (e) {
    return { source: 'חדשות', found: false };
  }
}

async function searchLegal(term) {
  const legalTerms = `${term} פסק דין OR משפט OR תביעה OR נאשם OR עבירה`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(legalTerms)}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const hasResults = (html.includes('פסק דין') || html.includes('משפט') || html.includes('נאשם')) && html.includes('<div class="g"');
    
    return {
      source: 'תיקים משפטיים',
      icon: '⚖️',
      found: hasResults,
      url: url,
      description: hasResults ? '⚠️ נמצא מידע משפטי' : null,
      priority: 'high'
    };
  } catch (e) {
    return { source: 'תיקים משפטיים', found: false };
  }
}

async function searchFacebook(term) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(term + ' site:facebook.com')}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const hasResults = html.includes('facebook.com') && html.includes('<div class="g"');
    
    return {
      source: 'פייסבוק',
      icon: '📘',
      found: hasResults,
      url: url,
      description: hasResults ? 'נמצא פרופיל פייסבוק' : null
    };
  } catch (e) {
    return { source: 'פייסבוק', found: false };
  }
}

async function searchInstagram(term) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(term + ' site:instagram.com')}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const hasResults = html.includes('instagram.com') && html.includes('<div class="g"');
    
    return {
      source: 'אינסטגרם',
      icon: '📷',
      found: hasResults,
      url: url,
      description: hasResults ? 'נמצא פרופיל אינסטגרם' : null
    };
  } catch (e) {
    return { source: 'אינסטגרם', found: false };
  }
}

async function searchLinkedIn(term) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(term + ' site:linkedin.com')}`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const hasResults = html.includes('linkedin.com') && html.includes('<div class="g"');
    
    return {
      source: 'לינקדאין',
      icon: '💼',
      found: hasResults,
      url: url,
      description: hasResults ? 'נמצא פרופיל לינקדאין' : null
    };
  } catch (e) {
    return { source: 'לינקדאין', found: false };
  }
}
