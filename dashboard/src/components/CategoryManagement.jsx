import React from 'react';
import { X, Tag, Plus, Trash2 } from 'lucide-react';

const CategoryManagement = ({
    isOpen,
    onClose,
    categories,
    categoryData,
    setCategoryData,
    onAddCategory,
    onDeleteCategory
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight">Category Management</h2>
                        <p className="text-xs text-text-muted mt-1 font-medium">Manage product categories</p>
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
                    {/* Add Category Section */}
                    <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Add New Category</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={categoryData.name}
                                    onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                    placeholder="e.g., Luxury Watches"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={categoryData.slug}
                                    onChange={(e) => setCategoryData({ ...categoryData, slug: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                    placeholder="e.g., luxury-watches"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Department</label>
                                <select
                                    value={categoryData.department}
                                    onChange={(e) => setCategoryData({ ...categoryData, department: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none bg-white"
                                >
                                    <option value="Womenswear">Womenswear</option>
                                    <option value="Menswear">Menswear</option>
                                    <option value="Kidswear">Kidswear</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={onAddCategory}
                            className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all"
                        >
                            <Plus size={16} className="inline mr-2" />
                            Add Category
                        </button>
                    </div>

                    {/* Categories List */}
                    <div>
                        <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Existing Categories</h3>
                        {categories.length === 0 ? (
                            <div className="text-center py-12 text-text-muted">
                                <Tag size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">No categories yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/20 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Tag size={18} className="text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-sm text-primary">{category.name}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${category.department === 'Womenswear' ? 'bg-pink-100 text-pink-700' :
                                                        category.department === 'Menswear' ? 'bg-blue-100 text-blue-700' :
                                                            category.department === 'Kidswear' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {category.department || 'Others'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-muted font-mono">{category.slug}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onDeleteCategory(category)}
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

export default CategoryManagement;
