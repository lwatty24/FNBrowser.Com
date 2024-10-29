import { useEffect, useState, useCallback } from 'react';

export function useInfiniteScroll<T>(
  items: T[],
  itemsPerPage: number = 20
) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage));
    setPage(1);
  }, [items, itemsPerPage]);

  const loadMoreItems = useCallback(() => {
    if (isLoading || displayedItems.length >= items.length) return;

    setIsLoading(true);
    const nextItems = items.slice(0, (page + 1) * itemsPerPage);
    
    setDisplayedItems(nextItems);
    setPage(p => p + 1);
    setIsLoading(false);
  }, [items, page, itemsPerPage, displayedItems.length, isLoading]);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.innerHeight + window.pageYOffset;
    const threshold = document.documentElement.scrollHeight - 1000;
    
    if (scrollPosition > threshold) {
      loadMoreItems();
    }
  }, [loadMoreItems]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { 
    displayedItems, 
    isLoading,
    hasMore: displayedItems.length < items.length 
  };
} 