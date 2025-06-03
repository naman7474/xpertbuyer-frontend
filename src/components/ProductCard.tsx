import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, PlayCircle, Users } from 'lucide-react';
import { Product } from '../types';
import { apiService } from '../services/api';
import { trackProductClick, trackProductView, trackMetaProductView } from '../utils/analytics';
import { logger } from '../utils/logger';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [creatorCount, setCreatorCount] = useState<number>(0);

  useEffect(() => {
    const fetchCreatorCount = async () => {
      try {
        const response = await apiService.getProductVideos(product.id);
        if (response.success) {
          setCreatorCount(response.data.creatorCount || 0);
        }
      } catch (error) {
        logger.error('Failed to fetch creator count:', error);
      }
    };

    fetchCreatorCount();
  }, [product.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getBenefitsText = () => {
    if (Array.isArray(product.benefits)) {
      return product.benefits.slice(0, 3).map(b => b.benefit).join(', ');
    } else if (product.benefits && typeof product.benefits === 'object' && 'benefits_list' in product.benefits) {
      return product.benefits.benefits_list.slice(0, 3).join(', ');
    }
    return '';
  };

  const handleClick = () => {
    trackProductClick(product.id, product.name, 0);
    trackProductView(product.id, product.name, product.brand, product.price.sale);
    trackMetaProductView(product.id, product.price.sale);
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      className="card cursor-pointer transform hover:scale-[1.02] transition-all duration-200"
    >
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/api/placeholder/300/300';
          }}
        />
        
        <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full shadow-md">
          <span className="text-xs font-medium">AI Pick</span>
        </div>
        
        <div className="absolute top-3 right-3 flex items-center space-x-2">
          {creatorCount > 0 && (
            <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{creatorCount}</span>
            </div>
          )}
          <PlayCircle className="w-6 h-6 text-white drop-shadow-lg" />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {product.brand}
          </p>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mt-1">
            {product.name}
          </h3>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          {product.matchReason}
        </p>

        {getBenefitsText() && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
              Key Benefits
            </p>
            <p className="text-sm text-blue-600">
              {getBenefitsText()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price.sale)}
            </span>
            {product.price.mrp > product.price.sale && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price.mrp)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {product.rating.average}
            </span>
            <span className="text-sm text-gray-500">
              ({product.rating.count})
            </span>
          </div>
        </div>

        <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
          <span>View Details</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 
 