"use client";

import { useEffect, useState } from "react";

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
  const [greeting, setGreeting] = useState<string>("Welcome");

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <p className="text-xs text-stone-500" suppressHydrationWarning>
      {greeting}, {userName} ✦
    </p>
  );
}

