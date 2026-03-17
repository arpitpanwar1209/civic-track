// src/components/Skeleton.jsx
import React from "react";

// ==========================================
// Generic Shimmering Line
// ==========================================
export function SkeletonLine({
  width = "100%",
  height = 12,
  radius = 6,
  className = "",
  style = {},
}) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: "#e9ecef",
        ...style,
      }}
    />
  );
}

// ==========================================
// Issue Card Skeleton Placeholder
// ==========================================
export function IssueCardSkeleton() {
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
      {/* Image Placeholder */}
      <div 
        className="skeleton-pulse" 
        style={{ height: 180, width: "100%", backgroundColor: "#f1f3f5" }} 
      />

      <div className="card-body p-4">
        {/* Category & Date Header */}
        <div className="d-flex justify-content-between mb-3">
          <SkeletonLine width="30%" height={10} />
          <SkeletonLine width="20%" height={10} />
        </div>

        {/* Title */}
        <SkeletonLine width="85%" height={20} className="mb-3" />

        {/* Status Badge Placeholder */}
        <SkeletonLine width="25%" height={24} radius={20} className="mb-4" />

        {/* Description Lines */}
        <SkeletonLine width="100%" className="mb-2" />
        <SkeletonLine width="90%" className="mb-4" />

        {/* Metadata Footer */}
        <div className="pt-3 border-top mt-auto">
          <div className="d-flex align-items-center mb-2">
            <SkeletonLine width="10%" height={14} radius={4} className="me-2" />
            <SkeletonLine width="60%" height={12} />
          </div>
          <SkeletonLine width="40%" height={10} />
        </div>

        {/* Action Buttons Placeholder */}
        <div className="d-flex gap-2 mt-4 pt-2 border-top">
          <SkeletonLine width="30%" height={32} radius={20} />
          <SkeletonLine width="30%" height={32} radius={20} className="ms-auto" />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .skeleton-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}