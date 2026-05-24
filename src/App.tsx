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
  const [workspaceRoot, setWorkspaceRoot] = useState<string>(() => {
    return localStorage.getItem("workspaceRoot") || "";
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
    if (!workspaceRoot) return;
    setIsScanning(true);
    try {
      const detectedProjects = await scanWorkspace(workspaceRoot);
      setProjects(detectedProjects);
      if (detectedProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(detectedProjects[0].id);
      }
    } catch (error) {
      console.error("Failed to scan workspace", error);
    } finally {
      setIsScanning(false);
    }
  }, [workspaceRoot, selectedProjectId]);

  useEffect(() => {
    if (workspaceRoot) {
      handleRefresh();
      localStorage.setItem("workspaceRoot", workspaceRoot);
    }
  }, [workspaceRoot, handleRefresh]);

  const handleSelectWorkspace = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === "string") {
      setWorkspaceRoot(selected);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (!workspaceRoot) {
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
          workspaceRoot={workspaceRoot}
          onWorkspaceRootChange={setWorkspaceRoot}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
