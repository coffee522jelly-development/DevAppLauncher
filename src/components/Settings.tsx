import React from 'react';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/plugin-dialog';

interface SettingsProps {
  workspaceRoots: string[];
  onWorkspaceRootsChange: (roots: string[]) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  workspaceRoots,
  onWorkspaceRootsChange,
  onClose,
}) => {
  const { t, i18n } = useTranslation();

  const handleAddWorkspace = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === 'string') {
      if (!workspaceRoots.includes(selected)) {
        onWorkspaceRootsChange([...workspaceRoots, selected]);
      }
    }
  };

  const handleRemoveWorkspace = (path: string) => {
    onWorkspaceRootsChange(workspaceRoots.filter((root) => root !== path));
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h3>{t('settings')}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="settings-body">
          <div className="setting-group">
            <label>{t('workspaceRoot')}</label>
            <div className="workspace-list">
              {workspaceRoots.map((root) => (
                <div key={root} className="workspace-item">
                  <span className="workspace-path" title={root}>{root}</span>
                  <button className="remove-btn" onClick={() => handleRemoveWorkspace(root)}>✕</button>
                </div>
              ))}
              <button className="add-workspace-btn" onClick={handleAddWorkspace}>
                + {t('selectWorkspace')}
              </button>
            </div>
          </div>
          <div className="setting-group">
            <label>{t('language')}</label>
            <select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
