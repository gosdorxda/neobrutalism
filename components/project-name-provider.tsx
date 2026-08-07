"use client";

import { createContext, useContext, ReactNode } from "react";

type ProjectNameContextValue = {
  projectName: string;
  tokenSymbol: string;
};

const ProjectNameContext = createContext<ProjectNameContextValue>({
  projectName: "CATFUND",
  tokenSymbol: "$CATFUND",
});

export function ProjectNameProvider({
  children,
  initialProjectName = "CATFUND",
}: {
  children: ReactNode;
  initialProjectName?: string;
}) {
  const projectName = initialProjectName.trim() || "CATFUND";
  const tokenSymbol = `$${projectName}`;

  return (
    <ProjectNameContext.Provider value={{ projectName, tokenSymbol }}>
      {children}
    </ProjectNameContext.Provider>
  );
}

export function useProjectName() {
  return useContext(ProjectNameContext);
}
