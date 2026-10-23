'use client';

import { useState, useCallback } from 'react';

/** Sidebar collapse state. Every page load starts expanded. */
export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return { isCollapsed, toggleCollapse };
}
