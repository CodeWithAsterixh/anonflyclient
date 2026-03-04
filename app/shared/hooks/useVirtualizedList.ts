import { useRef, useEffect, useState } from 'react';

interface UseVirtualizedListOptions {
    itemHeight: number;
    overscan?: number;
}

/**
 * Hook for basic list virtualization to improve performance with large message lists.
 */
export function useVirtualizedList<T>(items: T[], options: UseVirtualizedListOptions) {
    const { itemHeight, overscan = 5 } = options;
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setScrollTop(container.scrollTop);
        };

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerHeight(entry.contentRect.height);
            }
        });

        setContainerHeight(container.offsetHeight);
        container.addEventListener('scroll', handleScroll);
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
        };
    }, []);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
        item,
        index: startIndex + index,
        top: (startIndex + index) * itemHeight,
    }));

    return {
        containerRef,
        totalHeight,
        visibleItems,
        startIndex,
        endIndex,
    };
}
