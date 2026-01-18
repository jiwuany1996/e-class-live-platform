import React, { useState } from 'react';
import { 
  SearchIcon, PowerIcon, ShareIcon, MobileIcon, EditIcon, LogoIcon
} from './Icons';

interface CourseDetailProps {
  onEnterLive: () => void;
  onGoHome: () => void;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ onEnterLive, onGoHome }) => {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Top Header - Unified with Home */}
      <header className="bg-[#2D2F31] text-white h-16 flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span className="font-bold text-lg tracking-wide">e堂好课-教学赋能平台欢迎您！</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#333] font-bold text-xs border border-white/20 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-full h-full object-cover" alt="avatar"/>
            </div>
            <span className="text-sm text-gray-200">武舟x老师</span>
          </div>
          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm group">
            <PowerIcon />
            <span className="group-hover:translate-x-0.5 transition-transform">退出</span>
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto px-4 py-4">
          {/* Breadcrumb & Search */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-500 text-sm flex items-center gap-2">
              <span onClick={onGoHome} className="cursor-pointer hover:text-orange-500 transition-colors">在线集体教研系统</span>
              <span>&gt;</span>
              <span className="text-black font-medium text-lg">测试1231</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="请输入关键词查询" 
                  className="pl-8 pr-4 py-1.5 border border-gray-300 rounded-full text-sm w-64 focus:outline-none focus:border-yellow-500"
                />
                <span className="absolute left-3 top-2 text-gray-400">
                  <SearchIcon />
                </span>
              </div>
              <button className="px-4 py-1.5 border border-orange-400 text-orange-500 rounded text-sm hover:bg-orange-50 transition-colors">
                我的教研活动
              </button>
            </div>
          </div>

          {/* Course Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-4 flex gap-6 relative">
            <div className="w-48 h-32 bg-blue-100 rounded overflow-hidden relative group">
              {/* Reliable Unsplash Image */}
              <img src="https://images.unsplash.com/photo-1544396821-4dd40b938ad3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Course Cover" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 w-full bg-orange-400 text-white text-center py-1 text-xs">
                我发起的
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">测试1231</h1>
                <div className="flex gap-4 text-gray-500 text-xs">
                  <button className="flex items-center gap-1 hover:text-blue-500">
                    <ShareIcon /> 分享
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500">
                    <MobileIcon /> 手机查看
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded border border-green-200">进行中</span>
                <span className="text-gray-500 text-xs">教研时间: 2025-12-31 00:00 至 2025-12-31 23:59</span>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-4">
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="10" width="4" height="14"/><rect x="10" y="6" width="4" height="18"/><rect x="18" y="2" width="4" height="22"/></svg>
                      教研直播中
                    </button>
                    <button 
                      onClick={onEnterLive}
                      className="text-red-500 text-sm hover:underline font-medium"
                    >
                      进入直播间
                    </button>
                </div>
                <div className="text-gray-400 text-xs">
                  0人参与
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Tabs & Sidebar */}
          <div className="flex gap-4">
            {/* Left Content */}
            <div className="flex-1 bg-white rounded-lg shadow-sm min-h-[400px] flex flex-col">
              <div className="flex border-b border-gray-100">
                {['Intro', '教研直播', 'Reviews'].map((tab) => {
                  const isActive = (tab === '教研直播' && activeTab === 'live') || 
                                    (tab === 'Intro' && activeTab === 'intro') ||
                                    (tab === 'Reviews' && activeTab === 'reviews');
                  const tabKey = tab === '教研直播' ? 'live' : tab === 'Intro' ? 'intro' : 'reviews';
                  
                  return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tabKey)}
                      className={`px-6 py-4 text-sm font-medium relative ${isActive ? 'text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab === 'Intro' ? '活动简介' : tab === 'Reviews' ? '评论互动' : '教研直播'}
                      {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400"></div>}
                    </button>
                  );
                })}
                <div className="ml-auto px-4 py-4">
                  <button className="flex items-center gap-1 text-gray-400 text-xs hover:text-gray-600">
                    <EditIcon /> 编辑活动
                  </button>
                </div>
              </div>
              <div className="p-8 text-gray-500 text-sm">
                {activeTab === 'intro' && "This is an introduction for the language activity."}
                {activeTab === 'live' && "Live content area placeholder."}
                {activeTab === 'reviews' && "No reviews yet."}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-64 space-y-4">
              {/* Host Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-[#333] font-bold text-2xl border-4 border-white shadow-sm overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" className="w-full h-full object-cover" alt="host"/>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-orange-400 text-white text-[10px] px-1.5 rounded-full border border-white">
                      主持
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800">武舟x老师</h3>
              </div>

              {/* Resources Card */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                  <h4 className="text-gray-500 text-sm mb-3">配套资源 (1)</h4>
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer group">
                    <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center text-white font-bold text-xs shrink-0">
                      W
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-gray-700 text-sm truncate group-hover:text-blue-500">Xiangke Version Grade 1 Volume 2</p>
                      <p className="text-gray-400 text-xs mt-0.5">186.34KB</p>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;