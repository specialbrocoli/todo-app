import React, { useState, useEffect } from 'react';
import { Search, Plus, Sun, Moon, Github, MoreVertical, GripVertical } from 'lucide-react';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  // Default tasks
  const defaultTasks = {
    todo: [
      {
        id: 1,
        title: 'Design email templates',
        description: 'Create responsive email templates for marketing campaigns and newsletters',
        priority: 'High',
        tags: ['design', 'email', 'templates']
      },
      {
        id: 2,
        title: 'Design mobile app mockups',
        description: 'Create wireframes and high-fidelity mockups for mobile application',
        priority: 'High',
        tags: ['mobile', 'UX/UI']
      },
      {
        id: 3,
        title: 'Implement user dashboard',
        description: 'Create a responsive dashboard for user analytics',
        priority: 'Medium',
        tags: ['UI', 'dashboard']
      },
      {
        id: 4,
        title: 'Implement real-time notifications',
        description: 'Add WebSocket support for live notifications',
        priority: 'Low',
        tags: ['backend', 'websocket']
      }
    ],
    inProgress: [
      {
        id: 5,
        title: 'Design loading animations',
        description: 'Create engaging loading animations and micro-interactions for better UX',
        priority: 'High',
        tags: ['design', 'animations', 'UX']
      },
      {
        id: 6,
        title: 'Security audit and penetration testing',
        description: 'Conduct comprehensive security review and vulnerability assessment',
        priority: 'High',
        tags: ['security', 'audit', 'testing']
      },
      {
        id: 7,
        title: 'Fix login authentication bug',
        description: 'Users are unable to login with Google OAuth',
        priority: 'High',
        tags: ['bug', 'authentication', 'urgent']
      },
      {
        id: 8,
        title: 'Add multi-language support',
        description: 'Implement internationalization for multiple languages',
        priority: 'Medium',
        tags: ['i18n', 'localization']
      }
    ],
    done: [
      {
        id: 9,
        title: 'Design error page layouts',
        description: 'Design custom 404 and error page layouts with brand navigation',
        priority: 'Medium',
        tags: ['error-pages', 'layout']
      },
      {
        id: 10,
        title: 'Optimize database queries',
        description: 'Improve performance of slow database operations',
        priority: 'High',
        tags: ['performance', 'database', 'optimization']
      },
      {
        id: 11,
        title: 'Write API documentation',
        description: 'Document all REST API endpoints',
        priority: 'Medium',
        tags: ['documentation', 'API']
      },
      {
        id: 12,
        title: 'Refactor legacy codebase',
        description: 'Clean up and modernize old code components',
        priority: 'Low',
        tags: ['refactor', 'cleanup']
      }
    ]
  };

  // Load tasks from localStorage or use defaults
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('kanbanTasks');
      return saved ? JSON.parse(saved) : defaultTasks;
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return defaultTasks;
    }
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    tags: []
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [activeColumn, setActiveColumn] = useState('');

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [tasks]);

  // Load and save dark mode preference
  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('kanbanDarkMode');
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kanbanDarkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  }, [darkMode]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-pink-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getColumnCount = (column) => {
    return tasks[column]?.length || 0;
  };

  const getProgressPercentage = () => {
    const totalTasks = Object.values(tasks).flat().length;
    const doneTasks = tasks.done.length;
    return totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  };

  const filteredTasks = (column) => {
    if (!searchTerm) return tasks[column] || [];
    return (tasks[column] || []).filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: Date.now(),
      ...newTask,
      tags: newTask.tags.filter(tag => tag.trim())
    };
    
    setTasks(prev => ({
      ...prev,
      [activeColumn]: [...(prev[activeColumn] || []), task]
    }));
    
    setNewTask({ title: '', description: '', priority: 'Medium', tags: [] });
    setShowAddTask(false);
    setActiveColumn('');
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    const task = tasks[fromColumn].find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== taskId),
      [toColumn]: [...prev[toColumn], task]
    }));
  };

  const deleteTask = (taskId, column) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== taskId)
    }));
  };

  // Enhanced Drag and Drop functions with smooth animations
  const handleDragStart = (e, task, column) => {
    setDraggedTask(task);
    setDraggedFrom(column);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);
    
    // Clean up drag image after a brief delay
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = (e) => {
    // Only clear drag over if we're actually leaving the column area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedFrom && draggedFrom !== targetColumn) {
      moveTask(draggedTask.id, draggedFrom, targetColumn);
    }
    
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedFrom(null);
    setDragOverColumn(null);
  };

  const TaskCard = ({ task, column }) => {
    const isDragging = draggedTask?.id === task.id;
    
    return (
      <div 
        draggable
        onDragStart={(e) => handleDragStart(e, task, column)}
        onDragEnd={handleDragEnd}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 mb-3 group hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing ${
          isDragging ? 'opacity-50 scale-95 rotate-2 shadow-2xl ring-2 ring-blue-400' : 'hover:scale-[1.02] hover:-translate-y-1'
        }`}
        style={{
          transform: isDragging ? 'rotate(5deg) scale(0.95)' : '',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-2 flex-1">
            <GripVertical size={16} className={`mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-2 flex-1`}>
              {task.title}
            </h3>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button className={`p-1 rounded hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <MoreVertical size={14} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>
        
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 line-clamp-2 ml-6`}>
          {task.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3 ml-6">
          {task.tags.map((tag, index) => (
            <span key={index} className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex justify-between items-center ml-6">
          <span className={`text-xs px-2 py-1 rounded-full text-white ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {column !== 'todo' && (
              <button
                onClick={() => moveTask(task.id, column, column === 'inProgress' ? 'todo' : 'inProgress')}
                className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
              >
                ←
              </button>
            )}
            {column !== 'done' && (
              <button
                onClick={() => moveTask(task.id, column, column === 'todo' ? 'inProgress' : 'done')}
                className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
              >
                →
              </button>
            )}
            <button
              onClick={() => deleteTask(task.id, column)}
              className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, column, count }) => {
    const isDropTarget = dragOverColumn === column && draggedFrom !== column;
    
    return (
      <div 
        className="flex-1 min-w-full lg:min-w-80"
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, column)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} transition-all ${
              isDropTarget ? 'ring-2 ring-blue-400 bg-blue-100 text-blue-800' : ''
            }`}>
              {count}
            </span>
          </div>
          <button
            onClick={() => {
              setActiveColumn(column);
              setShowAddTask(true);
            }}
            className={`p-1 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors hover:scale-110`}
          >
            <Plus size={16} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>
        </div>
        
        <div 
          className={`space-y-3 max-h-[calc(100vh-300px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto min-h-[200px] rounded-xl p-3 transition-all duration-300 ${
            isDropTarget ? 
              (darkMode ? 'bg-blue-900/20 border-2 border-dashed border-blue-400 shadow-lg' : 'bg-blue-50 border-2 border-dashed border-blue-400 shadow-lg') :
              (darkMode ? 'bg-gray-800/30' : 'bg-gray-50/50')
          }`}
          style={{
            transform: isDropTarget ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
        >
          {filteredTasks(column).map(task => (
            <TaskCard key={task.id} task={task} column={column} />
          ))}
          {filteredTasks(column).length === 0 && (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-all duration-300`}>
              {searchTerm ? (
                <div>
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No matching tasks</p>
                </div>
              ) : (
                <div>
                  <Plus size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No tasks yet</p>
                  <p className="text-xs mt-1">Drag tasks here or click + to add</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 lg:px-6 py-4 backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="flex items-center gap-2">
              <Github className={`w-6 h-6 lg:w-8 lg:h-8 ${darkMode ? 'text-white' : 'text-gray-900'} transition-transform hover:scale-110`} />
              <span className={`text-lg lg:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Todo Board
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-200 hover:scale-110`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className={`w-full lg:w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b lg:border-b-0 lg:border-r p-4 lg:min-h-[calc(100vh-80px)]`}>
          <div className="mb-6">
            <div className="relative">
              <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors`} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
              />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Overall Progress
              </h3>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getProgressPercentage()}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {tasks.done.length} completed
              </span>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {Object.values(tasks).flat().length} total
              </span>
            </div>
          </div>

          {/* Enhanced Drag & Drop Instructions */}
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'} mb-4`}>
            <div className="flex items-center gap-2 mb-2">
              <GripVertical size={16} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
              <p className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Drag & Drop
              </p>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-blue-600'}`}>
              Drag tasks between columns or use arrow buttons. Data persists automatically!
            </p>
          </div>
        </div>

        {/* Task Board */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:overflow-x-auto lg:pb-4">
            <Column 
              title="To Do" 
              column="todo" 
              count={getColumnCount('todo')} 
            />
            <Column 
              title="In Progress" 
              column="inProgress" 
              count={getColumnCount('inProgress')} 
            />
            <Column 
              title="Done" 
              column="done" 
              count={getColumnCount('done')} 
            />
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Task
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  placeholder="Enter task title..."
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  rows="3"
                  placeholder="Enter task description..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setNewTask({...newTask, tags: e.target.value.split(',').map(tag => tag.trim())})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                    placeholder="design, urgent..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={addTask}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowAddTask(false);
                  setActiveColumn('');
                  setNewTask({ title: '', description: '', priority: 'Medium', tags: [] });
                }}
                className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;