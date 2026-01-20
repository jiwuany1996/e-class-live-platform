
import React, { useState } from 'react';
import { 
  LogoIcon, PowerIcon, SearchIcon, HistoryIcon, PlayCircleIcon, DocumentSearchIcon,
  PrepIcon, HistoryPrepIcon, HatIcon, VideoCameraIcon, PresentationIcon, BoardIcon,
  ChevronLeftIcon, ChevronRightIcon, GuideIcon
} from './Icons';

interface HomeProps {
  onEnterResearch: () => void;
  onEnterCourse: () => void;
  initialActiveItem?: string;
  onCreateActivity?: () => void;
}

const SIDEBAR_ITEMS = [
  "在线集体教研系统",
  "双师录播课堂"
];

const SUBJECTS = ["语文", "英语", "科学", "体育", "音乐", "美术", "心理"];
const GRADES = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级"];

// Reliable Unsplash images for education content - FINAL VERIFIED LIST
const COURSES = [
  { id: 1, title: "第二单元 丁零丁零, 上课了", subtitle: "四维阅读语文一年级上册", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80", duration: "20:53", tag: "艺术 · 唱游 · 音乐 一年级 上册" },
  { id: 2, title: "Unit 1 Making friends | 第三课时", subtitle: "人教版英语三年级上册", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80", duration: "16:56", tag: "艺术 · 唱游 · 音乐 一年级 上册" },
  { id: 3, title: "Unit 1 Making friends | 第一课时", subtitle: "人教版英语三年级上册", img: "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&w=600&q=80", duration: "18:09", tag: "艺术 · 唱游 · 音乐 一年级 上册" },
  { id: 4, title: "Unit 1 Making friends | 第二课时", subtitle: "人教版英语三年级上册", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80", duration: "17:42", tag: "艺术 · 唱游 · 音乐 一年级 上册" },
  { id: 5, title: "Unit 1 Making friends | 第三课时", subtitle: "人教版英语三年级上册", img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80", duration: "23:53", tag: "艺术 · 唱游 · 音乐 一年级 上册" },
  { id: 6, title: "Unit 1 Making friends | 第四课时", subtitle: "人教版英语三年级上册", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80", duration: "19:16", tag: "艺术 · 唱游 · 音乐 一年级 上册" },
];

const RESEARCH_ACTIVITIES = [
  {
    id: 1,
    title: "2025年秋季学期英语教研",
    time: "10-23 00:00 至 02-04 23:59",
    participants: 18,
    img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    color: "#F59E0B",
    canEnter: true
  },
  {
    id: 2,
    title: "2025年秋季学期科学教研",
    time: "09-24 00:00 至 12-31 23:59",
    participants: 58,
    img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    color: "#10B981",
    canEnter: false
  },
  {
    id: 3,
    title: "2025年秋季学期音乐教研",
    time: "09-23 00:00 至 02-01 23:59",
    participants: 31,
    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80",
    color: "#F97316",
    canEnter: false
  }
];

// Reliable User Avatar
const USER_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

const Home: React.FC<HomeProps> = ({ onEnterResearch, onEnterCourse, initialActiveItem, onCreateActivity }) => {
  const [selectedSubject, setSelectedSubject] = useState("英语");
  const [selectedGrade, setSelectedGrade] = useState("三年级");
  const [activeSidebarItem, setActiveSidebarItem] = useState(initialActiveItem || "双师录播课堂");

  const renderContent = () => {
    if (activeSidebarItem === "在线集体教研系统") {
      // Research Content View
      return (
        <div className="flex flex-col gap-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-orange-200 to-orange-400 rounded-lg p-4 flex items-center gap-3 shadow-sm text-white relative overflow-hidden">
             <div 
               className="absolute inset-0 opacity-20 pointer-events-none"
               style={{
                 backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
               }}
             ></div>
             <div className="z-10 bg-white/20 p-2 rounded-full">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm1 10h-2v-6h2v6zm-1 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
             </div>
             <span className="font-bold text-lg z-10 text-white drop-shadow-md">您还没有参加教研，赶快去报名参加吧~</span>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-md overflow-hidden">
                   <img src={USER_AVATAR} className="w-full h-full object-cover" alt="avatar"/>
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     武舟x老师, 上午好!
                   </h2>
                   <p className="text-gray-400 text-sm mt-1">2026年1月5日 星期一</p>
                   <p className="text-gray-300 text-xs mt-0.5">上次登录时间为2026-01-05 10:13:56</p>
                </div>
             </div>
             
             <div className="flex items-center gap-16 border-l border-r border-gray-100 px-16 mx-4">
                <div className="text-center">
                   <div className="text-2xl font-bold text-gray-800">0</div>
                   <div className="text-gray-500 text-xs mt-1">年度参与教研次数</div>
                </div>
                <div className="text-center">
                   <div className="text-2xl font-bold text-gray-800">0分钟</div>
                   <div className="text-gray-500 text-xs mt-1">本年参与直播时长</div>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={onCreateActivity}
                  className="bg-[#EAB308] hover:bg-[#CA8A04] text-white px-8 py-2 rounded-md text-sm font-bold shadow-sm transition-all"
                >
                   创建教研活动
                </button>
                <button className="bg-white border border-[#EAB308] text-[#EAB308] hover:bg-orange-50 px-8 py-2 rounded-md text-sm font-bold shadow-sm transition-all">
                   我的教研活动
                </button>
             </div>
          </div>

          {/* Research Activities Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">教研活动</h3>
                <div className="relative">
                   <input 
                      type="text" 
                      placeholder="请输入查询内容" 
                      className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:border-[#F59E0B] bg-gray-50"
                   />
                   <div className="absolute left-3 top-2 text-gray-400">
                      <SearchIcon />
                   </div>
                </div>
             </div>

             {/* Recommended Activities List */}
             <div className="mb-8">
                <h4 className="font-bold text-gray-700 mb-4">教研活动推荐</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {RESEARCH_ACTIVITIES.map(activity => (
                      <div key={activity.id} className="border border-gray-100 rounded-lg overflow-hidden flex hover:shadow-lg transition-shadow bg-white group cursor-pointer">
                         <div className="w-1/3 relative overflow-hidden">
                           <img src={activity.img} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-black/10"></div>
                           <div className="absolute top-2 left-2 right-2 bottom-2 border border-white/30 rounded flex items-center justify-center">
                              <div className="text-white text-center">
                                 <div className="font-bold text-sm drop-shadow-md p-1">{activity.title}</div>
                              </div>
                           </div>
                         </div>
                         <div className="w-2/3 p-4 flex flex-col justify-between">
                            <div>
                               <h5 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{activity.title}</h5>
                               <p className="text-gray-400 text-xs mb-1">{activity.time}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                               <span className="text-gray-500 text-xs">{activity.participants}人报名</span>
                               {activity.canEnter ? (
                                  <button 
                                    onClick={onEnterResearch}
                                    className="border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white px-3 py-1 rounded text-xs transition-colors"
                                  >
                                    进入活动
                                  </button>
                               ) : (
                                  <button className="text-gray-400 text-xs cursor-default">
                                    未开始
                                  </button>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Course Research - EMPTY STATE */}
             <div className="mt-8 border-t border-gray-100 pt-8">
                <h4 className="font-bold text-gray-700 mb-4">课程教研</h4>
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-16 text-center">
                   <div className="w-40 h-40 mb-2 opacity-50">
                       <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="100" cy="100" r="90" fill="#F9FAFB"/>
                          <path d="M65 75H135C140.523 75 145 79.4772 145 85V135C145 140.523 140.523 145 135 145H65C59.4772 145 55 140.523 55 135V85C55 79.4772 59.4772 75 65 75Z" fill="white" stroke="#E5E7EB" strokeWidth="4"/>
                          <path d="M75 95H125" stroke="#F3F4F6" strokeWidth="4" strokeLinecap="round"/>
                          <path d="M75 110H125" stroke="#F3F4F6" strokeWidth="4" strokeLinecap="round"/>
                          <path d="M75 125H105" stroke="#F3F4F6" strokeWidth="4" strokeLinecap="round"/>
                          <circle cx="135" cy="65" r="15" fill="#FDE68A" stroke="white" strokeWidth="4"/>
                          <path d="M130 65L133 68L140 61" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                          
                          {/* Floating Particles */}
                          <circle cx="40" cy="50" r="3" fill="#FCA5A5" fillOpacity="0.5" />
                          <circle cx="160" cy="150" r="4" fill="#93C5FD" fillOpacity="0.5" />
                          <circle cx="170" cy="40" r="2" fill="#D1D5DB" />
                       </svg>
                   </div>
                   <h3 className="text-gray-500 font-bold text-sm mb-1">暂无课程教研</h3>
                   <p className="text-gray-400 text-xs">当前还没有相关的课程教研记录</p>
                </div>
             </div>
          </div>
        </div>
      );
    }

    // Default View: 双师录播课堂 (Original Content)
    return (
      <>
           {/* Welcome Banner */}
           <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center justify-between border border-gray-100">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-[#FFC107] text-white flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden">
                   <img src={USER_AVATAR} className="w-full h-full object-cover" alt="avatar"/>
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-gray-800">武舟x老师</h2>
                 </div>
              </div>
              <button className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                 <HistoryIcon /> 观看历史
              </button>
           </div>

           {/* Filter Section */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              {/* Subject Tabs */}
              <div className="flex border-b border-gray-100 px-6 pt-4">
                 {SUBJECTS.map((sub) => (
                   <button
                     key={sub}
                     onClick={() => setSelectedSubject(sub)}
                     className={`pb-4 px-6 text-base font-medium transition-all relative ${
                       selectedSubject === sub 
                         ? "text-[#F59E0B]" 
                         : "text-gray-500 hover:text-gray-800"
                     }`}
                   >
                     {sub}
                     {selectedSubject === sub && (
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#F59E0B] rounded-t-full"></div>
                     )}
                   </button>
                 ))}
              </div>

              {/* Sub Filters */}
              <div className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-6 flex-wrap">
                    {/* Version Dropdown */}
                    <div className="relative group">
                       <button className="flex items-center gap-2 border border-gray-300 rounded px-4 py-1.5 text-sm text-gray-600 bg-white hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors">
                          湘艺版上册 <span className="text-xs">▼</span>
                       </button>
                    </div>

                    {/* Grade Pills */}
                    <div className="flex gap-3 overflow-x-auto pb-1">
                       {GRADES.map(grade => (
                         <button
                           key={grade}
                           onClick={() => setSelectedGrade(grade)}
                           className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                             selectedGrade === grade 
                               ? "bg-[#FFF7E6] text-[#F59E0B] border-[#F59E0B]" 
                               : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100"
                           }`}
                         >
                           {grade}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Search */}
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="请输入查询课程名称" 
                      className="pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] bg-gray-50"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <SearchIcon />
                    </div>
                 </div>
              </div>
           </div>

           {/* Course Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
              {COURSES.map((course) => (
                <div 
                  key={course.id} 
                  onClick={onEnterCourse}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer flex flex-col h-full"
                >
                   {/* Thumbnail */}
                   <div className="relative aspect-video overflow-hidden bg-gray-100">
                      <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                        {course.duration}
                      </div>
                      {/* Hover Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg text-[#F59E0B] scale-75 group-hover:scale-100 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                         </div>
                      </div>
                   </div>

                   {/* Content */}
                   <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-[#F59E0B] transition-colors">{course.title}</h3>
                      <p className="text-xs text-gray-400 mb-4">{course.tag}</p>
                      
                      <div className="mt-auto flex gap-3 pt-3 border-t border-gray-50">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onEnterCourse(); }}
                           className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#F59E0B] py-1.5 rounded bg-gray-50 hover:bg-[#FFF7E6] transition-colors"
                         >
                            <PlayCircleIcon /> 开始上课
                         </button>
                         <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#F59E0B] py-1.5 rounded bg-gray-50 hover:bg-[#FFF7E6] transition-colors">
                            <DocumentSearchIcon /> 查看导教案
                         </button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#F5F7FA] font-sans overflow-hidden">
        {/* Header */}
        <header className="bg-[#2D2F31] text-white h-16 flex items-center justify-between px-6 shadow-md shrink-0 z-20">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-bold text-lg tracking-wide">e堂好课-教学赋能平台欢迎您！</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#333] font-bold text-xs border border-white/20 overflow-hidden">
                 <img src={USER_AVATAR} className="w-full h-full object-cover" alt="avatar"/>
              </div>
              <span className="text-sm text-gray-200">武舟x老师</span>
            </div>
            <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm group">
              <PowerIcon />
              <span className="group-hover:translate-x-0.5 transition-transform">退出</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col shrink-0">
             {SIDEBAR_ITEMS.map((item, index) => {
               const isActive = item === activeSidebarItem;
               return (
                 <div 
                   key={index}
                   onClick={() => setActiveSidebarItem(item)}
                   className={`px-6 py-5 text-sm font-medium cursor-pointer transition-colors relative flex items-center justify-between ${
                     isActive 
                       ? "bg-[#F0F7FF] text-blue-600 border-r-4 border-blue-600" 
                       : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                   }`}
                 >
                   {item}
                 </div>
               );
             })}
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
             {renderContent()}
          </main>
        </div>
    </div>
  );
};

export default Home;
