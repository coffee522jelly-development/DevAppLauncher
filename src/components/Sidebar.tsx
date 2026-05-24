import React from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject: (id: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onRefresh,
  onOpenSettings,
}) => {
  const { t } = useTranslation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>{t('projects')}</h2>
        <button onClick={onRefresh} title={t('refreshProjects')}>
          🔄
        </button>
      </div>
      <div className="project-list">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`project-item ${selectedProjectId === project.id ? 'selected' : ''}`}
            onClick={() => onSelectProject(project.id)}
          >
            <span className="project-icon">📁</span>
            <span className="project-name">{project.name}</span>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <button onClick={onOpenSettings} className="settings-button">
          ⚙️ {t('settings')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
