
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeftIcon, ClockHistoryIcon, CommentIcon, DownloadIcon, EyeIcon, 
  FileIcon, FileTextIcon, ImageIcon, ListIcon, ShareIcon, UsersIcon, 
  BoldIcon, ItalicIcon, UnderlineIcon, LinkIcon, UndoIcon, RedoIcon,
  CheckCircleIcon, SettingsIcon, ChatIcon, SendIcon, PowerIcon
} from './Icons';

interface WorkbenchProps {
  onBack: () => void;
}

const COLLABORATORS = [
  { id: 1, name: "王老师", color: "#3B82F6", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wang" },
  { id: 2, name: "李主任", color: "#F59E0B", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Li" },
  { id: 3, name: "张教研", color: "#10B981", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang" },
];

const RESOURCES = [
  { id: 1, name: "第一单元教学大纲.pdf", size: "2.4MB", type: "pdf" },
  { id: 2, name: "课堂活动参考图.jpg", size: "1.2MB", type: "img" },
  { id: 3, name: "优秀教案范例.docx", size: "540KB", type: "doc" },
  { id: 4, name: "教学反思模板.docx", size: "120KB", type: "doc" },
];

const Workbench: React.FC<WorkbenchProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'history' | 'chat'>('chat');
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<string>('刚刚');
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  // Fake Cursors State
  const [cursors, setCursors] = useState<{id: number, x: number, y: number}[]>([
    { id: 2, x: 200, y: 150 },
    { id: 3, x: 450, y: 320 }
  ]);

  // Chat State
  const [messages, setMessages] = useState([
     { user: "李主任", msg: "教案的大纲部分我已经补充得差不多了。", time: "10:30" },
     { user: "张教研", msg: "好的，我正在整理活动环节的设计。", time: "10:32" },
  ]);
  const [inputMsg, setInputMsg] = useState("");

  // Auto-save Simulation
  useEffect(() => {
    const timer = setInterval(() => {
        setLastSaved(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Cursor Movement Simulation
  useEffect(() => {
    const timer = setInterval(() => {
        setCursors(prev => prev.map(c => ({
            ...c,
            x: Math.max(50, Math.min(600, c.x + (Math.random() - 0.5) * 100)),
            y: Math.max(100, Math.min(800, c.y + (Math.random() - 0.5) * 100))
        })));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([...messages, { user: "我", msg: inputMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInputMsg("");
  };

  return (
    <div className="h-screen flex flex-col bg-[#F9FAFB] font-sans overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ChevronLeftIcon />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded border border-blue-200 font-bold">听评课</span>
                        <h1 className="text-sm font-bold text-gray-800">2026年春季学期听评课活动备课</h1>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><CheckCircleIcon className="w-3 h-3 text-green-500" /> 已保存</span>
                        <span>|</span>
                        <span>最后修改: {lastSaved}</span>
                    </div>
                </div>
            </div>

            {/* Editor Toolbar */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <ToolBtn icon={<UndoIcon />} tooltip="撤销" />
                <ToolBtn icon={<RedoIcon />} tooltip="重做" />
                <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                <ToolBtn icon={<BoldIcon />} tooltip="加粗" active />
                <ToolBtn icon={<ItalicIcon />} tooltip="斜体" />
                <ToolBtn icon={<UnderlineIcon />} tooltip="下划线" />
                <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                <ToolBtn icon={<ListIcon />} tooltip="列表" />
                <ToolBtn icon={<LinkIcon />} tooltip="插入链接" />
                <ToolBtn icon={<ImageIcon />} tooltip="插入图片" />
            </div>

            <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                    {COLLABORATORS.map(c => (
                        <img key={c.id} src={c.avatar} className="w-8 h-8 rounded-full border-2 border-white cursor-pointer hover:z-10 transition-transform hover:scale-110" title={c.name} />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-bold">+2</div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                    <ShareIcon /> 分享
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500">
                    <SettingsIcon />
                </button>
            </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar: Resources */}
            <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <FileIcon /> 资源库
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {RESOURCES.map(res => (
                        <div key={res.id} draggable className="group p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 cursor-grab active:cursor-grabbing transition-all">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase shrink-0">
                                    {res.type}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-700 truncate mb-1 group-hover:text-blue-700">{res.name}</div>
                                    <div className="text-[10px] text-gray-400">{res.size}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <p className="text-xs text-gray-400">拖拽文件上传</p>
                    </div>
                </div>
            </aside>

            {/* Center: Editor Canvas */}
            <main className="flex-1 overflow-y-auto bg-[#F0F2F5] p-8 relative" onClick={() => {}}>
                <div className="max-w-[850px] min-h-[1000px] bg-white mx-auto shadow-sm border border-gray-200 rounded-sm p-12 relative cursor-text group">
                    {/* Simulated Content */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">第一单元：声音的探索</h1>
                    
                    <div className="space-y-4 text-gray-800 leading-relaxed relative">
                        <p>
                            <span className="font-bold">一、教学目标</span>
                            <br/>
                            1. 让学生感知生活中各种不同的声音，分辨声音的大小、高低。
                            <br/>
                            2. 培养学生对声音的兴趣，乐于参与音乐活动。
                        </p>
                        
                        <p>
                            <span className="font-bold">二、教学重难点</span>
                            <br/>
                            重点：引导学生积极参与声音探索活动。
                            <span className="bg-yellow-200/50 relative cursor-pointer group/comment border-b-2 border-yellow-400">
                                难点：如何引导学生用恰当的语言描述声音的特点。
                                {/* Comment Indicator */}
                                <div className="absolute -right-6 top-0 text-yellow-500 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                    <CommentIcon />
                                </div>
                            </span>
                        </p>

                        <p>
                            <span className="font-bold">三、教学准备</span>
                            <br/>
                            多媒体课件、各种打击乐器（如铃鼓、三角铁等）。
                        </p>

                        <div className="h-32 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                            [ 图片占位: 乐器展示图 ]
                        </div>
                    </div>

                    {/* Collaborative Cursors Simulation */}
                    {cursors.map(cursor => {
                        const user = COLLABORATORS.find(u => u.id === cursor.id);
                        return (
                            <div 
                                key={cursor.id} 
                                className="absolute pointer-events-none transition-all duration-500 ease-out z-10"
                                style={{ left: cursor.x, top: cursor.y }}
                            >
                                <div className="h-5 w-[2px] absolute" style={{ backgroundColor: user?.color }}></div>
                                <div 
                                    className="absolute left-0 -top-5 text-[10px] text-white px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm"
                                    style={{ backgroundColor: user?.color }}
                                >
                                    {user?.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Right Sidebar: Tools & Chat */}
            <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <TabBtn id="chat" label="讨论" icon={<ChatIcon />} active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
                    <TabBtn id="history" label="历史" icon={<ClockHistoryIcon />} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
                    {activeTab === 'chat' && (
                        <>
                           <div className="flex-1 overflow-y-auto p-4 space-y-4">
                               {messages.map((msg, i) => (
                                   <div key={i} className={`flex flex-col gap-1 ${msg.user === '我' ? 'items-end' : 'items-start'}`}>
                                       <div className="flex items-center gap-2">
                                           <span className="text-[10px] font-bold text-gray-500">{msg.user}</span>
                                           <span className="text-[9px] text-gray-400">{msg.time}</span>
                                       </div>
                                       <div className={`p-2 rounded-lg text-xs max-w-[90%] shadow-sm ${msg.user === '我' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'}`}>
                                           {msg.msg}
                                       </div>
                                   </div>
                               ))}
                           </div>
                           <div className="p-3 bg-white border-t border-gray-200">
                               <form onSubmit={handleSendMessage} className="relative">
                                   <input 
                                     type="text" 
                                     value={inputMsg}
                                     onChange={(e) => setInputMsg(e.target.value)}
                                     placeholder="发送消息..." 
                                     className="w-full pl-3 pr-10 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full text-xs transition-all outline-none"
                                   />
                                   <button type="submit" className="absolute right-1 top-1 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                                       <div className="scale-75"><SendIcon /></div>
                                   </button>
                               </form>
                           </div>
                        </>
                    )}
                    {activeTab === 'history' && (
                        <div className="p-4 space-y-4">
                            <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                                {[
                                    { time: '刚刚', user: '我', action: '修改了教学重难点' },
                                    { time: '10:32', user: '张教研', action: '上传了参考图.jpg' },
                                    { time: '10:15', user: '王老师', action: '创建了文档' },
                                ].map((log, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[21px] top-0 w-3 h-3 bg-gray-400 rounded-full ring-4 ring-white"></div>
                                        <div className="text-xs text-gray-500 mb-1">{log.time}</div>
                                        <div className="text-sm text-gray-800">
                                            <span className="font-bold text-blue-600">{log.user}</span> {log.action}
                                        </div>
                                        <button className="text-[10px] text-blue-500 hover:underline mt-1">恢复此版本</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
        
        {/* Bottom Status Bar */}
        <div className="h-6 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-[10px] text-gray-500 shrink-0">
            <div className="flex gap-4">
                <span>文档状态: <span className="text-green-600 font-bold">已同步</span></span>
                <span>字数: 3,452</span>
            </div>
            <div className="flex gap-4">
                <span>在线协作: 4人</span>
                <span>最后保存: {lastSaved}</span>
            </div>
        </div>
    </div>
  );
};

const ToolBtn = ({ icon, tooltip, active }: { icon: React.ReactNode, tooltip: string, active?: boolean }) => (
    <button 
        className={`p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors ${active ? 'bg-gray-200 text-blue-600' : ''}`}
        title={tooltip}
    >
        <div className="scale-90">{icon}</div>
    </button>
);

const TabBtn = ({ id, label, icon, active, onClick }: { id: string, label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 relative transition-colors ${active ? 'text-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-50'}`}
    >
        {icon} {label}
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
    </button>
);

export default Workbench;
