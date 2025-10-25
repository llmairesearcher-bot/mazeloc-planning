import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Trash2, Download, Upload, ChevronLeft, ChevronRight, BarChart3, Plus, X, Check, Edit2, ArrowLeft, Target, MessageCircle, Send, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';

const TimeBlockingPlanner = () => {
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const hours = ['3h-4h', '4h-5h', '5h-6h', '6h-7h', '7h-8h', '8h-9h', '9h-10h', '10h-11h', '11h-12h', '12h-13h', '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h', '18h-19h', '19h-20h', '20h-21h', '21h-22h'];
  
  const activities = [
    { name: 'E-commerce', color: 'bg-blue-500', textColor: 'text-blue-900', bgLight: 'bg-blue-100', icon: '🛒' },
    { name: 'Affiliate', color: 'bg-green-500', textColor: 'text-green-900', bgLight: 'bg-green-100', icon: '💰' },
    { name: 'Voice AI Marketing', color: 'bg-cyan-500', textColor: 'text-cyan-900', bgLight: 'bg-cyan-100', icon: '🎤' },
    { name: 'Client A IT', color: 'bg-purple-500', textColor: 'text-purple-900', bgLight: 'bg-purple-100', icon: '👤' },
    { name: 'Client B IT', color: 'bg-pink-500', textColor: 'text-pink-900', bgLight: 'bg-pink-100', icon: '👥' },
    { name: 'Client C IT', color: 'bg-indigo-500', textColor: 'text-indigo-900', bgLight: 'bg-indigo-100', icon: '👨‍💼' },
    { name: 'Vie Personnelle', color: 'bg-amber-500', textColor: 'text-amber-900', bgLight: 'bg-amber-100', icon: '🏠' }
  ];

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedActivityIndex, setSelectedActivityIndex] = useState(null);
  const [currentYear] = useState(2025);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [schedule, setSchedule] = useState({});
  const [tasks, setTasks] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getWeekDates = (weekNumber, year) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const weekStart = new Date(firstDayOfYear);
    weekStart.setDate(firstDayOfYear.getDate() + daysOffset - firstDayOfYear.getDay() + 1);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek, currentYear);

  useEffect(() => {
    loadWeekData(currentWeek);
    loadTasksData();
  }, [currentWeek]);

  useEffect(() => {
    if (chatOpen && chatMessages.length === 0) {
      initChat();
    }
  }, [chatOpen]);

  useEffect(() => {
    if (chatOpen) {
      initChat();
    }
  }, [currentWeek, schedule]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const initChat = () => {
    const stats = getStats();
    const alerts = getBusinessAlerts();
    const total = Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0);
    
    let greeting = `Salut Boss ! 👑 C'est ton AI Assistant Mazeloc.\n\n`;
    greeting += `📅 Tu es sur la SEMAINE ${currentWeek}\n`;
    
    if (total === 0) {
      greeting += `⚠️ Cette semaine est VIDE ! Rien de planifié.\n\n`;
      greeting += `Je peux t'aider à la remplir :\n`;
      greeting += `• "Planifie toute ma semaine"\n`;
      greeting += `• "Ajoute 8h de Client A IT"\n`;
      greeting += `• "10h de temps perso"\n`;
    } else {
      greeting += `✅ ${total} blocs planifiés cette semaine\n\n`;
      greeting += `📊 Répartition :\n`;
      if (stats[0] + stats[1] + stats[2] > 0) {
        greeting += `• Business Digital: ${stats[0] + stats[1] + stats[2]}h\n`;
      }
      if (stats[3] + stats[4] + stats[5] > 0) {
        greeting += `• Clients IT: ${stats[3] + stats[4] + stats[5]}h\n`;
      }
      if (stats[6] > 0) {
        greeting += `• Vie Perso: ${stats[6]}h\n`;
      }
      greeting += `\n`;
      
      if (alerts.length > 0) {
        greeting += `🚨 ${alerts.length} alerte(s) :\n`;
        alerts.forEach(alert => {
          greeting += `• ${alert.business}: ${alert.message}\n`;
        });
        greeting += `\n`;
      }
    }
    
    greeting += `Comment je peux t'aider ? 💪`;
    
    setChatMessages([{ type: 'ai', text: greeting }]);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
    const userMsg = chatInput.toLowerCase();
    setChatInput('');
    
    setTimeout(() => processMessage(userMsg), 500);
  };

  const processMessage = async (msg) => {
    // Analyser la semaine dernière
    if (msg.includes('semaine dernière') || msg.includes('semaine derniere') || msg.includes('semaine d\'avant') || msg.includes('avant')) {
      await analyzeLastWeek();
    }
    // Planifier toute la semaine
    else if (msg.includes('planifie') && (msg.includes('semaine') || msg.includes('tout'))) {
      suggestFullWeek();
    }
    // Ajouter des heures pour une activité
    else if (msg.includes('ajoute') || msg.includes('client') || msg.includes('e-commerce') || msg.includes('affiliate') || msg.includes('voice') || msg.includes('perso')) {
      suggestActivity(msg);
    }
    // Copier semaine précédente
    else if (msg.includes('copie') || msg.includes('comme') || msg.includes('reproduis')) {
      await copyLastWeek();
    }
    else {
      // Réponse par défaut intelligente
      const stats = getStats();
      const total = Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0);
      
      let response = `Je comprends ! 💡\n\n`;
      response += `Pour t'aider, je peux :\n`;
      response += `• Analyser ta semaine dernière\n`;
      response += `• Planifier toute ta semaine\n`;
      response += `• Ajouter des blocs spécifiques\n`;
      response += `• Copier la semaine précédente\n\n`;
      response += `Dis-moi ce que tu veux ! 💪`;
      
      setChatMessages(prev => [...prev, { type: 'ai', text: response }]);
    }
  };

  const analyzeLastWeek = async () => {
    try {
      const lastWeekNum = currentWeek > 1 ? currentWeek - 1 : 52;
      const result = await window.storage.get(`week-${currentYear}-${lastWeekNum}`);
      
      if (result && result.value) {
        const lastWeekSchedule = JSON.parse(result.value);
        const stats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        
        Object.values(lastWeekSchedule).forEach(blockActivities => {
          blockActivities.forEach(idx => stats[idx]++);
        });
        
        const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
        
        let response = `📊 Analyse Semaine ${lastWeekNum} :\n\n`;
        response += `Total: ${total} blocs planifiés\n\n`;
        response += `Détails :\n`;
        response += `• E-commerce: ${stats[0]}h\n`;
        response += `• Affiliate: ${stats[1]}h\n`;
        response += `• Voice AI: ${stats[2]}h\n`;
        response += `• Client A IT: ${stats[3]}h\n`;
        response += `• Client B IT: ${stats[4]}h\n`;
        response += `• Client C IT: ${stats[5]}h\n`;
        response += `• Vie Perso: ${stats[6]}h\n\n`;
        
        response += `💡 Tu veux copier ce planning pour cette semaine ?\n`;
        response += `Dis "Oui" ou "Copie la semaine dernière"`;
        
        setChatMessages(prev => [...prev, { type: 'ai', text: response }]);
      } else {
        setChatMessages(prev => [...prev, { 
          type: 'ai', 
          text: `La semaine ${lastWeekNum} est vide ! Aucun planning trouvé.\n\nJe peux créer un nouveau planning pour toi ? Dis "Planifie ma semaine" 💪` 
        }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: 'Erreur lors de la récupération de la semaine précédente 😅' 
      }]);
    }
  };

  const copyLastWeek = async () => {
    try {
      const lastWeekNum = currentWeek > 1 ? currentWeek - 1 : 52;
      const result = await window.storage.get(`week-${currentYear}-${lastWeekNum}`);
      
      if (result && result.value) {
        const lastWeekSchedule = JSON.parse(result.value);
        setSchedule(lastWeekSchedule);
        await saveWeekData(currentWeek, lastWeekSchedule);
        
        setChatMessages(prev => [...prev, { 
          type: 'ai', 
          text: `✅ Done ! J'ai copié la semaine ${lastWeekNum} sur la semaine ${currentWeek} !\n\nTon planning est maintenant identique. Tu peux modifier ce que tu veux ! 💪` 
        }]);
      } else {
        setChatMessages(prev => [...prev, { 
          type: 'ai', 
          text: `La semaine ${lastWeekNum} est vide, impossible de copier ! 😅\n\nJe peux créer un planning from scratch ?` 
        }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: 'Erreur lors de la copie 😅' 
      }]);
    }
  };

  const suggestFullWeek = () => {
    let response = `🎯 Je te propose un planning équilibré pour la semaine ${currentWeek} :\n\n`;
    response += `CLIENTS IT (priorité cash) :\n`;
    response += `• Client A: 8h (Lun-Mar matin)\n`;
    response += `• Client B: 6h (Mer matin)\n`;
    response += `• Client C: 10h (Jeu-Ven matin)\n\n`;
    response += `BUSINESS DIGITAL :\n`;
    response += `• E-commerce: 8h (Lun-Mar après-midi)\n`;
    response += `• Affiliate: 6h (Mer-Jeu après-midi)\n`;
    response += `• Voice AI: 5h (Ven après-midi)\n\n`;
    response += `VIE PERSO :\n`;
    response += `• 10h (Sam-Dim)\n\n`;
    response += `Total: 53h bien réparties ! 💪\n\n`;
    response += `Tu veux que j'applique ce plan ? Dis "Oui" !`;
    
    setChatMessages(prev => [...prev, { type: 'ai', text: response }]);
  };

  const suggestActivity = (msg) => {
    let activity = '';
    let hours = 0;
    
    // Détecter l'activité
    if (msg.includes('client a')) activity = 'Client A IT';
    else if (msg.includes('client b')) activity = 'Client B IT';
    else if (msg.includes('client c')) activity = 'Client C IT';
    else if (msg.includes('e-commerce') || msg.includes('ecommerce')) activity = 'E-commerce';
    else if (msg.includes('affiliate')) activity = 'Affiliate';
    else if (msg.includes('voice')) activity = 'Voice AI';
    else if (msg.includes('perso')) activity = 'Vie Personnelle';
    
    // Détecter les heures
    const match = msg.match(/(\d+)\s*(h|heure)/i);
    if (match) hours = parseInt(match[1]);
    
    if (activity && hours > 0) {
      let response = `✅ Ok ! Je te propose ${hours}h de ${activity} :\n\n`;
      response += `Créneaux suggérés :\n`;
      
      // Suggérer des créneaux intelligents
      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
      for (let i = 0; i < Math.min(hours, 5); i++) {
        response += `• ${days[i]} 9h-10h\n`;
      }
      
      response += `\nPour appliquer, clique sur les cases du planning ! 💪`;
      
      setChatMessages(prev => [...prev, { type: 'ai', text: response }]);
    } else {
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        text: `Précise l'activité et le nombre d'heures !\n\nExemple : "Ajoute 8h de Client A IT" 💡` 
      }]);
    }
  };

  const loadWeekData = async (weekNum) => {
    setLoading(true);
    try {
      const result = await window.storage.get(`week-${currentYear}-${weekNum}`);
      if (result && result.value) {
        setSchedule(JSON.parse(result.value));
      } else {
        const emptySchedule = {};
        daysOfWeek.forEach(day => {
          hours.forEach(hour => {
            emptySchedule[`${day}-${hour}`] = [];
          });
        });
        setSchedule(emptySchedule);
      }
    } catch (error) {
      const emptySchedule = {};
      daysOfWeek.forEach(day => {
        hours.forEach(hour => {
          emptySchedule[`${day}-${hour}`] = [];
        });
      });
      setSchedule(emptySchedule);
    }
    setLoading(false);
  };

  const loadTasksData = async () => {
    try {
      const result = await window.storage.get(`tasks-${currentYear}-${currentWeek}`);
      if (result && result.value) {
        setTasks(JSON.parse(result.value));
      } else {
        setTasks({});
      }
    } catch (error) {
      setTasks({});
    }
  };

  const saveWeekData = async (weekNum, data) => {
    try {
      await window.storage.set(`week-${currentYear}-${weekNum}`, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    }
  };

  const saveTasksData = async (tasksData) => {
    try {
      await window.storage.set(`tasks-${currentYear}-${currentWeek}`, JSON.stringify(tasksData));
    } catch (error) {
      console.error('Erreur de sauvegarde des tâches:', error);
    }
  };

  const handleBlockClick = (day, hour, e) => {
    const key = `${day}-${hour}`;
    const currentBlock = [...schedule[key]];
    
    if (e.shiftKey || e.ctrlKey) {
      currentBlock.pop();
    } else {
      if (currentBlock.length < 4) {
        currentBlock.push(selectedActivity);
      }
    }
    
    const newSchedule = { ...schedule, [key]: currentBlock };
    setSchedule(newSchedule);
    saveWeekData(currentWeek, newSchedule);
  };

  const clearBlock = (day, hour, e) => {
    e.stopPropagation();
    const key = `${day}-${hour}`;
    const newSchedule = { ...schedule, [key]: [] };
    setSchedule(newSchedule);
    saveWeekData(currentWeek, newSchedule);
  };

  const changeWeek = (direction) => {
    const newWeek = currentWeek + direction;
    if (newWeek >= 1 && newWeek <= 52) {
      setCurrentWeek(newWeek);
    }
  };

  const goToWeek = (weekNum) => {
    if (weekNum >= 1 && weekNum <= 52) {
      setCurrentWeek(weekNum);
    }
  };

  const addTask = (activityIndex) => {
    if (!newTaskText.trim()) return;
    
    const taskId = Date.now().toString();
    const newTasks = {
      ...tasks,
      [activityIndex]: [
        ...(tasks[activityIndex] || []),
        { id: taskId, text: newTaskText, completed: false, createdAt: new Date().toISOString() }
      ]
    };
    
    setTasks(newTasks);
    saveTasksData(newTasks);
    setNewTaskText('');
  };

  const toggleTask = (activityIndex, taskId) => {
    const newTasks = {
      ...tasks,
      [activityIndex]: tasks[activityIndex].map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    };
    setTasks(newTasks);
    saveTasksData(newTasks);
  };

  const deleteTask = (activityIndex, taskId) => {
    const newTasks = {
      ...tasks,
      [activityIndex]: tasks[activityIndex].filter(task => task.id !== taskId)
    };
    setTasks(newTasks);
    saveTasksData(newTasks);
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const saveEditTask = (activityIndex, taskId) => {
    if (!editingTaskText.trim()) return;
    
    const newTasks = {
      ...tasks,
      [activityIndex]: tasks[activityIndex].map(task =>
        task.id === taskId ? { ...task, text: editingTaskText } : task
      )
    };
    setTasks(newTasks);
    saveTasksData(newTasks);
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const getStats = () => {
    const stats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    Object.values(schedule).forEach(blockActivities => {
      blockActivities.forEach(activityIndex => {
        stats[activityIndex]++;
      });
    });
    return stats;
  };

  const getBusinessAlerts = () => {
    const alerts = [];
    const s = getStats();
    
    if (s[0] === 0) {
      alerts.push({ business: 'E-commerce', level: 'danger', message: 'ZERO activité !' });
    } else if (s[0] < 5) {
      alerts.push({ business: 'E-commerce', level: 'warning', message: 'Trop peu d\'attention' });
    }
    
    if (s[1] === 0) {
      alerts.push({ business: 'Affiliate', level: 'danger', message: 'ZERO activité !' });
    } else if (s[1] < 5) {
      alerts.push({ business: 'Affiliate', level: 'warning', message: 'Trop peu d\'attention' });
    }
    
    if (s[2] === 0) {
      alerts.push({ business: 'Voice AI', level: 'danger', message: 'ZERO activité !' });
    } else if (s[2] < 5) {
      alerts.push({ business: 'Voice AI', level: 'warning', message: 'Trop peu d\'attention' });
    }
    
    const itTotal = s[3] + s[4] + s[5];
    if (itTotal === 0) {
      alerts.push({ business: 'IT Consulting', level: 'critical', message: 'DANGER ! Ton cash flow !' });
    } else if (itTotal < 10) {
      alerts.push({ business: 'IT Consulting', level: 'warning', message: 'Pas assez de temps clients' });
    }
    
    if (s[6] === 0) {
      alerts.push({ business: 'Vie Personnelle', level: 'warning', message: 'Risque de burnout !' });
    }
    
    return alerts;
  };

  const exportToCalendar = () => {
    try {
      const formatDateICS = (d) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return year + month + day + 'T' + hours + minutes + '00';
      };

      let icsContent = 'BEGIN:VCALENDAR\r\n';
      icsContent += 'VERSION:2.0\r\n';
      icsContent += 'PRODID:-//Mazeloc//CEO Planning//FR\r\n';
      icsContent += 'CALSCALE:GREGORIAN\r\n';
      icsContent += 'METHOD:PUBLISH\r\n';
      icsContent += 'X-WR-CALNAME:Mazeloc Planning Semaine ' + currentWeek + '\r\n';
      icsContent += 'X-WR-TIMEZONE:Europe/Paris\r\n';

      Object.entries(schedule).forEach(([key, blockActivities]) => {
        if (blockActivities.length === 0) return;
        
        const parts = key.split('-');
        const dayName = parts[0];
        const hourRange = parts[1];
        const dayIndex = daysOfWeek.indexOf(dayName);
        const date = weekDates[dayIndex];
        
        const hourParts = hourRange.split('h-');
        const startHour = parseInt(hourParts[0]);
        const endHourStr = hourParts[1] || '';
        const endHour = parseInt(endHourStr.replace('h', ''));
        
        blockActivities.forEach((activityIndex) => {
          const activity = activities[activityIndex];
          const activityTasks = tasks[activityIndex] || [];
          
          const startDate = new Date(date);
          startDate.setHours(startHour, 0, 0, 0);
          
          const endDate = new Date(date);
          endDate.setHours(endHour, 0, 0, 0);
          
          let description = activity.icon + ' ' + activity.name;
          if (activityTasks.length > 0) {
            description += '\\n\\nTaches:\\n';
            activityTasks.forEach(task => {
              const status = task.completed ? 'FAIT' : 'TODO';
              description += status + ': ' + task.text + '\\n';
            });
          }
          
          const uid = Date.now() + '-' + activityIndex + '@mazeloc.com';
          
          icsContent += 'BEGIN:VEVENT\r\n';
          icsContent += 'UID:' + uid + '\r\n';
          icsContent += 'DTSTAMP:' + formatDateICS(new Date()) + '\r\n';
          icsContent += 'DTSTART:' + formatDateICS(startDate) + '\r\n';
          icsContent += 'DTEND:' + formatDateICS(endDate) + '\r\n';
          icsContent += 'SUMMARY:' + activity.icon + ' ' + activity.name + '\r\n';
          icsContent += 'DESCRIPTION:' + description + '\r\n';
          icsContent += 'LOCATION:Mazeloc HQ\r\n';
          icsContent += 'STATUS:CONFIRMED\r\n';
          icsContent += 'END:VEVENT\r\n';
        });
      });

      icsContent += 'END:VCALENDAR';

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mazeloc-semaine-' + currentWeek + '-' + currentYear + '.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Calendrier exporté ! Ouvre le fichier .ics sur ton téléphone pour l\'importer 📅');
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export. Vérifie que tu as des blocs planifiés.');
    }
  };

  const exportAllWeeks = async () => {
    const allData = { year: currentYear, weeks: {}, tasks: {} };
    
    for (let week = 1; week <= 52; week++) {
      try {
        const scheduleResult = await window.storage.get(`week-${currentYear}-${week}`);
        if (scheduleResult && scheduleResult.value) {
          allData.weeks[week] = JSON.parse(scheduleResult.value);
        }
        
        const tasksResult = await window.storage.get(`tasks-${currentYear}-${week}`);
        if (tasksResult && tasksResult.value) {
          allData.tasks[week] = JSON.parse(tasksResult.value);
        }
      } catch (error) {
        // Semaine vide
      }
    }
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mazeloc-planning-${currentYear}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importAllWeeks = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.weeks) {
          for (const [weekNum, weekData] of Object.entries(imported.weeks)) {
            await saveWeekData(parseInt(weekNum), weekData);
          }
        }
        if (imported.tasks) {
          for (const [weekNum, tasksData] of Object.entries(imported.tasks)) {
            await window.storage.set(`tasks-${currentYear}-${weekNum}`, JSON.stringify(tasksData));
          }
        }
        loadWeekData(currentWeek);
        loadTasksData();
        alert('Import réussi !');
      } catch (error) {
        alert('Erreur lors de l\'import');
      }
    };
    reader.readAsText(file);
  };

  const openActivityView = (activityIndex) => {
    setSelectedActivityIndex(activityIndex);
    setCurrentView('activity');
  };

  const backToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedActivityIndex(null);
  };

  const stats = getStats();
  const totalBlocks = Object.values(schedule).reduce((sum, arr) => sum + arr.length, 0);
  const businessAlerts = getBusinessAlerts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-2xl text-slate-600">Chargement...</div>
      </div>
    );
  }

  // Activity Detail View
  if (currentView === 'activity' && selectedActivityIndex !== null) {
    const activity = activities[selectedActivityIndex];
    const activityTasks = tasks[selectedActivityIndex] || [];
    const activityBlocks = stats[selectedActivityIndex];
    
    const allocatedSlots = [];
    Object.entries(schedule).forEach(([key, blockActivities]) => {
      if (blockActivities.includes(selectedActivityIndex)) {
        const [day, hour] = key.split('-');
        allocatedSlots.push({ day, hour });
      }
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className={`${activity.color} rounded-2xl shadow-2xl p-8 mb-6 text-white`}>
            <button
              onClick={backToDashboard}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all mb-6"
            >
              <ArrowLeft size={20} />
              Retour au Dashboard
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">{activity.icon}</div>
              <div>
                <h1 className="text-5xl font-black">{activity.name}</h1>
                <p className="text-xl text-white/80 mt-2">Deep Dive - Semaine {currentWeek}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{activityBlocks}</div>
                <div className="text-sm text-white/80">Blocs planifiés</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{activityTasks.length}</div>
                <div className="text-sm text-white/80">Tâches total</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">
                  {activityTasks.filter(t => t.completed).length}/{activityTasks.length}
                </div>
                <div className="text-sm text-white/80">Complétées</div>
              </div>
            </div>
          </div>

          {allocatedSlots.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className={activity.textColor} size={24} />
                <h2 className="text-xl font-bold text-slate-800">Créneaux horaires alloués</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allocatedSlots.map((slot, idx) => (
                  <div key={idx} className={`${activity.bgLight} ${activity.textColor} p-3 rounded-lg text-center font-semibold`}>
                    {slot.day} • {slot.hour}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className={activity.textColor} size={24} />
              <h2 className="text-xl font-bold text-slate-800">Gestion des tâches</h2>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask(selectedActivityIndex)}
                placeholder="Ajouter une nouvelle tâche..."
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => addTask(selectedActivityIndex)}
                className={`${activity.color} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-semibold`}
              >
                <Plus size={20} />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {activityTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Target size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Aucune tâche pour le moment</p>
                  <p className="text-sm">Commence par ajouter des tâches spécifiques pour cette activité</p>
                </div>
              ) : (
                activityTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      task.completed
                        ? 'bg-slate-50 border-slate-200'
                        : `${activity.bgLight} border-transparent`
                    }`}
                  >
                    {editingTaskId === task.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingTaskText}
                          onChange={(e) => setEditingTaskText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEditTask(selectedActivityIndex, task.id)}
                          className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditTask(selectedActivityIndex, task.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="bg-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTask(selectedActivityIndex, task.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            task.completed
                              ? 'bg-green-500 border-green-500'
                              : `border-slate-300 hover:border-slate-400`
                          }`}
                        >
                          {task.completed && <Check size={16} className="text-white" />}
                        </button>
                        <span className={`flex-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                          {task.text}
                        </span>
                        <button
                          onClick={() => startEditTask(task)}
                          className="text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteTask(selectedActivityIndex, task.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`${activity.color} rounded-2xl shadow-lg p-6 mt-6 text-white`}>
            <h3 className="text-xl font-bold mb-3">💡 Conseils pour {activity.name}</h3>
            {selectedActivityIndex <= 2 ? (
              <ul className="space-y-2 text-sm">
                <li>✓ Définis des objectifs clairs et mesurables pour cette semaine</li>
                <li>✓ Utilise les blocs alloués pour du Deep Work sans interruption</li>
                <li>✓ Décompose les grandes tâches en sous-tâches de 1-2h max</li>
                <li>✓ Review quotidien : qu'est-ce qui avance ? Qu'est-ce qui bloque ?</li>
              </ul>
            ) : selectedActivityIndex <= 5 ? (
              <ul className="space-y-2 text-sm">
                <li>✓ Commence chaque session par checker les priorités client</li>
                <li>✓ Documente ton travail au fur et à mesure</li>
                <li>✓ Anticipe les questions et prépare les réponses</li>
                <li>✓ Update régulier avec le client = moins de surprises</li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm">
                <li>✓ Ce temps est sacré - protège-le comme une réunion importante</li>
                <li>✓ Déconnecte complètement du travail pendant ces moments</li>
                <li>✓ Sport, famille, repos : c'est ce qui te permet de performer</li>
                <li>✓ Un CEO reposé = de meilleures décisions pour Mazeloc</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 rounded-2xl shadow-2xl p-8 mb-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <Calendar className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight">MAZELOC</h1>
                <p className="text-xl text-blue-200 font-semibold mt-1">CEO Command Center {currentYear}</p>
                <p className="text-sm text-blue-300 mt-1">4 Business Empires • Infinite Possibilities</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-white mb-1">{totalBlocks}</div>
              <div className="text-sm text-blue-200">Blocs de domination</div>
              <div className="text-xs text-blue-300 mt-1">cette semaine</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats[0] + stats[1] + stats[2]}</div>
              <div className="text-sm text-blue-200">Business Digital</div>
              <div className="text-xs text-blue-300">E-com + Affiliate + Voice AI</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats[3] + stats[4] + stats[5]}</div>
              <div className="text-sm text-purple-200">Consulting IT</div>
              <div className="text-xs text-purple-300">3 Clients Actifs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats[6]}</div>
              <div className="text-sm text-amber-200">Vie Personnelle</div>
              <div className="text-xs text-amber-300">Famille • Sport • Repos</div>
            </div>
            <div className={`backdrop-blur-sm rounded-xl p-4 border-2 ${
              businessAlerts.length === 0 
                ? 'bg-green-500/20 border-green-400' 
                : businessAlerts.some(a => a.level === 'critical' || a.level === 'danger')
                ? 'bg-red-500/20 border-red-400'
                : 'bg-yellow-500/20 border-yellow-400'
            }`}>
              <div className="text-3xl font-bold">{businessAlerts.length === 0 ? '✓' : '⚠️'}</div>
              <div className="text-sm text-white font-semibold">
                {businessAlerts.length === 0 ? 'Tout est OK' : `${businessAlerts.length} Alerte${businessAlerts.length > 1 ? 's' : ''}`}
              </div>
              <div className="text-xs text-white/80">
                {businessAlerts.length === 0 ? 'Balance parfaite' : 'Business négligés'}
              </div>
            </div>
          </div>

          {businessAlerts.length > 0 && (
            <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚨</span>
                <h3 className="text-xl font-black text-white">ALERTES RISQUES</h3>
              </div>
              <div className="space-y-2">
                {businessAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg ${
                      alert.level === 'critical' 
                        ? 'bg-red-600/40 border-2 border-red-300' 
                        : alert.level === 'danger'
                        ? 'bg-red-500/30 border border-red-300'
                        : 'bg-yellow-500/30 border border-yellow-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{alert.business}</span>
                      <span className={`text-sm ${
                        alert.level === 'critical' || alert.level === 'danger' 
                          ? 'text-red-200' 
                          : 'text-yellow-200'
                      }`}>
                        {alert.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-white/90 italic">
                💡 Astuce CEO : Rééquilibre ton planning maintenant pour éviter les problèmes plus tard !
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={exportToCalendar}
                className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all border border-green-400"
              >
                <Calendar size={18} />
                <span className="hidden md:inline">📅 Calendrier</span>
              </button>
              <button
                onClick={exportAllWeeks}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all border border-white/30"
              >
                <Download size={18} />
                <span className="hidden md:inline">Export</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importAllWeeks}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all border border-white/30"
              >
                <Upload size={18} />
                <span className="hidden md:inline">Import</span>
              </button>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black italic">{totalBlocks > 0 ? 'EXECUTION MODE' : 'READY TO DOMINATE'}</div>
              <div className="text-xs text-blue-300">Le succès n'attend pas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeWeek(-1)}
              disabled={currentWeek <= 1}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 font-semibold"
            >
              <ChevronLeft size={20} />
              Semaine précédente
            </button>
            
            <div className="text-center">
              <div className="text-3xl font-black text-slate-900">SEMAINE {currentWeek}</div>
              <div className="text-sm text-slate-600 font-semibold">
                {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-slate-600">Aller à:</span>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={currentWeek}
                  onChange={(e) => goToWeek(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 border-2 border-slate-900 rounded-lg text-center font-bold"
                />
              </div>
            </div>
            
            <button
              onClick={() => changeWeek(1)}
              disabled={currentWeek >= 52}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 font-semibold"
            >
              Semaine suivante
              <ChevronRight size={20} />
            </button>
          </div>
          
          {totalBlocks > 50 && (
            <div className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl text-center">
              <div className="text-xl font-black">🚀 MODE BEAST ACTIVÉ !</div>
              <div className="text-sm mt-1">Cette semaine est STACKÉE ! Tu es sur la voie de la domination totale !</div>
            </div>
          )}
          
          {totalBlocks > 0 && totalBlocks <= 20 && (
            <div className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl text-center">
              <div className="text-xl font-black">⚡ IL EST TEMPS D'ACCÉLÉRER !</div>
              <div className="text-sm mt-1">Un CEO ne laisse pas de vide dans son planning. Fill it up !</div>
            </div>
          )}
          
          {totalBlocks === 0 && (
            <div className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl text-center">
              <div className="text-xl font-black">👑 MAZELOC ATTEND TES ORDRES</div>
              <div className="text-sm mt-1">Commence par bloquer tes 3 clients IT. Le reste suivra !</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target size={24} className="text-blue-600" />
            Deep Dive par Activité
          </h2>
          <p className="text-slate-600 text-sm mb-4">Clique sur une activité pour gérer les tâches détaillées</p>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {activities.map((activity, index) => (
              <button
                key={index}
                onClick={() => openActivityView(index)}
                className={`p-4 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg ${activity.bgLight} ${activity.textColor}`}
              >
                <div className="text-3xl mb-2">{activity.icon}</div>
                <div className="font-semibold text-sm">{activity.name}</div>
                <div className="text-xs mt-1">{stats[index]} blocs</div>
                <div className="text-xs mt-1 opacity-70">{(tasks[index] || []).length} tâches</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Sélectionne une activité pour le planning :</h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {activities.map((activity, index) => (
              <button
                key={index}
                onClick={() => setSelectedActivity(index)}
                className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                  selectedActivity === index 
                    ? `${activity.color} text-white shadow-lg` 
                    : `${activity.bgLight} ${activity.textColor} hover:shadow-md`
                }`}
              >
                <div className="text-2xl mb-1">{activity.icon}</div>
                <div className="font-semibold text-sm">{activity.name}</div>
                <div className="text-xs mt-1">{stats[index]} blocs</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-green-600" size={24} />
            <h2 className="text-lg font-semibold text-slate-800">Statistiques - Semaine {currentWeek}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">{totalBlocks}</div>
              <div className="text-xs text-slate-600">Segments</div>
            </div>
            {activities.map((activity, index) => (
              <div key={index} className={`${activity.bgLight} p-4 rounded-xl`}>
                <div className={`text-2xl font-bold ${activity.textColor}`}>{stats[index]}</div>
                <div className={`text-xs ${activity.textColor}`}>{activity.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-purple-600" size={24} />
            <h2 className="text-lg font-semibold text-slate-800">Planning de la semaine {currentWeek}</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            <strong>Click :</strong> Ajouter • <strong>Shift+Click :</strong> Retirer • <strong>Poubelle :</strong> Effacer
          </p>
          <div className="min-w-max">
            <div className="grid grid-cols-8 gap-2">
              <div className="p-3 font-semibold text-slate-600 text-center">Horaires</div>
              {daysOfWeek.map((day, idx) => (
                <div key={day} className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="font-semibold text-slate-800">{day}</div>
                  <div className="text-xs text-slate-500">
                    {weekDates[idx].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
              
              {hours.map(hour => (
                <React.Fragment key={hour}>
                  <div className="p-3 text-xs font-medium text-slate-600 flex items-center justify-center bg-slate-50 rounded-lg">
                    {hour}
                  </div>
                  {daysOfWeek.map(day => {
                    const key = `${day}-${hour}`;
                    const blockActivities = schedule[key] || [];
                    
                    return (
                      <div
                        key={key}
                        onClick={(e) => handleBlockClick(day, hour, e)}
                        className="relative p-2 rounded-lg transition-all cursor-pointer border-2 border-slate-200 hover:border-slate-400 hover:shadow-md bg-white min-h-16"
                      >
                        {blockActivities.length > 0 ? (
                          <>
                            <div className="flex flex-col gap-1 h-full">
                              {blockActivities.map((activityIndex, idx) => {
                                const activity = activities[activityIndex];
                                return (
                                  <div
                                    key={idx}
                                    className={`${activity.color} text-white text-xs font-medium px-2 py-1 rounded flex-1 flex items-center justify-center`}
                                  >
                                    {activity.icon} {activity.name}
                                  </div>
                                );
                              })}
                            </div>
                            <button
                              onClick={(e) => clearBlock(day, hour, e)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="text-slate-300 text-xs text-center h-full flex items-center justify-center">
                            +
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-2xl shadow-2xl p-8 mt-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">👑</div>
            <h3 className="text-3xl font-black">MAZELOC CEO MINDSET</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>🎯</span> Les Règles du Jeu
              </h4>
              <ul className="space-y-2 text-sm">
                <li>✓ <strong>1 semaine = 1 bataille :</strong> Planifie 4 semaines à l'avance comme un général</li>
                <li>✓ <strong>Clients IT d'abord :</strong> Cash flow = carburant de l'empire</li>
                <li>✓ <strong>Business digital ensuite :</strong> Scale sans limites</li>
                <li>✓ <strong>Vie perso = non négociable :</strong> Un CEO fatigué prend de mauvaises décisions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                <span>💎</span> Principes de Domination
              </h4>
              <ul className="space-y-2 text-sm">
                <li>✓ <strong>Deep Work Blocks :</strong> 3h sans interruption &gt; 8h distrait</li>
                <li>✓ <strong>Batching impitoyable :</strong> Emails 2x/jour max, pas plus</li>
                <li>✓ <strong>Délégation :</strong> Si quelqu'un peut le faire à 80%, délègue</li>
                <li>✓ <strong>Revue dimanche :</strong> 1h de planning = 10h gagnées dans la semaine</li>
                <li>✓ <strong>Famille/Sport/Repos :</strong> Bloque ces moments comme des réunions importantes</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-blue-600/40 rounded-xl p-4 mb-4 border-2 border-blue-400">
            <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span>📱</span> Sync Mobile : Mode d'emploi
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>1. Clique sur "📅 Calendrier"</strong> → Télécharge le fichier .ics</p>
              <p><strong>2. Sur iPhone :</strong> Ouvre le fichier → "Ajouter à Calendrier" → Active les notifications</p>
              <p><strong>3. Sur Android :</strong> Ouvre le fichier → "Importer dans Google Calendar" → Active les notifications</p>
              <p><strong>4. Sur PC :</strong> Importe dans Google Calendar, Outlook, ou Apple Calendar</p>
              <p className="text-yellow-200 italic mt-3">💡 Pro tip : Refais l'export chaque fois que tu modifies ton planning pour rester sync !</p>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4 text-center border-2 border-white/30">
            <div className="text-2xl font-black mb-2">🔥 LA VÉRITÉ</div>
            <div className="text-lg italic">"Les petits pensent en heures. Les boss pensent en semaines. Les légendes pensent en années."</div>
            <div className="text-sm mt-2 text-yellow-200">Tu construis Mazeloc pour les 10 prochaines années. Agis en conséquence.</div>
          </div>
        </div>
      </div>
      
      {/* BOUTON ROBOT */}
      {!chatOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-full shadow-2xl hover:scale-110 transform transition-all"
            onClick={() => setChatOpen(true)}
          >
            <Bot size={40} />
          </button>
        </div>
      )}

      {/* CHATBOT WINDOW */}
      {chatOpen && (
        <div className="fixed bottom-8 right-8 w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-blue-500">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <div className="font-bold">AI Assistant</div>
                <div className="text-xs">Mazeloc</div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-2 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  <div className="text-sm whitespace-pre-line">{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Écris ton message..."
                className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeBlockingPlanner;
