import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import { Project } from "./types";
import { scanWorkspace } from "./utils/scanner";
import { useCommandExecutor } from "./hooks/useCommandExecutor";
import Sidebar from "./components/Sidebar";
import ProjectDetails from "./components/ProjectDetails";
import Settings from "./components/Settings";

function App() {
  const { t } = useTranslation();
  const [workspaceRoots, setWorkspaceRoots] = useState<string[]>(() => {
    const saved = localStorage.getItem("workspaceRoots");
    return saved ? JSON.parse(saved) : [];
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const {
    logs,
    runningProcesses,
    runningCommands,
    runCommand,
    stopCommand,
  } = useCommandExecutor();

  const handleRefresh = useCallback(async () => {
    if (workspaceRoots.length === 0) {
      setProjects([]);
      return;
    }
    setIsScanning(true);
    try {
      const allDetectedProjects: Project[] = [];
      for (const root of workspaceRoots) {
        const detected = await scanWorkspace(root);
        allDetectedProjects.push(...detected);
      }

      // Filter out duplicate paths (just in case)
      const uniqueProjects = allDetectedProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id)
      );

      setProjects(uniqueProjects);
      if (uniqueProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(uniqueProjects[0].id);
      }
    } catch (error) {
      console.error("Failed to scan workspaces", error);
    } finally {
      setIsScanning(false);
    }
  }, [workspaceRoots, selectedProjectId]);

  useEffect(() => {
    handleRefresh();
    localStorage.setItem("workspaceRoots", JSON.stringify(workspaceRoots));
  }, [workspaceRoots, handleRefresh]);

  const handleSelectWorkspace = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === "string") {
      if (!workspaceRoots.includes(selected)) {
        setWorkspaceRoots((prev) => [...prev, selected]);
      }
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (workspaceRoots.length === 0) {
    return (
      <div className="empty-state">
        <h1>Tauri Workspace Launcher</h1>
        <button onClick={handleSelectWorkspace} className="primary-button">
          {t("selectWorkspace")}
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onRefresh={handleRefresh}
        onOpenSettings={() => setShowSettings(true)}
      />
      <main className="main-content">
        {selectedProject ? (
          <ProjectDetails
            project={selectedProject}
            logs={logs[selectedProject.id] || []}
            isRunning={!!runningProcesses[selectedProject.id]}
            runningCommand={runningCommands[selectedProject.id]}
            onRunCommand={(program, args) =>
              runCommand(selectedProject.id, selectedProject.path, program, args)
            }
            onStopCommand={() => stopCommand(selectedProject.id)}
          />
        ) : (
          <div className="no-selection">
            {projects.length > 0 ? (
              <p>{t("selectAProject")}</p>
            ) : isScanning ? (
              <p>Scanning...</p>
            ) : (
              <p>{t("noProjectsFound")}</p>
            )}
          </div>
        )}
      </main>

      {showSettings && (
        <Settings
          workspaceRoots={workspaceRoots}
          onWorkspaceRootsChange={setWorkspaceRoots}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
