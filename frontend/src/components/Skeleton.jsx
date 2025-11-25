import React from "react";

// Generic shimmering line
export function SkeletonLine({
  width = "100%",
  height = 12,
  radius = 6,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`skeleton-line ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

// Issue card skeleton placeholder
export function IssueCardSkeleton() {
  return (
    <div className="card shadow-sm skeleton-card">
      {/* Image placeholder */}
      <div className="skeleton-image" />

      <div className="card-body">
        <SkeletonLine width="70%" height={16} className="mb-2" />
        <SkeletonLine width="40%" height={14} className="mb-3" />

        <SkeletonLine width="95%" className="mb-2" />
        <SkeletonLine width="85%" className="mb-2" />
        <SkeletonLine width="75%" className="mb-2" />
      </div>
    </div>
  );
}
