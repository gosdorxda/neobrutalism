"use client";

import { createContext, useContext, ReactNode } from "react";

type ProjectNameContextValue = {
  projectName: string;
  tokenSymbol: string;
  projectLogo: string;
};

const ProjectNameContext = createContext<ProjectNameContextValue>({
  projectName: "CATFUND",
  tokenSymbol: "CATFUND",
  projectLogo: "",
});

export function ProjectNameProvider({
  children,
  initialProjectName = "CATFUND",
  initialProjectLogo = "",
}: {
  children: ReactNode;
  initialProjectName?: string;
  initialProjectLogo?: string;
}) {
  const projectName = initialProjectName.trim() || "CATFUND";
  const tokenSymbol = projectName;
  const projectLogo = initialProjectLogo.trim();

  return (
    <ProjectNameContext.Provider value={{ projectName, tokenSymbol, projectLogo }}>
      {children}
    </ProjectNameContext.Provider>
  );
}

export function useProjectName() {
  return useContext(ProjectNameContext);
}
