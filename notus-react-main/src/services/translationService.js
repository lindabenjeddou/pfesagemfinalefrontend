// Translation Service for Sagemcom Maintenance Platform
// Handles external API translations and caching

class TranslationService {
  constructor() {
    this.apiKey = process.env.REACT_APP_TRANSLATION_API_KEY;
    this.baseUrl = 'https://api.mymemory.translated.net/get';
    this.cache = new Map();
    this.supportedLanguages = ['fr', 'en', 'ar'];
  }

  // Get translations from external API (MyMemory API as fallback)
  async getTranslations(languageCode, texts = []) {
    if (!this.supportedLanguages.includes(languageCode)) {
      throw new Error(`Language ${languageCode} is not supported`);
    }

    const translations = {};
    
    for (const text of texts) {
      const cacheKey = `${languageCode}:${text}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        translations[text] = this.cache.get(cacheKey);
        continue;
      }

      try {
        const translation = await this.translateText(text, 'fr', languageCode);
        translations[text] = translation;
        
        // Cache the translation
        this.cache.set(cacheKey, translation);
        
        // Add delay to respect API rate limits
        await this.delay(100);
        
      } catch (error) {
        console.warn(`Failed to translate "${text}" to ${languageCode}:`, error);
        translations[text] = text; // Fallback to original text
      }
    }

    return translations;
  }

  // Translate a single text using external API
  async translateText(text, fromLang = 'fr', toLang = 'en') {
    if (fromLang === toLang) {
      return text;
    }

    const cacheKey = `${toLang}:${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        const translation = data.responseData.translatedText;
        
        // Cache the translation
        this.cache.set(cacheKey, translation);
        
        return translation;
      } else {
        throw new Error('Translation API returned invalid response');
      }
      
    } catch (error) {
      console.error('Translation API error:', error);
      return text; // Return original text as fallback
    }
  }

  // Batch translate multiple texts
  async batchTranslate(texts, fromLang = 'fr', toLang = 'en') {
    const translations = {};
    
    for (const text of texts) {
      translations[text] = await this.translateText(text, fromLang, toLang);
      // Add delay between requests to respect rate limits
      await this.delay(100);
    }
    
    return translations;
  }

  // Detect language of a text
  async detectLanguage(text) {
    try {
      const url = `${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=autodetect|en`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.match?.language || 'unknown';
      }
      
      return 'unknown';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'unknown';
    }
  }

  // Get available translation languages
  getSupportedLanguages() {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' }
    ];
  }

  // Clear translation cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size
  getCacheSize() {
    return this.cache.size;
  }

  // Export cache for persistence
  exportCache() {
    return Object.fromEntries(this.cache);
  }

  // Import cache from storage
  importCache(cacheData) {
    this.cache = new Map(Object.entries(cacheData));
  }

  // Save cache to localStorage
  saveCacheToStorage() {
    try {
      const cacheData = this.exportCache();
      localStorage.setItem('sagemcom_translation_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save translation cache:', error);
    }
  }

  // Load cache from localStorage
  loadCacheFromStorage() {
    try {
      const cacheData = localStorage.getItem('sagemcom_translation_cache');
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        this.importCache(parsedCache);
      }
    } catch (error) {
      console.error('Failed to load translation cache:', error);
    }
  }

  // Utility function to add delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate translation quality (basic check)
  validateTranslation(original, translated, minLength = 1) {
    if (!translated || translated.length < minLength) {
      return false;
    }
    
    // Check if translation is not just the original text
    if (original === translated) {
      return false;
    }
    
    // Check for common translation errors
    const errorPatterns = [
      /^ERROR/i,
      /^INVALID/i,
      /^QUOTA/i,
      /^LIMIT/i
    ];
    
    return !errorPatterns.some(pattern => pattern.test(translated));
  }

  // Get translation statistics
  getStats() {
    return {
      cacheSize: this.getCacheSize(),
      supportedLanguages: this.supportedLanguages.length,
      apiUrl: this.baseUrl
    };
  }
}

// Create and export singleton instance
const translationService = new TranslationService();

// Load cache on initialization
translationService.loadCacheFromStorage();

// Save cache periodically
setInterval(() => {
  translationService.saveCacheToStorage();
}, 30000); // Save every 30 seconds

// Save cache before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    translationService.saveCacheToStorage();
  });
}

export { translationService };
export default translationService;