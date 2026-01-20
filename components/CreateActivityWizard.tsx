
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, CalendarIcon, 
  ClockIcon, FileTextIcon, UploadCloudIcon, UserPlusIcon, TrashIcon,
  AlertTriangleIcon, CheckIcon, VideoCameraIcon, PresentationIcon, BoardIcon
} from './Icons';

interface CreateActivityWizardProps {
  onBack: () => void;
  onFinish: () => void;
}

const STEPS = [
  { id: 1, title: '活动类型' },
  { id: 2, title: '基本信息' },
  { id: 3, title: '资源配置' },
  { id: 4, title: '预览提交' },
];

const ACTIVITY_TYPES = [
  { 
    id: 'lecture', 
    title: '听评课', 
    icon: VideoCameraIcon, 
    desc: '观摩优秀课堂，进行教学评价与反思',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    hover: 'hover:border-blue-500 hover:shadow-blue-100'
  },
  { 
    id: 'prep', 
    title: '集体备课', 
    icon: PresentationIcon, 
    desc: '共同研讨教材，优化教学设计方案',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    hover: 'hover:border-orange-500 hover:shadow-orange-100'
  },
  { 
    id: 'seminar', 
    title: '专家讲座', 
    icon: BoardIcon, 
    desc: '邀请专家分享前沿教育理念与实践',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    hover: 'hover:border-purple-500 hover:shadow-purple-100'
  },
];

// Reusable Error Tooltip Component
const ErrorTooltip = ({ message }: { message: string }) => (
  <div className="absolute right-0 -bottom-6 z-10 animate-in fade-in slide-in-from-top-1 pointer-events-none">
     <div className="bg-red-50 text-red-600 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm border border-red-200 flex items-center gap-1.5">
        <AlertTriangleIcon className="w-3 h-3" />
        {message}
     </div>
  </div>
);

