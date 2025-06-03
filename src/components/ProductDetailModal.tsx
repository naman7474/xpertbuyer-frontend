import React, { useState, useEffect } from 'react';
import { X, Star, ExternalLink, Play, Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { Product, ProductVideoResponse } from '../types';
import { apiService } from '../services/api';
import { logger } from '../utils/logger';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const [videos, setVideos] = useState<ProductVideoResponse | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        const response = await apiService.getProductVideos(product.id);
        setVideos(response);
      } catch (error) {
        logger.error('Failed to fetch videos:', error);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [product.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getSafetyColor = (safety: string | undefined) => {
    if (!safety) return 'text-gray-600';
    
    switch (safety.toLowerCase()) {
      case 'safe':
        return 'text-green-600';
      case 'allergen':
        return 'text-yellow-600';
      case 'irritant':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSafetyIcon = (safety: string | undefined) => {
    if (!safety) return <Shield className="w-4 h-4" />;
    
    switch (safety.toLowerCase()) {
      case 'safe':
        return <CheckCircle className="w-4 h-4" />;
      case 'allergen':
        return <AlertTriangle className="w-4 h-4" />;
      case 'irritant':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getBenefitsText = () => {
    if (Array.isArray(product.benefits)) {
      return product.benefits.map(b => b.benefit);
    } else if (product.benefits && typeof product.benefits === 'object' && 'benefits_list' in product.benefits) {
      return product.benefits.benefits_list;
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
            <p className="text-gray-600">{product.brand}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Product Images and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/400/400';
                  }}
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === activeImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Price and Rating */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price.sale)}
                    </span>
                    {product.price.mrp > product.price.sale && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.price.mrp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-medium">{product.rating.average}</span>
                    <span className="text-gray-500">({product.rating.count} reviews)</span>
                  </div>
                </div>

                {/* Match Reason */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Why this is perfect for you</h4>
                  <p className="text-blue-700">{product.matchReason}</p>
                </div>

                {/* Benefits */}
                {getBenefitsText().length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {getBenefitsText().slice(0, 6).map((benefit, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 rounded-xl transition-colors duration-200 space-x-2"
                >
                  <span>Buy Now</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Product Description</h3>
            <div 
              className="text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description.replace(/&amp;/g, '&') }}
            />
          </div>

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Full Ingredients List</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.ingredients.map((ingredient, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{ingredient.name}</h4>
                        {ingredient.inci_name && (
                          <p className="text-sm text-gray-500 mt-1">{ingredient.inci_name}</p>
                        )}
                        {ingredient.benefits && (
                          <p className="text-sm text-gray-600 mt-2">{ingredient.benefits}</p>
                        )}
                      </div>
                      <div className={`flex items-center space-x-1 ${getSafetyColor(ingredient.safety)}`}>
                        {getSafetyIcon(ingredient.safety)}
                        <span className="text-xs font-medium capitalize">{ingredient.safety || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Video Reviews</h3>
            
            {videosLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading video reviews...</p>
              </div>
            ) : videos?.data.videos && videos.data.videos.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-blue-700">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{videos.data.creatorCount} creators</span>
                    </div>
                    <span className="text-blue-600">have reviewed this product</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.data.videos.map((video) => (
                  <div key={video.videoId} className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-blue-300 transition-colors"
                        >
                          <Play className="w-12 h-12" />
                        </a>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{video.channelTitle}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{video.viewCount?.toLocaleString()} views</span>
                        <span>{video.likeCount?.toLocaleString()} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Play className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No video reviews available for this product</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal; 