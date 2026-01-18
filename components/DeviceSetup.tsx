
import React, { useState } from 'react';
import { MicIcon, VideoIcon, FaceIcon, FilterIcon, MagicIcon, BanIcon } from './Icons';

interface DeviceSetupProps {
  onFinish: () => void;
  mirror: boolean;
  onMirrorChange: (mirror: boolean) => void;
}

const DeviceSetup: React.FC<DeviceSetupProps> = ({ onFinish, mirror, onMirrorChange }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  
  // Audio State
  const [micLevel, setMicLevel] = useState(0); // For fake visualization
  const [aiNoise, setAiNoise] = useState(false);
  
  // Video State
  const [selectedFilter, setSelectedFilter] = useState('none');
  
  // Fake Audio Level Animation
  React.useEffect(() => {
    if (activeTab === 'audio') {
      const interval = setInterval(() => {
        setMicLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="w-[700px] h-[500px] bg-[#3C3F41] rounded-xl flex shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Sidebar */}
        <div className="w-40 bg-[#2D2F31] flex flex-col pt-8">
          <h2 className="text-gray-200 font-bold text-lg px-6 mb-6">设备设置</h2>
          
          <button 
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'audio' ? 'bg-[#1890FF] text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <MicIcon /> 音频
          </button>
          
          <button 
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'video' ? 'bg-[#1890FF] text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <VideoIcon /> 视频
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-[#373A3C] relative flex flex-col">
          {activeTab === 'audio' ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
               {/* 麦克风 Section */}
               <div>
                 <label className="block text-gray-300 text-sm mb-2">麦克风</label>
                 <select className="w-full bg-white text-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                   <option>Default - MacBook Pro Microphone</option>
                   <option>Disabled</option>
                 </select>
                 {/* Audio Level Meter */}
                 <div className="flex items-center gap-2 mt-3">
                   <span className="text-gray-500"><MicIcon /></span>
                   <div className="flex-1 flex gap-1 h-2">
                     {Array.from({ length: 20 }).map((_, i) => (
                       <div 
                         key={i} 
                         className={`flex-1 rounded-full transition-all duration-75 ${
                           (micLevel / 5) > i ? 'bg-[#1890FF]' : 'bg-gray-600'
                         }`}
                       ></div>
                     ))}
                   </div>
                 </div>
               </div>

               {/* Speaker Section */}
               <div>
                 <label className="block text-gray-300 text-sm mb-2">扬声器</label>
                 <div className="flex gap-3">
                    <select className="flex-1 bg-white text-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Default - MacBook Pro Speakers</option>
                    </select>
                    <button className="bg-[#1890FF] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-1">
                       Test
                    </button>
                 </div>
               </div>

               {/* AI Noise Cancellation */}
               <div>
                  <label className="block text-gray-300 text-sm mb-2">AI降噪</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="aiNoise" 
                        checked={aiNoise} 
                        onChange={() => setAiNoise(true)} 
                        className="accent-[#1890FF]"
                      /> 
                      On
                    </label>
                    <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="aiNoise" 
                        checked={!aiNoise} 
                        onChange={() => setAiNoise(false)} 
                        className="accent-[#1890FF]"
                      /> 
                      Off
                    </label>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
               {/* Camera Preview */}
               <div className="bg-black w-full aspect-video rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {/* Mock Camera Feed - Static reliable image */}
                  <div className="text-gray-500 text-xs absolute top-2 right-2 flex items-center gap-1 z-10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Live
                  </div>
                  <img 
                    src={`https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`} 
                    alt="Camera Preview" 
                    className={`w-full h-full object-cover opacity-90 transition-transform duration-300 ${mirror ? 'scale-x-[-1]' : ''}`} 
                  />
                  <div className="absolute bottom-4 left-4 bg-gray-800/80 px-3 py-1 rounded text-white text-xs z-10">
                     WebcastMate VirtualCamera
                  </div>
               </div>

               {/* Beauty Filters */}
               <div className="mt-2">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-gray-300 text-sm">美颜</span>
                   <span className="bg-[#7B61FF] text-white text-[10px] px-1 rounded">Beta</span>
                 </div>
                 <div className="flex gap-3">
                    {[
                      { id: 'none', label: '无', icon: BanIcon },
                      { id: 'bright', label: '美白', icon: FaceIcon },
                      { id: 'smooth', label: '磨皮', icon: MagicIcon },
                      { id: 'rosy', label: '红润', icon: FilterIcon },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setSelectedFilter(filter.id)}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded bg-[#444] border hover:bg-[#555] transition-all ${
                          selectedFilter === filter.id ? 'border-[#1890FF] text-[#1890FF]' : 'border-transparent text-gray-400'
                        }`}
                      >
                         <div className="scale-75"><filter.icon /></div>
                         <span className="text-[10px] mt-1">{filter.label}</span>
                      </button>
                    ))}
                 </div>
               </div>
               
               {/* Mirror Toggle */}
               <div className="mt-auto">
                 <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={mirror}
                      onChange={(e) => onMirrorChange(e.target.checked)}
                      className="accent-[#1890FF] w-4 h-4 rounded"
                    />
                    镜像模式
                 </label>
               </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="absolute bottom-8 right-8">
            <button 
              onClick={onFinish}
              className="bg-[#1890FF] hover:bg-blue-600 text-white px-10 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/20"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSetup;
