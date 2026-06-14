'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScrollableWithArrowsProps {
  children: React.ReactNode;
  className?: string;
  hideArrows?: boolean;
  downArrowOffset?: string;
}

export default function ScrollableWithArrows({ children, className = '', hideArrows = false, downArrowOffset = 'bottom-2' }: ScrollableWithArrowsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  };

  const scrollBy = (direction: 'up' | 'down') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: direction === 'up' ? -150 : 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const timeout = setTimeout(checkScroll, 100);
    // Add resize listener in case container changes size
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  // Drag to scroll logic
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const dragMode = useRef<'content' | 'scrollbar'>('content');

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    // Don't interfere with inputs or buttons
    if (e.button !== 0 || target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.closest('button')) return;
    
    isDragging.current = true;
    if (scrollRef.current) {
      startY.current = e.pageY;
      startScrollTop.current = scrollRef.current.scrollTop;
      
      const scrollbarWidth = currentTarget.offsetWidth - currentTarget.clientWidth;
      if (scrollbarWidth > 0 && e.clientX >= currentTarget.getBoundingClientRect().right - scrollbarWidth) {
        dragMode.current = 'scrollbar';
      } else {
        dragMode.current = 'content';
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    
    const y = e.pageY;
    const walk = y - startY.current;
    
    if (dragMode.current === 'scrollbar') {
      // Dragging native scrollbar thumb down -> content moves down
      const ratio = scrollRef.current.scrollHeight / scrollRef.current.clientHeight;
      scrollRef.current.scrollTop = startScrollTop.current + (walk * ratio);
    } else {
      // Panning content down -> content moves up
      scrollRef.current.scrollTop = startScrollTop.current - (walk * 1.5);
    }
  };

  const handlePointerUpOrLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
      scrollRef.current.style.userSelect = '';
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden flex flex-col group/scrollable h-full">
      {!hideArrows && canScrollUp && (
        <div className="absolute top-2 left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover/scrollable:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scrollBy('up')}
            className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
          >
            <ChevronUp size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onPointerCancel={handlePointerUpOrLeave}
        onWheel={(e) => { 
          e.stopPropagation(); 
          e.currentTarget.scrollTop += e.deltaY; 
          checkScroll(); 
        }}
        className={`flex-1 overflow-y-auto hidden-scrollbar ${className}`}
      >
        {children}
      </div>

      {!hideArrows && canScrollDown && (
        <div className={`absolute ${downArrowOffset} left-0 right-0 flex justify-center z-30 pointer-events-none opacity-0 group-hover/scrollable:opacity-100 transition-opacity duration-300`}>
          <button
            onClick={() => scrollBy('down')}
            className="bg-blue-500/80 hover:bg-blue-400 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)] border border-blue-400/50 backdrop-blur-md transition-all pointer-events-auto animate-bounce"
          >
            <ChevronDown size={18} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
