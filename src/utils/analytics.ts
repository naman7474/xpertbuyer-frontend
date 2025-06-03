// Google Analytics and Meta Pixel utility functions

// Google Analytics 4 events
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Specific tracking functions
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
    content_type: 'skincare_products'
  });
};

export const trackProductView = (productId: string, productName: string, brand: string, price: number) => {
  trackEvent('view_item', {
    item_id: productId,
    item_name: productName,
    item_brand: brand,
    value: price,
    currency: 'INR',
    item_category: 'skincare'
  });
};

export const trackProductClick = (productId: string, productName: string, position: number) => {
  trackEvent('select_item', {
    item_id: productId,
    item_name: productName,
    index: position,
    content_type: 'product'
  });
};

export const trackCompareView = (productIds: string[]) => {
  trackEvent('compare_products', {
    product_ids: productIds,
    product_count: productIds.length
  });
};

export const trackVideoClick = (productId: string, videoId: string, creator: string) => {
  trackEvent('video_play', {
    product_id: productId,
    video_id: videoId,
    creator: creator,
    content_type: 'product_review'
  });
};

export const trackPurchaseIntent = (productId: string, productName: string, price: number) => {
  trackEvent('add_to_cart', {
    currency: 'INR',
    value: price,
    items: [{
      item_id: productId,
      item_name: productName,
      currency: 'INR',
      price: price,
      quantity: 1
    }]
  });
};

// Meta Pixel events
export const trackMetaEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

export const trackMetaSearch = (query: string) => {
  trackMetaEvent('Search', {
    search_string: query,
    content_category: 'skincare'
  });
};

export const trackMetaProductView = (productId: string, price: number) => {
  trackMetaEvent('ViewContent', {
    content_ids: [productId],
    content_type: 'product',
    value: price,
    currency: 'INR'
  });
};

export const trackMetaPurchaseIntent = (productId: string, price: number) => {
  trackMetaEvent('AddToCart', {
    content_ids: [productId],
    content_type: 'product',
    value: price,
    currency: 'INR'
  });
};

// Page view tracking
export const trackPageView = (pageName: string, path: string) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: path
    });
  }
  
  // Meta Pixel
  trackMetaEvent('PageView');
};

// Declare global types for analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
} 