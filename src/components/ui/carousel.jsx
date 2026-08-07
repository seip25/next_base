"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const CarouselContext = createContext(null);

export function Carousel({ children, autoplay = false, interval = 3500, className = "" }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const trackRef = useRef(null);

  const scrollToSlide = (index) => {
    if (!trackRef.current) return;
    const items = trackRef.current.querySelectorAll(".carousel-item, .carousel-card");
    if (items.length === 0) return;

    let targetIndex = index;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= items.length) targetIndex = items.length - 1;

    setCurrentSlideIndex(targetIndex);
    const targetItem = items[targetIndex];
    if (targetItem) {
      trackRef.current.scrollTo({
        left: targetItem.offsetLeft - trackRef.current.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (trackRef.current) {
      const items = trackRef.current.querySelectorAll(".carousel-item, .carousel-card");
      setSlideCount(items.length);
    }
  }, []);

  useEffect(() => {
    if (!autoplay || slideCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        const nextIdx = (prev + 1) % slideCount;
        scrollToSlide(nextIdx);
        return nextIdx;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, slideCount]);

  return (
    <CarouselContext.Provider
      value={{
        currentSlideIndex,
        slideCount,
        scrollToSlide,
        trackRef,
      }}
    >
      <div className={`carousel ${className}`}>{children}</div>
    </CarouselContext.Provider>
  );
}

export function CarouselTrack({ children, className = "" }) {
  const ctx = useContext(CarouselContext);

  return (
    <div
      ref={ctx?.trackRef}
      className={`carousel-track ${className}`}
      style={{ cursor: "grab" }}
    >
      {children}
    </div>
  );
}

export function CarouselItem({ children, className = "" }) {
  return <div className={`carousel-item ${className}`}>{children}</div>;
}

export function CarouselPrev({ children = "‹", className = "" }) {
  const ctx = useContext(CarouselContext);
  return (
    <button
      type="button"
      className={`carousel-prev carousel-nav ${className}`}
      aria-label="Previous slide"
      onClick={() => ctx && ctx.scrollToSlide(ctx.currentSlideIndex - 1)}
    >
      {children}
    </button>
  );
}

export function CarouselNext({ children = "›", className = "" }) {
  const ctx = useContext(CarouselContext);
  return (
    <button
      type="button"
      className={`carousel-next carousel-nav ${className}`}
      aria-label="Next slide"
      onClick={() => ctx && ctx.scrollToSlide(ctx.currentSlideIndex + 1)}
    >
      {children}
    </button>
  );
}

export function CarouselIndicators({ className = "" }) {
  const ctx = useContext(CarouselContext);
  if (!ctx || ctx.slideCount <= 1) return null;

  return (
    <div className={`carousel-indicators ${className}`}>
      {Array.from({ length: ctx.slideCount }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          className={`carousel-dot ${idx === ctx.currentSlideIndex ? "active" : ""}`}
          aria-label={`Go to slide ${idx + 1}`}
          onClick={() => ctx.scrollToSlide(idx)}
        />
      ))}
    </div>
  );
}
