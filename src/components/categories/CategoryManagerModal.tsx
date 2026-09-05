import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  FolderPlus, 
  CheckCircle2, 
  ListTodo, 
  Layers, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CategoryManagerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose }) => {
  const { 
    data, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    addProject, 
    deleteProject, 
    addTask, 
    toggleTask, 
    deleteTask 
  } = useApp();

  const categories = data.categories || [];
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || 'career');

  // Form states for new category
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🎯');
  const [catColor, setCatColor] = useState('#6366f1');
  const [catTarget, setCatTarget] = useState(20);

  // Form states for new project
  const [isCreatingProj, setIsCreatingProj] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');

  // Form states for new task
  const [taskInputs, setTaskInputs] = useState({});

  if (!isOpen) return null;

  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory({
      name: catName.trim(),
      icon: catIcon || '🎯',
      color: catColor,
      targetPercent: Number(catTarget) || 20
    });
    setCatName('');
    setIsCreatingCat(false);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projName.trim() || !activeCategory) return;
    addProject(activeCategory.id, {
      name: projName.trim(),
      description: projDesc.trim()
    });
    setProjName('');
    setProjDesc('');
    setIsCreatingProj(false);
  };

  const handleAddTask = (projId) => {
    const taskTitle = taskInputs[projId]?.trim();
    if (!taskTitle || !activeCategory) return;
    addTask(activeCategory.id, projId, { title: taskTitle, priority: 'high' });
    setTaskInputs((prev) => ({ ...prev, [projId]: '' }));
  };

  const emojiOptions = ['🕌', '📱', '👤', '💪', '💻', '🎨', '📚', '💰', '🧠', '🌿', '⚡', '🎯', '🚀', '⭐'];
  const colorOptions = ['#10b981', '#06b6d4', '#a855f7', '#f59e0b', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', maxHeight: '90vh', padding: '2rem' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Dynamic Pillars & Project Hierarchy</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Customize your life dimensions: Category &rarr; Projects &rarr; Tasks & Habits
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', minHeight: '450px' }}>
          {/* Left Column: Categories List */}
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Life Categories ({categories.length})
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsCreatingCat(!isCreatingCat)}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', gap: '0.2rem' }}
              >
                <Plus size={13} />
                <span>New</span>
              </button>
            </div>

            {/* Create Category Form */}
            {isCreatingCat && (
              <form onSubmit={handleCreateCategory} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', border: '1px solid var(--primary-light)' }}>
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    style={{ width: '40px', textAlign: 'center', padding: '0.2rem' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Category Name"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: c,
                        border: catColor === c ? '2px solid #fff' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsCreatingCat(false)} style={{ fontSize: '0.75rem' }}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>Add</button>
                </div>
              </form>
            )}

            {/* Categories list items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
              {categories.map((cat) => {
                const isSelected = cat.id === activeCategory?.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--bg-surface)' : 'transparent',
                      borderLeft: `3px solid ${cat.color || 'var(--primary)'}`,
                      borderRight: isSelected ? '1px solid var(--border-color)' : '1px solid transparent',
                      borderTop: isSelected ? '1px solid var(--border-color)' : '1px solid transparent',
                      borderBottom: isSelected ? '1px solid var(--border-color)' : '1px solid transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500 }}>{cat.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {(cat.projects || []).length} projects
                        </div>
                      </div>
                    </div>

                    {categories.length > 1 && (
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete category "${cat.name}" and its projects?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        style={{ color: '#ef4444', padding: '0.2rem' }}
                        title="Delete Category"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Projects & Tasks under Selected Category */}
          {activeCategory && (
            <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '550px' }}>
              {/* Category Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{activeCategory.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{activeCategory.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Projects, active work streams & actionable tasks
                    </p>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsCreatingProj(!isCreatingProj)}
                  style={{ gap: '0.35rem' }}
                >
                  <FolderPlus size={15} />
                  <span>New Project</span>
                </button>
              </div>

              {/* Create Project Form */}
              {isCreatingProj && (
                <form onSubmit={handleCreateProject} className="card" style={{ marginBottom: '1.25rem', border: '1px solid var(--primary-light)' }}>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem' }}>Create New Project in {activeCategory.name}</h5>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Project Name (e.g. ERP Invoicing Module)"
                      required
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Short description / goal"
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCreatingProj(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary btn-sm">Create Project</button>
                  </div>
                </form>
              )}

              {/* Projects List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(activeCategory.projects || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                    <Layers size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No projects inside {activeCategory.name} yet</p>
                    <p style={{ fontSize: '0.78rem' }}>Click "New Project" to organize goals into structured workflows</p>
                  </div>
                ) : (
                  (activeCategory.projects || []).map((proj) => (
                    <div
                      key={proj.id}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        borderLeft: `4px solid ${activeCategory.color || 'var(--primary)'}`
                      }}
                    >
                      {/* Project title row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>📁</span>
                            <span>{proj.name}</span>
                          </div>
                          {proj.description && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {proj.description}
                            </p>
                          )}
                        </div>

                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => deleteProject(activeCategory.id, proj.id)}
                          style={{ color: '#ef4444' }}
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Tasks under this project */}
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                          Actionable Tasks ({(proj.tasks || []).length})
                        </div>

                        {/* Task items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                          {(proj.tasks || []).map((task) => (
                            <div
                              key={task.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.45rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                background: task.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                                border: task.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-color-subtle)'
                              }}
                            >
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
                                onClick={() => toggleTask(activeCategory.id, proj.id, task.id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!task.completed}
                                  onChange={() => {}}
                                  style={{ accentColor: '#10b981', cursor: 'pointer' }}
                                />
                                <span style={{
                                  fontSize: '0.82rem',
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                  fontWeight: 500
                                }}>
                                  {task.title}
                                </span>
                              </div>

                              <button
                                className="btn btn-ghost btn-icon btn-sm"
                                onClick={() => deleteTask(activeCategory.id, proj.id, task.id)}
                                style={{ color: 'var(--text-muted)', padding: '0.15rem' }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Task Input */}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Add actionable task..."
                            value={taskInputs[proj.id] || ''}
                            onChange={(e) => setTaskInputs((prev) => ({ ...prev, [proj.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(proj.id); }}
                            style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                          />
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddTask(proj.id)}
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
