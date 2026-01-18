
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronLeftIcon, DocumentSearchIcon, PlayIcon, PauseIcon, SparklesIcon, TrophyIcon,
  VolumeIcon, SettingsIcon, FullscreenIcon, RobotIcon, BrainIcon, MusicNoteIcon, PaletteIcon, WaveformIcon,
  ChevronDownIcon, ChevronUpIcon, MicIcon, RedoIcon, CheckIcon, GuideIcon 
} from './Icons';

// Add a specific upload icon locally if not available globally
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

interface RecordedCourseDetailProps {
  onEnterLive: () => void;
  onGoHome: () => void;
}

interface AiConfig {
  type: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  subLabel: string;
}

interface Activity {
  id: number;
  title: string;
  startTime: number;
  duration: number;
  prompt: string;
  description: string;
  aiConfig: AiConfig | null;
}

// Mock Activity Data with Timestamps, AI Config, and Teaching Prompts
const ACTIVITIES: Activity[] = [
  { 
    id: 1, 
    title: '开始上课', 
    startTime: 0, 
    duration: 10, 
    prompt: '请老师做好上课准备，检查设备。',
    description: '课程导入与问候。',
    aiConfig: null
  },
  { 
    id: 2, 
    title: '现场活动一', 
    startTime: 10, // Seconds when this activity triggers
    duration: 180, // 3 minutes
    prompt: '请现场老师组织学生分享自己上学路上的有趣经历。',
    description: '通过不同的形式复习上节课的核心词汇和句型。',
    aiConfig: { type: 'english', label: 'AI 语音评测', icon: WaveformIcon, subLabel: '互动模式: 等待录音输入...' }
  },
  { 
    id: 3, 
    title: '现场活动二', 
    startTime: 40, 
    duration: 180, // 3 minutes
    prompt: '请现场老师组织学生分组讨论，并记录观察到的现象。',
    description: '通过读更多的单词、听音圈出第一个音等活动，强化学生对含有“Aa—Dd”单词的拼读能力，检验学生的学习成果。',
    aiConfig: { type: 'analysis', label: 'AI 课堂互动分析', icon: BrainIcon, subLabel: '互动模式: 点击开始监测讨论' }
  },
  { 
    id: 4, 
    title: '现场活动三', 
    startTime: 70, 
    duration: 240, // 4 minutes
    prompt: '请现场老师带领学生跟随示范视频练习歌曲节奏。',
    description: '让学生规范书写字母，培养学生正确书写字母的能力。',
    aiConfig: { type: 'music', label: 'AI 音准/节奏分析', icon: MusicNoteIcon, subLabel: '互动模式: 等待跟唱...' }
  },
  { 
    id: 5, 
    title: '现场活动四', 
    startTime: 100, 
    duration: 300, // 5 minutes
    prompt: '请现场老师将7名学生分为一组，分别担任太阳、花朵等角色进行展示。',
    description: '学生展示绘画作品，AI 识别色彩运用与构图。',
    aiConfig: { type: 'art', label: 'AI 图像识别评价', icon: PaletteIcon, subLabel: '互动模式: 等待作品上传...' }
  },
  { 
    id: 6, 
    title: '总结与评价', 
    startTime: 130, 
    duration: 60, // 1 minute
    prompt: '请老师总结本节课的学习内容，并布置相关的课后作业。',
    description: '课堂总结，布置作业。',
    aiConfig: null
  },
];

const VIDEO_TOTAL_DURATION = 160; // Total mock video duration in seconds

