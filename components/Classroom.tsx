




import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeviceSetup from './DeviceSetup';
import { 
  SignalIcon, VideoIcon, MicIcon, SettingsIcon, LinkIcon, ExitIcon,
  PointerIcon, PenIcon, TextIcon, EraserIcon, HandIcon, ResourcesIcon, CloudIcon, UsersIcon, ChatIcon,
  TrophyIcon, MicOffIcon, CrownIcon, UserRemoveIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, HelpIcon, AlertIcon, SendIcon, PortraitIcon,
  ShapeRectIcon, ShapeCircleIcon, ShapeLineIcon, ShapeArrowIcon, ShapeTriangleIcon, ShapeStarIcon, ShapeDiamondIcon, FillIcon, SelectAreaIcon, CursorIcon,
  RobotIcon, SparklesIcon, MagicIcon
} from './Icons';

interface Participant {
  id: number;
  name: string;
  score: number;
  isMicOn: boolean;
  img: string;
  school?: string;
  group?: string;
}

interface ClassroomProps {
  onExit: () => void;
  mirror: boolean;
  onMirrorChange: (mirror: boolean) => void;
}

interface ChatMessage {
  user: string;
  msg: string;
  type: string;
  time?: string;
}

interface AiMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  actionType?: 'note' | 'alert' | 'success';
}

// Drawing Element Interfaces
interface Point { x: number; y: number; }
interface DrawingElement {
  id: string;
  type: string;
  points?: Point[]; // For freehand
  start?: Point; // For shapes
  end?: Point; // For shapes
  color: string;
  width: number;
}

const FALLBACK_IMG = 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback';

// Reliable avatar images
const AVATAR_IMGS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1491013516836-7db643ee125a?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=400&h=400&q=80",
  // Extended avatars for simulation
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1521119989659-a83eee488058?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1525875975442-5252acd806e6?auto=format&fit=crop&w=400&h=400&q=80",
];

// Initial State only has 1 participant
const STARTING_PARTICIPANTS: Participant[] = [
  { id: 1, name: '彭雨洁', score: 14, isMicOn: false, img: AVATAR_IMGS[0], school: '瓜子镇中心小学', group: '第一组' },
];

// Full database of potential students
const MOCK_DATABASE: Participant[] = [
  { id: 2, name: '宋梦珂', score: 13, isMicOn: false, img: AVATAR_IMGS[1], school: '实验小学', group: '第一组' },
  { id: 3, name: '罗燕', score: 10, isMicOn: false, img: AVATAR_IMGS[2], school: '解放路小学', group: '第二组' },
  { id: 4, name: '曾丹', score: 9, isMicOn: false, img: AVATAR_IMGS[3], school: '瓜子镇中心小学', group: '第二组' },
  { id: 5, name: '缪瑾', score: 7, isMicOn: false, img: AVATAR_IMGS[4], school: '长乐小学', group: '第三组' },
  { id: 6, name: '黄雄伟', score: 5, isMicOn: false, img: AVATAR_IMGS[5], school: '希望小学', group: '第三组' },
  { id: 7, name: '涂老师', score: 4, isMicOn: false, img: AVATAR_IMGS[6], school: '新华小学', group: '第四组' },
  { id: 8, name: '冯梦娜', score: 3, isMicOn: false, img: AVATAR_IMGS[7], school: '金渡小学', group: '第四组' },
  { id: 9, name: '刘华瑶', score: 3, isMicOn: false, img: AVATAR_IMGS[8], school: '新市小学', group: '第一组' },
  { id: 10, name: '毛妙', score: 2, isMicOn: false, img: AVATAR_IMGS[9], school: '神鼎山小学', group: '第二组' },
  { id: 11, name: '余老师', score: 2, isMicOn: false, img: AVATAR_IMGS[10], school: '火天小学', group: '第三组' },
  { id: 12, name: '万典', score: 1, isMicOn: false, img: AVATAR_IMGS[11], school: '大荆镇中心小学', group: '第四组' },
  { id: 13, name: '张伟', score: 0, isMicOn: false, img: AVATAR_IMGS[12], school: '实验小学', group: '第一组' },
  { id: 14, name: '李娜', score: 0, isMicOn: false, img: AVATAR_IMGS[13], school: '新市小学', group: '第二组' },
  { id: 15, name: '王强', score: 0, isMicOn: false, img: AVATAR_IMGS[14], school: '长乐小学', group: '第三组' },
  { id: 16, name: '赵敏', score: 0, isMicOn: false, img: AVATAR_IMGS[15], school: '新华小学', group: '第四组' },
  { id: 17, name: '孙悟空', score: 0, isMicOn: false, img: AVATAR_IMGS[16], school: '希望小学', group: '第一组' },
  { id: 18, name: '猪八戒', score: 0, isMicOn: false, img: AVATAR_IMGS[17], school: '希望小学', group: '第二组' },
  { id: 19, name: '沙和尚', score: 0, isMicOn: false, img: AVATAR_IMGS[18], school: '希望小学', group: '第三组' },
  { id: 20, name: '唐僧', score: 0, isMicOn: false, img: AVATAR_IMGS[19], school: '希望小学', group: '第四组' },
  { id: 21, name: '白骨精', score: 0, isMicOn: false, img: AVATAR_IMGS[20], school: '实验小学', group: '第一组' },
  { id: 22, name: '蜘蛛精', score: 0, isMicOn: false, img: AVATAR_IMGS[21], school: '实验小学', group: '第二组' },
  { id: 23, name: '红孩儿', score: 0, isMicOn: false, img: AVATAR_IMGS[22], school: '实验小学', group: '第三组' },
  { id: 24, name: '哪吒', score: 0, isMicOn: false, img: AVATAR_IMGS[23], school: '实验小学', group: '第四组' },
  { id: 25, name: '杨戬', score: 0, isMicOn: false, img: AVATAR_IMGS[24], school: '金渡小学', group: '第一组' },
];

