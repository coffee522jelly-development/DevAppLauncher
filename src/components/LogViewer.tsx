import React, { useEffect, useRef } from 'react';
import { CommandLog } from '../hooks/useCommandExecutor';

interface LogViewerProps {
  logs: CommandLog[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="log-viewer">
      {logs.map((log, index) => (
        <div key={index} className={`log-entry ${log.type}`}>
          <span className="log-timestamp">[{log.timestamp}]</span>
          <span className="log-content">{log.content}</span>
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default LogViewer;
