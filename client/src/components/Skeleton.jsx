import './Skeleton.css';

/**
 * Generic shimmer skeleton block.
 * @param {string} width   - CSS width  (default: '100%')
 * @param {string} height  - CSS height (default: '1rem')
 * @param {string} borderRadius - CSS border-radius (default: '6px')
 * @param {string} className - Extra class names
 */
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '6px', className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

/**
 * A skeleton placeholder that mimics a product card.
 */
export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton" aria-hidden="true">
      <Skeleton height="1.5rem" width="70%" />
      <Skeleton height="0.9rem" width="40%" />
      <Skeleton height="3rem" />
      <Skeleton height="0.85rem" width="55%" />
      <Skeleton height="2.5rem" borderRadius="8px" />
    </div>
  );
}

