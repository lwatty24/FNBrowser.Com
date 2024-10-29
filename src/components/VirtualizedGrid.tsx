import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  columnCount: number;
  itemHeight: number;
  className?: string;
}

export function VirtualizedGrid<T>({ 
  items, 
  renderItem, 
  columnCount, 
  itemHeight,
  className 
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / 6);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + 16,
    overscan: 2,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    const images = parentRef.current?.getElementsByTagName('img') || [];
    Array.from(images).forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, [items]);

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-180px)] overflow-y-auto w-full px-4"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * 6;
          const end = Math.min(start + 6, items.length);
          
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: `${itemHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-6 gap-4"
            >
              {items.slice(start, end).map((item) => (
                <div key={(item as any).id} className="w-full">
                  {renderItem(item)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