const RecordedCourseDetail: React.FC<RecordedCourseDetailProps> = ({ onEnterLive, onGoHome }) => {
  const [activeTab, setActiveTab] = useState('现场活动');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Activity Pause State
  const [isActivityPaused, setIsActivityPaused] = useState(false);
  const [currentPauseActivityId, setCurrentPauseActivityId] = useState<number | null>(null);
  const [activityTimer, setActivityTimer] = useState(0); // in seconds
  
  // Hover Preview State
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [previewLeft, setPreviewLeft] = useState<number>(0);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  // AI Interaction State
  const [isAiPanelExpanded, setIsAiPanelExpanded] = useState(true);
  const [aiInteractionState, setAiInteractionState] = useState<'idle' | 'processing' | 'result'>('idle');
  const [historyScores, setHistoryScores] = useState<{id: number, score: number, time: string}[]>([]);
  
  // Specific State for Activity 2 (Group Analysis)
  const [analysisTimer, setAnalysisTimer] = useState(0);
  const [groupLevels, setGroupLevels] = useState([0, 0, 0, 0]);
  const [analysisKeywords, setAnalysisKeywords] = useState<string[]>([]);
  
  const progressInterval = useRef<number | null>(null);
  const activityInterval = useRef<number | null>(null);

  // Determine active activity based on current time
  const currentActivity = useMemo(() => {
    if (currentPauseActivityId) {
        return ACTIVITIES.find(a => a.id === currentPauseActivityId);
    }
    return ACTIVITIES.slice().reverse().find(act => currentTime >= act.startTime) || ACTIVITIES[0];
  }, [currentTime, currentPauseActivityId]);

  // Auto-play logic simulation
  useEffect(() => {
    if (isPlaying && !isActivityPaused) {
      progressInterval.current = window.setInterval(() => {
        setCurrentTime(prev => {
          // Check if next second hits an activity start time
          const nextTime = prev + 1;
          const activityStarting = ACTIVITIES.find(a => a.startTime === nextTime && a.id !== 1); // Skip first start
          
          if (activityStarting) {
             // Pause video and enter activity mode
             setIsPlaying(false);
             setIsActivityPaused(true);
             setCurrentPauseActivityId(activityStarting.id);
             setActivityTimer(activityStarting.duration);
             setAiInteractionState('idle'); // Reset AI interaction
             setHistoryScores([]); // Reset local history for new activity
             setAnalysisTimer(0);
             setAnalysisKeywords([]);
             return nextTime;
          }

          if (nextTime >= VIDEO_TOTAL_DURATION) {
            setIsPlaying(false);
            return VIDEO_TOTAL_DURATION;
          }
          return nextTime;
        });
      }, 1000);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, isActivityPaused]);

  // Activity Countdown Timer Logic
  useEffect(() => {
    if (isActivityPaused) {
        activityInterval.current = window.setInterval(() => {
            setActivityTimer(prev => prev - 1);
        }, 1000);
    } else {
        if (activityInterval.current) {
            clearInterval(activityInterval.current);
        }
    }
    return () => {
        if (activityInterval.current) clearInterval(activityInterval.current);
    };
  }, [isActivityPaused]);

  // Special Simulation Effect for Analysis Mode (Activity 2)
  useEffect(() => {
    let interval: number;
    // Only run this simulation if we are in 'processing' state AND current activity is 'analysis'
    if (aiInteractionState === 'processing' && currentActivity?.aiConfig?.type === 'analysis') {
        interval = window.setInterval(() => {
            setAnalysisTimer(t => t + 1);
            
            // Randomize group levels
            setGroupLevels(prev => prev.map((_, i) => {
                // Simulate: Group 2 is quiet (low activity), Group 1 & 4 are active
                const base = i === 1 ? 10 : (Math.random() > 0.4 ? 60 : 30); 
                return Math.min(100, Math.max(5, base + Math.random() * 40));
            }));

            // Randomly add detected keywords
            if (Math.random() > 0.6) {
                const words = ['Red', 'Blue', 'Big', 'Small', 'Circle', 'Square', 'Flower', 'Sun', 'Beautiful', 'Shape', 'Color', 'Yes', 'No'];
                const newWord = words[Math.floor(Math.random() * words.length)];
                setAnalysisKeywords(prev => {
                    const next = [...prev, newWord];
                    return next.slice(-6); // Keep last 6 keywords
                });
            }
        }, 800);
    }
    return () => clearInterval(interval);
  }, [aiInteractionState, currentActivity]);

  const handleTimelineClick = (startTime: number) => {
    const activity = ACTIVITIES.find(a => a.startTime === startTime && a.id !== 1);
    if (activity) {
        setCurrentTime(startTime);
        setIsPlaying(false); 
        setIsActivityPaused(true); 
        setCurrentPauseActivityId(activity.id);
        setActivityTimer(activity.duration);
        setAiInteractionState('idle'); 
        setHistoryScores([]);
        setAnalysisTimer(0);
        setAnalysisKeywords([]);
    } else {
        setCurrentTime(startTime);
        setIsPlaying(true);
        setIsActivityPaused(false);
        setCurrentPauseActivityId(null);
    }
  };

  const handlePlayToggle = () => {
    if (isActivityPaused) {
        setIsActivityPaused(false);
        setCurrentPauseActivityId(null);
        setIsPlaying(true);
    } else {
        if (currentTime >= VIDEO_TOTAL_DURATION) {
          setCurrentTime(0);
        }
        setIsPlaying(!isPlaying);
    }
  };

  const handleContinueClass = () => {
      setIsActivityPaused(false);
      setCurrentPauseActivityId(null);
      setIsPlaying(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = Math.floor(percentage * VIDEO_TOTAL_DURATION);
    setCurrentTime(newTime);
    setIsActivityPaused(false);
    setCurrentPauseActivityId(null);
  };
  
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    setPreviewLeft(x);
    setPreviewTime(Math.floor(percentage * VIDEO_TOTAL_DURATION));
  };

  const handleProgressMouseLeave = () => {
    setPreviewTime(null);
  };

  // --- AI Interaction Handlers ---
  const startSimulation = () => {
      if (currentActivity?.aiConfig?.type === 'analysis') {
          // For analysis, we switch to processing but DO NOT set a timeout to finish. User manually stops.
          setAiInteractionState('processing');
          setAnalysisTimer(0);
          setAnalysisKeywords([]);
          setGroupLevels([10,10,10,10]);
          return;
      }

      // Default simulation for other types (English, Art, Music)
      setAiInteractionState('processing');
      setTimeout(() => {
          setAiInteractionState('result');
          const newScore = Math.floor(Math.random() * 15) + 85; 
          setHistoryScores(prev => [{
              id: Date.now(),
              score: newScore,
              time: new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})
          }, ...prev]);
      }, 2500); 
  };

  const stopAnalysis = () => {
      setAiInteractionState('result');
  };

  const resetSimulation = () => {
      setAiInteractionState('idle');
      setAnalysisTimer(0);
      setAnalysisKeywords([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const m1 = Math.floor(mins / 10);
    const m2 = mins % 10;
    const s1 = Math.floor(secs / 10);
    const s2 = secs % 10;
    return { m1, m2, s1, s2, isOvertime: seconds < 0 };
  };

  const timerDisplay = formatCountdown(activityTimer);

  return (
    <div className="flex flex-col h-screen bg-[#F5F7FA] font-sans">
       {/* Header */}
       <div className="h-16 bg-white px-6 flex items-center justify-between shadow-sm sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={onGoHome}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
               <ChevronLeftIcon />
               <span className="text-sm font-medium">返回</span>
            </button>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <span className="text-sm font-bold text-gray-800">艺术 · 唱歌、游戏 · 音乐 一年级 上册</span>
          </div>
          <button className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
             <DocumentSearchIcon /> 查看导教案
          </button>
       </div>

       {/* Content */}
       <div className="flex-1 p-6 flex gap-6 overflow-hidden max-h-[calc(100vh-64px)]">
          {/* Main Left - Video Player Area */}
          <div className="flex-1 flex flex-col min-w-0">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <h1 className="text-2xl font-bold text-gray-800">第一课 唱歌、游戏</h1>
                   <span className="text-gray-300 text-2xl font-light">|</span>
                   <h1 className="text-2xl font-bold text-gray-800">上学歌</h1>
                </div>
             </div>

             <div className="flex-1 bg-black rounded-2xl overflow-hidden relative group shadow-2xl ring-1 ring-black/5 flex flex-col select-none">
                {/* Video Placeholder Image - Dynamic Zoom Effect based on playing */}
                <div 
                  className="absolute inset-0 z-0 overflow-hidden cursor-pointer"
                  onClick={handlePlayToggle}
                >
                   <img 
                      src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                      className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isPlaying ? 'scale-110' : 'scale-100'}`} 
                      alt="Course Video Cover"
                   />
                   <div className="absolute inset-0 bg-black/30"></div>
                   
                   {/* Title Slide Text Overlay (Only show at start) */}
                   {currentTime < 5 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none animate-in fade-in zoom-in duration-1000">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-16 py-10 rounded-2xl shadow-2xl text-center transform scale-90 border border-gray-100">
                            <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-widest">湘艺版 音乐 <span className="text-blue-600 bg-blue-100 px-1 rounded">一年级</span></div>
                            <div className="text-5xl font-black mb-6 tracking-tight text-gray-900">上学歌</div>
                            <div className="text-xs text-gray-400 font-mono">教学设计: e堂好课课程中心</div>
                          </div>
                      </div>
                   )}
                </div>

                {/* --- Activity Pause Overlay --- */}
                {isActivityPaused && currentActivity && (
                    <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 flex flex-col">
                        
                        {/* Top Right Countdown Timer */}
                        <div className="absolute top-6 right-6 flex items-center gap-4">
                            <div className="bg-[#F59E0B] rounded-lg p-2 shadow-lg flex items-center gap-3 border-2 border-white/20">
                                <span className="text-white font-bold text-sm tracking-widest px-1">倒计时</span>
                                <div className="flex items-center gap-1 bg-black/10 rounded px-2 py-1">
                                   {/* Timer Digits */}
                                   <div className="w-8 h-10 bg-white/20 rounded flex items-center justify-center text-2xl font-mono font-bold text-white shadow-inner">{timerDisplay.m1}</div>
                                   <div className="w-8 h-10 bg-white/20 rounded flex items-center justify-center text-2xl font-mono font-bold text-white shadow-inner">{timerDisplay.m2}</div>
                                   <div className="text-white font-bold text-xl pb-1">:</div>
                                   <div className="w-8 h-10 bg-white/20 rounded flex items-center justify-center text-2xl font-mono font-bold text-white shadow-inner">{timerDisplay.s1}</div>
                                   <div className="w-8 h-10 bg-white/20 rounded flex items-center justify-center text-2xl font-mono font-bold text-white shadow-inner">{timerDisplay.s2}</div>
                                </div>
                                {timerDisplay.isOvertime && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold animate-pulse">超时</span>
                                )}
                            </div>
                        </div>

                        {/* Center Content: Teaching Prompt */}
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-2xl w-full text-center relative overflow-hidden border-4 border-[#F59E0B]">
                                <div className="absolute top-0 left-0 right-0 h-4 bg-[#F59E0B]"></div>
                                <div className="inline-block bg-[#FFE4B5] text-[#8B4513] px-6 py-2 rounded-b-xl font-bold text-lg mb-6 shadow-sm">
                                    {currentActivity.title.split(':')[0]}
                                </div>
                                <div className="space-y-6">
                                    <div className="text-2xl font-bold text-gray-800">
                                        教学提示：
                                    </div>
                                    <div className="text-3xl font-medium text-gray-700 leading-relaxed font-serif">
                                        {currentActivity.prompt}
                                    </div>
                                    <div className="text-xl text-gray-500 pt-4">
                                        活动时间：<span className="font-bold text-gray-800">{currentActivity.duration / 60}分钟</span>
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute -bottom-6 -left-6 text-[#F59E0B]/10">
                                    <SparklesIcon className="w-32 h-32" />
                                </div>
                                <div className="absolute -top-6 -right-6 text-[#F59E0B]/10">
                                    <SparklesIcon className="w-32 h-32" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right Continue Button */}
                        <div className="absolute bottom-24 right-6">
                            <button 
                                onClick={handleContinueClass}
                                className="group bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#FBBF24] hover:to-[#B45309] text-white pl-8 pr-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
                            >
                                <span className="text-lg font-bold tracking-widest">继续上课</span>
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <PlayIcon className="w-6 h-6" />
                                </div>
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Dynamic AI Tool Overlay */}
                {currentActivity?.aiConfig && (
                   <div className={`absolute bottom-24 left-6 z-40 transition-all duration-300 ${isActivityPaused ? 'scale-100 translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                      
                      <div className={`
                          rounded-xl border shadow-2xl overflow-hidden transition-all duration-300 
                          ${isAiPanelExpanded 
                              ? 'w-[400px] p-4 bg-black/40 backdrop-blur-md border-white/20 text-white' 
                              : 'w-auto p-2 bg-black/60 backdrop-blur-md border-white/10 text-white'
                          }
                      `}>
                         
                         {/* Panel Header with Toggle */}
                         <div 
                           className="flex items-center gap-3 cursor-pointer select-none"
                           onClick={() => setIsAiPanelExpanded(!isAiPanelExpanded)}
                         >
                            <div className={`p-2 rounded-lg shrink-0 ${
                               currentActivity.aiConfig.type === 'english' ? 'bg-blue-600' :
                               currentActivity.aiConfig.type === 'music' ? 'bg-pink-600' :
                               currentActivity.aiConfig.type === 'art' ? 'bg-purple-600' : 'bg-green-600'
                            } text-white shadow-md`}>
                               <currentActivity.aiConfig.icon className="w-5 h-5" />
                            </div>
                            
                            {isAiPanelExpanded && (
                                <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                                   <div className="font-bold text-sm truncate">{currentActivity.aiConfig.label}</div>
                                   <div className={`text-[10px] uppercase tracking-wider text-gray-300`}>
                                       AI Intelligent Analysis
                                   </div>
                                </div>
                            )}

                            {isAiPanelExpanded && (
                                <div className="ml-auto flex gap-1 items-center">
                                    <div className="flex gap-0.5 mr-2">
                                        <span className="block w-1 h-3 bg-green-400 animate-pulse delay-75 rounded-full"></span>
                                        <span className="block w-1 h-4 bg-green-400 animate-pulse delay-150 rounded-full"></span>
                                        <span className="block w-1 h-2 bg-green-400 animate-pulse delay-300 rounded-full"></span>
                                    </div>
                                    <div className="text-gray-300 hover:text-white transition-colors">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            )}
                            
                            {!isAiPanelExpanded && (
                                <div className="text-gray-300 hover:text-white transition-colors">
                                    <ChevronUpIcon />
                                </div>
                            )}
                         </div>

                         {/* Panel Body (Collapsible & Interactive) */}
                         {isAiPanelExpanded && (
                             <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                 
                                 {/* ---------------- ANALYSIS (Interactive) ---------------- */}
                                 {currentActivity.aiConfig.type === 'analysis' && (
                                     <div className="space-y-4">
                                         {aiInteractionState === 'idle' && (
                                             <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={startSimulation}>
                                                 <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                                                     <BrainIcon className="w-6 h-6" />
                                                 </div>
                                                 <p className="text-sm font-bold text-gray-200">开启小组讨论分析</p>
                                                 <p className="text-xs text-gray-400 mt-1">实时监测各小组参与度与核心观点</p>
                                             </div>
                                         )}

                                         {aiInteractionState === 'processing' && (
                                             <div className="space-y-3">
                                                 {/* Header / Control */}
                                                 <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                                     <div className="flex items-center gap-2">
                                                          <span className="relative flex h-2.5 w-2.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                          </span>
                                                          <span className="text-xs font-bold text-gray-200">实时监听中 (00:{analysisTimer.toString().padStart(2, '0')})</span>
                                                     </div>
                                                     <button onClick={stopAnalysis} className="text-[10px] bg-red-500/80 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors">停止分析</button>
                                                 </div>

                                                 {/* Groups Grid */}
                                                 <div className="grid grid-cols-2 gap-2">
                                                     {groupLevels.map((level, idx) => (
                                                         <div key={idx} className={`bg-white/5 p-2 rounded-lg border ${level < 20 && analysisTimer > 2 ? 'border-red-500/50 bg-red-900/10' : 'border-white/10'} transition-all duration-300 relative overflow-hidden`}>
                                                             <div className="flex justify-between items-center mb-1 relative z-10">
                                                                 <span className="text-[10px] font-bold text-gray-400">第{idx+1}组</span>
                                                                 {level < 20 && analysisTimer > 2 && <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded animate-pulse">需关注</span>}
                                                             </div>
                                                             {/* Waveform Viz */}
                                                             <div className="flex items-end gap-0.5 h-6 relative z-10">
                                                                 {[...Array(10)].map((_, i) => (
                                                                     <div 
                                                                         key={i} 
                                                                         className={`flex-1 rounded-sm transition-all duration-200 ${level > i*10 ? (idx % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500') : 'bg-gray-700'}`} 
                                                                         style={{height: level > i*10 ? `${Math.max(20, Math.random() * 100)}%` : '10%'}}
                                                                     ></div>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>

                                                 {/* Live Keywords */}
                                                 <div className="bg-black/20 p-2 rounded-lg border border-white/5 min-h-[40px] flex flex-wrap gap-2 items-center content-start">
                                                     <span className="text-[9px] text-gray-500 uppercase font-bold mr-1">Detected:</span>
                                                     {analysisKeywords.length === 0 && <span className="text-[10px] text-gray-600 italic">Listening...</span>}
                                                     {analysisKeywords.map((k, i) => (
                                                         <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-yellow-200 animate-in zoom-in slide-in-from-bottom-2 duration-300 border border-white/5">{k}</span>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}

                                         {aiInteractionState === 'result' && (
                                              <div className="space-y-4 pt-1 border-t border-white/10 animate-in fade-in">
                                                 <div className="flex items-center gap-2 bg-green-900/20 p-2 rounded text-green-300 text-xs border border-green-500/20">
                                                     <CheckIcon />
                                                     分析完成
                                                 </div>
                                                 
                                                 {/* Summary Stats */}
                                                 <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                       <div className="text-[10px] text-gray-400 mb-1">活跃度最高</div>
                                                       <div className="text-lg font-bold text-blue-400">第1组</div>
                                                       <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                                          <div className="bg-blue-500 h-full w-[85%]"></div>
                                                       </div>
                                                    </div>
                                                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                                       <div className="text-[10px] text-gray-400 mb-1">需关注</div>
                                                       <div className="text-lg font-bold text-red-400">第2组</div>
                                                       <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                                          <div className="bg-red-500 h-full w-[30%]"></div>
                                                       </div>
                                                    </div>
                                                 </div>

                                                 {/* AI Suggestion */}
                                                 <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20">
                                                     <div className="flex items-center gap-2 mb-1">
                                                         <RobotIcon className="w-3 h-3 text-indigo-400" />
                                                         <span className="text-[10px] font-bold text-indigo-300">AI 教学建议</span>
                                                     </div>
                                                     <p className="text-xs text-gray-300 leading-relaxed">
                                                         第2组讨论声量较低，建议老师巡视该组并进行引导提问，激发学生表达意愿。核心关键词主要集中在“形状”，可引导学生关注“颜色”。
                                                     </p>
                                                 </div>
                                                 
                                                 <button onClick={resetSimulation} className="w-full text-xs text-gray-400 hover:text-white py-2 border border-dashed border-white/20 rounded hover:bg-white/5 transition-all">
                                                     重新开始监测
                                                 </button>
                                              </div>
                                         )}
                                     </div>
                                 )}

                                 {/* ---------------- ENGLISH ACTIVITY ---------------- */}
                                 {currentActivity.aiConfig.type === 'english' && (
                                     <div className="space-y-4">
                                         {aiInteractionState === 'idle' && (
                                             <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-xl border border-white/10">
                                                 <button 
                                                    onClick={startSimulation}
                                                    className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all hover:scale-110 active:scale-95 group"
                                                 >
                                                     <MicIcon className="w-8 h-8 group-hover:animate-pulse" />
                                                 </button>
                                                 <p className="mt-3 text-sm font-bold text-gray-200">点击开始跟读练习</p>
                                                 <p className="text-xs text-gray-400 mt-1">AI 将实时评测您的发音准确度</p>
                                             </div>
                                         )}

                                         {aiInteractionState === 'processing' && (
                                             <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-xl border border-white/10">
                                                 <div className="flex items-center gap-1.5 h-10 mb-4">
                                                     {[...Array(8)].map((_, i) => (
                                                         <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-[bounce_1s_infinite]" style={{animationDelay: `${i * 0.1}s`, height: `${Math.random() * 20 + 20}px`}}></div>
                                                     ))}
                                                 </div>
                                                 <p className="text-sm font-bold text-blue-400 animate-pulse">正在录音分析中...</p>
                                             </div>
                                         )}

                                         {aiInteractionState === 'result' && (
                                             <div className="space-y-4">
                                                 {/* Result Header */}
                                                 <div className="flex items-center justify-between">
                                                     <div className="flex items-baseline gap-2">
                                                         <span className="text-3xl font-black text-yellow-400">{historyScores[0]?.score || 92}</span>
                                                         <span className="text-xs text-gray-400">分</span>
                                                     </div>
                                                     <button onClick={resetSimulation} className="text-xs flex items-center gap-1 text-gray-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all">
                                                         <RedoIcon /> 再试一次
                                                     </button>
                                                 </div>

                                                 {/* Waveform Comparison (Existing Visualization) */}
                                                 <div className="space-y-2 pt-1 border-t border-white/10">
                                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-bold">
                                                        <span>标准示范</span>
                                                        <span>您的发音</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                                        <div className="flex-1 h-10 flex items-center justify-center gap-[2px] px-1 overflow-hidden">
                                                            {[...Array(24)].map((_,i) => (
                                                                <div key={`std-${i}`} className="w-1 bg-green-500/80 rounded-full" style={{height: `${40 + Math.random() * 60}%`}}></div>
                                                            ))}
                                                        </div>
                                                        <div className="text-[10px] font-black text-gray-500">VS</div>
                                                        <div className="flex-1 h-10 flex items-center justify-center gap-[2px] px-1 overflow-hidden relative">
                                                             {[...Array(24)].map((_,i) => (
                                                                <div key={`stu-${i}`} className={`w-1 rounded-full ${i > 12 && i < 16 ? 'bg-red-400' : 'bg-blue-500'}`} style={{height: `${30 + Math.random() * 50}%`}}></div>
                                                             ))}
                                                        </div>
                                                    </div>
                                                 </div>

                                                 {/* History List */}
                                                 <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                                     <div className="text-[10px] text-gray-400 mb-2 font-bold uppercase tracking-wider">测评历史</div>
                                                     <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                                                         {historyScores.map((h, i) => (
                                                             <div key={h.id} className="flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-white/5 animate-in slide-in-from-left-2">
                                                                 <span className="text-gray-400">Attempt {historyScores.length - i}</span>
                                                                 <span className="text-gray-500 font-mono text-[10px]">{h.time}</span>
                                                                 <span className={`font-bold ${h.score >= 90 ? 'text-green-400' : 'text-yellow-400'}`}>{h.score}分</span>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                 )}

                                 {/* ---------------- ART ACTIVITY ---------------- */}
                                 {currentActivity.aiConfig.type === 'art' && (
                                     <div className="space-y-4">
                                         {aiInteractionState === 'idle' && (
                                             <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-xl border border-white/10 border-dashed hover:bg-white/10 transition-colors cursor-pointer" onClick={startSimulation}>
                                                 <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
                                                     <UploadIcon />
                                                 </div>
                                                 <p className="text-sm font-bold text-gray-200">上传美术作品</p>
                                                 <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG 格式，自动分析构图与色彩</p>
                                             </div>
                                         )}

                                         {aiInteractionState === 'processing' && (
                                             <div className="relative py-8 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col items-center">
                                                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent animate-[scan_2s_infinite]"></div>
                                                 <p className="text-sm font-bold text-purple-400 relative z-10">AI 正在扫描作品...</p>
                                                 <div className="w-32 h-20 bg-gray-700/50 mt-4 rounded-lg animate-pulse relative z-10"></div>
                                             </div>
                                         )}

                                         {aiInteractionState === 'result' && (
                                             <div className="space-y-4 animate-in fade-in">
                                                 <div className="flex justify-between items-center">
                                                     <div className="flex items-center gap-2">
                                                         <div className="w-10 h-10 bg-gray-700 rounded-md overflow-hidden border border-white/20">
                                                             <img src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="artwork" />
                                                         </div>
                                                         <div>
                                                             <div className="text-sm font-bold text-white">综合评分</div>
                                                             <div className="text-xs text-purple-400 font-mono">Excellent</div>
                                                         </div>
                                                     </div>
                                                     <button onClick={resetSimulation} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                                                         重新上传
                                                     </button>
                                                 </div>

                                                 {/* Art Visualization (Existing) */}
                                                 <div className="pt-1 border-t border-white/10">
                                                    {/* Color Palette */}
                                                    <div className="mb-3">
                                                       <div className="text-[10px] text-gray-400 mb-2 font-bold">色彩提取 (Palette)</div>
                                                       <div className="flex gap-2">
                                                          {['#FF5733', '#FFC300', '#DAF7A6', '#C70039', '#900C3F'].map(c => (
                                                              <div key={c} className="w-8 h-8 rounded-full shadow-md border-2 border-white/20 ring-1 ring-black/20 transition-transform hover:scale-110" style={{backgroundColor: c}}></div>
                                                          ))}
                                                       </div>
                                                    </div>
                                                    {/* Composition Score */}
                                                    <div>
                                                       <div className="text-[10px] text-gray-400 mb-2 font-bold">构图分析 (Composition)</div>
                                                       <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                                                          <div className="flex items-center gap-2 text-[10px]">
                                                             <span className="w-12 font-bold text-gray-400">Balance</span>
                                                             <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 w-[85%] rounded-full"></div>
                                                             </div>
                                                             <span className="text-orange-400 font-bold">8.5</span>
                                                          </div>
                                                          <div className="flex items-center gap-2 text-[10px]">
                                                             <span className="w-12 font-bold text-gray-400">Creativity</span>
                                                             <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 w-[92%] rounded-full"></div>
                                                             </div>
                                                             <span className="text-purple-400 font-bold">9.2</span>
                                                          </div>
                                                       </div>
                                                    </div>
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                 )}

                                 {/* ---------------- MUSIC ACTIVITY ---------------- */}
                                 {currentActivity.aiConfig.type === 'music' && (
                                     <div className="space-y-4">
                                         {aiInteractionState === 'idle' && (
                                             <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-xl border border-white/10" onClick={startSimulation}>
                                                 <button 
                                                    className="w-14 h-14 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(219,39,119,0.5)] transition-all hover:scale-110 active:scale-95"
                                                 >
                                                     <PlayIcon className="w-6 h-6 ml-1" />
                                                 </button>
                                                 <p className="mt-3 text-sm font-bold text-gray-200">开始节奏跟练</p>
                                             </div>
                                         )}

                                         {(aiInteractionState === 'processing' || aiInteractionState === 'result') && (
                                             <div className="space-y-4 pt-1 border-t border-white/10">
                                                {/* Pitch Match */}
                                                <div>
                                                   <div className="flex justify-between text-[10px] text-gray-400 mb-2 font-bold">
                                                      <span>音准匹配 (Pitch Accuracy)</span>
                                                      <span className="text-green-400 bg-green-900/30 px-1.5 rounded">Perfect Match</span>
                                                   </div>
                                                   <div className="h-14 bg-black/40 rounded-lg relative overflow-hidden flex items-center px-0 shadow-inner border border-white/5">
                                                       {/* Background Grid */}
                                                       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                                                       {/* Reference Line */}
                                                       <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                                          <path d="M0 35 Q 20 15, 40 35 T 80 35 T 120 35 T 160 35 T 200 35 T 240 35" stroke="rgba(255,255,255,0.3)" strokeWidth="3" fill="none" strokeDasharray="4 2" />
                                                          {/* User Line (Matching) */}
                                                          <path d="M0 35 Q 20 17, 40 33 T 80 36 T 120 34 T 160 35 T 200 35 T 240 35" stroke="#EC4899" strokeWidth="2" fill="none" className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                                                       </svg>
                                                       {/* Moving playhead */}
                                                       <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)]"></div>
                                                   </div>
                                                </div>
                                                {/* Rhythm Bars */}
                                                <div>
                                                   <div className="text-[10px] text-gray-400 mb-2 font-bold">节奏 (Rhythm)</div>
                                                   <div className="flex gap-1 h-6 items-end">
                                                      {[...Array(16)].map((_, i) => (
                                                         <div key={i} className={`flex-1 rounded-sm transition-all duration-300 ${[1,1,0,1,1,1,0,1,1,1,0,0,1,1,1,0][i] ? 'bg-pink-500 h-full' : 'bg-gray-600 h-2'}`}></div>
                                                      ))}
                                                   </div>
                                                </div>
                                                {aiInteractionState === 'result' && (
                                                    <div className="flex justify-center pt-2">
                                                        <button onClick={resetSimulation} className="text-xs text-pink-400 hover:text-pink-300">重新练习</button>
                                                    </div>
                                                )}
                                             </div>
                                         )}
                                     </div>
                                 )}

                             </div>
                         )}

                         {/* Visual cue that AI is active for the current task */}
                         {isActivityPaused && (
                             <div className="absolute -top-3 -right-3">
                                 <span className="relative flex h-3 w-3">
                                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                 </span>
                             </div>
                         )}
                      </div>
                   </div>
                )}

                {/* Center Play Button (Only when paused AND NOT in activity mode) */}
                {!isPlaying && !isActivityPaused && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                       <button 
                         onClick={handlePlayToggle}
                         className="w-24 h-24 bg-[#F59E0B]/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-110 transition-transform duration-300 cursor-pointer border-4 border-white/20 pointer-events-auto"
                       >
                          <PlayIcon className="w-10 h-10 ml-2" />
                       </button>
                    </div>
                )}

                {/* Bottom Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-end pb-4 px-6 gap-6 z-20">
                   <button 
                     onClick={handlePlayToggle}
                     className="text-white hover:text-yellow-400 transition-colors"
                   >
                     {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                   </button>
                   
                   {/* Progress Bar */}
                   <div 
                     ref={progressBarRef}
                     className="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer group/progress mb-3"
                     onClick={handleSeek}
                     onMouseMove={handleProgressMouseMove}
                     onMouseLeave={handleProgressMouseLeave}
                   >
                      {/* PREVIEW TOOLTIP */}
                      {previewTime !== null && (
                        <div 
                          className="absolute bottom-5 -translate-x-1/2 flex flex-col items-center z-50 pointer-events-none"
                          style={{ left: previewLeft }}
                        >
                          <div className="w-28 h-16 bg-black rounded-lg border border-white/20 overflow-hidden shadow-2xl mb-1 relative">
                            <img 
                                src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60" 
                                className="w-full h-full object-cover opacity-80" 
                                alt="preview"
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-mono text-white text-xs font-bold bg-black/40 backdrop-blur-[1px]">
                                {formatTime(previewTime)}
                            </div>
                          </div>
                          {/* Arrow */}
                          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20"></div>
                        </div>
                      )}

                      {/* Played Track */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-[#F59E0B] rounded-full group-hover/progress:bg-yellow-400 transition-all duration-100 ease-linear"
                        style={{ width: `${(currentTime / VIDEO_TOTAL_DURATION) * 100}%` }}
                      ></div>
                      
                      {/* Playhead thumb */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all duration-100 ease-linear scale-0 group-hover/progress:scale-100"
                        style={{ left: `${(currentTime / VIDEO_TOTAL_DURATION) * 100}%` }}
                      ></div>

                      {/* Chapter Markers on Progress Bar */}
                      {ACTIVITIES.map(act => (
                        <div 
                           key={act.id} 
                           className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white/60 rounded-full pointer-events-none"
                           style={{ left: `${(act.startTime / VIDEO_TOTAL_DURATION) * 100}%` }}
                        ></div>
                      ))}
                   </div>
                   
                   <div className="flex items-center gap-4 mb-1">
                      <span className="text-white text-xs font-mono font-medium opacity-90 whitespace-nowrap min-w-[80px] text-center">
                        {formatTime(currentTime)} / {formatTime(VIDEO_TOTAL_DURATION)}
                      </span>
                      
                      <div className="flex items-center gap-2 group/vol">
                         <VolumeIcon className="text-white w-5 h-5 cursor-pointer" />
                         <div className="w-20 h-1 bg-white/30 rounded-full cursor-pointer overflow-hidden">
                            <div className="w-2/3 bg-white h-full rounded-full group-hover/vol:bg-yellow-400 transition-colors"></div>
                         </div>
                      </div>
                      
                      <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                      
                      <button className="text-white hover:text-white/80 transition-colors"><SettingsIcon className="w-5 h-5" /></button>
                      <button className="text-white hover:text-white/80 transition-colors"><FullscreenIcon className="w-5 h-5" /></button>
                   </div>
                </div>
             </div>
          </div>

          {/* Sidebar Right */}
          <div className="w-[340px] bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-gray-200 shrink-0">
             {/* Tabs */}
             <div className="flex border-b border-gray-100 bg-white">
                {['现场活动', '教学流程', '课堂资源'].map(tab => {
                   const isActive = activeTab === tab;
                   return (
                      <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-sm font-bold relative transition-colors ${
                           isActive ? 'text-[#F59E0B] bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                         {tab}
                         {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#F59E0B] rounded-full"></div>}
                      </button>
                   );
                })}
             </div>

             {/* Timeline List */}
             <div className="flex-1 overflow-y-auto p-0 relative bg-white custom-scrollbar">
                <div className="absolute left-8 top-6 bottom-6 w-[2px] bg-gray-100 border-l border-dashed border-gray-200"></div>
                
                <div className="p-6 space-y-8 relative">
                   {/* Start Class Node (Always first) */}
                   <div className="relative pl-10 group">
                      <div className={`absolute left-[6px] top-1.5 w-3 h-3 rounded-full ring-4 z-10 transition-colors ${currentTime < 10 ? 'bg-[#F59E0B] ring-orange-50' : 'bg-gray-300 ring-transparent'}`}></div>
                      <div 
                         className={`font-bold text-sm text-left block transition-colors ${currentTime < 10 ? 'text-[#F59E0B]' : 'text-gray-600'}`}
                      >
                         开始上课
                      </div>
                   </div>

                   {/* Activity Nodes */}
                   {ACTIVITIES.slice(1).map((act, index) => {
                      const isActive = currentActivity?.id === act.id;
                      const isPausedHere = isActivityPaused && currentPauseActivityId === act.id;
                      const isPast = currentTime >= (act.startTime + act.duration);
                      
                      return (
                         <div key={act.id} className="relative pl-10">
                            {/* Dot Indicator */}
                            <div 
                               className={`absolute left-[9px] top-4 w-2 h-2 rounded-full z-10 transition-all duration-300 ${
                                  isActive ? 'bg-[#F59E0B] scale-125 ring-4 ring-orange-100' : 
                                  isPast ? 'bg-[#F59E0B]' : 'bg-gray-200'
                               }`}
                            ></div>
                            
                            {/* Card */}
                            <div 
                               onClick={() => handleTimelineClick(act.startTime)}
                               className={`p-4 rounded-xl border shadow-sm transition-all cursor-pointer group relative overflow-hidden ${
                                  isActive 
                                    ? 'bg-[#FFFBF0] border-[#F59E0B] shadow-md scale-[1.02]' 
                                    : 'bg-[#FAFAFA] border-gray-100 hover:bg-white hover:shadow-md'
                               }`}
                            >
                               {/* Active Indicator Bar on Left */}
                               {isActive && <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPausedHere ? 'bg-red-500 animate-pulse' : 'bg-[#F59E0B]'}`}></div>}
                               
                               <div className="flex justify-between items-center mb-2">
                                  <span className={`font-bold text-sm transition-colors ${isActive ? 'text-[#B45309]' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                     {act.title.split(':')[0]}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                                     isActive ? 'bg-[#F59E0B] text-white' : 'text-gray-400 bg-gray-100'
                                  }`}>
                                     {Math.floor(act.duration / 60)}分钟
                                  </span>
                               </div>
                               
                               <div className="text-xs text-gray-500 leading-relaxed space-y-1 mb-2">
                                  {act.description}
                                </div>

                               {/* AI Tag if available */}
                               {act.aiConfig && (
                                  <div className={`flex items-center gap-1.5 text-[10px] font-bold mt-2 pt-2 border-t border-dashed ${isActive ? 'border-orange-200 text-orange-600' : 'border-gray-200 text-gray-400'}`}>
                                     <act.aiConfig.icon className="w-3 h-3" />
                                     {act.aiConfig.label}
                                     {isActive && <span className="ml-auto animate-pulse">Running...</span>}
                                  </div>
                               )}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default RecordedCourseDetail;
