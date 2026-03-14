'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionData } from '@/data/types';
import ConfirmationModal from '@/components/modals/ConfirmationModal'; // 引入自定义组件
import AdminSidebar from '@/components/admin/AdminSidebar';
import QuestionList from '@/components/admin/QuestionList';
import EditQuestionModal from '@/components/admin/EditQuestionModal';
import AdminRightPanel from '@/components/admin/AdminRightPanel';

export default function AdminPage() {
  const [data, setData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDev, setIsDev] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // 新增：删除确认状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialOrdersRef = useRef<Record<string, string[]>>({});
  const [defaultAscNext, setDefaultAscNext] = useState(true);
  const [explainAscNext, setExplainAscNext] = useState(true);


  // Check environment
  useEffect(() => {
    // 简单的环境检测，实际项目中可以通过 API 返回环境信息
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  // Fetch data on load
  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        setData(data);
        if (Object.keys(data).length > 0) {
          setSelectedModuleId(Object.keys(data)[0]);
        }
        // snapshot original order for each module
        (Object.entries(data) as [string, QuestionData[string]][]).forEach(([mid, mod]) => {
          initialOrdersRef.current[mid] = mod.questions.map((q: Question) => q.id);
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('加载数据失败:', err);
        setLoading(false);
      });
  }, []);

  const handleGenerateExplanation = async () => {
    if (!editingQuestion) return;
    setGenerateStatus('idle');
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editingQuestion.text,
          options: editingQuestion.options,
          correctAnswer: editingQuestion.correctAnswer,
          image: editingQuestion.image || ''
        })
      });

      if (!response.ok) throw new Error('生成解析失败');

      const data = await response.json();
      setEditingQuestion({
        ...editingQuestion,
        explanation: data.explanation || '生成解析失败'
      });
      setGenerateStatus('success');
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setGenerateStatus('idle');
      }, 2000);
    } catch (error) {
      console.error(error);
      setGenerateStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    if (!data) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('保存失败');
      setSaveStatus('success');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 1500);
    } catch {
      setSaveStatus('error');
    }
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    if (!data || !selectedModuleId) return;
    
    const newQuestions = data[selectedModuleId].questions.map(q => 
      q.id === updatedQ.id ? updatedQ : q
    );
    
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: newQuestions
      }
    });
    
    setIsEditModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!data || !selectedModuleId) return;
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!data || !selectedModuleId || deleteConfirmId === null) return;
    
    const newQuestions = data[selectedModuleId].questions.filter(q => q.id !== deleteConfirmId);
    
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: newQuestions
      }
    });
    // update snapshot
    if (initialOrdersRef.current[selectedModuleId]) {
      initialOrdersRef.current[selectedModuleId] = initialOrdersRef.current[selectedModuleId].filter(id => id !== deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  const handleAddQuestion = () => {
    if (!data || !selectedModuleId) return;
    
    // Use random UUID for new questions
    const newId = crypto.randomUUID();
    const currentQuestions = data[selectedModuleId].questions;
      
    const newQuestion: Question = {
      id: newId,
      text: '新题目',
      options: ['选项A', '选项B', '选项C', '选项D'],
      correctAnswer: 0,
      explanation: '解析内容'
    };
    
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: [...currentQuestions, newQuestion]
      }
    });
    // update snapshot for default order
    if (!initialOrdersRef.current[selectedModuleId]) {
      initialOrdersRef.current[selectedModuleId] = [];
    }
    initialOrdersRef.current[selectedModuleId].push(newId);
    
    // Automatically open edit modal for new question
    setEditingQuestion(newQuestion);
    setIsEditModalOpen(true);
    setGenerateStatus('idle');
  };

  const handleCreateModule = () => {
    if (!data) return;
    const newId = crypto.randomUUID();
    const index = Object.keys(data).length + 1;
    const newModuleTitle = `新模块${index}`;
    const newModule: QuestionData[string] = {
      title: newModuleTitle,
      questions: []
    };
    setData({
      ...data,
      [newId]: newModule
    });
    initialOrdersRef.current[newId] = [];
    setSelectedModuleId(newId);
    setEditingQuestion(null);
    setIsEditModalOpen(false);
    setGenerateStatus('idle');
  };

  const handleRenameModule = (id: string, newTitle: string) => {
    if (!data || !data[id]) return;
    setData({
      ...data,
      [id]: {
        ...data[id],
        title: newTitle
      }
    });
  };

  const handleSortExplanationAsc = () => {
    if (!data || !selectedModuleId) return;
    const sorted = [...data[selectedModuleId].questions].sort((a, b) => {
      const la = (a.explanation || '').length;
      const lb = (b.explanation || '').length;
      return la - lb;
    });
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: sorted
      }
    });
  };
  const handleSortExplanationDesc = () => {
    if (!data || !selectedModuleId) return;
    const sorted = [...data[selectedModuleId].questions].sort((a, b) => {
      const la = (a.explanation || '').length;
      const lb = (b.explanation || '').length;
      return lb - la;
    });
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: sorted
      }
    });
  };
  const handleSortDefault = () => {
    if (!data || !selectedModuleId) return;
    const snap = initialOrdersRef.current[selectedModuleId];
    if (!snap) return;
    const map = new Map(data[selectedModuleId].questions.map(q => [q.id, q]));
    const restored = snap.map(id => map.get(id)).filter(Boolean) as Question[];
    // append any new ids not in snapshot (shouldn't happen, but safe)
    const extra = data[selectedModuleId].questions.filter(q => !snap.includes(q.id));
    const merged = [...restored, ...extra];
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: merged
      }
    });
  };
  const handleSortDefaultDesc = () => {
    if (!data || !selectedModuleId) return;
    const snap = initialOrdersRef.current[selectedModuleId];
    if (!snap) return;
    const map = new Map(data[selectedModuleId].questions.map(q => [q.id, q]));
    const restored = [...snap].reverse().map(id => map.get(id)).filter(Boolean) as Question[];
    const extra = data[selectedModuleId].questions.filter(q => !snap.includes(q.id)).reverse();
    const merged = [...restored, ...extra];
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: merged
      }
    });
  };

  const handleToggleDefaultSort = () => {
    if (defaultAscNext) {
      handleSortDefault();
    } else {
      handleSortDefaultDesc();
    }
    setDefaultAscNext(!defaultAscNext);
  };

  const handleToggleExplainSort = () => {
    if (explainAscNext) {
      handleSortExplanationAsc();
    } else {
      handleSortExplanationDesc();
    }
    setExplainAscNext(!explainAscNext);
  };

  const handleShuffle = () => {
    if (!data || !selectedModuleId) return;
    const arr = [...data[selectedModuleId].questions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setData({
      ...data,
      [selectedModuleId]: {
        ...data[selectedModuleId],
        questions: arr
      }
    });
  };

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  if (loading) return <div className="p-8 text-center">加载中...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">数据加载失败</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Modules */}
      <AdminSidebar
        data={data}
        selectedModuleId={selectedModuleId}
        onSelect={setSelectedModuleId}
        isDev={isDev}
        onCreateModule={handleCreateModule}
        onRenameModule={handleRenameModule}
      />

      {/* Main Content - Questions */}
      <div className="flex-1 ml-64 mr-72 p-8 overflow-y-auto">
        {selectedModuleId && (
          <QuestionList
            module={data[selectedModuleId]}
            onAdd={handleAddQuestion}
            onEdit={(q) => { setEditingQuestion(q); setIsEditModalOpen(true); setGenerateStatus('idle'); }}
            onDelete={handleDeleteQuestion}
          />
        )}
      </div>

      <AdminRightPanel
        selectedModule={selectedModuleId ? data[selectedModuleId] : null}
        onSaveAll={handleSaveAll}
        isDev={isDev}
        saveStatus={saveStatus}
        defaultAscNext={defaultAscNext}
        explainAscNext={explainAscNext}
        onToggleDefaultSort={handleToggleDefaultSort}
        onToggleExplainSort={handleToggleExplainSort}
        onShuffle={handleShuffle}
      />

      {/* Edit Modal */}
      <EditQuestionModal
        isOpen={isEditModalOpen && !!editingQuestion}
        displayIndex={
          isEditModalOpen && editingQuestion && selectedModuleId
            ? data[selectedModuleId].questions.findIndex(x => x.id === editingQuestion.id) + 1
            : null
        }
        question={editingQuestion}
        onChange={setEditingQuestion}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={() => editingQuestion && handleUpdateQuestion(editingQuestion)}
        onGenerate={handleGenerateExplanation}
        isGenerating={isGenerating}
        generateStatus={generateStatus}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除这道题目吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  );
}
