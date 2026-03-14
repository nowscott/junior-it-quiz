'use client';

import React, { useState, useEffect } from 'react';
import { ModuleData, Question, QuestionData } from '@/data/types';
import { Save, Plus, Trash2, Edit2, ChevronRight, X, AlertCircle } from 'lucide-react';
import ConfirmationModal from '@/components/modals/ConfirmationModal'; // 引入自定义组件

export default function AdminPage() {
  const [data, setData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDev, setIsDev] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null); // 新增：删除确认状态

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
        console.error('Failed to load data:', err);
        setMessage({ type: 'error', text: '加载数据失败，请刷新重试' });
        setLoading(false);
      });
  }, []);

  const handleSaveAll = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      setMessage({ type: 'success', text: '保存成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
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

  const handleDeleteQuestion = (id: number) => {
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
    
    // Generate new ID (max + 1)
    const currentQuestions = data[selectedModuleId].questions;
    const maxId = currentQuestions.length > 0 
      ? Math.max(...currentQuestions.map(q => q.id)) 
      : 0;
      
    const newQuestion: Question = {
      id: maxId + 1,
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
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0">
        <div className="p-4 border-b border-gray-100 font-bold text-lg text-gray-800">
          题库管理
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {Object.entries(data).map(([id, module]) => (
            <button
              key={id}
              onClick={() => setSelectedModuleId(id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedModuleId === id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {module.title}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          {!isDev && (
            <div className="mb-3 p-3 bg-yellow-50 text-yellow-700 text-xs rounded-lg border border-yellow-100 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                生产环境无法修改数据。请在本地运行 <code>npm run dev</code> 进行编辑，然后提交代码。
              </span>
            </div>
          )}
          <button 
            onClick={handleSaveAll}
            disabled={saving || !isDev}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isDev ? "仅支持本地开发环境保存" : "保存到本地文件"}
          >
            {saving ? '保存中...' : <><Save size={18} /> 保存全部更改</>}
          </button>
          {message && (
            <div className={`mt-2 text-xs text-center p-2 rounded ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Questions */}
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        {selectedModuleId && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {data[selectedModuleId].title}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({data[selectedModuleId].questions.length} 题)
                </span>
              </h1>
              <button 
                onClick={handleAddQuestion}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} /> 添加题目
              </button>
            </div>

            <div className="space-y-4">
              {data[selectedModuleId].questions.map((q) => (
                <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">ID: {q.id}</span>
                        <h3 className="font-medium text-gray-900 line-clamp-2">{q.text}</h3>
                      </div>
                      <div className="text-sm text-gray-500 pl-1">
                        答案: <span className="font-mono bg-green-50 text-green-700 px-1 rounded">{String.fromCharCode(65 + q.correctAnswer)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="编辑"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">编辑题目 (ID: {editingQuestion.id})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label>
                <textarea 
                  value={editingQuestion.text}
                  onChange={e => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选项</label>
                <div className="space-y-2">
                  {editingQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-gray-400">{String.fromCharCode(65 + idx)}</span>
                      <input 
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOpts = [...editingQuestion.options];
                          newOpts[idx] = e.target.value;
                          setEditingQuestion({...editingQuestion, options: newOpts});
                        }}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input 
                        type="radio"
                        name="correctAnswer"
                        checked={editingQuestion.correctAnswer === idx}
                        onChange={() => setEditingQuestion({...editingQuestion, correctAnswer: idx})}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        title="设为正确答案"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">解析</label>
                <textarea 
                  value={editingQuestion.explanation}
                  onChange={e => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
              >
                取消
              </button>
              <button 
                onClick={() => handleUpdateQuestion(editingQuestion)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-200"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}

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
