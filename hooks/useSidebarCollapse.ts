'use client';

import { useState, useCallback, useEffect } from 'react';

const DESKTOP = '(min-width: 1024px)';

/**
 * Sidebar collapse state. Every page load starts expanded. Collapsing is a desktop
 * feature only: below the lg breakpoint the sidebar is a drawer that always opens with
 * icons and page names, whatever was chosen on a wider screen.
 */
export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return { isCollapsed: collapsed && isDesktop, toggleCollapse };
}
