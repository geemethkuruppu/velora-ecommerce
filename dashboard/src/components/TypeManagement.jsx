import React, { useState } from 'react';
import { X, Layers, Plus, Trash2, ChevronRight } from 'lucide-react';

const TypeManagement = ({
    isOpen,
    onClose,
    types,
    categories,
    typeData,
    setTypeData,
    onAddType,
    onDeleteType
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight">Type Management</h2>
                        <p className="text-xs text-text-muted mt-1 font-medium">Manage product types under categories</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Add Type Section */}
                    <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Add New Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Type Name</label>
                                <input
                                    type="text"
                                    value={typeData.name}
                                    onChange={(e) => setTypeData({ ...typeData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                    placeholder="e.g., Evening Gowns"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={typeData.slug}
                                    onChange={(e) => setTypeData({ ...typeData, slug: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                    placeholder="e.g., evening-gowns"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Category</label>
                            <select
                                value={typeData.category_id}
                                onChange={(e) => setTypeData({ ...typeData, category_id: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.department} — {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={onAddType}
                            disabled={!typeData.name || !typeData.slug || !typeData.category_id}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} className="inline mr-2" />
                            Add Type
                        </button>
                    </div>

                    {/* Types List */}
                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Existing Types</h3>
                        {types.length === 0 ? (
                            <div className="text-center py-12 text-text-muted">
                                <Layers size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">No types yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {types.map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Layers size={18} className="text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-sm text-primary">{type.name}</h4>
                                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase flex items-center gap-1">
                                                        {type.category?.department} <ChevronRight size={10} /> {type.category?.name}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-muted font-mono">{type.slug}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDeleteType(type)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-primary rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TypeManagement;
