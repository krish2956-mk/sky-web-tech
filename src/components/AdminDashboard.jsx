import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Search, LayoutDashboard, Settings, Send, Paperclip, 
  CheckCircle2, CircleDashed, Users, FileText, Download, 
  MessageSquare, FolderOpen, LogOut, Briefcase, Star, Trash2, Bell, Plus, UploadCloud, Loader2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'Admin User';
  const userRole = localStorage.getItem('userRole') || 'Admin';

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

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const fetchAllAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [projRes, clientRes, reqRes] = await Promise.all([
          fetch('http://localhost:5000/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/auth/clients', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/requests', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (projRes.ok) {
          const data = await projRes.json();
          // The backend returns client_name as the name, let's map it to "client" so UI doesn't break
          const mapped = data.map(p => ({ ...p, client: p.client_name || 'Unassigned' }));
          setProjects(mapped);
          if (mapped.length > 0) setSelectedProjectId(mapped[0].id);
        }
        if (clientRes.ok) {
          setClients(await clientRes.json());
        }
        if (reqRes.ok) {
          setRequests(await reqRes.json());
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAllAdminData();
    }
  }, [activeTab]);

  const refreshClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/clients', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setClients(await res.json());
      }
    } catch (err) {
      console.error("Error refreshing clients:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'wizard') {
      refreshClients();
    }
  }, [activeTab]);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  const [milestones, setMilestones] = useState([]);
  const milestonesRef = useRef(milestones);
  useEffect(() => {
    milestonesRef.current = milestones;
  }, [milestones]);

  const [adminUploads, setAdminUploads] = useState([]);
  const [clientUploads, setClientUploads] = useState([]);
  const [pendingAdminUpload, setPendingAdminUpload] = useState(null);
  const [isAdminUploading, setIsAdminUploading] = useState(false);

  const projectMilestones = activeProject ? milestones.filter(m => m.project_id === activeProject.id) : [];

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
          role: f.uploader_role,
          uploaderName: f.uploaded_by_name
        }));
        setAdminUploads(formatted.filter(f => f.role === 'Admin'));
        setClientUploads(formatted.filter(f => f.role === 'Client'));
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleMilestoneChange = (milestoneId, field, value) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      
      let newM = { ...m, [field]: value };
      
      // Auto-align percentages and statuses instantly in the UI
      if (field === 'status' && value === 'Completed') newM.completion_percentage = 100;
      if (field === 'status' && value === 'Pending') newM.completion_percentage = 0;
      if (field === 'completion_percentage' && Number(value) >= 100 && newM.status !== 'Completed') newM.status = 'Completed';
      
      return newM;
    }));
  };

  const handleSaveMilestone = async (milestoneId, field, value) => {
    const mToUpdate = milestonesRef.current.find(m => m.id === milestoneId) || milestones.find(m => m.id === milestoneId);
    if (!mToUpdate) return;
    
    let finalStatus = field === 'status' ? value : mToUpdate.status;
    let finalPct = field === 'completion_percentage' ? value : mToUpdate.completion_percentage;
    
    // Auto-align percentages for logical consistency
    if (finalStatus === 'Completed') finalPct = 100;
    if (finalStatus === 'Pending') finalPct = 0;
    if (finalPct >= 100 && finalStatus !== 'Completed') {
      finalStatus = 'Completed';
      finalPct = 100;
    }

    const payload = {
      title: field === 'title' ? value : mToUpdate.title,
      status: finalStatus,
      completion_percentage: finalPct
    };
    
    // If logical alignment altered fields that weren't strictly the ones edited, update local UI state to match
    if (finalPct !== (field === 'completion_percentage' ? value : mToUpdate.completion_percentage) || 
        finalStatus !== (field === 'status' ? value : mToUpdate.status)) {
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: finalStatus, completion_percentage: finalPct } : m));
    }
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Error saving milestone:", err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    // Optimistic delete from UI
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Error deleting milestone:", err);
    }
  };

  const handleAddNewProjectMilestone = async () => {
    if (!activeProject) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/milestones/project/${activeProject.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: 'New Milestone', status: 'Pending', completion_percentage: 0 })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMilestones(prev => [...prev, data.milestone]);
      }
    } catch (err) {
      console.error("Error adding milestone:", err);
    }
  };

  // Project Edit State
  const [projectEditData, setProjectEditData] = useState({ title: '', description: '', status: 'Active', end_date: '' });
  const [isSavingProject, setIsSavingProject] = useState(false);

  useEffect(() => {
    if (activeProject) {
      setProjectEditData({
        title: activeProject.title || '',
        description: activeProject.description || '',
        status: activeProject.status || 'Active',
        end_date: activeProject.end_date ? new Date(activeProject.end_date).toISOString().split('T')[0] : ''
      });
    }
  }, [activeProject]);

  const handleSaveProjectSettings = async () => {
    if (!activeProject) return;
    setIsSavingProject(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(projectEditData)
      });
      if (res.ok) {
        // Refresh projects list
        const projRes = await fetch('http://localhost:5000/api/projects', { headers: { 'Authorization': `Bearer ${token}` } });
        if (projRes.ok) {
          const data = await projRes.json();
          setProjects(data.map(p => ({ ...p, client: p.client_name || 'Unassigned' })));
        }
      }
    } catch (err) {
      console.error("Error updating project settings:", err);
    } finally {
      setIsSavingProject(false);
    }
  };

  // Chat State
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/messages/project/${selectedProjectId}`, {
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
    fetchMilestones(selectedProjectId);

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    newSocket.emit('join_project_room', selectedProjectId);

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

    newSocket.on('milestone_update', (m) => {
      setMilestones(prev => {
        const exists = prev.find(mx => mx.id === m.id);
        if (exists) {
          return prev.map(mx => mx.id === m.id ? m : mx);
        }
        return [...prev, m];
      });
    });

    newSocket.on('file_uploaded', (data) => {
      if (String(data.projectId) === String(selectedProjectId)) {
        fetchProjectFiles(selectedProjectId);
      }
    });

    if (selectedProjectId) {
      fetchMilestones(selectedProjectId);
      fetchProjectFiles(selectedProjectId);
    }

    newSocket.emit('join_admin_room');
    newSocket.on('new_project_request', (req) => {
      setRequests(prev => [req, ...prev]);
    });

    return () => newSocket.close();
  }, [selectedProjectId, userName]);

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

      await fetch(`http://localhost:5000/api/messages/project/${selectedProjectId}`, {
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

      const uploadRes = await fetch(`http://localhost:5000/api/files/project/${selectedProjectId}`, {
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

  // Files State (Moved up)
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      setPendingAdminUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmAdminUpload = async () => {
    if (!pendingAdminUpload || !selectedProjectId) return;

    setIsAdminUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', pendingAdminUpload);

      const res = await fetch(`http://localhost:5000/api/files/project/${selectedProjectId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setPendingAdminUpload(null);
        fetchProjectFiles(selectedProjectId); // Refresh list
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setIsAdminUploading(false);
    }
  };

  const cancelAdminUpload = () => {
    setPendingAdminUpload(null);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    handleFileUpload(e);
  };

  // Requests state is now dynamic, initialized at top.

  // Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    title: '', description: '', deadline: '',
    clientMode: 'existing', clientId: '', newClientName: '', newClientEmail: '',
    milestones: [{ id: 1, title: '' }, { id: 2, title: '' }, { id: 3, title: '' }]
  });

  const handleWizardNext = async () => {
    if (wizardStep < 3) {
      setWizardStep(wizardStep + 1);
    } else {
      // Complete Wizard
      try {
        const token = localStorage.getItem('token');
        let finalClientId = wizardData.clientId;
        
        // If "new" client mode, we would ideally create them here. For now, assume "existing" mode or handle appropriately.
        // If they pick a client from dropdown, finalClientId is their ID.
        
        const createProjRes = await fetch('http://localhost:5000/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            client_id: finalClientId,
            title: wizardData.title,
            description: wizardData.description,
            start_date: new Date().toISOString().split('T')[0],
            end_date: wizardData.deadline || null
          })
        });

        if (createProjRes.ok) {
           const newProject = await createProjRes.json();
           
           // If we have a requestId, approve it
           if (wizardData.requestId) {
             await fetch(`http://localhost:5000/api/requests/${wizardData.requestId}/approve`, {
               method: 'PUT',
               headers: { 'Authorization': `Bearer ${token}` }
             });
             // Remove from local state
             setRequests(prev => prev.filter(r => r.id !== wizardData.requestId));
           }

           // Create milestones
           for (const m of wizardData.milestones) {
             if (m.title.trim()) {
               await fetch(`http://localhost:5000/api/milestones/project/${newProject.projectId}`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify({ title: m.title, status: 'Pending', completion_percentage: 0 })
               });
             }
           }
        }

        // Refetch projects to update UI
        const projRes = await fetch('http://localhost:5000/api/projects', { headers: { 'Authorization': `Bearer ${token}` } });
        if (projRes.ok) {
          const data = await projRes.json();
          const mapped = data.map(p => ({ ...p, client: p.client_name || 'Unassigned' }));
          setProjects(mapped);
          if (mapped.length > 0) setSelectedProjectId(mapped[0].id);
        }
      } catch (err) {
        console.error("Error creating project", err);
      }

      setActiveTab('overview');
      setWizardStep(1);
      setWizardData({
        title: '', description: '', deadline: '',
        clientMode: 'existing', clientId: '', newClientName: '', newClientEmail: '', requestId: null,
        milestones: [{ id: 1, title: '' }, { id: 2, title: '' }, { id: 3, title: '' }]
      });
    }
  };

  const handleAddMilestone = () => {
    setWizardData({
      ...wizardData,
      milestones: [...wizardData.milestones, { id: Date.now(), title: '' }]
    });
  };

  const handleRemoveMilestone = (index) => {
    if (wizardData.milestones.length <= 1) return;
    const newM = wizardData.milestones.filter((_, i) => i !== index);
    setWizardData({ ...wizardData, milestones: newM });
  };

  const handleApproveSetup = (req) => {
    setWizardData({
      requestId: req.id,
      title: req.title || '',
      description: req.description || `${req.type} from ${req.client}`,
      deadline: req.deadline || '',
      clientMode: 'existing',
      clientId: req.client_id || '', 
      newClientName: '', 
      newClientEmail: '',
      milestones: [{ id: 1, title: 'API Key Configuration' }, { id: 2, title: 'Sandbox Testing' }, { id: 3, title: 'Live Deployment' }]
    });
    setWizardStep(1);
    setActiveTab('wizard');
  };

  const handleNewProjectClick = () => {
    setWizardData({
      requestId: null,
      title: '', description: '', deadline: '',
      clientMode: 'existing', clientId: '', newClientName: '', newClientEmail: '',
      milestones: [{ id: 1, title: '' }, { id: 2, title: '' }, { id: 3, title: '' }]
    });
    setWizardStep(1);
    setActiveTab('wizard');
  };

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-screen w-full bg-[#FDFBF7] text-slate-900 font-sans overflow-hidden selection:bg-orange-200 selection:text-orange-900 relative"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 0% 0%, rgba(251,146,60,0.08) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(234,88,12,0.04) 0%, transparent 50%)'
        }}
      />

      {/* ── TOP NAVBAR ── */}
      <header className="relative z-20 shrink-0 px-8 h-16 flex items-center justify-between bg-white/70 backdrop-blur-2xl border-b border-slate-200">
        
        {/* Left: Logo + Pill Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 pr-6 border-r border-slate-200">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-500/20"
              style={{
                background: 'linear-gradient(135deg, #ea580c, #f97316)',
              }}
            >S</div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">Admin Portal</span>
          </div>

          {/* Pill Tab Switcher */}
          <div className="flex items-center bg-slate-100/50 rounded-xl p-1 border border-slate-200/60 gap-1 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
              { key: 'manager', label: 'Project Manager', Icon: Briefcase },
              { key: 'files',  label: 'Files & Assets', Icon: FolderOpen },
              { key: 'requests', label: 'Client Requests', Icon: MessageSquare },
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
          <button 
            onClick={handleNewProjectClick}
            className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors mr-2"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>

          <Link 
            to="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-xs font-medium bg-slate-100/50 hover:bg-slate-200/50 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300"
          >
            <Home className="w-3.5 h-3.5" /> View Site
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

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 overflow-auto bg-slate-50 relative">
          
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : !activeProject && activeTab !== 'wizard' && activeTab !== 'requests' ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center">
              <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">No Projects Found</h2>
              <p className="text-slate-500 mb-6">There are no active projects yet. Use the New Project Wizard to provision a project for a client.</p>
              <button 
                onClick={() => setActiveTab('wizard')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-colors"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ── TAB 1: OVERVIEW ── */}
              {activeTab === 'overview' && activeProject && (
                <div className="p-10 max-w-7xl mx-auto w-full">
                  <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column (Stats + Table) */}
                <div className="xl:col-span-2 space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">Active Projects</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{projects.filter(p => p.status === 'Active').length}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">Total Clients</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{clients.length}</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500">New Requests</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{requests.filter(r => r.status === 'Pending').length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Project List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">All Projects</h3>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Search projects..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4 border-b border-slate-100">Project Name</th>
                            <th className="px-6 py-4 border-b border-slate-100">Client</th>
                            <th className="px-6 py-4 border-b border-slate-100">Target Deadline</th>
                          <th className="px-6 py-4 border-b border-slate-100">Status</th>
                          <th className="px-6 py-4 border-b border-slate-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{p.title}</p>
                              <p className="text-xs text-slate-500">{p.company}</p>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{p.client}</td>
                            <td className="px-6 py-4">
                              <span className="inline-block text-slate-600 text-[12px] font-semibold">
                                {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Not Set'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => { setSelectedProjectId(p.id); setActiveTab('manager'); }}
                                className="relative text-orange-500 font-bold hover:text-orange-600 text-xs inline-flex items-center"
                              >
                                Manage
                                {p.hasNotifications && (
                                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.6)]"></span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>

                {/* Right Column: Recent Activity Feed */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" /> Recent Activity
                    </h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {requests.slice(0, 3).map(req => (
                      <div key={`req-${req.id}`} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 leading-snug">
                            New Request from <span className="font-bold">{req.client_name}</span> on <span className="font-bold text-slate-900">{req.project_type}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{new Date(req.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {projects.slice(0, 3).map(proj => (
                      <div key={`proj-${proj.id}`} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-800 leading-snug">
                            <span className="font-bold text-slate-900">{proj.title}</span> is marked as <span className="font-bold text-blue-600">{proj.status}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Project Update</p>
                        </div>
                      </div>
                    ))}
                    {requests.length === 0 && projects.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
                    )}
                  </div>
                </div>
              </motion.div>
              </div>
            )}

            {/* PROJECT MANAGER TAB */}
            {activeTab === 'manager' && (
              <div className="p-10 max-w-7xl mx-auto w-full">
              <motion.div key="manager" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                
                {/* Selector */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="font-bold text-slate-700 text-sm ml-2">Managing:</span>
                  <select 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-lg py-2 px-4 focus:outline-none focus:border-orange-500 min-w-[250px]"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.client})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Col: Editor & Milestones */}
                  <div className="space-y-6">
                    {/* Details Editor */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-orange-500" /> Project Settings</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
                          <input 
                            type="text" 
                            value={projectEditData.title} 
                            onChange={e => setProjectEditData({...projectEditData, title: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                          <select 
                            value={projectEditData.status} 
                            onChange={e => setProjectEditData({...projectEditData, status: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                          >
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                          <textarea 
                            value={projectEditData.description} 
                            onChange={e => setProjectEditData({...projectEditData, description: e.target.value})} 
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors resize-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Deadline</label>
                          <input 
                            type="date" 
                            value={projectEditData.end_date} 
                            onChange={e => setProjectEditData({...projectEditData, end_date: e.target.value})} 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-orange-500 transition-colors" 
                          />
                        </div>
                      </div>
                      <button 
                        onClick={handleSaveProjectSettings}
                        disabled={isSavingProject}
                        className="mt-6 bg-slate-900 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                      >
                        {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>

                    {/* Milestone Controller */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Milestones</h3>
                        <button onClick={handleAddNewProjectMilestone} className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:text-orange-600"><Plus className="w-4 h-4" /> Add Milestone</button>
                      </div>
                      <div className="space-y-4">
                        {projectMilestones.map(m => (
                          <div key={m.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-4 group transition-all">
                            <div className="mt-1 shrink-0">
                              {m.status === 'Completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : (m.status === 'In Progress' || m.status === 'Review') ? <div className="w-5 h-5 rounded-full border-[3px] border-orange-500 bg-orange-100" /> : <CircleDashed className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div className="flex-1">
                              <input 
                                type="text" 
                                value={m.title} 
                                onChange={(e) => handleMilestoneChange(m.id, 'title', e.target.value)}
                                onBlur={(e) => handleSaveMilestone(m.id, 'title', e.target.value)}
                                placeholder="Milestone Title"
                                className="bg-transparent font-bold text-slate-900 text-sm focus:outline-none focus:border-b focus:border-slate-300 w-full mb-1 transition-all" 
                              />
                              <input 
                                type="number" 
                                value={m.completion_percentage} 
                                onChange={(e) => handleMilestoneChange(m.id, 'completion_percentage', Number(e.target.value))}
                                onBlur={(e) => handleSaveMilestone(m.id, 'completion_percentage', Number(e.target.value))}
                                placeholder="Completion %"
                                className="bg-transparent text-xs text-slate-500 focus:outline-none focus:border-b focus:border-slate-300 w-full transition-all" 
                              />
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <select 
                                value={m.status} 
                                onChange={(e) => {
                                  handleMilestoneChange(m.id, 'status', e.target.value);
                                  setTimeout(() => handleSaveMilestone(m.id, 'status', e.target.value), 0);
                                }}
                                className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-orange-400 cursor-pointer"
                              >
                                <option value="Completed">Completed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Pending">Pending</option>
                              </select>
                              <button onClick={() => handleDeleteMilestone(m.id)} className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                        {projectMilestones.length === 0 && (
                          <p className="text-sm text-slate-500 text-center py-4">No milestones defined yet.</p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Col: Admin Chat */}
                  <div className="h-[700px]">
                    <div className="h-full bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <h3 className="text-sm font-bold text-slate-900">Client Chat</h3>
                        </div>
                        <span className="text-[10px] bg-white px-2 py-1 rounded-full border border-slate-200 font-bold text-slate-500">Replying as Admin</span>
                      </div>
                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#FDFBF7]/30">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex gap-3 items-start ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.isOwn ? 'text-white shadow-md' : 'text-slate-800 bg-white border border-slate-200'}`} style={msg.isOwn ? { background: 'linear-gradient(135deg, #ea580c, #f97316)' } : {}}>
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
                      <div className="px-4 py-3 border-t border-slate-100 bg-white flex flex-col gap-2">
                        {/* Mock Upload Section */}
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
                          <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyPress} placeholder="Message client..." className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none" />
                          <button onClick={() => handleSendMessage()} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm" style={message ? { background: '#ea580c' } : { background: '#cbd5e1' }}>
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              </div>
            )}

            {/* FILES & ASSETS TAB */}
            {activeTab === 'files' && (
              <div className="p-10 max-w-7xl mx-auto w-full">
              <motion.div key="files" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                
                {/* Selector */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="font-bold text-slate-700 text-sm ml-2">Project Context:</span>
                  <select 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm rounded-lg py-2 px-4 focus:outline-none focus:border-orange-500 min-w-[250px]"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.client})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Deliverables */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Project Deliverables</h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Upload assets specifically for {projects.find(p => p.id === selectedProjectId)?.title}</p>
                      </div>
                    </div>
                    
                    {/* Drag & Drop Zone */}
                    {!pendingAdminUpload ? (
                      <div 
                        onDrop={handleFileDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer group mb-6"
                      >
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-6 h-6 text-orange-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 font-medium text-center max-w-[250px]">SVG, PNG, JPG, PDF or ZIP (max. 100MB)</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                      </div>
                    ) : (
                      <div className="mb-6 bg-white border border-orange-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-sm relative">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{pendingAdminUpload.name}</p>
                            <p className="text-[11px] font-medium text-slate-500">{(pendingAdminUpload.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full mt-2">
                          <button 
                            onClick={cancelAdminUpload}
                            disabled={isAdminUploading}
                            className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={confirmAdminUpload}
                            disabled={isAdminUploading}
                            className="flex-1 py-2 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isAdminUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            Confirm Upload
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {adminUploads.map(f => (
                        <div key={f.id} className="flex items-center gap-4 bg-white border border-slate-100 shadow-sm rounded-xl p-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 truncate hover:text-orange-500 transition-colors block">{f.name}</a>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              <span>{f.date}</span> • <span>{f.size}</span>
                            </div>
                          </div>
                          <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Client Uploaded Assets */}
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Client Assets (From Client)</h3>
                    
                    <div className="space-y-3">
                      {clientUploads.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-10">Client hasn't uploaded any assets yet.</p>
                      ) : (
                        clientUploads.map(f => (
                          <div key={f.id} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{f.name}</p>
                              {f.title && <p className="text-xs font-semibold text-orange-600 mt-0.5">{f.title}</p>}
                              {f.desc && <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{f.desc}</p>}
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                <span>{f.date}</span> • <span>{f.size}</span>
                              </div>
                            </div>
                            <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noreferrer" className="p-2 bg-white border border-slate-200 shadow-sm rounded-lg text-slate-600 hover:text-orange-500 transition-colors flex items-center justify-center"><Download className="w-4 h-4" /></a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="p-10 max-w-7xl mx-auto w-full">
              <motion.div key="requests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Incoming Project Requests</h3>
                    <span className="bg-orange-100 text-orange-600 font-bold text-xs px-3 py-1 rounded-full">{requests.filter(r => r.status === 'Pending').length} New</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {requests.filter(r => r.status === 'Pending').length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-10">No new requests.</p>
                    ) : (
                      requests.filter(r => r.status === 'Pending').map(r => (
                        <div key={r.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                                <h4 className="text-base font-bold text-slate-900">{r.title}</h4>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider ml-5 mb-2">
                                <span>Client: <span className="text-slate-800">{r.client}</span></span>
                                <span>Type: <span className="text-slate-800">{r.budget || r.type || 'Project Request'}</span></span>
                                <span>Deadline: <span className="text-slate-800">{r.deadline ? new Date(r.deadline).toLocaleDateString() : 'N/A'}</span></span>
                                <span>Submitted: <span className="text-slate-800">{new Date(r.created_at || r.date).toLocaleDateString()}</span></span>
                              </div>
                              {r.description && (
                                <p className="ml-5 text-sm text-slate-600 mb-3">{r.description}</p>
                              )}
                              {/* File Attachments */}
                              {r.attachments && r.attachments.length > 0 && (
                                <div className="ml-5 mt-3">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attachments ({r.attachments.length})</p>
                                  <div className="space-y-2">
                                    {r.attachments.map((att, idx) => (
                                      <div key={idx} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                          <FileText className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-slate-900 truncate">{att.title || att.original_name}</p>
                                          {att.description && (
                                            <p className="text-xs text-slate-500 mt-0.5">{att.description}</p>
                                          )}
                                          <a
                                            href={`http://localhost:5000${att.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-orange-600 font-bold mt-1 hover:text-orange-700"
                                          >
                                            <Download className="w-3 h-3" /> Download
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-5 md:ml-0 shrink-0">
                              <button 
                                onClick={() => setSelectedRequest(selectedRequest?.id === r.id ? null : r)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                              >
                                {selectedRequest?.id === r.id ? 'Collapse' : 'Review Details'}
                              </button>
                              <button 
                                onClick={() => handleApproveSetup(r)}
                                className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-bold text-white shadow-sm hover:bg-orange-600"
                              >
                                Approve & Setup
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
              </div>
            )}

            {/* WIZARD TAB */}
            {activeTab === 'wizard' && (
              <div className="p-10 max-w-7xl mx-auto w-full">
              <motion.div key="wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                  
                  {/* Left Sidebar Steps */}
                  <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-8">Setup Wizard</h3>
                    <div className="space-y-6">
                      {[
                        { step: 1, label: 'Core Details' },
                        { step: 2, label: 'Client Access' },
                        { step: 3, label: 'Milestones' }
                      ].map(s => (
                        <div key={s.step} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${wizardStep === s.step ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' : wizardStep > s.step ? 'bg-slate-200 text-slate-500' : 'bg-white border border-slate-200 text-slate-400'}`}>
                            {wizardStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                          </div>
                          <span className={`text-sm font-semibold transition-colors ${wizardStep === s.step ? 'text-teal-600' : 'text-slate-500'}`}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-10 flex flex-col relative">
                    <div className="flex-1">
                      {wizardStep === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg">
                          <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Details</h2>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Title</label>
                            <input type="text" value={wizardData.title} onChange={e => setWizardData({...wizardData, title: e.target.value})} placeholder="e.g. Acme SaaS Platform" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Deadline</label>
                            <input type="date" value={wizardData.deadline} onChange={e => setWizardData({...wizardData, deadline: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brief Description</label>
                            <textarea rows={3} value={wizardData.description} onChange={e => setWizardData({...wizardData, description: e.target.value})} placeholder="What are we building?" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none" />
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg">
                          <h2 className="text-2xl font-bold text-slate-900 mb-6">Client Access</h2>
                          
                          <p className="text-sm text-slate-500 mb-4">
                            Select the existing client this project belongs to. If this project was created from a client request, the client will be pre-selected.
                          </p>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Client</label>
                              <button onClick={refreshClients} className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                                Refresh List
                              </button>
                            </div>
                            <select 
                              value={wizardData.clientId || ''}
                              onChange={e => setWizardData({...wizardData, clientId: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                            >
                              <option value="" disabled>Select a client...</option>
                              {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                              ))}
                            </select>
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg">
                          <h2 className="text-2xl font-bold text-slate-900 mb-6">Initial Milestones</h2>
                          <p className="text-sm text-slate-500 mb-4">Define the first few phases of the project. You can always add more later.</p>
                          <div className="space-y-3">
                            {wizardData.milestones.map((m, i) => (
                              <div key={m.id} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                                <input 
                                  type="text" 
                                  value={m.title}
                                  onChange={e => {
                                    const newM = [...wizardData.milestones];
                                    newM[i].title = e.target.value;
                                    setWizardData({...wizardData, milestones: newM});
                                  }}
                                  placeholder={`e.g. ${i === 0 ? 'UI/UX Design' : i === 1 ? 'Frontend Development' : 'Backend & Launch'}`} 
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none focus:border-teal-500 transition-all" 
                                />
                                {wizardData.milestones.length > 1 && (
                                  <button onClick={() => handleRemoveMilestone(i)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button onClick={handleAddMilestone} className="text-teal-600 text-sm font-bold flex items-center gap-1 hover:text-teal-700 mt-2"><Plus className="w-4 h-4" /> Add another milestone</button>
                        </motion.div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-8 mt-auto flex justify-between items-center border-t border-slate-100">
                      {wizardStep > 1 ? (
                        <button onClick={() => setWizardStep(wizardStep - 1)} className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">Back</button>
                      ) : <div />}
                      
                      <button 
                        onClick={handleWizardNext}
                        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl shadow-sm shadow-teal-500/20 transition-all flex items-center gap-2"
                      >
                        {wizardStep === 3 ? 'Create Project' : 'Next Step'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              </div>
            )}

          </AnimatePresence>
          )}
        </div>
      </main>
    </motion.div>
  );
}
