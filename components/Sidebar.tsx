import { type ElementType } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Infinity as InfinityIcon, 
  PanelLeftClose, 
  PanelLeftOpen,
  Cpu,
  Monitor,
  Network,
  FileText,
  Grid,
  Presentation,
  X,
  Settings
} from 'lucide-react';
import clsx from 'clsx';
import { questionData } from '@/data/questions';

const moduleIcons: Record<string, ElementType> = {
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
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  // 新增：拦截检查函数
  checkNavigation: (action: () => void) => void;
}

export default function Sidebar({
  currentModuleId,
  mode,
  onModuleChange,
  onStartExam,
  onStartInfinite,
  onOpenSettings,
  isOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
  checkNavigation
}: SidebarProps) {
  // 统一的点击拦截器
  const handleIntercept = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    checkNavigation(action);
  };

  const handleModuleClick = (moduleId: string) => {
    if (currentModuleId !== moduleId || mode !== 'practice') {
      onModuleChange(moduleId);
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
          
          <div className="flex items-center space-x-1">
            {/* 移动端关闭按钮 */}
            {isOpen && (
              <button 
                onClick={onClose}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                title="关闭侧边栏"
              >
                <X size={20} />
              </button>
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Modules Section */}
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
                基础练习
              </h3>
            )}
            
            <div className="space-y-1">
              {Object.entries(questionData).map(([id, data]) => {
                const Icon = moduleIcons[id] || BookOpen;
                const isActive = currentModuleId === id && mode === 'practice';
                
                return (
                  <button
                    key={id}
                    onClick={(e) => handleIntercept(e, () => handleModuleClick(id))}
                    title={isCollapsed ? data.title : undefined}
                    className={clsx(
                      "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <Icon 
                      size={18} 
                      className={clsx(
                        "transition-colors",
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500",
                        !isCollapsed && "mr-3"
                      )} 
                    />
                    {!isCollapsed && <span className="flex-1 text-left truncate">{data.title}</span>}
                    
                    {!isCollapsed && isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Section */}
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
                模拟测试
              </h3>
            )}
            
            <div className="space-y-1">
              <button
                onClick={(e) => handleIntercept(e, onStartExam)}
                title={isCollapsed ? "随机综合考试" : undefined}
                className={clsx(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                  mode === 'exam'
                    ? "bg-purple-50 text-purple-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "justify-center"
                )}
              >
                <GraduationCap 
                  size={18} 
                  className={clsx(
                    "transition-colors",
                    mode === 'exam' ? "text-purple-600" : "text-gray-400 group-hover:text-gray-500",
                    !isCollapsed && "mr-3"
                  )} 
                />
                {!isCollapsed && <span className="flex-1 text-left">随机综合考试</span>}
              </button>

              <button
                onClick={(e) => handleIntercept(e, onStartInfinite)}
                title={isCollapsed ? "随机无尽模式" : undefined}
                className={clsx(
                  "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                  mode === 'infinite'
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "justify-center"
                )}
              >
                <InfinityIcon 
                  size={18} 
                  className={clsx(
                    "transition-colors",
                    mode === 'infinite' ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500",
                    !isCollapsed && "mr-3"
                  )} 
                />
                {!isCollapsed && <span className="flex-1 text-left">随机无尽模式</span>}
              </button>
            </div>
          </div>

          {/* Settings Entry */}
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={(e) => handleIntercept(e, onOpenSettings)}
              title={isCollapsed ? "设置" : undefined}
              className={clsx(
                "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center"
              )}
            >
              <Settings size={18} className="text-gray-400 group-hover:text-gray-500 mr-3" />
              {!isCollapsed && <span className="flex-1 text-left">设置</span>}
            </button>
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-50 bg-gray-50/50">
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-700">复习小贴士</span>
              </div>
              <p className="text-xs text-blue-600/80 leading-relaxed">
                每天坚持练习 20 题，轻松掌握信息技术知识点！
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