const Classroom: React.FC<ClassroomProps> = ({ onExit, mirror, onMirrorChange }) => {
  const [isLive, setIsLive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>(STARTING_PARTICIPANTS);
  const [spotlightIds, setSpotlightIds] = useState<number[]>([]);
  
  // Toolbar and Sidebar States
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isCoursewareVisible, setIsCoursewareVisible] = useState(true); // Renamed for clarity, controls overlay/sidebar
  const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(false); // Start expanded to show dynamic joining
  const [activeTool, setActiveTool] = useState('pointer');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
  const [showPortrait, setShowPortrait] = useState(true);
  
  // AI Assistant State
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    { id: '1', type: 'ai', content: '您好，我是您的AI助教。我可以帮您管理课堂、整理笔记或分析学生情绪。', timestamp: '10:00' }
  ]);
  const aiPanelRef = useRef<HTMLDivElement>(null);

  // Dynamic top bar limit
  const [maxVisibleSlots, setMaxVisibleSlots] = useState(12);
  const participantsListRef = useRef<HTMLDivElement>(null);

  // Pen Tool States
  const [penColor, setPenColor] = useState('#3B82F6'); // Default Blue
  const [penWidth, setPenWidth] = useState(4);
  const [penToolType, setPenToolType] = useState('freehand'); // freehand, line, rect, circle, arrow, etc.
  
  // Drawing States
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Portrait Dragging State
  const [portraitPos, setPortraitPos] = useState({ x: 0, y: 0 });
  const [isDraggingPortrait, setIsDraggingPortrait] = useState(false);
  const portraitDragStart = useRef({ x: 0, y: 0 });
  const portraitStartPos = useRef({ x: 0, y: 0 });

  // User Settings State
  const [isUserMicOn, setIsUserMicOn] = useState(true);
  const [isUserCameraOn, setIsUserCameraOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Rewards & Modals State
  const [rewardingParticipant, setRewardingParticipant] = useState<Participant | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat State
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
     { user: "涂老师", msg: "大家注意听这个重点。", type: "teacher", time: "10:20" },
     { user: "彭雨洁", msg: "老师，这个倒计时是做什么的？", type: "student", time: "10:21" },
     { user: "宋梦珂", msg: "明白了！", type: "student", time: "10:21" },
     { user: "罗燕", msg: "声音有点小，能大一点吗？", type: "student", time: "10:22" },
  ]);

  // Operation Guide Tour State
  const [tourStep, setTourStep] = useState(0);

  // Refs
  const isChatOpenRef = useRef(isChatOpen);

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Dynamically calculate max participants in top bar (2 Rows Max)
  useEffect(() => {
    // We only need to observe if the list is actually visible (not collapsed)
    if (isTopBarCollapsed || !participantsListRef.current) return;

    const calculateSlots = (width: number) => {
      const CARD_WIDTH = 155; // w-[155px]
      const GAP = 16; // gap-4 = 16px
      
      const itemsPerRow = Math.floor((width + GAP) / (CARD_WIDTH + GAP));
      const totalSlots = itemsPerRow * 2;
      setMaxVisibleSlots(Math.max(2, totalSlots));
    };

    calculateSlots(participantsListRef.current.clientWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
         calculateSlots(entry.contentRect.width);
      }
    });

    observer.observe(participantsListRef.current);
    return () => observer.disconnect();
  }, [isTopBarCollapsed]);


  // Simulate Participants Joining Dynamically
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
        if (currentIndex < MOCK_DATABASE.length) {
            const participantToAdd = MOCK_DATABASE[currentIndex];
            setParticipants(prev => {
                if (!participantToAdd) return prev;
                if (prev.find(p => p.id === participantToAdd.id)) return prev;
                return [...prev, participantToAdd];
            });
            currentIndex++;
        } else {
            clearInterval(interval);
        }
    }, 800); 

    return () => clearInterval(interval);
  }, []);

  // Simulate Chat Messages
  useEffect(() => {
    const interval = setInterval(() => {
        if (Math.random() > 0.65) {
            const students = ["刘华瑶", "黄雄伟", "曾丹", "缪瑾", "毛妙", "万典", "冯梦娜"];
            const texts = ["收到", "听懂了", "这个动画好酷", "老师声音可以再大点吗", "笔记记下来了", "互动很有趣", "网络有点卡", "老师讲得真好"];
            const randomStudent = students[Math.floor(Math.random() * students.length)];
            const randomText = texts[Math.floor(Math.random() * texts.length)];
            const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric" });
            
            setMessages(prev => [...prev, {
                user: randomStudent,
                msg: randomText,
                type: "student",
                time: time
            }]);

            if (!isChatOpenRef.current) {
                setUnreadCount(prev => prev + 1);
            }
        }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Simulate AI Background Events (Notes, Sentiment)
  useEffect(() => {
      if (!isAiPanelOpen) return;
      
      const interval = setInterval(() => {
          if (Math.random() > 0.8) {
              const events: AiMessage[] = [
                  { id: Date.now().toString(), type: 'system', content: '监测到课堂互动活跃度上升，已自动记录精彩片段。', timestamp: 'Now', actionType: 'note' },
                  { id: Date.now().toString(), type: 'system', content: '学生[刘华瑶]提出疑问，已自动归纳到问题库。', timestamp: 'Now', actionType: 'note' },
                  { id: Date.now().toString(), type: 'system', content: '课堂专注度保持良好 (92%)。', timestamp: 'Now', actionType: 'success' },
              ];
              const randomEvent = events[Math.floor(Math.random() * events.length)];
              setAiMessages(prev => [...prev, randomEvent]);
          }
      }, 8000);
      return () => clearInterval(interval);
  }, [isAiPanelOpen]);

  // Scroll AI Panel to bottom
  useEffect(() => {
      if (aiPanelRef.current) {
          aiPanelRef.current.scrollTop = aiPanelRef.current.scrollHeight;
      }
  }, [aiMessages, isAiPanelOpen]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenClassroomTour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setTourStep(1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (tourStep === 4) setIsTopBarCollapsed(false);
    if (tourStep === 6) setIsToolbarVisible(true);
  }, [tourStep]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPortrait) return;
      const dx = e.clientX - portraitDragStart.current.x;
      const dy = e.clientY - portraitDragStart.current.y;
      setPortraitPos({
        x: portraitStartPos.current.x + dx,
        y: portraitStartPos.current.y + dy
      });
    };

    const handleMouseUp = () => {
      setIsDraggingPortrait(false);
    };

    if (isDraggingPortrait) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPortrait]);

  const handlePortraitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPortrait(true);
    portraitDragStart.current = { x: e.clientX, y: e.clientY };
    portraitStartPos.current = { ...portraitPos };
  };

  const resetTourState = () => {
    localStorage.setItem('hasSeenClassroomTour', 'true');
    setTourStep(0);
    setIsTopBarCollapsed(true);
    setIsToolbarVisible(true);
  };

  const handleNextTour = () => {
    if (tourStep < 7) setTourStep(prev => prev + 1);
    else resetTourState();
  };

  const handleSkipTour = () => resetTourState();

  useEffect(() => {
    let interval: number;
    if (isLive) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleLiveToggleRequest = () => {
    if (isLive) {
      setShowStopConfirm(true);
    } else {
      setIsLive(true);
    }
  };

  const confirmStopLive = () => {
    setIsLive(false);
    setShowStopConfirm(false);
    setElapsedTime(0);
    setSpotlightIds([]);
    setIsCoursewareVisible(true);
  };

  const handleExitRequest = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    onExit();
  };

  const handleCopyLink = () => {
    showToast("邀请链接已复制到剪贴板");
  };

  const handleToolClick = (toolName: string) => {
    if (toolName === 'portrait') {
      setShowPortrait(prev => !prev);
      return;
    }
    if (toolName === 'users') {
      setIsParticipantsPanelOpen(prev => !prev);
      if (!isParticipantsPanelOpen) {
        setIsChatOpen(false); 
      }
      return;
    }
    if (toolName === 'ai') {
        setIsAiPanelOpen(prev => !prev);
        if (!isAiPanelOpen) {
            setIsChatOpen(false);
            setIsParticipantsPanelOpen(false);
        }
        return;
    }
    if (toolName === 'eraser') {
      setElements([]);
      return;
    }

    if (activeTool === toolName) {
      setActiveTool('pointer');
    } else {
      setActiveTool(toolName);
    }
  };

  // AI Command Logic
  const handleAiSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!aiInput.trim()) return;

      const userMsg: AiMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: aiInput,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setAiMessages(prev => [...prev, userMsg]);
      const command = aiInput.toLowerCase();
      setAiInput('');
      setAiStatus('processing');

      // Simulate AI processing
      setTimeout(() => {
          let responseContent = "抱歉，我还在学习如何处理这个指令。";
          let actionType: AiMessage['actionType'] = undefined;

          if (command.includes('ppt') || command.includes('课件') || command.includes('投影')) {
              if (command.includes('关') || command.includes('收')) {
                  setIsCoursewareVisible(false);
                  responseContent = "好的，已为您收起课件。";
              } else {
                  setIsCoursewareVisible(true);
                  responseContent = "好的，已将PPT课件投影至主屏幕。";
              }
              actionType = 'success';
          } else if (command.includes('笔记') || command.includes('总结')) {
              responseContent = "正在整理课堂笔记... 已生成本节课前20分钟的重点摘要：\n1. 节奏练习要点\n2. 歌曲情感表达\n3. 互动环节学生反馈";
              actionType = 'note';
          } else if (command.includes('情绪') || command.includes('状态')) {
              responseContent = "当前课堂情绪分析：学生参与度高，情绪积极。注意力集中指数：88%。";
              actionType = 'alert';
          } else if (command.includes('静音') || command.includes('闭麦')) {
              handleMuteAll();
              responseContent = "已执行全员闭麦操作。";
              actionType = 'alert';
          } else if (command.includes('上台') || command.includes('连麦')) {
              handleSpotlightAll();
              responseContent = "已邀请列表前12位同学上台连麦。";
              actionType = 'success';
          } else if (command.includes('下台')) {
              handleUnspotlightAll();
              responseContent = "已清空舞台。";
          }

          const aiResponse: AiMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: responseContent,
              timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              actionType
          };
          setAiMessages(prev => [...prev, aiResponse]);
          setAiStatus('idle');
      }, 1000);
  };

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => b.score - a.score);
  }, [participants]);

  const spotlightParticipants = useMemo(() => {
    return sortedParticipants.filter(p => spotlightIds.includes(p.id));
  }, [spotlightIds, sortedParticipants]);

  const toggleSpotlight = (id: number) => {
    setSpotlightIds(prev => {
      const isAdding = !prev.includes(id);
      if (isAdding) {
        setIsCoursewareVisible(false);
        if (prev.length >= 12) {
          showToast("舞台人数已达上限 (12人)");
          return prev;
        }
        return [...prev, id];
      } else {
        return prev.filter(pid => pid !== id);
      }
    });
  };

  const handleSpotlightAll = () => {
    setSpotlightIds(sortedParticipants.slice(0, 12).map(p => p.id));
    setIsCoursewareVisible(false);
  };
  
  const handleUnspotlightAll = () => setSpotlightIds([]);

  const handleMuteAll = () => {
    setParticipants(prev => prev.map(p => ({ ...p, isMicOn: false })));
    showToast("已全部闭麦");
  };

  const handleUnmuteAll = () => {
    setParticipants(prev => prev.map(p => ({ ...p, isMicOn: true })));
    showToast("已全部开麦");
  };

  const handleReward = (id: number) => {
    const p = participants.find(p => p.id === id);
    if (p) {
      setRewardingParticipant(null); 
      setTimeout(() => {
        setRewardingParticipant({ ...p, score: p.score + 1 });
        setParticipants(prev => prev.map(item => item.id === id ? { ...item, score: item.score + 1 } : item));
      }, 50);
    }
  };

  useEffect(() => {
    if (rewardingParticipant) {
      const timer = setTimeout(() => setRewardingParticipant(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [rewardingParticipant]);

  const toggleParticipantMic = (id: number) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, isMicOn: !p.isMicOn } : p));
  };

  const getRank = (id: number) => sortedParticipants.findIndex(p => p.id === id) + 1;
  const hasSpotlights = spotlightParticipants.length > 0;

  const showOverflow = sortedParticipants.length > maxVisibleSlots;
  const visibleCount = showOverflow ? Math.max(0, maxVisibleSlots - 1) : sortedParticipants.length;
  
  const visibleParticipants = sortedParticipants.slice(0, visibleCount);
  const overflowCount = Math.max(0, sortedParticipants.length - visibleCount);

  // Drawing Logic
  const getStageCoordinates = (e: React.MouseEvent) => {
      if (!stageRef.current) return { x: 0, y: 0 };
      const rect = stageRef.current.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  };

  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'pen') return;
    setIsDrawing(true);
    const coords = getStageCoordinates(e);

    const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: penToolType,
        color: penColor,
        width: penWidth,
        points: penToolType === 'freehand' ? [coords] : undefined,
        start: coords,
        end: coords
    };
    setCurrentElement(newElement);
  };

  const handleStageMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentElement) return;
    const coords = getStageCoordinates(e);

    if (currentElement.type === 'freehand') {
        setCurrentElement({
            ...currentElement,
            points: [...(currentElement.points || []), coords]
        });
    } else {
        setCurrentElement({
            ...currentElement,
            end: coords
        });
    }
  };

  const handleStageMouseUp = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);
    setElements(prev => [...prev, currentElement]);
    setCurrentElement(null);
  };

  return (
    <div className="h-screen bg-[#0F0F12] flex flex-col overflow-hidden select-none font-sans text-white relative">
      <style>{`
        @keyframes burst-particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
        }
        .particle-burst {
          animation: burst-particle 0.8s ease-out forwards;
        }
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 2px solid #3b82f6;
        }
        /* Custom scrollbar for AI panel */
        .ai-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .ai-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .ai-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
        }
      `}</style>
      
      <svg className="absolute w-0 h-0">
          <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="context-stroke" />
              </marker>
          </defs>
      </svg>

      {tourStep > 0 && (
        <div className="fixed inset-0 bg-black/70 z-[105] transition-opacity duration-500 animate-in fade-in pointer-events-none" />
      )}

      {/* Header */}
      <header className={`h-12 bg-[#1C1C1F] flex items-center justify-between px-6 border-b border-[#2D2D33] shrink-0 relative z-[50]`}>
        <div className={`flex items-center gap-4 relative transition-all duration-300 ${tourStep === 2 ? 'z-[110]' : ''}`}>
           {tourStep === 2 && <TourPulse className="absolute -inset-3 rounded-lg opacity-60" />}
           <SignalIcon />
           <div className="h-4 w-[1px] bg-[#333] mx-2"></div>
           <div className="flex items-center gap-3 font-black tracking-widest text-gray-400">
              <span className="text-[10px] text-blue-500 uppercase tracking-tighter">课堂会话</span>
              <span className="text-[10px] text-[#333]">|</span>
              {isLive ? (
                 <div className="flex items-center gap-2 text-red-500 font-mono text-xl">
                   <div className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                   </div>
                   {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}
                 </div>
              ) : <span className="text-xl font-mono">-- : --</span>}
           </div>
        </div>

        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${tourStep === 3 ? 'z-[110]' : 'z-10'}`}>
           {tourStep === 3 && <TourPulse className="absolute -inset-2 rounded-full opacity-60" />}
           <button onClick={handleLiveToggleRequest} className={`px-14 py-1.5 rounded-full text-xs font-black tracking-widest transition-all shadow-xl border-2 active:scale-95 ${isLive ? 'bg-red-600 border-red-500 text-white shadow-red-500/20 hover:bg-red-700' : 'bg-blue-600 border-blue-500 text-white shadow-blue-500/20 hover:bg-blue-700'}`}>
             {isLive ? '结束上课' : '开始上课'}
           </button>
        </div>

        <div className={`flex items-center gap-6 text-gray-400 relative transition-all duration-300 ${tourStep === 7 ? 'z-[110]' : ''}`}>
           {tourStep === 7 && <TourPulse className="absolute -inset-4 rounded-xl opacity-60" />}
           
           <button 
             onClick={() => setIsUserCameraOn(!isUserCameraOn)} 
             className={`transition-colors hover:scale-110 transform ${isUserCameraOn ? 'text-blue-500' : 'text-red-500'}`} 
             title={isUserCameraOn ? "关闭摄像头" : "开启摄像头"}
           >
             <VideoIcon />
           </button>
           
           <button 
             onClick={() => setIsUserMicOn(!isUserMicOn)} 
             className={`transition-colors hover:scale-110 transform ${isUserMicOn ? 'text-blue-500' : 'text-red-500'}`} 
             title={isUserMicOn ? "关闭麦克风" : "开启麦克风"}
           >
             {isUserMicOn ? <MicIcon /> : <MicOffIcon />}
           </button>
           
           <button onClick={() => setShowSettings(true)} className="hover:text-white transition-colors" title="设备设置"><SettingsIcon /></button>
           <button onClick={() => setTourStep(1)} className="hover:text-white transition-colors" title="操作指引"><HelpIcon /></button>
           <button onClick={handleCopyLink} className="hover:text-white transition-colors" title="复制邀请链接"><LinkIcon /></button>
           <button onClick={handleExitRequest} className="hover:text-red-500 transition-all transform hover:scale-110" title="退出课堂"><ExitIcon /></button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
         <div className="flex-1 flex flex-col min-w-0 bg-[#121214] relative">
            
            {/* Top Participants Bar */}
            <div className={`absolute top-0 left-0 right-0 border-b border-[#2D2D33] bg-[#18181B] transition-all duration-300 ease-out z-[60] ${tourStep === 4 ? 'z-[110]' : ''} ${isTopBarCollapsed ? 'h-14 overflow-hidden shadow-lg' : 'p-6 pb-10 shadow-2xl h-auto max-h-[50vh] overflow-visible'}`}>
                {tourStep === 4 && <TourPulse className="absolute inset-0 z-[60] pointer-events-none opacity-40" />}

                {isTopBarCollapsed ? (
                  <div className="h-full flex items-center justify-between px-6 animate-in fade-in duration-200">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">参与者</span>
                      <div className="flex -space-x-2 items-center">
                        {sortedParticipants.slice(0, 3).map(p => (
                          <img key={p.id} src={p.img} className="w-7 h-7 rounded-full border-2 border-[#18181B] object-cover shadow-sm" alt="" />
                        ))}
                        <div className="w-7 h-7 rounded-full bg-[#2D2D33] border-2 border-[#18181B] flex items-center justify-center text-[9px] font-bold text-gray-400">+{sortedParticipants.length - 3}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        <VideoIcon className="w-4 h-4" /> <span className="opacity-80">上台人数:</span> {spotlightParticipants.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4 px-2">
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-gray-200 uppercase tracking-[0.1em] border-l-4 border-pink-500 pl-3">参与者列表 — 按得分排序</span>
                          <div className="flex items-center gap-2">
                             <button onClick={handleSpotlightAll} className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black hover:bg-blue-500 hover:text-white transition-all active:scale-95">全部上台</button>
                             <button onClick={handleUnspotlightAll} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black hover:bg-red-600 hover:text-white hover:border-red-500 transition-all active:scale-95">全部下台</button>
                             <button onClick={handleUnmuteAll} className="px-3 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black hover:bg-green-600 hover:text-white transition-all active:scale-95">全部开麦</button>
                             <button onClick={handleMuteAll} className="px-3 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black hover:bg-red-600 hover:text-white transition-all active:scale-95">全部闭麦</button>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div> 连麦中
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div> 已上台
                          </div>
                       </div>
                    </div>
                    {/* Participants Grid */}
                    <div 
                      ref={participantsListRef}
                      className="flex flex-wrap gap-4 justify-start items-start animate-in fade-in duration-300"
                    >
                      {visibleParticipants.map((p, index) => {
                        const isSpotlight = spotlightIds.includes(p.id);
                        const rank = index + 1;
                        return (
                          <div 
                            key={p.id} 
                            onClick={() => toggleSpotlight(p.id)} 
                            className={`relative h-[85px] w-[155px] bg-[#0A0A0C] border-2 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 group overflow-hidden shrink-0 animate-in zoom-in-50 ${isSpotlight ? 'border-blue-500 ring-2 ring-blue-500/20 z-10' : 'border-[#2D2D33] hover:border-gray-500'}`}
                          >
                              <div className={`absolute top-1 left-1.5 bg-black/70 text-yellow-500 text-[9px] font-black px-2 py-0.5 rounded italic z-10 shadow-sm border border-white/5 uppercase`}>NO.{rank}</div>
                              
                              {/* Hover Action Panel */}
                              <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/40 backdrop-blur-[2px]">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleReward(p.id); }}
                                    className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:scale-110 hover:bg-yellow-400 transition-all shadow-lg active:scale-95 border border-white/20"
                                    title="奖励"
                                  >
                                    <TrophyIcon className="w-4 h-4" />
                                  </button>
                                  
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleParticipantMic(p.id); }}
                                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95 border border-white/20 ${p.isMicOn ? 'bg-blue-600' : 'bg-red-500'}`}
                                    title={p.isMicOn ? "关闭麦克风" : "开启麦克风"}
                                  >
                                    <div className="">{p.isMicOn ? <MicIcon /> : <MicOffIcon />}</div>
                                  </button>

                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleSpotlight(p.id); }}
                                    className={`w-8 h-8 rounded-full text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95 border border-white/20 ${isSpotlight ? 'bg-red-500' : 'bg-green-600'}`}
                                    title={isSpotlight ? "下台" : "上台"}
                                  >
                                    <div className="">{isSpotlight ? <UserRemoveIcon /> : <PlusIcon />}</div>
                                  </button>
                                </div>
                              </div>

                              {isSpotlight && (
                                <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white w-4.5 h-4.5 flex items-center justify-center rounded-md z-20 animate-in zoom-in duration-100 shadow-lg border border-white/20">
                                   <CheckIcon />
                                </div>
                              )}
                              <ParticipantImage src={p.img} name={p.name} isSpotlight={isSpotlight} />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 flex items-center justify-between z-20">
                                 <div className="flex items-center gap-1.5 text-[10px] text-white truncate max-w-[70%]">
                                   <span className={p.isMicOn ? 'text-green-400' : 'text-red-500'}>
                                     {p.isMicOn ? <MicIcon className="w-3 h-3" /> : <MicOffIcon />}
                                   </span>
                                   <span className="truncate font-bold tracking-tight uppercase">{p.name}</span>
                                 </div>
                                 <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-black leading-none pt-0.5">
                                    <TrophyIcon /> <span className="pt-0.5">{p.score}</span>
                                 </div>
                              </div>
                          </div>
                        );
                      })}
                      {overflowCount > 0 && (
                        <div 
                          onClick={() => setIsParticipantsPanelOpen(true)}
                          className="relative h-[85px] w-[155px] bg-[#2D2D33] border-2 border-[#3E3E42] rounded-xl cursor-pointer transition-all hover:bg-[#3E3E42] hover:border-blue-500 flex flex-col items-center justify-center gap-2 group animate-in zoom-in-50"
                        >
                            <div className="text-3xl font-black text-gray-500 group-hover:text-blue-400 transition-colors">+{overflowCount}</div>
                            <div className="text-[10px] font-bold text-gray-600 group-hover:text-blue-500 transition-colors">查看更多</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center group pointer-events-auto">
                    <button 
                      onClick={() => setIsTopBarCollapsed(!isTopBarCollapsed)}
                      className={`relative px-8 h-6 bg-[#2D2D33] hover:bg-blue-600 transition-all duration-200 rounded-t-xl flex items-center justify-center border border-white/10 border-b-0 shadow-2xl text-gray-400 hover:text-white group-hover:h-8 group-active:scale-95`}
                    >
                      <div className={`transition-transform duration-300 ${isTopBarCollapsed ? 'rotate-180' : 'rotate-0'}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors"></div>
                    </button>
                </div>
            </div>

            {/* Stage Area */}
            <div 
                className={`flex-1 relative bg-[#F0F0F5] overflow-hidden p-6 pt-20 flex items-center justify-center transition-all duration-300 ${tourStep === 5 ? 'z-[110]' : ''} ${activeTool === 'pen' ? 'cursor-crosshair' : ''}`}
                onMouseDown={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                onMouseLeave={handleStageMouseUp}
                ref={stageRef}
            >
               {tourStep === 5 && <TourPulse className="absolute inset-6 rounded-[2.5rem] pointer-events-none z-[60] opacity-50" />}
               
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
                   {elements.map(el => (
                       <RenderElement key={el.id} el={el} />
                   ))}
                   {currentElement && <RenderElement el={currentElement} />}
               </svg>

               <div className="w-full h-full flex flex-col items-center justify-center transition-all duration-500 relative z-0">
                  {hasSpotlights ? (
                    <>
                      <AdaptiveStageGrid 
                        participants={spotlightParticipants} 
                        getRank={getRank} 
                        onToggleSpotlight={toggleSpotlight}
                        onReward={handleReward}
                        onToggleMic={toggleParticipantMic}
                      />
                      
                      {isCoursewareVisible && (
                        <div className="absolute z-40 w-[60%] aspect-video bg-white shadow-2xl rounded-[2rem] border-[8px] border-[#FFD000] overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
                            <button 
                                onClick={() => setIsCoursewareVisible(false)}
                                className="absolute top-2 right-2 z-50 bg-black/20 hover:bg-black/50 text-white rounded-full p-1.5 transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            <CoursewareContent isFullscreen={false} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full animate-in zoom-in duration-500">
                       <CoursewareContent isFullscreen={true} />
                    </div>
                  )}
               </div>

               {showPortrait && (
                 <div className="absolute bottom-0 right-0 h-[70%] z-[35] pointer-events-none flex items-end justify-end animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div 
                      onMouseDown={handlePortraitMouseDown}
                      style={{ transform: `translate(${portraitPos.x}px, ${portraitPos.y}px)` }}
                      className={`h-full pointer-events-auto transition-transform duration-0 ${isDraggingPortrait ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <img 
                        src="https://pngimg.com/uploads/teacher/teacher_PNG8.png"
                        alt="Teacher Portrait" 
                        className={`h-full object-contain filter drop-shadow-2xl select-none transition-transform duration-300 ${mirror ? 'scale-x-[-1]' : ''}`}
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                 </div>
               )}

               {rewardingParticipant && (
                 <div className="absolute inset-0 z-[150] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"></div>
                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                        <div className="w-[150vw] h-[150vw] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,215,0,0.1)_10deg,transparent_20deg,rgba(255,215,0,0.1)_30deg,transparent_40deg,rgba(255,215,0,0.1)_50deg,transparent_60deg)] animate-[spin_20s_linear_infinite]"></div>
                    </div>

                    <div className="relative flex flex-col items-center justify-center animate-in zoom-in-50 slide-in-from-bottom-10 duration-500 ease-out-back">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/30 rounded-full blur-[100px]"></div>
                        <div className="relative z-10 filter drop-shadow-[0_0_50px_rgba(234,179,8,0.5)] transform hover:scale-105 transition-transform duration-500">
                           <svg width="280" height="280" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-in zoom-in duration-700">
                              <defs>
                                <linearGradient id="trophyGold" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                  <stop offset="0" stopColor="#FEF08A" />
                                  <stop offset="0.4" stopColor="#EAB308" />
                                  <stop offset="1" stopColor="#A16207" />
                                </linearGradient>
                                <linearGradient id="trophyBase" x1="0" y1="17" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                  <stop offset="0" stopColor="#A16207" />
                                  <stop offset="1" stopColor="#EAB308" />
                                </linearGradient>
                              </defs>
                              <path d="M6 8C4 8 2 9 2 11C2 13 4 14 6 14" stroke="url(#trophyGold)" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M18 8C20 8 22 9 22 11C22 13 20 14 18 14" stroke="url(#trophyGold)" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M6 5H18V11C18 14.3137 15.3137 17 12 17C8.68629 17 6 14.3137 6 11V5Z" fill="url(#trophyGold)" stroke="#CA8A04" strokeWidth="0.5" />
                              <path d="M6 6L7.5 14H16.5L18 6" fill="white" fillOpacity="0.2" />
                              <path d="M11 5V17" stroke="#CA8A04" strokeOpacity="0.3" strokeWidth="0.5"/>
                              <path d="M12 17V20" stroke="url(#trophyGold)" strokeWidth="3" strokeLinecap="round"/>
                              <path d="M8 20H16L17 22H7L8 20Z" fill="url(#trophyBase)" />
                              <circle cx="15" cy="8" r="1.5" fill="white" fillOpacity="0.8" />
                           </svg>
                           
                           <div className="absolute -top-6 -right-10 z-20 animate-[bounce_2s_infinite]">
                              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white text-4xl font-black italic px-5 py-3 rounded-2xl border-[3px] border-white shadow-[0_10px_20px_rgba(220,38,38,0.4)] rotate-12">
                                +1
                              </div>
                           </div>
                        </div>

                        <div className="relative z-10 mt-10 text-center space-y-4">
                             <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-100 drop-shadow-sm italic uppercase tracking-widest animate-pulse">
                               Excellent!
                             </h2>
                             <div className="inline-flex items-center gap-4 bg-[#1C1C1F]/80 border border-yellow-500/20 backdrop-blur-xl px-10 py-4 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 duration-700 delay-100">
                                <img src={rewardingParticipant.img} className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover" alt="" />
                                <div className="text-left">
                                   <div className="text-2xl font-bold text-white leading-none mb-1">{rewardingParticipant.name}</div>
                                   <div className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Congratulations</div>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
                                <div className="flex flex-col items-center leading-none">
                                   <div className="text-xs text-gray-400 font-bold uppercase mb-0.5">Total</div>
                                   <div className="flex items-center gap-1 text-yellow-400 font-black text-3xl">
                                      <TrophyIcon /> {rewardingParticipant.score}
                                   </div>
                                </div>
                             </div>
                        </div>

                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(16)].map((_, i) => {
                                const angle = (i / 16) * 360;
                                const distance = 200 + Math.random() * 100;
                                const x = Math.cos(angle * Math.PI / 180) * distance;
                                const y = Math.sin(angle * Math.PI / 180) * distance;
                                const delay = Math.random() * 0.2;
                                
                                return (
                                  <div 
                                    key={i}
                                    className="absolute w-2.5 h-2.5 rounded-full bg-yellow-400 particle-burst shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        '--tw-translate-x': `${x}px`,
                                        '--tw-translate-y': `${y}px`,
                                        animationDelay: `${delay}s`
                                    } as React.CSSProperties}
                                  />
                                );
                            })}
                        </div>
                    </div>
                 </div>
               )}

               {hasSpotlights && !isCoursewareVisible && (
                 <button 
                   onClick={() => setIsCoursewareVisible(true)}
                   className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#FFD000] text-black w-12 h-20 flex items-center justify-center rounded-l-[1.5rem] shadow-xl z-30 animate-in slide-in-from-right duration-300 border-4 border-white border-r-0 hover:w-14 hover:bg-[#FACC15] transition-all"
                   title="显示课件"
                 >
                   <ChevronLeftIcon />
                 </button>
               )}
            </div>
         </div>

         {/* 聊天面板 */}
         <div className={`fixed right-16 bottom-0 top-12 z-[75] bg-[#1C1C1F] border-l border-[#2D2D33] w-80 transition-transform duration-300 ease-in-out ${isChatOpen && isToolbarVisible ? 'translate-x-0' : 'translate-x-[120%]'}`}>
             <ChatPanel messages={messages} />
         </div>

         {/* 参与者列表面板 */}
         <div className={`fixed right-16 bottom-0 top-12 z-[75] bg-[#1C1C1F] border-l border-[#2D2D33] w-80 transition-transform duration-300 ease-in-out ${isParticipantsPanelOpen && isToolbarVisible ? 'translate-x-0' : 'translate-x-[120%]'}`}>
             <ParticipantsPanel 
               participants={sortedParticipants} 
               spotlightIds={spotlightIds}
               onReward={handleReward}
               onToggleMic={toggleParticipantMic}
               onToggleSpotlight={toggleSpotlight}
             />
         </div>
         
         {/* AI 助教悬浮面板 (AI Assistant Panel) */}
         {isAiPanelOpen && (
             <div className="absolute left-20 top-20 z-[80] w-96 max-h-[600px] flex flex-col bg-[#1C1C1F]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 slide-in-from-left-10 duration-300 ring-1 ring-white/5">
                {/* Header */}
                <div className="h-16 bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                            <RobotIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                           <div className="font-bold text-white text-sm">AI 教学助手</div>
                           <div className="text-[10px] text-indigo-200 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${aiStatus === 'listening' || aiStatus === 'processing' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                              {aiStatus === 'idle' ? '待机中' : aiStatus === 'listening' ? '聆听中...' : '思考中...'}
                           </div>
                        </div>
                    </div>
                    <button onClick={() => setIsAiPanelOpen(false)} className="text-white/70 hover:text-white transition-colors relative z-10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={aiPanelRef} className="flex-1 overflow-y-auto p-4 space-y-4 ai-scroll bg-gradient-to-b from-transparent to-black/20">
                    {aiMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-1 ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                            {msg.type !== 'system' && (
                                <span className="text-[10px] text-gray-500 px-1">{msg.timestamp}</span>
                            )}
                            
                            {msg.type === 'system' ? (
                                <div className="self-center bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-[10px] text-gray-400 flex items-center gap-2 my-1 w-full">
                                    {msg.actionType === 'note' && <div className="p-1 bg-yellow-500/20 rounded text-yellow-500"><TextIcon /></div>}
                                    {msg.actionType === 'alert' && <div className="p-1 bg-red-500/20 rounded text-red-500"><AlertIcon /></div>}
                                    {msg.actionType === 'success' && <div className="p-1 bg-green-500/20 rounded text-green-500"><CheckIcon /></div>}
                                    <span className="flex-1">{msg.content}</span>
                                </div>
                            ) : (
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                                    msg.type === 'user' 
                                      ? 'bg-blue-600 text-white rounded-br-none' 
                                      : 'bg-[#2D2D33] text-gray-100 rounded-bl-none border border-gray-700'
                                }`}>
                                   {msg.content}
                                   {msg.type === 'ai' && msg.actionType === 'success' && (
                                       <div className="mt-2 flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-900/20 px-2 py-1 rounded w-fit">
                                           <CheckIcon /> 操作已执行
                                       </div>
                                   )}
                                </div>
                            )}
                        </div>
                    ))}
                    {aiStatus === 'processing' && (
                        <div className="flex items-center gap-1 p-2">
                           <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                           <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                           <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-[#1C1C1F]">
                    <form onSubmit={handleAiSubmit} className="relative group">
                       <input 
                         type="text" 
                         value={aiInput}
                         onChange={(e) => setAiInput(e.target.value)}
                         placeholder="输入指令，例如：打开课件..." 
                         className="w-full bg-black/30 text-white text-xs rounded-xl py-3 pl-10 pr-10 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-gray-600"
                       />
                       <div className="absolute left-3 top-3 text-indigo-400">
                         <SparklesIcon className="w-4 h-4" />
                       </div>
                       <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={!aiInput.trim()}>
                          <div className="scale-75"><SendIcon /></div>
                       </button>
                    </form>
                    <div className="flex justify-center mt-3">
                         <button className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-indigo-400 transition-colors">
                             <div className="w-6 h-6 rounded-full border border-gray-700 flex items-center justify-center"><MicIcon /></div>
                             <span>按住说话</span>
                         </button>
                    </div>
                </div>
             </div>
         )}

         {/* 侧边工具栏 */}
         <div className={`bg-[#18181B] border-l border-[#2D2D33] flex flex-col items-center py-8 gap-6 transition-all duration-300 ease-in-out relative ${tourStep === 6 ? 'z-[110]' : 'z-[80]'} ${isToolbarVisible ? 'w-16' : 'w-0 overflow-hidden'}`}>
            {tourStep === 6 && <TourPulse className="absolute inset-0 pointer-events-none z-[90] opacity-50" />}
            
            {[
              { id: 'pointer', Icon: PointerIcon },
              { id: 'pen', Icon: PenIcon },
              { id: 'text', Icon: TextIcon },
              { id: 'eraser', Icon: EraserIcon },
              { id: 'hand', Icon: HandIcon },
              { id: 'resources', Icon: ResourcesIcon },
              { id: 'cloud', Icon: CloudIcon },
              { id: 'users', Icon: UsersIcon },
              { id: 'portrait', Icon: PortraitIcon },
              { id: 'ai', Icon: RobotIcon } // Added AI Tool
            ].map(({ id, Icon }) => {
              const isActive = id === 'portrait' ? showPortrait : 
                               id === 'users' ? isParticipantsPanelOpen : 
                               id === 'ai' ? isAiPanelOpen :
                               activeTool === id;
              
              // Special styling for AI button
              const isAi = id === 'ai';
              
              return (
                <button 
                  key={id} 
                  onClick={() => handleToolClick(id)}
                  className={`p-3 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-90 ${
                      isActive 
                        ? (isAi ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-blue-600 text-white shadow-lg') 
                        : (isAi ? 'text-indigo-400 hover:text-white hover:bg-indigo-900/50' : 'text-gray-500 hover:text-white hover:bg-[#25252B]')
                  }`}
                  title={
                      id === 'portrait' ? (showPortrait ? "隐藏人像" : "显示人像") : 
                      id === 'users' ? "参与者管理" : 
                      id === 'ai' ? "AI 助教" :
                      id
                  }
                >
                  <Icon />
                </button>
              );
            })}
            <div className="mt-auto px-2 w-full flex flex-col items-center gap-6">
               <button 
                 onClick={() => {
                   setIsChatOpen(!isChatOpen);
                   if (!isChatOpen) {
                       setIsParticipantsPanelOpen(false);
                       setIsAiPanelOpen(false);
                   }
                 }}
                 className={`w-11 h-11 rounded-2xl transition-all shadow-xl flex items-center justify-center relative ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white'}`}
               >
                 <ChatIcon />
                 {unreadCount > 0 && (
                   <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-bounce border-2 border-[#18181B]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                   </div>
                 )}
               </button>
               <button onClick={() => setIsToolbarVisible(false)} className="text-gray-600 hover:text-white transition-colors transform hover:scale-110"><ChevronRightIcon /></button>
            </div>
         </div>
         
         {/* Pen Control Panel Overlay */}
         {activeTool === 'pen' && (
             <PenControlPanel 
               color={penColor} 
               width={penWidth} 
               type={penToolType}
               onColorChange={setPenColor}
               onWidthChange={setPenWidth}
               onTypeChange={setPenToolType}
               onToolChange={(tool) => setActiveTool(tool)}
             />
         )}

         {!isToolbarVisible && (
            <button 
              onClick={() => setIsToolbarVisible(true)}
              className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#18181B] w-8 h-16 flex items-center justify-center rounded-l-xl shadow-2xl z-[80] border border-white/5 border-r-0 hover:w-10 transition-all duration-300 animate-in slide-in-from-right"
            >
              <ChevronLeftIcon />
            </button>
         )}
      </div>

      {/* Confirmation Modals */}
      {showExitConfirm && (
        <ConfirmationModal 
          title="确认退出课堂?"
          message="退出后将中断当前连接，确定要离开吗？"
          type="danger"
          onConfirm={confirmExit}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {showStopConfirm && (
        <ConfirmationModal 
          title="确认结束上课?"
          message="结束上课将停止推流并断开所有学员连麦，确定结束吗？"
          type="danger"
          onConfirm={confirmStopLive}
          onCancel={() => setShowStopConfirm(false)}
        />
      )}

      {/* Settings Modal Layer */}
      {showSettings && (
        <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <DeviceSetup 
             onFinish={() => setShowSettings(false)} 
             mirror={mirror} 
             onMirrorChange={onMirrorChange} 
           />
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl z-[250] animate-in fade-in slide-in-from-top-4 flex items-center gap-2 backdrop-blur-md border border-white/10">
          <CheckIcon />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tour Guide Overlay Content */}
      {tourStep > 0 && <TourGuide step={tourStep} onNext={handleNextTour} onSkip={handleSkipTour} />}
    </div>
  );
};

// ... RenderElement Component ...
const RenderElement: React.FC<{ el: DrawingElement }> = ({ el }) => {
    const { type, color, width, points, start, end } = el;

    if (type === 'freehand' && points) {
        if (points.length < 2) return null;
        const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    }

    if (!start || !end) return null;

    if (type === 'rect') {
        const x = Math.min(start.x, end.x);
        const y = Math.min(start.y, end.y);
        const w = Math.abs(start.x - end.x);
        const h = Math.abs(start.y - end.y);
        return <rect x={x} y={y} width={w} height={h} stroke={color} strokeWidth={width} fill="none" />;
    }

    if (type === 'circle') {
        const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        return <circle cx={start.x} cy={start.y} r={r} stroke={color} strokeWidth={width} fill="none" />;
    }

    if (type === 'line') {
        return <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={width} strokeLinecap="round" />;
    }
    
    if (type === 'arrow') {
        return (
          <line 
            x1={start.x} 
            y1={start.y} 
            x2={end.x} 
            y2={end.y} 
            stroke={color} 
            strokeWidth={width} 
            strokeLinecap="round" 
            markerEnd="url(#arrowhead)" 
          />
        );
    }
    
    if (type === 'triangle') {
        // Calculate triangle points based on bounding box
        const x1 = (start.x + end.x) / 2;
        const y1 = start.y;
        const x2 = start.x;
        const y2 = end.y;
        const x3 = end.x;
        const y3 = end.y;
        return <polygon points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} stroke={color} strokeWidth={width} fill="none" />;
    }

    if (type === 'diamond') {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        return <polygon points={`${midX},${start.y} ${end.x},${midY} ${midX},${end.y} ${start.x},${midY}`} stroke={color} strokeWidth={width} fill="none" />;
    }

    if (type === 'star') {
        // Simplified star logic within bounding box
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        const outerRadius = Math.min(Math.abs(start.x - end.x), Math.abs(start.y - end.y)) / 2;
        const innerRadius = outerRadius / 2;
        let pointsStr = "";
        for (let i = 0; i < 10; i++) {
             const angle = Math.PI / 5 * i - Math.PI / 2;
             const r = i % 2 === 0 ? outerRadius : innerRadius;
             pointsStr += `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r} `;
        }
        return <polygon points={pointsStr} stroke={color} strokeWidth={width} fill="none" />;
    }

    return null;
};

// ... Pen Control Panel ...
const PenControlPanel: React.FC<{
    color: string;
    width: number;
    type: string;
    onColorChange: (color: string) => void;
    onWidthChange: (width: number) => void;
    onTypeChange: (type: string) => void;
    onToolChange: (tool: string) => void;
}> = ({ color, width, type, onColorChange, onWidthChange, onTypeChange, onToolChange }) => {
    
    const shapes = [
        { id: 'freehand', Icon: PenIcon },
        { id: 'rect', Icon: ShapeRectIcon },
        { id: 'circle', Icon: ShapeCircleIcon },
        { id: 'line', Icon: ShapeLineIcon },
        { id: 'star', Icon: ShapeStarIcon },
        { id: 'diamond', Icon: ShapeDiamondIcon },
        { id: 'arrow', Icon: ShapeArrowIcon },
        { id: 'triangle', Icon: ShapeTriangleIcon },
    ];

    const colors = [
        '#FFFFFF', '#9CA3AF', '#4B5563', '#000000',
        '#EF4444', '#F59E0B', '#FACC15', '#4ADE80',
        '#A855F7', '#2DD4BF', '#3B82F6', '#F472B6'
    ];

    return (
        <div className="absolute right-[4.5rem] top-[88px] flex items-start gap-3 z-[150] animate-in slide-in-from-right-10 fade-in duration-200 pointer-events-auto">
            {/* Main Settings Panel */}
            <div className="bg-[#1C1C1F] p-4 rounded-xl border border-[#2D2D33] shadow-2xl w-56 flex flex-col gap-5 relative">
                {/* Arrow Pointer */}
                <div className="absolute top-8 -right-2 w-4 h-4 bg-[#1C1C1F] border-t border-r border-[#2D2D33] rotate-45"></div>

                {/* Shapes Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {shapes.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => onTypeChange(s.id)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-[#333] ${type === s.id ? 'text-[#3B82F6] bg-[#3B82F6]/10 ring-1 ring-[#3B82F6]' : 'text-gray-400'}`}
                        >
                            <s.Icon />
                        </button>
                    ))}
                </div>

                {/* Width Slider */}
                <div className="px-1 py-2 border-t border-b border-[#2D2D33]">
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={width} 
                        onChange={(e) => onWidthChange(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                </div>

                {/* Colors Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {colors.map(c => (
                        <button 
                            key={c}
                            onClick={() => onColorChange(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... ParticipantsPanel ...
const ParticipantsPanel: React.FC<{
  participants: Participant[];
  spotlightIds: number[];
  onReward: (id: number) => void;
  onToggleMic: (id: number) => void;
  onToggleSpotlight: (id: number) => void;
}> = ({ participants, spotlightIds, onReward, onToggleMic, onToggleSpotlight }) => {
  const [viewMode, setViewMode] = useState<'list' | 'group'>('list');

  // Group participants by their group field
  const groupedParticipants = useMemo(() => {
    const groups: { [key: string]: Participant[] } = {};
    participants.forEach(p => {
      const g = p.group || '未分组';
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });
    return groups;
  }, [participants]);

  const renderParticipantItem = (p: Participant) => {
    const isSpotlight = spotlightIds.includes(p.id);
    const rank = participants.findIndex(item => item.id === p.id) + 1;

    let rankBadgeClass = "bg-[#3E3E42] text-gray-500 border border-transparent";
    if (rank === 1) rankBadgeClass = "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border border-yellow-300 shadow-sm";
    if (rank === 2) rankBadgeClass = "bg-gradient-to-br from-slate-300 to-slate-400 text-white border border-slate-200 shadow-sm";
    if (rank === 3) rankBadgeClass = "bg-gradient-to-br from-orange-400 to-orange-600 text-white border border-orange-300 shadow-sm";

    return (
      <div key={p.id} className="flex items-center justify-between p-3 bg-[#2D2D33] rounded-xl mb-2 hover:bg-[#3E3E42] transition-colors group">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black italic shrink-0 ${rankBadgeClass}`}>
             {rank}
          </div>
          
          <div className="relative shrink-0">
             <img src={p.img} alt={p.name} className={`w-9 h-9 rounded-full object-cover border transition-all ${isSpotlight ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-white/10'}`} />
             {isSpotlight && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-[2px] border-2 border-[#2D2D33] shadow-sm animate-in zoom-in duration-200" title="已上台">
                   <VideoIcon className="w-2.5 h-2.5" />
                </div>
             )}
          </div>

          <div className="flex flex-col min-w-0">
             <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs font-bold text-white truncate" title={p.name}>{p.name}</span>
             </div>
             <div className="flex items-center gap-1 text-[10px] text-gray-400">
               <TrophyIcon className="w-3 h-3" /> {p.score}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
           <button 
             onClick={() => onReward(p.id)}
             className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B] hover:text-black flex items-center justify-center transition-all active:scale-95"
             title="奖励"
           >
             <TrophyIcon className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={() => onToggleMic(p.id)}
             className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 ${p.isMicOn ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white'}`}
             title={p.isMicOn ? "关闭麦克风" : "开启麦克风"}
           >
             {p.isMicOn ? <MicIcon /> : <MicOffIcon />}
           </button>
           <button 
             onClick={() => onToggleSpotlight(p.id)}
             className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 ${isSpotlight ? 'bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white'}`}
             title={isSpotlight ? "下台" : "上台"}
           >
             {isSpotlight ? <UserRemoveIcon /> : <PlusIcon />}
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#1C1C1F] text-white select-none">
       {/* Header */}
       <div className="p-4 border-b border-[#2D2D33] flex items-center justify-between shrink-0">
          <div className="font-bold text-sm">参与者 ({participants.length})</div>
       </div>

       {/* Tabs */}
       <div className="flex p-2 gap-2 shrink-0">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#2D2D33] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            全部列表
          </button>
          <button 
            onClick={() => setViewMode('group')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'group' ? 'bg-[#2D2D33] text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
          >
            分组视图
          </button>
       </div>

       {/* List Content */}
       <div className="flex-1 overflow-y-auto p-3 dark-scroll">
          {viewMode === 'list' ? (
             participants.map(renderParticipantItem)
          ) : (
             <div className="space-y-4">
                {Object.keys(groupedParticipants).map(groupName => (
                  <div key={groupName} className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-bold text-gray-300">{groupName}</span>
                        <span className="text-[10px] text-gray-500 bg-[#2D2D33] px-1.5 rounded-full">{groupedParticipants[groupName].length}</span>
                     </div>
                     <div>
                       {groupedParticipants[groupName].map(renderParticipantItem)}
                     </div>
                  </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

// ... AdaptiveStageGrid ...
const AdaptiveStageGrid: React.FC<{
  participants: Participant[],
  getRank: (id: number) => number,
  onToggleSpotlight: (id: number) => void,
  onReward: (id: number) => void,
  onToggleMic: (id: number) => void
}> = ({ participants, getRank, onToggleSpotlight, onReward, onToggleMic }) => {
  const count = participants.length;

  if (count > 3) {
    const cols = count <= 4 ? 2 : count <= 9 ? 3 : 4;
    return (
      <div className={`grid gap-6 w-full h-full max-w-[1400px] animate-in fade-in duration-300`}
           style={{ 
             gridTemplateColumns: `repeat(${cols}, 1fr)`,
             gridTemplateRows: `repeat(${Math.ceil(count / cols)}, 1fr)` 
           }}>
        {participants.map(p => (
          <div key={p.id} className="relative rounded-[2rem] overflow-hidden bg-black shadow-lg border-2 border-black/10 transition-all duration-300 animate-in zoom-in-95">
             <SpotlightCard 
                p={p} 
                rank={getRank(p.id)} 
                isHero={false}
                isUniform={count > 6}
                onClose={() => onToggleSpotlight(p.id)} 
                onReward={() => onReward(p.id)}
                onToggleMic={() => onToggleMic(p.id)}
              />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-5 max-w-[1400px]">
       <div className={`flex gap-5 transition-all duration-400 ${count === 1 ? 'h-full' : 'h-[65%] min-h-[300px]'}`}>
          <div className={`relative rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border-4 border-black/10 transition-all duration-400 animate-in zoom-in-95 ${count === 1 ? 'flex-1' : count === 2 ? 'flex-1' : 'flex-[1.6]'}`}>
            <SpotlightCard 
               p={participants[0]} 
               rank={getRank(participants[0].id)} 
               isHero={true} // Main card is always hero in 1-3 layout
               onClose={() => onToggleSpotlight(participants[0].id)} 
               onReward={() => onReward(participants[0].id)}
               onToggleMic={() => onToggleMic(participants[0].id)}
            />
          </div>
          {count > 1 && (
            <div className={`flex flex-col gap-5 animate-in slide-in-from-right duration-300 ${count === 2 ? 'flex-1' : 'flex-1'}`}>
               {participants.slice(1, 3).map(p => (
                 <div key={p.id} className="flex-1 relative rounded-[2.5rem] overflow-hidden bg-black shadow-xl border-2 border-black/10 transition-all duration-400 animate-in zoom-in-95">
                   <SpotlightCard 
                     p={p} 
                     rank={getRank(p.id)} 
                     isHero={false}
                     isUniform={count > 2} // Treat side cards as "small/uniform" if 3 participants
                     onClose={() => onToggleSpotlight(p.id)} 
                     onReward={() => onReward(p.id)}
                     onToggleMic={() => onToggleMic(p.id)}
                   />
                 </div>
               ))}
            </div>
          )}
       </div>
    </div>
  );
};

// ... ParticipantImage ...
const ParticipantImage: React.FC<{ src: string, name: string, isSpotlight?: boolean }> = ({ src, name, isSpotlight }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <img 
      src={imgSrc} 
      alt={name} 
      onError={() => {
        if (!hasError) {
          setImgSrc(FALLBACK_IMG);
          setHasError(true);
        }
      }}
      className={`w-full h-full object-cover transition-all duration-500 ${isSpotlight ? 'opacity-100 scale-105' : 'opacity-50 group-hover:opacity-70'}`} 
    />
  );
};

// ... CoursewareContent ...
const CoursewareContent: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => {
  return (
    <div className={`flex flex-col h-full bg-white transition-all duration-500 ease-in-out ${isFullscreen ? '' : 'rounded-[1rem] overflow-hidden'}`}>
        <div className="bg-[#FFD000] py-3 text-center shrink-0 shadow-sm">
           <span className="bg-[#92400E] text-white px-8 py-1.5 rounded-full text-[10px] font-black shadow-lg uppercase tracking-widest inline-block border border-white/20">现场活动三</span>
        </div>
        <div className={`flex-1 flex ${isFullscreen ? 'flex-row p-10 gap-10' : 'flex-col p-4 gap-4'} overflow-hidden transition-all duration-500`}>
           <div className={`flex-1 bg-[#F5F5F7] rounded-[2.5rem] overflow-hidden border border-gray-100 relative shadow-inner ${isFullscreen ? 'flex-[1.8]' : 'min-h-[160px]'}`}>
              <div className="absolute top-4 left-4 bg-[#EF4444] text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-10 shadow-md uppercase">互动教研资源</div>
              <img src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" alt="Course" />
           </div>
           <div className={`flex flex-col gap-4 ${isFullscreen ? 'flex-1 py-4 justify-center' : 'py-2'}`}>
              <h3 className={`${isFullscreen ? 'text-5xl' : 'text-xl'} font-black text-gray-900 border-b-4 border-[#FFD000] w-fit italic leading-none pb-1 uppercase tracking-tighter transition-all duration-500`}>教学提示</h3>
              <div className={`bg-[#FFFBEB] ${isFullscreen ? 'p-8 text-xl' : 'p-3 text-xs'} rounded-[2rem] border-l-4 border-[#F59E0B] shadow-sm transition-all duration-500`}>
                <p className="text-gray-800 leading-relaxed font-bold tracking-tight">请现场教师组织学生随伴奏音乐边唱歌边进行自主练习。</p>
              </div>
              <div className={`bg-gradient-to-br from-[#E11D48] to-[#9F1239] ${isFullscreen ? 'p-10 mt-auto' : 'p-4 mt-2'} rounded-[3rem] text-center shadow-2xl border-2 border-white/10 transition-all duration-500`}>
                 <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.4em] block mb-1">倒计时</span>
                 <div className={`${isFullscreen ? 'text-8xl' : 'text-4xl'} font-black text-white font-mono tracking-tighter flex items-end justify-center`}>
                   285<span className={`${isFullscreen ? 'text-4xl' : 'text-xl'} font-bold text-white/40 mb-3 ml-1`}>S</span>
                 </div>
              </div>
           </div>
        </div>
    </div>
  );
};

// ... SpotlightCard ...
const SpotlightCard: React.FC<{ 
  p: Participant, 
  rank: number, 
  isHero: boolean,
  isUniform?: boolean,
  onClose: () => void,
  onReward: () => void,
  onToggleMic: () => void
}> = ({ p, rank, isHero, isUniform, onClose, onReward, onToggleMic }) => {
  
  const rankTheme = useMemo(() => {
    if (rank === 1) return { badge: 'bg-[#F59E0B] text-white' };
    if (rank === 2) return { badge: 'bg-[#94A3B8] text-white' };
    if (rank === 3) return { badge: 'bg-[#B45309] text-white' };
    return { badge: 'bg-black/60 text-white backdrop-blur-md' };
  }, [rank]);

  const nameSize = isHero ? 'text-4xl lg:text-5xl xl:text-6xl' : isUniform ? 'text-[18px]' : 'text-3xl';
  const schoolSize = isHero ? 'text-xl font-bold' : isUniform ? 'text-[10px]' : 'text-sm font-bold';
  const badgeSize = isHero ? 'px-14 py-5 text-5xl xl:text-6xl' : isUniform ? 'px-6 py-2 text-[14px]' : 'px-10 py-4 text-[26px]';
  const scoreBadgeSize = isHero ? 'w-28 h-28 text-5xl' : isUniform ? 'w-16 h-8 text-[14px]' : 'w-28 h-14 text-[24px]';
  
  // Adaptive button size based on camera/card size context
  const buttonSize = isHero ? 'w-14 h-14' : isUniform ? 'w-9 h-9' : 'w-11 h-11';
  const iconScale = isHero ? 'scale-110' : isUniform ? 'scale-75' : 'scale-90';

  const trophySizeClass = isHero ? 'w-10 h-10' : isUniform ? 'w-4 h-4' : 'w-7 h-7';

  return (
    <div className={`w-full h-full relative group bg-[#0A0A0C] flex items-center justify-center transition-all duration-300 ease-in-out`}>
      <div className="w-full h-full aspect-video relative flex items-center justify-center overflow-hidden">
        <ParticipantImage src={p.img} name={p.name} isSpotlight={true} />

        <div className={`absolute top-0 left-0 ${rankTheme.badge} font-black italic rounded-br-[3rem] shadow-2xl z-10 uppercase tracking-tighter ${badgeSize} flex items-center justify-center transition-all duration-300 ease-in-out border-b-4 border-r-4 border-black/10`}>
           NO.{rank}
        </div>

        <div className={`absolute inset-0 flex flex-col justify-end transition-all duration-300 ${isHero ? 'p-12' : 'p-6'}`}>
           <div className={`font-black text-blue-400 uppercase tracking-widest mb-2 leading-none drop-shadow-lg transition-all ${schoolSize}`}>{p.school || 'ACADEMY'}</div>
           <div className="flex items-center gap-4">
              <div className={`w-4.5 h-4.5 rounded-full shrink-0 ${p.isMicOn ? 'bg-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'bg-gray-500 shadow-[0_0_15px_rgba(107,114,128,0.8)]'}`}></div>
              <span className={`font-black truncate uppercase leading-none drop-shadow-2xl transition-all ${nameSize} text-white`}>{p.name}</span>
           </div>
        </div>

        <div className={`absolute right-6 top-1/2 -translate-x-1/2 bg-white text-[#F59E0B] rounded-full flex items-center justify-center gap-2 shadow-[0_15px_40px_rgba(0,0,0,0.4)] border-2 border-white/20 transition-all duration-300 ${scoreBadgeSize}`}>
           <TrophyIcon className={trophySizeClass} />
           <span className="font-black pt-1">{p.score}</span>
        </div>

        {/* 悬浮操作条 */}
        <div className={`absolute top-3 right-3 flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out z-50 ${isHero ? 'top-6 right-6 gap-4' : ''}`}>
           <button 
             onClick={(e) => { e.stopPropagation(); onReward(); }} 
             className={`${buttonSize} rounded-xl bg-yellow-500/90 text-black border border-white/20 backdrop-blur-md hover:scale-110 hover:bg-yellow-400 transition-all duration-100 flex items-center justify-center shadow-xl active:scale-90`}
             title="奖励奖杯"
           >
             <span className={iconScale}><TrophyIcon /></span>
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleMic(); }} 
             className={`${buttonSize} rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition-all duration-100 shadow-xl active:scale-90 ${p.isMicOn ? 'bg-blue-600/90 text-white hover:bg-blue-500' : 'bg-red-600/90 text-white hover:bg-red-500'}`}
             title={p.isMicOn ? "禁麦" : "开麦"}
           >
             <span className={iconScale}>{p.isMicOn ? <MicIcon /> : <MicOffIcon />}</span>
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onClose(); }} 
             className={`${buttonSize} rounded-xl bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-red-600 hover:text-white transition-all duration-100 flex items-center justify-center shadow-xl active:scale-90`}
             title="下台"
           >
             <span className={iconScale}><UserRemoveIcon /></span>
           </button>
        </div>
      </div>
    </div>
  );
};

// ... ChatPanel ...
const ChatPanel: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-[#1C1C1F] text-white">
      <div className="p-4 border-b border-[#2D2D33] flex items-center justify-between">
         <span className="font-bold text-sm">互动消息 ({messages.length})</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 dark-scroll">
         {messages.map((chat, i) => (
           <div key={i} className="flex flex-col gap-1 animate-in slide-in-from-right-2 fade-in duration-300">
              <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold ${chat.type === 'teacher' ? 'text-yellow-500' : 'text-blue-400'}`}>{chat.user}</span>
                 <span className="text-[10px] text-gray-500">{chat.time || "10:20"}</span>
              </div>
              <div className="bg-[#2D2D33] p-2 rounded-lg rounded-tl-none text-xs text-gray-200 leading-relaxed break-words">
                {chat.msg}
              </div>
           </div>
         ))}
         <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t border-[#2D2D33]">
         <div className="relative">
           <input 
             type="text" 
             placeholder="发送消息..." 
             className="w-full bg-[#121214] text-white text-xs rounded-full py-2.5 pl-4 pr-10 border border-[#2D2D33] focus:border-blue-500 focus:outline-none"
           />
           <button className="absolute right-1.5 top-1.5 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-500">
             <div className="scale-75"><SendIcon /></div>
           </button>
         </div>
      </div>
    </div>
  );
};

// ... ConfirmationModal ...
const ConfirmationModal: React.FC<{ 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void,
  type?: 'danger' | 'info'
}> = ({ title, message, onConfirm, onCancel, type = 'info' }) => {
  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
       <div className="bg-[#1C1C1F] border border-[#333] p-8 rounded-2xl w-[400px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
            <AlertIcon />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4 w-full">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-[#2D2D33] text-gray-300 hover:bg-[#3E3E42] hover:text-white font-bold text-sm transition-all">取消</button>
            <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg hover:brightness-110 transition-all ${type === 'danger' ? 'bg-red-600' : 'bg-blue-600'}`}>确认</button>
          </div>
       </div>
    </div>
  );
};

// Tour Components
const TourPulse: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`border-4 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-pulse ${className}`} />
);

const TourGuide: React.FC<{ step: number, onNext: () => void, onSkip: () => void }> = ({ step, onNext, onSkip }) => {
  const content = [
    { title: "欢迎使用", text: "欢迎进入在线教研课堂直播间，接下来将为您介绍核心功能操作。", position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
    { title: "状态监测", text: "左上角实时显示网络信号状态及课堂持续时长，时刻掌握课堂动态。", position: "top-16 left-6" },
    { title: "课堂控制", text: "顶部中央为课堂控制主开关。点击【开始上课】即可启动课堂直播。", position: "top-16 left-1/2 -translate-x-1/2 -translate-y-1/2" },
    { title: "学员管理", text: "此区域展示在线学员列表。点击学员头像可将其请上舞台(Spotlight)，悬浮头像可控制麦克风或奖励奖杯。", position: "top-40 left-6" },
    { title: "核心舞台", text: "中央区域为教学主舞台。展示互动课件内容或上台学员的实时视频画面，支持自适应网格布局。", position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
    { title: "教学工具", text: "工具栏右侧提供丰富的教学工具，如画笔、文本、云盘资源等，点击图标即可激活使用。", position: "right-20 top-1/2 -translate-y-1/2" },
    { title: "系统设置", text: "右上角功能区可进行摄像头/麦克风设备调试、复制课堂邀请链接以及安全退出课堂。", position: "top-16 right-6" },
  ];

  const current = content[step - 1];
  if (!current) return null;

  return (
    <div className="absolute inset-0 z-[300] pointer-events-none">
       <div className={`absolute ${current.position} pointer-events-auto max-w-sm`}>
         <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-2xl border-4 border-blue-500 animate-in zoom-in slide-in-from-bottom-5 duration-300 relative">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-xl text-blue-600">{current.title}</h3>
              <span className="text-gray-400 text-xs font-bold bg-gray-100 px-2 py-1 rounded-full">{step} / 7</span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed font-medium text-sm">{current.text}</p>
            <div className="flex gap-3 justify-end">
               <button onClick={onSkip} className="px-4 py-2 text-gray-400 hover:text-gray-600 text-sm font-bold">跳过</button>
               <button onClick={onNext} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95">
                 {step === 7 ? '开始上课' : '下一步'}
               </button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default Classroom;