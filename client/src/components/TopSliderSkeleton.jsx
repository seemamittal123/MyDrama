import React from 'react';

const TopSliderSkeleton = () => {
  return (
    <div className="top-slider-skeleton" aria-hidden="true">
      <div className="top-slider-skeleton__content">
        <div className="top-slider-skeleton__title skeleton-shimmer" />
        <div className="top-slider-skeleton__description skeleton-shimmer" />
        <div className="top-slider-skeleton__description top-slider-skeleton__description--short skeleton-shimmer" />
        <div className="top-slider-skeleton__actions">
          <div className="top-slider-skeleton__button skeleton-shimmer" />
          <div className="top-slider-skeleton__button skeleton-shimmer" />
        </div>
      </div>
      <div className="top-slider-skeleton__image skeleton-shimmer" />
    </div>
  );
};

export default TopSliderSkeleton;