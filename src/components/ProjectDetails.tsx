import React from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../types';
import { CommandLog } from '../hooks/useCommandExecutor';
import LogViewer from './LogViewer';

interface ProjectDetailsProps {
  project: Project;
  logs: CommandLog[];
  isRunning: boolean;
  runningCommand?: string;
  onRunCommand: (name: string, args: string[]) => void;
  onStopCommand: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  logs,
  isRunning,
  runningCommand,
  onRunCommand,
  onStopCommand,
}) => {
  const { t } = useTranslation();

  const handleInstall = () => {
    const cmd = project.packageManager;
    const args = cmd === 'yarn' ? [] : ['install'];
    onRunCommand(cmd, args);
  };

  const handleRunScript = (scriptName: string) => {
    onRunCommand(project.packageManager, ['run', scriptName]);
  };

  return (
    <div className="project-details">
      <div className="project-info-header">
        <h1>{project.name}</h1>
        <p className="project-path">{project.path}</p>
        <div className="project-meta">
          <span className="badge">{project.packageManager}</span>
        </div>
      </div>

      <div className="actions-bar">
        <button
          className="install-button"
          onClick={handleInstall}
          disabled={isRunning}
        >
          {t('install')}
        </button>
        {Object.keys(project.scripts).map((scriptName) => (
          <button
            key={scriptName}
            onClick={() => handleRunScript(scriptName)}
            disabled={isRunning}
            title={project.scripts[scriptName]}
          >
            {scriptName}
          </button>
        ))}
      </div>

      {isRunning && (
        <div className="running-indicator">
          <span>{t('running')} <code>{runningCommand}</code></span>
          <button className="stop-button" onClick={onStopCommand}>
            {t('stop')}
          </button>
        </div>
      )}

      <LogViewer logs={logs} />
    </div>
  );
};

export default ProjectDetails;
