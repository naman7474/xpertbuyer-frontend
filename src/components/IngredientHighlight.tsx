import React from 'react';

interface IngredientHighlightProps {
  text: string;
  ingredients: string[];
  className?: string;
}

const IngredientHighlight: React.FC<IngredientHighlightProps> = ({ 
  text, 
  ingredients, 
  className = '' 
}) => {
  if (!ingredients.length) {
    return <div className={className} style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  // Create a regex pattern for all ingredients (case-insensitive, whole words only)
  const ingredientPattern = ingredients
    .map(ingredient => ingredient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  const regex = new RegExp(`\\b(${ingredientPattern})\\b`, 'gi');
  
  // Split text by ingredient matches while preserving the matches
  const parts = text.split(regex);
  
  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        const isIngredient = ingredients.some(
          ingredient => ingredient.toLowerCase() === part.toLowerCase()
        );
        
        if (isIngredient) {
          return (
            <span 
              key={index}
              className="ingredient-tag mx-1 inline-flex"
              title={`Learn more about ${part}`}
            >
              {part}
            </span>
          );
        }
        
        return part;
      })}
    </div>
  );
};

export default IngredientHighlight; 