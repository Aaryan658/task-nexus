import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ quantumTasks, onPurge, onToggleNexus }) {
  if (quantumTasks === null) {
    return <div className="loading">Nexus Syncing...</div>;
  }

  if (!Array.isArray(quantumTasks) || quantumTasks.length === 0) {
    return <div className="empty">No tasks yet.</div>;
  }

  return (
    <div className="task-list">
      {quantumTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onPurge}
          onToggle={onToggleNexus}
        />
      ))}
    </div>
  );
}
