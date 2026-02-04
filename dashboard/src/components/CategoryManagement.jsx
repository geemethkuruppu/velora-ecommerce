import React, { useRef, useState } from 'react';
import { X, Tag, Plus, Trash2, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';

const CategoryManagement = ({
    isOpen,
    onClose,
    categories,
    categoryData,
    setCategoryData,
    onAddCategory,
    onDeleteCategory
}) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create instant local preview
        const previewUrl = URL.createObjectURL(file);
        setLocalPreview(previewUrl);

        try {
            setUploading(true);
            const response = await productService.uploadMedia(file);
            setCategoryData({ ...categoryData, image_url: response.url });
            // Once uploaded successfully, we can clear the local preview 
            // as the categoryData.image_url will now take over
            setLocalPreview(null);
        } catch (error) {
            console.error('Error uploading category image:', error);
            alert('Failed to upload image. Please try again.');
            setLocalPreview(null); // Clear preview on error
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
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

                        <div className="flex gap-6 mb-6">
                            {/* Image Upload Area */}
                            <div className="w-32 h-32 flex-shrink-0">
                                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Image</label>
                                <div
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    className={`w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group ${categoryData.image_url ? 'border-primary/20 bg-gray-50' : 'border-gray-200 hover:border-primary/40 bg-gray-50/50'
                                        }`}
                                >
                                    {uploading && !localPreview ? (
                                        <Loader2 className="animate-spin text-primary" size={24} />
                                    ) : (localPreview || categoryData.image_url) ? (
                                        <>
                                            <img src={localPreview || categoryData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <Loader2 className="animate-spin text-white" size={20} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase tracking-widest">
                                                Change
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="text-text-muted mb-1" size={20} />
                                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Upload</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Category Name</label>
                                        <input
                                            type="text"
                                            value={categoryData.name}
                                            onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                            placeholder="e.g., Luxury Watches"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Slug</label>
                                        <input
                                            type="text"
                                            value={categoryData.slug}
                                            onChange={(e) => setCategoryData({ ...categoryData, slug: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary/50 transition-colors text-sm"
                                            placeholder="e.g., luxury-watches"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Department</label>
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
                        </div>

                        <button
                            onClick={onAddCategory}
                            disabled={uploading || !categoryData.name || !categoryData.slug}
                            className={`w-full py-3 bg-primary text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${uploading || !categoryData.name || !categoryData.slug ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]'
                                }`}
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
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center">
                                                {category.image_url ? (
                                                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Tag size={18} className="text-primary" />
                                                )}
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
