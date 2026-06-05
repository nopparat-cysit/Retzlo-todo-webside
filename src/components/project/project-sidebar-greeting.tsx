"use client";

import { useMemo } from "react";

interface ProjectSidebarGreetingProps {
  userName: string;
}

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function ProjectSidebarGreeting({ userName }: ProjectSidebarGreetingProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return getGreeting(hour);
  }, []);

  return (
    <p className="text-xs text-stone-500">
      {greeting}, {userName} ✦
    </p>
  );
}
