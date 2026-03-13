import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Infinity as InfinityIcon, 
  PanelLeftClose, 
  PanelLeftOpen,
  Search,
  Hash,
  Cpu,
  Monitor,
  Network,
  FileText,
  Grid,
  Presentation
} from 'lucide-react';
import clsx from 'clsx';
import { questionData } from '@/data/questions';

const moduleIcons: Record<string, any> = {
  module1: Cpu,
  module2: Monitor,
  module3: Network,
  module4: FileText,
  module5: Grid,
  module6: Presentation
};

interface SidebarProps {
  currentModuleId: string;
  mode: 'practice' | 'exam' | 'infinite';
  onModuleChange: (id: string) => void;
  onStartExam: () => void;
  onStartInfinite: () => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onJumpToQuestion: (id: number) => void;
}

export default function Sidebar({
  currentModuleId,
  mode,
  onModuleChange,
  onStartExam,
  onStartInfinite,
  isOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
  onJumpToQuestion
}: SidebarProps) {
  const [jumpId, setJumpId] = useState('');

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(jumpId);
    if (!isNaN(id)) {
      onJumpToQuestion(id);
      setJumpId('');
    }
  };

  return (
    <aside className={clsx(
      "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 shadow-sm transform transition-all duration-300 ease-in-out md:relative",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      isCollapsed ? "md:w-20" : "md:w-72",
      "w-72" // 移动端始终宽 72
    )}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className={clsx(
          "h-16 flex items-center border-b border-gray-50 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-200 shadow-lg">
                IT
              </div>
              <div className="whitespace-nowrap">
                <h1 className="text-sm font-bold text-gray-900 leading-tight">信息技术练习</h1>
                <p className="text-xs text-gray-400">初中复习专用</p>
              </div>
            </div>
          )}
          
          {/* 折叠按钮 (仅桌面端显示) */}
          <button 
            onClick={toggleCollapse}
            className={clsx(
              "hidden md:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors",
              isCollapsed ? "mx-auto" : "" // 收起时居中
            )}
            title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {/* Practice Modules */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                基础练习
              </div>
            )}
            <div className="space-y-1">
              {Object.entries(questionData).map(([id, module]) => {
                const Icon = moduleIcons[id] || BookOpen;
                return (
                <button
                  key={id}
                  onClick={() => onModuleChange(id)}
                  title={isCollapsed ? module.title : undefined}
                  className={clsx(
                    "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                    currentModuleId === id && mode === 'practice'
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Icon size={18} className={clsx(
                    "transition-colors flex-shrink-0",
                    currentModuleId === id && mode === 'practice' ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="truncate text-left flex-1">{module.title}</span>
                      {currentModuleId === id && mode === 'practice' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2" />
                      )}
                    </>
                  )}
                </button>
              )})}
            </div>
          </div>

          {/* Challenge Modes */}
          <div>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                挑战模式
              </div>
            )}
            <div className="space-y-1">
              <button
                onClick={onStartExam}
                title={isCollapsed ? "随机综合考试" : undefined}
                className={clsx(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                  mode === 'exam'
                    ? "bg-purple-50 text-purple-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "justify-center"
                )}
              >
                <GraduationCap size={18} className={clsx(
                  "transition-colors flex-shrink-0",
                  mode === 'exam' ? "text-purple-500" : "text-gray-400 group-hover:text-gray-500",
                  !isCollapsed && "mr-3"
                )} />
                {!isCollapsed && <span className="flex-1 text-left">随机综合考试</span>}
              </button>
              
              <button
                onClick={onStartInfinite}
                title={isCollapsed ? "随机无尽模式" : undefined}
                className={clsx(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                  mode === 'infinite'
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "justify-center"
                )}
              >
                <InfinityIcon size={18} className={clsx(
                  "transition-colors flex-shrink-0",
                  mode === 'infinite' ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500",
                  !isCollapsed && "mr-3"
                )} />
                {!isCollapsed && <span className="flex-1 text-left">随机无尽模式</span>}
              </button>
            </div>
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-50 bg-gray-50/50">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
              <h3 className="font-bold text-sm mb-1">加油！</h3>
              <p className="text-xs text-blue-100 opacity-90">
                每天进步一点点，坚持就是胜利。
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
