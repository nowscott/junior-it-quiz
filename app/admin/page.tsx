'use client';

import React, { useState, useEffect } from 'react';
import { Question, QuestionData } from '@/data/types';
import ConfirmationModal from '@/components/modals/ConfirmationModal'; // 引入自定义组件
import AdminSidebar from '@/components/admin/AdminSidebar';
import QuestionList from '@/components/admin/QuestionList';
import EditQuestionModal from '@/components/admin/EditQuestionModal';

export default function AdminPage() {
  const [data, setData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDev, setIsDev] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // 新增：删除确认状态
  const [isGenerating, setIsGenerating] = useState(false);


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
        setLoading(false);
      })
      .catch(err => {
        console.error('加载数据失败:', err);
        setMessage({ type: 'error', text: '加载数据失败，请刷新重试' });
        setLoading(false);
      });
  }, []);

  const handleGenerateExplanation = async () => {
    if (!editingQuestion) return;
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
      
      setMessage({ type: 'success', text: '解析生成成功！' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: '生成解析失败，请稍后重试' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('保存失败');
      
      setMessage({ type: 'success', text: '保存成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: '保存失败，请检查控制台' });
    } finally {
      setSaving(false);
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
    
    // Automatically open edit modal for new question
    setEditingQuestion(newQuestion);
    setIsEditModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center">加载中...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">数据加载失败</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Modules */}
      <AdminSidebar
        data={data}
        selectedModuleId={selectedModuleId}
        onSelect={setSelectedModuleId}
        onSaveAll={handleSaveAll}
        saving={saving}
        isDev={isDev}
        message={message}
      />

      {/* Main Content - Questions */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {selectedModuleId && (
          <QuestionList
            module={data[selectedModuleId]}
            onAdd={handleAddQuestion}
            onEdit={(q) => { setEditingQuestion(q); setIsEditModalOpen(true); }}
            onDelete={handleDeleteQuestion}
          />
        )}
      </div>

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
