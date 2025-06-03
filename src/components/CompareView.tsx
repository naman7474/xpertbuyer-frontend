import React, { useState, useEffect } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { Product, CompareResponse } from '../types';
import { apiService } from '../services/api';
import { trackCompareView } from '../utils/analytics';
import { logger } from '../utils/logger';

interface CompareViewProps {
  products: Product[];
}

const CompareView: React.FC<CompareViewProps> = ({ products }) => {
  const [comparisonData, setComparisonData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const productIds = products.map(p => p.id);
        const response = await apiService.compareProducts(productIds);
        setComparisonData(response);
      } catch (error) {
        logger.error('Failed to fetch comparison:', error);
      } finally {
        setLoading(false);
      }
    };

    if (products.length > 0) {
      fetchComparison();
      // Track compare view
      trackCompareView(products.map(p => p.id));
    }
  }, [products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };



  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Product Comparison</h2>
        <p className="text-gray-600 mt-1">Compare key features side by side</p>
      </div>

      {/* Mobile-friendly scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header with product images and names */}
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-900 min-w-[150px] sticky left-0 bg-gray-50 z-10">
                Features
              </th>
              {products.map((product) => (
                <th key={product.id} className="p-4 min-w-[250px]">
                  <div className="text-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/64/64';
                      }}
                    />
                    <p className="font-semibold text-gray-900 text-sm leading-tight">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {/* Price Row */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                Price
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price.sale)}
                    </p>
                    {product.price.mrp > product.price.sale && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price.mrp)}
                      </p>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Rating Row */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                Rating
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating.average}</span>
                    <span className="text-gray-500">({product.rating.count})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Key Ingredients Row */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                Key Ingredients
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  <div className="space-y-1">
                    {product.ingredients?.slice(0, 4).map((ingredient, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                      >
                        {ingredient.name}
                      </span>
                    ))}
                    {product.ingredients?.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{product.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Match Reason Row */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                Why Recommended
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.matchReason}
                  </p>
                </td>
              ))}
            </tr>

            {/* Size Row */}
            <tr className="hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                Size
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <p className="text-sm text-gray-700">
                    {product.size || 'Not specified'}
                  </p>
                </td>
              ))}
            </tr>

            {/* Brand Row */}
            {comparisonData?.data?.comparison?.brands && 
             comparisonData.data.comparison.brands.length > 1 && (
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Brand
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {product.brand}
                    </span>
                  </td>
                ))}
              </tr>
            )}

            {/* Common Ingredients Row */}
            {comparisonData?.data?.comparison?.commonIngredients && 
             comparisonData.data.comparison.commonIngredients.length > 0 && (
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Common Ingredients
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    <div className="space-y-1">
                                             {comparisonData.data.comparison.commonIngredients.slice(0, 3).map((ingredient: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {comparisonData.data.comparison.commonIngredients.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{comparisonData.data.comparison.commonIngredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Unique Ingredients Row */}
            {comparisonData?.data?.comparison?.uniqueIngredients && (
              <tr className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white">
                  Unique Ingredients
                </td>
                {products.map((product) => {
                  const uniqueData = comparisonData.data.comparison.uniqueIngredients.find(
                    item => item.productId === product.id
                  );
                  return (
                    <td key={product.id} className="p-4">
                      <div className="space-y-1">
                                                 {uniqueData?.uniqueIngredients?.slice(0, 4).map((ingredient: string, index: number) => (
                           <span
                             key={index}
                             className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                           >
                             {ingredient}
                           </span>
                         ))}
                         {uniqueData?.uniqueIngredients && uniqueData.uniqueIngredients.length > 4 && (
                           <span className="text-xs text-gray-500">
                             +{uniqueData.uniqueIngredients.length - 4} more
                           </span>
                         )}
                         {(!uniqueData?.uniqueIngredients || uniqueData.uniqueIngredients.length === 0) && (
                           <span className="text-xs text-gray-500">None listed</span>
                         )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Action Buttons Row */}
            <tr className="bg-gray-50">
              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-gray-50">
                Actions
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4">
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 space-x-2"
                  >
                    <span>Buy Now</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareView; 