const CreateActivityWizard: React.FC<CreateActivityWizardProps> = ({ onBack, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    date: '',
    startTime: '09:00',
    duration: 45,
    description: '',
    files: [] as File[],
    participants: ['王老师', '李主任', '张教研员'] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  
  // New Success Feedback State
  const [successToast, setSuccessToast] = useState<{show: boolean, countdown: number}>({ show: false, countdown: 3 });

  // Auto-save draft effect
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('activity_draft', JSON.stringify(formData));
      setIsDraftSaved(true);
      setTimeout(() => setIsDraftSaved(false), 2000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Handle Success Countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (successToast.show && successToast.countdown > 0) {
        timer = setInterval(() => {
            setSuccessToast(prev => ({ ...prev, countdown: prev.countdown - 1 }));
        }, 1000);
    } else if (successToast.show && successToast.countdown === 0) {
        onFinish(); // Trigger navigation
    }
    return () => clearInterval(timer);
  }, [successToast, onFinish]);

  // Validation Logic
  const validateField = (name: string, value: any): boolean => {
    let error = '';
    
    switch (name) {
        case 'type':
            if (!value) error = '请选择一种活动类型';
            break;
        case 'title':
            if (!value.trim()) error = '活动名称不能为空';
            else if (value.length < 4) error = '名称至少需4个字符';
            break;
        case 'date':
            if (!value) error = '请选择日期';
            else {
                const selected = new Date(value);
                const today = new Date();
                today.setHours(0,0,0,0);
                if (selected < today) error = '日期不能早于今天';
            }
            break;
        case 'description':
            if (!value.trim()) error = '请填写活动描述';
            break;
        case 'participants':
            if (!value || value.length === 0) error = '至少需添加一名参与者';
            break;
        default:
            break;
    }

    setErrors(prev => {
        const next = { ...prev };
        if (error) next[name] = error;
        else delete next[name];
        return next;
    });

    return !error;
  };

  const validateStep = (step: number) => {
      let isValid = true;
      if (step === 1) isValid = validateField('type', formData.type) && isValid;
      if (step === 2) {
          isValid = validateField('title', formData.title) && isValid;
          isValid = validateField('date', formData.date) && isValid;
          isValid = validateField('description', formData.description) && isValid;
      }
      if (step === 3) {
          isValid = validateField('participants', formData.participants) && isValid;
      }
      return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    setSuccessToast({ show: true, countdown: 3 });
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Real-time validation: if error exists, check if fixed
    if (errors[key]) {
        validateField(key, value);
    }
  };

  // Step Components
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {ACTIVITY_TYPES.map(type => (
                <div 
                    key={type.id}
                    onClick={() => {
                        setFormData(prev => ({
                            ...prev,
                            type: type.id,
                            title: prev.title || `2026年春季学期${type.title}活动`
                        }));
                        setErrors(prev => {
                            const next = { ...prev };
                            delete next.type;
                            return next;
                        });
                    }}
                    className={`cursor-pointer rounded-2xl p-8 border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 group relative ${
                    formData.type === type.id 
                        ? `border-blue-500 shadow-xl bg-white scale-105` 
                        : `bg-white border-gray-100 ${type.hover} hover:-translate-y-1 hover:shadow-lg`
                    }`}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${type.color}`}>
                        <type.icon />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{type.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{type.desc}</p>
                    </div>
                    <div className="mt-auto pt-4 text-xs font-bold text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        点击选择
                    </div>
                    {/* Selected Checkmark */}
                    {formData.type === type.id && (
                        <div className="absolute top-4 right-4 text-blue-500 animate-in zoom-in">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                    )}
                </div>
                ))}
            </div>
            {errors.type && (
                <div className="text-center mt-6 animate-in fade-in">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium border border-red-100">
                        <AlertTriangleIcon className="w-4 h-4" /> {errors.type}
                    </span>
                </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                * 活动名称 <span className="text-gray-400 font-normal text-xs">(自动提示: 推荐包含学期、学科、类型)</span>
              </label>
              <div className="relative">
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    onBlur={() => validateField('title', formData.title)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'} focus:ring-4 outline-none transition-all`}
                    placeholder="请输入活动名称"
                  />
                  {errors.title && <ErrorTooltip message={errors.title} />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CalendarIcon /> * 活动日期
                  </label>
                  <div className="relative">
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => updateFormData('date', e.target.value)}
                        onBlur={() => validateField('date', formData.date)}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.date ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} outline-none transition-all cursor-pointer`}
                      />
                      {errors.date && <ErrorTooltip message={errors.date} />}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <ClockIcon /> * 预计时长
                  </label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => updateFormData('duration', parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value={30}>30 分钟</option>
                    <option value={45}>45 分钟</option>
                    <option value={60}>60 分钟</option>
                    <option value={90}>90 分钟</option>
                  </select>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileTextIcon /> 活动描述
              </label>
              <div className="relative">
                  <textarea 
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    onBlur={() => validateField('description', formData.description)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} outline-none transition-all h-32 resize-none`}
                    placeholder="请输入活动目标、流程安排等详细信息..."
                  />
                  {errors.description && <ErrorTooltip message={errors.description} />}
              </div>
              <div className="flex gap-2">
                 {['通用模板', '听评课模板', '研讨模板'].map(tag => (
                   <button 
                     key={tag} 
                     onClick={() => {
                         updateFormData('description', '本次活动旨在提升教师教学能力，具体流程如下：\n1. 环节一...\n2. 环节二...');
                         // Clear error explicitly
                         setErrors(prev => { const n = {...prev}; delete n.description; return n; });
                     }} 
                     className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full transition-colors"
                   >
                     {tag}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
             {/* File Upload */}
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">配套资源</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                      <UploadCloudIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                   </div>
                   <p className="text-sm font-medium">点击或拖拽文件到此处上传</p>
                   <p className="text-xs text-gray-400 mt-1">支持 PDF, PPT, Word (最大 50MB)</p>
                </div>
                {/* Mock Uploaded List */}
                <div className="space-y-2 mt-2">
                   <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs">PPT</div>
                         <span className="text-sm text-gray-700">第一单元教学设计.pptx</span>
                      </div>
                      <button className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                   </div>
                </div>
             </div>

             {/* Participants */}
             <div className="space-y-2 relative">
                <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                   <span className="flex items-center gap-2">
                       参与人员
                       {errors.participants && <span className="text-xs text-red-500 font-normal flex items-center gap-1"><AlertTriangleIcon className="w-3 h-3"/> {errors.participants}</span>}
                   </span>
                   <button className="text-blue-600 text-xs hover:underline flex items-center gap-1"><UserPlusIcon /> 从通讯录添加</button>
                </label>
                <div className={`bg-white border ${errors.participants ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200'} rounded-xl p-4 min-h-[100px] flex flex-wrap gap-2 content-start transition-all`}>
                   {formData.participants.map(name => (
                      <div key={name} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 animate-in zoom-in-50 duration-200">
                         <div className="w-5 h-5 bg-gray-300 rounded-full overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} />
                         </div>
                         {name}
                         <button 
                            onClick={() => {
                                const newParticipants = formData.participants.filter(p => p !== name);
                                updateFormData('participants', newParticipants);
                            }}
                            className="hover:text-red-500 ml-1 rounded-full p-0.5 hover:bg-gray-200 transition-colors"
                         >
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                         </button>
                      </div>
                   ))}
                   <input type="text" placeholder="@搜索人员" className="bg-transparent text-sm outline-none px-2 py-1.5 min-w-[100px]" />
                </div>
                <div className="flex items-center gap-2 text-xs text-orange-500 bg-orange-50 p-2 rounded-lg">
                   <AlertTriangleIcon className="w-4 h-4" />
                   <span>系统检测到 "李主任" 在选定时间段可能有其他会议冲突。</span>
                </div>
             </div>
          </div>
        );

      case 4:
        const typeInfo = ACTIVITY_TYPES.find(t => t.id === formData.type);
        return (
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 text-white">
                   <div className="text-xs font-bold bg-white/20 inline-block px-2 py-1 rounded mb-2">{typeInfo?.title || '教研活动'}</div>
                   <h2 className="text-2xl font-bold">{formData.title || '未命名活动'}</h2>
                </div>
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-gray-500">活动时间</div>
                      <div className="font-bold text-gray-800">{formData.date || '未设置'} {formData.startTime}</div>
                      
                      <div className="text-gray-500">预计时长</div>
                      <div className="font-bold text-gray-800">{formData.duration} 分钟</div>
                      
                      <div className="text-gray-500">参与人数</div>
                      <div className="font-bold text-gray-800">{formData.participants.length} 人</div>
                   </div>
                   
                   <div className="border-t border-gray-100 pt-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">活动描述</h4>
                      <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {formData.description || '暂无描述'}
                      </p>
                   </div>

                   <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm border border-green-100">
                      <CheckCircleIcon />
                      <span>资源配置完成，人员通知将通过短信发送。</span>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  const typeInfo = ACTIVITY_TYPES.find(t => t.id === formData.type);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
               <ChevronLeftIcon className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">创建教研活动</h1>
         </div>
         <div className="flex items-center gap-4">
            {isDraftSaved && <span className="text-xs text-gray-400 animate-pulse">草稿已保存</span>}
            <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">取消</button>
         </div>
      </header>

      {/* Progress Bar */}
      <div className="py-8 bg-gray-50 shrink-0">
         <div className="max-w-3xl mx-auto px-4">
            <div className="relative flex justify-between items-center">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-0"></div>
               <div 
                 className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-500 -z-0"
                 style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
               ></div>
               
               {STEPS.map((step, index) => {
                 const isActive = currentStep >= step.id;
                 const isCurrent = currentStep === step.id;
                 return (
                   <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-4 ${isActive ? 'bg-blue-500 border-white text-white shadow-md' : 'bg-white border-white text-gray-400'}`}>
                         {isActive ? <CheckIcon className="w-4 h-4" /> : step.id}
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>{step.title}</span>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
         <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
            {renderStepContent()}
         </div>
      </div>

      {/* Footer Controls */}
      <div className="h-20 bg-white border-t border-gray-100 flex items-center justify-center gap-4 fixed bottom-0 left-0 right-0 z-20">
         {currentStep > 1 && (
           <button 
             onClick={handlePrev}
             className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors min-w-[120px] whitespace-nowrap"
           >
             上一步
           </button>
         )}
         {currentStep < 4 ? (
           <button 
             onClick={handleNext}
             className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all min-w-[140px] flex items-center justify-center gap-2 whitespace-nowrap"
           >
             下一步 <ChevronRightIcon />
           </button>
         ) : (
           <button 
             onClick={handleSubmit}
             className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all min-w-[140px] flex items-center justify-center gap-2 whitespace-nowrap"
           >
             提交
           </button>
         )}
      </div>

      {/* Success Centered Modal */}
      {successToast.show && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
             <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-sm w-full animate-in zoom-in-95 duration-300 overflow-hidden relative">
                 <div className="bg-green-50 p-8 flex flex-col items-center justify-center border-b border-green-100">
                     <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4 shadow-sm animate-in zoom-in duration-500">
                         <CheckCircleIcon className="w-10 h-10" />
                     </div>
                     <h3 className="font-bold text-gray-900 text-2xl mb-1">活动创建成功!</h3>
                     <p className="text-gray-500 text-sm">正在为您跳转至备课空间...</p>
                 </div>
                 
                 <div className="p-6">
                     <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2 border border-gray-100 mb-6">
                        <div className="flex justify-between">
                           <span className="text-gray-400">活动名称:</span>
                           <span className="font-bold text-gray-800 text-right truncate max-w-[180px]">{formData.title}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-400">活动类型:</span>
                           <span className="font-bold text-gray-800">{typeInfo?.title || '未定义'}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-400">预计开始:</span>
                           <span className="font-bold text-gray-800">{formData.date} {formData.startTime}</span>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                         <button onClick={onFinish} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2">
                            立即备课 <ChevronRightIcon className="w-4 h-4" />
                         </button>
                         <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                             <button onClick={onBack} className="hover:text-gray-700 underline transition-colors">查看活动列表</button>
                             <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">自动跳转 {successToast.countdown}s</span>
                         </div>
                     </div>
                 </div>
                 {/* Progress Bar */}
                 <div className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-1000 ease-linear" style={{ width: `${(successToast.countdown / 3) * 100}%` }}></div>
             </div>
          </div>
      )}
    </div>
  );
};

export default CreateActivityWizard;
