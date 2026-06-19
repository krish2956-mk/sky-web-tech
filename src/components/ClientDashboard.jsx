import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Bell,
  TrendingUp,
  CircleDashed,
  Send,
  Home,
  Paperclip,
  Upload,
  UploadCloud,
  Plus,
  LayoutDashboard,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Clock,
  Loader2,
  X,
  FileText,
  Download,
  FileArchive,
  LogOut,
  Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// ─── Color tokens ───────────────────────────────────────────────
// accent: orange  →  #ea580c (dark) / #f97316 (mid) / #fb923c (light)
// background: beige → #FDFBF7
// ────────────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('progress');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'Client User';
  const userRole = localStorage.getItem('userRole') || 'Client';
  
  const getInitials = (name) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(userName);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/auth');
  };
  
  // ── Project & Chat State ──
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const projectDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [milestones, setMilestones] = useState([]);
  
  const [adminFiles, setAdminFiles] = useState([]);
  const [clientFiles, setClientFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState(null);

  const fetchProjectFiles = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/files/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(f => ({
          id: f.id,
          name: f.file_name,
          url: f.file_path,
          date: new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: 'File',
          type: f.file_name.split('.').pop().toLowerCase(),
          role: f.uploader_role,
        }));
        setAdminFiles(formatted.filter(f => f.role === 'Admin'));
        setClientFiles(formatted.filter(f => f.role === 'Client'));
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const clientFileInputRef = useRef(null);

  const handleClientFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      setPendingUploadFile(file);
    }
    if (clientFileInputRef.current) clientFileInputRef.current.value = '';
  };

  const confirmUpload = async () => {
    if (!pendingUploadFile || !activeProject) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', pendingUploadFile);

      const res = await fetch(`http://localhost:5000/api/files/project/${activeProject.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setPendingUploadFile(null);
        fetchProjectFiles(activeProject.id); // Refresh list
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setPendingUploadFile(null);
  };

  const handleClientFileDrop = (e) => {
    e.preventDefault();
    handleClientFileUpload(e);
  };
  
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  // Switch between projects — clears all per-project state
  const switchProject = (project) => {
    if (project.id === activeProject?.id) {
      setShowProjectDropdown(false);
      return;
    }
    setChatMessages([]);
    setMilestones([]);
    setAdminFiles([]);
    setClientFiles([]);
    setPendingUploadFile(null);
    setActiveProject(project);
    setShowProjectDropdown(false);
    setActiveTab('progress');
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) {
            setActiveProject(data[0]);
          } else {
            setActiveTab('details');
          }
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchMilestones = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/milestones/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMilestones(await res.json());
      }
    } catch (err) {
      console.error("Error fetching milestones:", err);
    }
  };

  // ── Socket & Real-time: separate effect keyed on activeProject ──
  useEffect(() => {
    if (!activeProject) return;

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Fetch messages history
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/messages/project/${activeProject.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(m => ({
            id: m.id,
            sender: m.sender_name === userName ? 'You' : m.sender_name,
            initials: getInitials(m.sender_name),
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: m.content,
            isOwn: m.sender_name === userName,
            attachment_url: m.attachment_url,
            attachment_name: m.attachment_name
          }));
          setChatMessages(formatted);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();

    // Fetch milestones & files
    fetchMilestones(activeProject.id);
    fetchProjectFiles(activeProject.id);

    // Set up socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join project room for chat
    newSocket.emit('join_project_room', activeProject.id);

    // Join client-specific room for notifications
    if (userId) {
      newSocket.emit('join_client_room', userId);
    }

    // Listen for new chat messages
    newSocket.on('new_message', (m) => {
      setChatMessages(prev => [...prev, {
        id: m.id,
        sender: m.sender_name === userName ? 'You' : m.sender_name,
        initials: getInitials(m.sender_name),
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: m.content,
        isOwn: m.sender_name === userName,
        attachment_url: m.attachment_url,
        attachment_name: m.attachment_name
      }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Listen for real-time milestone updates from admin
    newSocket.on('milestone_update', (m) => {
      setMilestones(prev => {
        const exists = prev.find(mx => mx.id === m.id);
        if (exists) return prev.map(mx => mx.id === m.id ? m : mx);
        return [...prev, m];
      });
    });

    // Listen for real-time file updates
    newSocket.on('file_uploaded', (data) => {
      if (String(data.projectId) === String(activeProject.id)) {
        fetchProjectFiles(activeProject.id);
      }
    });

    // Listen for project approval notification
    newSocket.on('request_approved', () => {
      fetch('http://localhost:5000/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(fetchedProjects => {
        setProjects(fetchedProjects);
        if (fetchedProjects.length > 0) {
          setActiveProject(fetchedProjects[0]);
          setActiveTab('progress');
        }
      });
    });

    return () => newSocket.close();
  }, [activeProject?.id, userName]);

  const handleSendMessage = async (customMessage = null, attachmentData = null) => {
    if (!activeProject) return;
    const textToSend = customMessage !== null ? customMessage : message.trim();
    if (!textToSend && !attachmentData) return;
    
    try {
      const token = localStorage.getItem('token');
      const payload = { content: textToSend };
      if (attachmentData) {
        payload.attachment_url = attachmentData.url;
        payload.attachment_name = attachmentData.name;
      }

      await fetch(`http://localhost:5000/api/messages/project/${activeProject.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (customMessage === null) setMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const chatFileInputRef = useRef(null);

  const handleChatAttachment = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`http://localhost:5000/api/files/project/${activeProject.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        await handleSendMessage(`Attached file: ${data.fileName}`, { url: data.filePath, name: data.fileName });
      }
    } catch (err) {
      console.error("Error uploading chat attachment:", err);
    }
  };

  const handleChatDrop = (e) => {
    e.preventDefault();
    handleChatAttachment(e);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // ── Form State ──
  const [formData, setFormData] = useState({ title: '', type: '', deadline: '', notes: '' });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({ file: f, title: f.name, description: '' }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({ file: f, title: f.name, description: '' }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const updateFile = (index, field, value) => {
    setFiles(files.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');

      // Build FormData to support file uploads
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.notes);
      fd.append('budget', formData.type);
      fd.append('deadline', formData.deadline);

      // Append each File object under the 'files' field
      const metaArray = files.map(f => ({ title: f.title, description: f.description }));
      files.forEach(f => fd.append('files', f.file));
      fd.append('attachmentsMeta', JSON.stringify(metaArray));

      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 
          // NOTE: Do NOT set Content-Type here; browser sets it with boundary for multipart
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });

      if (res.ok) {
        setShowSuccessToast(true);
        setFormData({ title: '', type: '', deadline: '', notes: '' });
        setFiles([]);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } else {
        const data = await res.json();
        console.error("Failed to submit request:", data.message);
      }
    } catch (err) {
      console.error("Error submitting request", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-screen w-full bg-[#FDFBF7] text-slate-900 font-sans overflow-hidden selection:bg-orange-200 selection:text-orange-900 relative"
    >
      {/* Background — soft warm beige gradient */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 0% 0%, rgba(251,146,60,0.08) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(234,88,12,0.04) 0%, transparent 50%)'
        }}
      />

      {/* ── TOP NAVBAR ── */}
      <header className="relative z-20 shrink-0 px-8 h-16 flex items-center justify-between bg-white/70 backdrop-blur-2xl border-b border-slate-200">
        
        {/* Left: Logo + Project Switcher + Pill Tabs */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-slate-200">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}
            >S</div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">SkyWebTech</span>
          </div>

          {/* ── Project Switcher Dropdown ── */}
          {projects.length > 0 && (
            <div className="relative" ref={projectDropdownRef}>
              <button
                onClick={() => setShowProjectDropdown(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all group max-w-[220px]"
              >
                <Briefcase className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-xs font-bold text-orange-700 truncate">
                  {activeProject?.title || 'Select Project'}
                </span>
                {projects.length > 1 && (
                  <div className="flex items-center gap-1 ml-1 shrink-0">
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-100 rounded-full px-1.5 py-0.5">
                      {projects.length}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-orange-500 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>

              <AnimatePresence>
                {showProjectDropdown && projects.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Projects</p>
                    </div>
                    <div className="py-2 max-h-64 overflow-y-auto">
                      {projects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => switchProject(p)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                            activeProject?.id === p.id ? 'bg-orange-50' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            activeProject?.id === p.id
                              ? 'bg-orange-500'
                              : 'bg-slate-100'
                          }`}>
                            <Briefcase className={`w-4 h-4 ${
                              activeProject?.id === p.id ? 'text-white' : 'text-slate-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${
                              activeProject?.id === p.id ? 'text-orange-700' : 'text-slate-900'
                            }`}>{p.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {p.status || 'Active'}
                              {p.end_date ? ` · Due ${new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                            </p>
                          </div>
                          {activeProject?.id === p.id && (
                            <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Pill Tab Switcher */}
          <div className="flex items-center bg-slate-100/50 rounded-xl p-1 border border-slate-200/60 gap-1">
            {[
              { key: 'progress', label: 'Project Progress', Icon: LayoutDashboard },
              { key: 'files', label: 'Files & Deliverables', Icon: FileText },
              { key: 'details', label: 'Add Project Details', Icon: FolderPlus },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              >
                {activeTab === key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg shadow-sm"
                    style={{
                      background: 'white',
                      border: '1px solid rgba(226,232,240,0.8)',
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <Icon className={`relative z-10 w-3.5 h-3.5 transition-colors ${activeTab === key ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className={`relative z-10 transition-colors ${activeTab === key ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link 
            to="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-xs font-medium bg-slate-100/50 hover:bg-slate-200/50 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>

          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100/50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-all">
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ background: '#f97316', boxShadow: '0 0 5px rgba(249,115,22,0.5)' }}
            />
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div
              className="w-7 h-7 rounded-full p-[1.5px] shadow-sm shadow-orange-500/20"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #fcd34d)',
              }}
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] text-slate-800 font-bold">{initials}</div>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-900 leading-none mb-0.5">{userName}</p>
              <p className="text-[10px] text-slate-500">{userRole}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── TAB 1: PROJECT PROGRESS ── */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="p-8 md:px-10 md:py-8 max-w-[1400px] mx-auto space-y-7"
            >
              {/* Page Header — real data from activeProject */}
              {(() => {
                const completedCount = milestones.filter(m => m.status === 'Completed').length;
                const totalCount = milestones.length;
                const getLogicalPct = (m) => m.status === 'Completed' ? 100 : (m.status === 'Pending' ? 0 : (m.completion_percentage || 0));
                const overallPct = totalCount > 0
                  ? Math.round(milestones.reduce((sum, m) => sum + getLogicalPct(m), 0) / totalCount)
                  : (activeProject?.progress || 0);
                const deadlineDate = activeProject?.end_date ? new Date(activeProject.end_date) : null;
                const daysRemaining = deadlineDate
                  ? Math.max(0, Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)))
                  : null;
                const deadlineLabel = deadlineDate
                  ? deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—';
                const remaining = totalCount - completedCount;

                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-orange-600 text-xs font-bold mb-2 uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" /> Active Project
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{activeProject?.title || 'Your Project'}</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">{activeProject?.description || 'Project in progress'}</p>
                      </div>
                      {daysRemaining !== null && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white shadow-sm px-3 py-2 rounded-xl border border-slate-200">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-orange-600 font-bold">{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</span>&nbsp;remaining
                        </div>
                      )}
                    </div>

                    {/* Metric Cards — all live data */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Progress */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                        className="relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between text-white shadow-lg shadow-orange-500/10"
                        style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' }}
                      >
                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-orange-100 text-[11px] font-bold uppercase tracking-widest mb-3">Overall Progress</p>
                          <p className="text-5xl font-extrabold tracking-tighter">{overallPct}%</p>
                        </div>
                        <div className="mt-4">
                          <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Milestones */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Milestones</p>
                        <div>
                          <p className="text-4xl font-extrabold tracking-tighter text-slate-900">{completedCount}<span className="text-2xl text-slate-300 font-semibold">/{totalCount}</span></p>
                          <p className="text-slate-500 text-sm mt-2 font-medium">{remaining} remaining to complete</p>
                        </div>
                        <div className="mt-4 flex gap-1.5">
                          {totalCount > 0 ? milestones.map((m, i) => (
                            <div key={m.id} className="h-1.5 flex-1 rounded-full" style={{ background: m.status === 'Completed' ? '#f97316' : '#f1f5f9' }} />
                          )) : <div className="h-1.5 flex-1 rounded-full bg-slate-100" />}
                        </div>
                      </motion.div>

                      {/* Deadline */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.16 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
                      >
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">Deadline</p>
                        <div>
                          <p className="text-4xl font-extrabold tracking-tighter text-slate-900">{deadlineLabel}</p>
                          <p className="text-slate-500 text-sm mt-2 font-medium">{activeProject?.status || 'Active'}</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg w-fit border border-green-100">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-green-700 text-xs font-bold">On Track</span>
                        </div>
                      </motion.div>
                    </div>
                  </>
                );
              })()}

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Milestones Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col overflow-hidden"
                  style={{ height: '460px' }}
                >
                  <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <h3 className="text-base font-bold tracking-tight text-slate-900">Project Milestones</h3>
                    <button className="flex items-center gap-1 text-xs font-bold transition-colors hover:text-orange-700" style={{ color: '#ea580c' }}>
                      Full Timeline <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">
                    {milestones.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-10">No milestones yet.</p>
                    ) : (
                      milestones.map((m, index) => {
                        const isDone = m.status === 'Completed';
                        const isActive = m.status === 'In Progress' || m.status === 'Review';
                        const isQueued = m.status === 'Pending';
                        const isLast = index === milestones.length - 1;

                        return (
                          <div key={m.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              {isDone && (
                                <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                </div>
                              )}
                              {isActive && (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-orange-50 shadow-sm shadow-orange-500/20"
                                  style={{ borderColor: '#f97316' }}
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.8 }}
                                    className="w-2.5 h-2.5 rounded-full shadow-md shadow-orange-500/50"
                                    style={{ background: '#ea580c' }}
                                  />
                                </div>
                              )}
                              {isQueued && (
                                <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                                  <CircleDashed className="w-4 h-4 text-slate-400" />
                                </div>
                              )}

                              {!isLast && (
                                <div className={`w-px flex-1 my-2 ${isDone ? 'bg-gradient-to-b from-green-300 to-slate-200' : 'bg-slate-200'}`} />
                              )}
                            </div>
                            <div className="pb-4 flex-1">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                                <span
                                  className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                                    isDone ? 'text-green-700 bg-green-100 border-green-200' : 
                                    isActive ? 'text-orange-700 bg-orange-50 border-orange-200' : 
                                    'text-slate-500 bg-slate-100 border-slate-200'
                                  }`}
                                >{m.status}</span>
                              </div>
                              {isActive && (
                                <div className="flex items-center gap-3 mt-3">
                                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden inset-shadow-sm">
                                    <motion.div
                                      initial={{ width: 0 }} animate={{ width: `${m.completion_percentage || 0}%` }} transition={{ duration: 1.5 }}
                                      className="h-full rounded-full shadow-sm"
                                      style={{ background: 'linear-gradient(90deg, #f97316, #fb923c)' }}
                                    />
                                  </div>
                                  <span className="text-[11px] text-slate-600 font-bold">{m.completion_percentage || 0}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>

                {/* Chat Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col overflow-hidden"
                  style={{ height: '460px' }}
                >
                  <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-slate-50/50">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-base font-bold tracking-tight text-slate-900">Project Chat</h3>
                    <span className="ml-auto text-[10px] text-slate-500 bg-white shadow-sm px-2.5 py-1 rounded-full border border-slate-200 font-bold tracking-wide">SkyWebTech Team</span>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#FDFBF7]/30">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex gap-3 items-start ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                        <div
                          className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.isOwn ? 'text-slate-800 shadow-sm border border-slate-200 bg-white' : 'text-white shadow-md shadow-orange-500/20'}`}
                          style={!msg.isOwn ? { background: 'linear-gradient(135deg, #ea580c, #f97316)' } : {}}
                        >
                          {msg.initials}
                        </div>
                        <div className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                          <p className={`text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider ${msg.isOwn ? 'mr-1' : 'ml-1'}`}>{msg.sender} · {msg.time}</p>
                          <div className={`rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed max-w-[220px] ${msg.isOwn ? 'rounded-tr-none text-white' : 'rounded-tl-none bg-white border border-slate-200 text-slate-700'}`} style={msg.isOwn ? { background: 'linear-gradient(135deg, #ea580c, #f97316)' } : {}}>
                            {msg.text}
                            {msg.attachment_url && (
                              <a href={`http://localhost:5000${msg.attachment_url}`} target="_blank" rel="noreferrer" className={`mt-2 flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-colors ${msg.isOwn ? 'bg-orange-500/50 hover:bg-orange-500 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'}`}>
                                <FileText className="w-4 h-4 shrink-0" />
                                <span className="truncate">{msg.attachment_name}</span>
                                <Download className="w-3 h-3 shrink-0 ml-auto opacity-70" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-col gap-2">
                    <div 
                      onDrop={handleChatDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2 justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                      onClick={() => chatFileInputRef.current?.click()}
                    >
                      <UploadCloud className="w-4 h-4 text-orange-500" />
                      <span>Drag & drop files to attach to chat</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                      <input type="file" ref={chatFileInputRef} onChange={handleChatAttachment} className="hidden" />
                      <button onClick={() => chatFileInputRef.current?.click()} className="text-slate-400 hover:text-orange-500 transition-colors p-1" title="Attach file">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyPress} placeholder="Message project team..." className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none" />
                      <button onClick={() => handleSendMessage()} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm" style={message ? { background: '#ea580c' } : { background: '#cbd5e1' }}>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-2 ml-1">Paperclip to attach files · images, PDFs, zips</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── TAB 2: FILES & DELIVERABLES ── */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="p-8 md:px-10 md:py-8 max-w-[1400px] mx-auto space-y-7"
            >
              {/* Page Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-orange-600 text-xs font-bold mb-2 uppercase tracking-widest">
                    <FileText className="w-3.5 h-3.5" /> Project Assets
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Files & Deliverables</h1>
                  <p className="text-slate-500 text-sm mt-1 font-medium">Manage deliverables from SkyWebTech and upload your own assets.</p>
                </div>
              </div>

              {/* The clean white card */}
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Column 1: Deliverables (From SkyWebTech) */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-100 p-8 md:p-10">
                  <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">Deliverables (From SkyWebTech)</h2>
                  
                  <div className="space-y-3">
                    {adminFiles.length === 0 && <p className="text-sm text-slate-500 py-4">No deliverables uploaded yet.</p>}
                    {adminFiles.map((f, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 bg-slate-50/50 hover:bg-orange-50/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4 overflow-hidden">
                           <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 group-hover:border-orange-200 transition-colors">
                             {f.type === 'zip' ? <FileArchive className="w-5 h-5 text-orange-500" /> : <FileText className="w-5 h-5 text-orange-500" />}
                           </div>
                           <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">{f.name}</p>
                             <div className="flex items-center gap-3 mt-0.5">
                               <p className="text-[11px] font-medium text-slate-500">{f.date}</p>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <p className="text-[11px] font-medium text-slate-500">{f.size}</p>
                             </div>
                           </div>
                        </div>
                        <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-100 transition-colors shrink-0">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Client Assets */}
                <div className="flex-1 p-8 md:p-10 bg-[#FDFBF7]/50">
                  <h2 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">Client Assets (Uploaded by You)</h2>
                  
                  {/* Drag & Drop Zone */}
                  {!pendingUploadFile ? (
                    <label 
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleClientFileDrop}
                      className="mb-6 block border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group hover:bg-orange-50/50 hover:border-orange-400 transition-all"
                    >
                       <input type="file" ref={clientFileInputRef} onChange={handleClientFileUpload} className="hidden" />
                       <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-100 transition-colors">
                         <Upload className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                       </div>
                       <div className="text-center">
                         <p className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Drag & Drop files here</p>
                         <p className="text-[11px] font-medium text-slate-500 mt-0.5">or click to browse from your computer</p>
                       </div>
                    </label>
                  ) : (
                    <div className="mb-6 bg-white border border-orange-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{pendingUploadFile.name}</p>
                          <p className="text-[11px] font-medium text-slate-500">{(pendingUploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full mt-2">
                        <button 
                          onClick={cancelUpload}
                          disabled={isUploading}
                          className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={confirmUpload}
                          disabled={isUploading}
                          className="flex-1 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                          Confirm Upload
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploaded List */}
                  <div className="space-y-3">
                    {clientFiles.length === 0 && !pendingUploadFile && <p className="text-sm text-slate-500 py-4 text-center">No assets uploaded yet.</p>}
                    {clientFiles.map((f, i) => (
                      <div key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-orange-300 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                             {f.type === 'zip' ? <FileArchive className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition-colors" /> : <FileText className="w-5 h-5 text-slate-500 group-hover:text-orange-500 transition-colors" />}
                           </div>
                           <div className="min-w-0">
                             <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 truncate hover:text-orange-500 transition-colors block">{f.name}</a>
                             <div className="flex items-center gap-3 mt-0.5">
                               <p className="text-[11px] font-medium text-slate-500">{f.date}</p>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <p className="text-[11px] font-medium text-slate-500">{f.size}</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB 3: ADD PROJECT DETAILS ── */}
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="p-8 md:px-10 md:py-8 max-w-3xl mx-auto"
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 text-orange-600 text-xs font-bold mb-2 uppercase tracking-widest">
                  <FolderPlus className="w-3.5 h-3.5" /> Submit to Team
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Project Details</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Share requirements, credentials, or brand assets with the SkyWebTech team.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
                  <h3 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">Requirement Details</h3>
                  <div className="space-y-5">
                    
                    {/* Project Type Dropdown */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Project Type</label>
                      <select
                        required
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-medium focus:outline-none transition-all shadow-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="" disabled>Select project type...</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Title</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none transition-all shadow-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          placeholder="e.g., Stripe API Keys, Logo Files…"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Target Deadline</label>
                        <input
                          type="date"
                          required
                          value={formData.deadline}
                          onChange={e => setFormData({...formData, deadline: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-medium focus:outline-none transition-all shadow-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-2 uppercase tracking-wider">Notes / Description</label>
                      <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none transition-all resize-none shadow-sm focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        placeholder="Describe the requirement or paste credentials here…"
                      />
                    </div>
                  </div>
                </div>

                {/* Drop Zone & Previews */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                  <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest px-2">Attachments</h3>
                  
                  <label
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="block bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all hover:bg-[#fff7ed] hover:border-orange-400"
                  >
                    <input type="file" multiple className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-100 transition-colors shadow-sm">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 group-hover:text-orange-600 transition-colors font-bold">Drop files here or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">PDF, PNG, JPG, ZIP, Figma · up to 50 MB each</p>
                    </div>
                  </label>

                  {/* File Previews List */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {files.map((fileObj, i) => (
                        <motion.div 
                          key={`${fileObj.file.name}-${i}`}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="flex flex-col bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                                 <FileText className="w-5 h-5 text-orange-500" />
                              </div>
                              <div className="flex-1 min-w-0 pr-4">
                                 <input
                                   type="text"
                                   value={fileObj.title}
                                   onChange={(e) => updateFile(i, 'title', e.target.value)}
                                   className="w-full text-sm font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-orange-400 focus:outline-none transition-colors py-0.5 bg-transparent"
                                   placeholder="File Title"
                                 />
                                 <p className="text-[10px] font-medium text-slate-500 mt-0.5">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeFile(i)} 
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0 mt-0.5"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
                            <textarea
                              value={fileObj.description}
                              onChange={(e) => updateFile(i, 'description', e.target.value)}
                              placeholder="Add a description or note for this file..."
                              rows={2}
                              className="w-full text-xs text-slate-700 bg-transparent border-none p-2 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-white rounded-md transition-all resize-none placeholder-slate-400"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #ea580c, #f97316)',
                    boxShadow: '0 4px 20px rgba(234,88,12,0.25)'
                  }}
                  onMouseEnter={e => !isSubmitting && (e.currentTarget.style.boxShadow = '0 6px 25px rgba(234,88,12,0.4)')}
                  onMouseLeave={e => !isSubmitting && (e.currentTarget.style.boxShadow = '0 4px 20px rgba(234,88,12,0.25)')}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Project Details...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Submit to SkyWebTech Team</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── SUCCESS TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-2xl shadow-green-500/20 rounded-xl p-4 pr-6"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Project requirements submitted successfully!</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">The SkyWebTech team has been notified.</p>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)} 
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
