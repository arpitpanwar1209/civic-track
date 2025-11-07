import React from "react";

export function SkeletonLine({ width="100%", height=12, className="" }) {
  return (
    <div
      className={`bg-light shimmer ${className}`}
      style={{ width, height, borderRadius: 6 }}
    />
  );
}

export function IssueCardSkeleton() {
  return (
    <div className="card shadow-sm">
      <div className="ratio ratio-16x9 bg-light shimmer" />
      <div className="card-body">
        <SkeletonLine width="60%" className="mb-2"/>
        <SkeletonLine width="40%" className="mb-3"/>
        <SkeletonLine width="90%" className="mb-1"/>
        <SkeletonLine width="80%" className="mb-1"/>
      </div>
    </div>
  );
}
