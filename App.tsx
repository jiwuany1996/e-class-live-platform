
import React, { useState } from 'react';
import CourseDetail from './components/CourseDetail';
import RecordedCourseDetail from './components/RecordedCourseDetail';
import DeviceSetup from './components/DeviceSetup';
import Classroom from './components/Classroom';
import Home from './components/Home';

type Step = 'home' | 'detail' | 'recorded-detail' | 'setup' | 'classroom';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('home');
  const [returnStep, setReturnStep] = useState<Step>('recorded-detail'); // Default fallback
  const [homeActiveItem, setHomeActiveItem] = useState("双师录播课堂");
  
  // Shared Device Settings
  const [mirror, setMirror] = useState(false);

  const handleEnterResearch = () => {
    setHomeActiveItem("在线集体教研系统");
    setStep('detail');
  };

  const handleEnterCourse = () => {
    // Navigate to the new Recorded Course Detail page
    // Explicitly set the active item to ensure when we return, we land on the course list
    setHomeActiveItem("双师录播课堂");
    setStep('recorded-detail');
  };

  const handleEnterLive = () => {
    // Capture current step before moving to setup so we know where to return
    setReturnStep(step);
    setStep('setup');
  };

  const handleFinishSetup = () => {
    setStep('classroom');
  };

  const handleExitClassroom = () => {
    // Return to the specific detail page user came from
    setStep(returnStep);
  };

  const handleGoHome = () => {
    setStep('home');
  };

  return (
    <div className="font-sans text-gray-900">
      {step === 'home' && (
        <Home 
          onEnterResearch={handleEnterResearch} 
          onEnterCourse={handleEnterCourse}
          initialActiveItem={homeActiveItem} 
        />
      )}

      {step === 'detail' && (
        <CourseDetail onEnterLive={handleEnterLive} onGoHome={handleGoHome} />
      )}

      {step === 'recorded-detail' && (
        <RecordedCourseDetail onEnterLive={handleEnterLive} onGoHome={handleGoHome} />
      )}
      
      {step === 'setup' && (
        <div className="relative">
           {/* Render the background based on where the user came from to maintain context */}
           <div className="absolute inset-0 pointer-events-none opacity-20 filter blur-sm">
             {returnStep === 'detail' ? (
               <CourseDetail onEnterLive={() => {}} onGoHome={() => {}} />
             ) : (
               <RecordedCourseDetail onEnterLive={() => {}} onGoHome={() => {}} />
             )}
           </div>
           <DeviceSetup 
             onFinish={handleFinishSetup} 
             mirror={mirror} 
             onMirrorChange={setMirror} 
           />
        </div>
      )}

      {step === 'classroom' && (
        <Classroom 
          onExit={handleExitClassroom} 
          mirror={mirror}
          onMirrorChange={setMirror}
        />
      )}
    </div>
  );
};

export default App;
