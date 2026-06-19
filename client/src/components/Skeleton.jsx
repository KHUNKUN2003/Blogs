export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function BlogCardSkeleton() {
  return (
    <article className="blog-card">
      <SkeletonBlock className="blog-card__image" />
      <div className="blog-card__body">
        <SkeletonBlock className="skeleton-line skeleton-line--short" />
        <SkeletonBlock className="skeleton-line skeleton-line--title" />
        <SkeletonBlock className="skeleton-line" />
        <SkeletonBlock className="skeleton-line skeleton-line--wide" />
      </div>
    </article>
  );
}

export function BlogDetailSkeleton() {
  return (
    <article className="detail">
      <SkeletonBlock className="detail__cover" />
      <SkeletonBlock className="skeleton-line skeleton-line--short" />
      <SkeletonBlock className="skeleton-line skeleton-line--heading" />
      <SkeletonBlock className="skeleton-line" />
      <SkeletonBlock className="skeleton-line" />
      <SkeletonBlock className="skeleton-line skeleton-line--wide" />
    </article>
  );
}
