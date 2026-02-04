import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Edit2, Trash2, Eye, X, Image as ImageIcon, Settings, List, PlusCircle, MinusCircle, CheckCircle, Tag, Layers, UploadCloud, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { productService } from '../services/productService';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ErrorDisplay from '../components/ErrorDisplay';
import CategoryManagement from '../components/CategoryManagement';
import TypeManagement from '../components/TypeManagement';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [deletingType, setDeletingType] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // general, variants, media, specs

    // Category Form State
    const [categoryData, setCategoryData] = useState({ name: '', slug: '', department: 'Others', image_url: '' });

    // Type Form State
    const [typeData, setTypeData] = useState({ name: '', slug: '', category_id: '' });

    // Success Modal State
    const [showSuccess, setShowSuccess] = useState(false);
    const [successTitle, setSuccessTitle] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');
    const [viewingProduct, setViewingProduct] = useState(null);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [deletingProductStock, setDeletingProductStock] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingProduct, setTogglingProduct] = useState(null);
    const [isToggling, setIsToggling] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        slug: '',
        brand: '',
        tags: '',
        short_description: '',
        description: '',
        base_price: '',
        currency: 'USD',
        type_id: '',
        is_active: true,
        variants: [],
        specifications: [],
        media: []
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchTypes();
    }, []);

    useEffect(() => {
        console.log('Current products state:', products);
    }, [products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTypes = async () => {
        try {
            const data = await productService.getTypes();
            setTypes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const handleTypeSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            setLoading(true);
            await productService.createType(typeData);
            setSuccessTitle('Type Created');
            setSuccessMsg(`Type "${typeData.name}" has been added.`);
            setIsTypeModalOpen(false);
            setTypeData({ name: '', slug: '', category_id: '' });
            setShowSuccess(true);
            fetchTypes();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteType = async () => {
        try {
            setIsDeleting(true);
            await productService.deleteType(deletingType.id);
            setSuccessTitle('Type Deleted');
            setSuccessMsg('The product type has been removed successfully.');
            setDeletingType(null);
            setShowSuccess(true);
            fetchTypes();
        } catch (error) {
            setError(error.message);
            setDeletingType(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                ...product,
                type_id: product.type_id || '',
                base_price: product.base_price?.toString() || '',
                variants: product.variants || [],
                specifications: product.specifications || [],
                media: product.media || []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: '',
                slug: '',
                brand: '',
                tags: '',
                short_description: '',
                description: '',
                base_price: '',
                currency: 'USD',
                type_id: types[0]?.id || '',
                is_active: true,
                variants: [],
                specifications: [],
                media: []
            });
        }
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...formData,
                base_price: parseFloat(formData.base_price),
                type_id: parseInt(formData.type_id),
                variants: formData.variants.map(v => ({
                    ...v,
                    price_override: v.price_override ? parseFloat(v.price_override) : null
                }))
            };

            if (editingProduct) {
                await productService.update(editingProduct.id, payload);
                setSuccessTitle('Product Updated');
                setSuccessMsg('Product details have been updated successfully.');
            } else {
                await productService.create(payload);
                setSuccessTitle('Product Created');
                setSuccessMsg('New product has been added to the catalog.');
            }
            setIsModalOpen(false);
            setShowSuccess(true);
            fetchProducts();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addItem = (field, template) => {
        setFormData({ ...formData, [field]: [...formData[field], template] });
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await productService.createCategory(categoryData);
            setSuccessTitle('Category Created');
            setSuccessMsg(`Category "${categoryData.name}" has been added.`);
            setIsCategoryManagementOpen(false);
            setCategoryData({ name: '', slug: '', department: 'Others', image_url: '' });
            setShowSuccess(true);
            fetchCategories();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (field, index) => {
        const newList = [...formData[field]];
        newList.splice(index, 1);
        setFormData({ ...formData, [field]: newList });
    };

    const updateNestedItem = (field, index, subField, value) => {
        const newList = [...formData[field]];
        newList[index] = { ...newList[index], [subField]: value };
        setFormData({ ...formData, [field]: newList });
    };

    const handleViewProduct = (product) => {
        setViewingProduct(product);
        setSelectedMediaIndex(0);
    };

    const handleDeleteClick = async (product) => {
        try {
            const stockData = await productService.getProductStock(product.id);
            setDeletingProductStock(stockData.total_stock);
            setDeletingProduct(product);
        } catch (error) {
            console.error('Error fetching product stock:', error);
            setDeletingProductStock(0);
            setDeletingProduct(product); // Fallback to delete even if stock check fails
        }
    };

    const handleDeleteProduct = async () => {
        try {
            setIsDeleting(true);
            await productService.delete(deletingProduct.id);
            setSuccessTitle('Product Deleted');
            setSuccessMsg('The product has been permanently removed.');
            setDeletingProduct(null);
            setDeletingProductStock(0);
            setShowSuccess(true);
            fetchProducts();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = (product) => {
        setTogglingProduct(product);
    };

    const handleConfirmToggle = async () => {
        try {
            setIsToggling(true);
            if (togglingProduct.is_active) {
                await productService.deactivate(togglingProduct.id);
            } else {
                await productService.activate(togglingProduct.id);
            }
            fetchProducts();

            // Also update viewingProduct if it's the one being toggled
            if (viewingProduct && viewingProduct.id === togglingProduct.id) {
                setViewingProduct({ ...viewingProduct, is_active: !togglingProduct.is_active });
            }
            setTogglingProduct(null);
            setSuccessTitle('Status Updated');
            setSuccessMsg(`Product ${togglingProduct.is_active ? 'deactivated' : 'activated'} successfully.`);
            setShowSuccess(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsToggling(false);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            setIsDeleting(true);
            await productService.deleteCategory(deletingCategory.id);
            setSuccessTitle('Category Deleted');
            setSuccessMsg('The category has been removed successfully.');
            setDeletingCategory(null);
            setShowSuccess(true);
            fetchCategories();
        } catch (error) {
            setError(error.message);
            setDeletingCategory(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Product Management</h1>
                    <p className="text-text-muted text-xs font-bold tracking-wider mt-1">Manage luxury products, variants, and specifications.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className="flex items-center gap-2.5 px-6 py-3 bg-white border-2 border-primary/10 text-primary hover:bg-gray-50 rounded-xl shadow-sm transition-all active:scale-95 group font-bold"
                        onClick={() => setIsCategoryManagementOpen(true)}
                    >
                        <Tag size={18} className="text-primary/70" />
                        <span className="text-xs tracking-widest uppercase">Categories</span>
                    </button>
                    <button
                        className="flex items-center gap-2.5 px-6 py-3 bg-white border-2 border-primary/10 text-primary hover:bg-gray-50 rounded-xl shadow-sm transition-all active:scale-95 group font-bold"
                        onClick={() => setIsTypeModalOpen(true)}
                    >
                        <Layers size={18} className="text-primary/70" />
                        <span className="text-xs tracking-widest uppercase">Types</span>
                    </button>
                    <button
                        className="flex items-center gap-2.5 px-6 py-3 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white rounded-xl shadow-xl shadow-[#7C4DFF]/20 transition-all active:scale-95 group"
                        onClick={() => handleOpenModal()}
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs font-bold tracking-widest uppercase">Add Product</span>
                    </button>
                </div>
            </header>

            {/* Product List Table */}
            <div className="glass-card !p-0 overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-white">
                    <div className="flex items-center bg-white border border-gray-200 px-4 py-2.5 rounded-xl w-[350px] gap-3">
                        <Search size={18} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-text-main w-full focus:outline-none text-xs font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Product Detail</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Department</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Category</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Type</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Base Price</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Variants</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Status</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && products.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            <p className="text-xs font-bold text-text-muted tracking-widest uppercase">Fetching Catalog...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-text-muted text-sm font-medium italic">No products matched your search.</td>
                                </tr>
                            ) : filteredProducts.map(product => (
                                <tr key={product.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors group bg-white">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-primary tracking-tight">{product.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-tight uppercase ${product.type?.category?.department === 'Womenswear' ? 'bg-pink-100 text-pink-700' :
                                            product.type?.category?.department === 'Menswear' ? 'bg-blue-100 text-blue-700' :
                                                product.type?.category?.department === 'Kidswear' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {product.type?.category?.department || 'Others'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold tracking-tight uppercase">
                                            {product.type?.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold tracking-tight uppercase">
                                            {product.type?.name || 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-primary">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: product.currency || 'USD'
                                        }).format(product.base_price || 0)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex -space-x-2">
                                            {product.variants?.slice(0, 3).map((v, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600" title={v.sku}>
                                                    {v.size || i + 1}
                                                </div>
                                            ))}
                                            {product.variants?.length > 3 && (
                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                                    +{product.variants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(product); }}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all ${product.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-emerald-600' : 'bg-red-500'}`} />
                                            <span className="text-[10px] font-bold tracking-widest uppercase">{product.is_active ? 'Active' : 'Inactive'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleViewProduct(product)} className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleOpenModal(product)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(product)} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comprehensive Product Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden border border-black/5 animate-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary tracking-tight">{editingProduct ? 'Update Product' : 'Add New Product'}</h2>
                                    <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-widest">Enterprise Catalog Terminal</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-text-muted hover:text-red-500 transition-all hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content - Tabbed */}
                            <div className="flex flex-1 overflow-hidden">
                                {/* Left Side: Tabs Navigation */}
                                <div className="w-64 border-r border-gray-100 p-6 flex flex-col gap-3 bg-white">
                                    {[
                                        { id: 'general', label: 'General Info', icon: Package },
                                        { id: 'variants', label: 'Variations', icon: List },
                                        { id: 'media', label: 'Media Assets', icon: ImageIcon },
                                        { id: 'specs', label: 'Specifications', icon: Settings }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-3 px-5 py-4 rounded-[20px] text-xs font-bold tracking-tight transition-all ${activeTab === tab.id ? 'bg-[#7C4DFF] text-white shadow-lg shadow-[#7C4DFF]/20 translate-x-1' : 'text-text-muted hover:bg-white hover:text-primary'}`}
                                        >
                                            <tab.icon size={18} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Right Side: Tab Panes */}
                                <div className="flex-1 overflow-y-auto p-10 bg-white">
                                    <form onSubmit={handleSubmit} id="productForm">
                                        {activeTab === 'general' && (
                                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Product Name</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                                                            placeholder="Luxury Gold Watch..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Unique SKU</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={formData.sku}
                                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                                                            placeholder="VEL-WATCH-01"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">URL Slug</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={formData.slug}
                                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                                                            placeholder="luxury-gold-watch"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Product Type</label>
                                                        <select
                                                            required
                                                            value={formData.type_id}
                                                            onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white outline-none transition-all text-sm font-medium appearance-none"
                                                        >
                                                            <option value="">Select Type</option>
                                                            {types.map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    {t.category?.department} — {t.category?.name} — {t.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Base Price</label>
                                                        <div className="relative">
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
                                                            <input
                                                                required
                                                                type="number"
                                                                step="0.01"
                                                                value={formData.base_price}
                                                                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                                                                className="w-full pl-10 pr-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white outline-none transition-all text-sm font-medium"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Currency</label>
                                                        <select
                                                            value={formData.currency}
                                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                                                        >
                                                            <option value="USD">USD - US Dollar</option>
                                                            <option value="EUR">EUR - Euro</option>
                                                            <option value="GBP">GBP - British Pound</option>
                                                            <option value="JPY">JPY - Japanese Yen</option>
                                                            <option value="CNY">CNY - Chinese Yuan</option>
                                                            <option value="AUD">AUD - Australian Dollar</option>
                                                            <option value="CAD">CAD - Canadian Dollar</option>
                                                            <option value="CHF">CHF - Swiss Franc</option>
                                                            <option value="INR">INR - Indian Rupee</option>
                                                            <option value="SGD">SGD - Singapore Dollar</option>
                                                            <option value="HKD">HKD - Hong Kong Dollar</option>
                                                            <option value="NZD">NZD - New Zealand Dollar</option>
                                                            <option value="SEK">SEK - Swedish Krona</option>
                                                            <option value="NOK">NOK - Norwegian Krone</option>
                                                            <option value="MXN">MXN - Mexican Peso</option>
                                                            <option value="ZAR">ZAR - South African Rand</option>
                                                            <option value="BRL">BRL - Brazilian Real</option>
                                                            <option value="AED">AED - UAE Dirham</option>
                                                            <option value="SAR">SAR - Saudi Riyal</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Brand</label>
                                                        <input
                                                            type="text"
                                                            value={formData.brand}
                                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                                                            placeholder="e.g. VELORA"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Tags</label>
                                                        <input
                                                            type="text"
                                                            value={formData.tags}
                                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                            className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary/20 focus:bg-white outline-none transition-all text-sm font-medium"
                                                            placeholder="luxury, premium, limited"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Short Description</label>
                                                    <input
                                                        type="text"
                                                        value={formData.short_description}
                                                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white outline-none transition-all text-sm font-medium"
                                                        placeholder="A brief catchy summary..."
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Full Description</label>
                                                    <textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white outline-none transition-all text-sm font-medium min-h-[140px] resize-none"
                                                        placeholder="Detailed product storytelling..."
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'variants' && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Product Variations</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => addItem('variants', { sku: '', color: '', size: '', price_override: null, stock_quantity: 0 })}
                                                        className="flex items-center gap-2 text-xs font-bold text-[#7C4DFF] hover:text-[#6C3DFF] transition-colors"
                                                    >
                                                        <PlusCircle size={16} />
                                                        Add Variant
                                                    </button>
                                                </div>

                                                {formData.variants.length === 0 ? (
                                                    <div className="p-12 border-2 border-dashed border-gray-100 rounded-[32px] text-center">
                                                        <p className="text-xs font-medium text-text-muted italic">No variants added yet. Add sizes or colors for this product.</p>
                                                    </div>
                                                ) : formData.variants.map((variant, index) => (
                                                    <div key={index} className="p-6 bg-white rounded-[28px] border border-gray-200 relative group animate-in zoom-in-95 duration-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem('variants', index)}
                                                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-gray-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                        >
                                                            <MinusCircle size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-5 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider ml-1">Variant SKU</label>
                                                                <input
                                                                    required
                                                                    type="text"
                                                                    value={variant.sku}
                                                                    onChange={(e) => updateNestedItem('variants', index, 'sku', e.target.value)}
                                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="ID-COLOR-SIZE"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider ml-1">Color</label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.color}
                                                                    onChange={(e) => updateNestedItem('variants', index, 'color', e.target.value)}
                                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="e.g. Red"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider ml-1">Size</label>
                                                                <input
                                                                    type="text"
                                                                    value={variant.size}
                                                                    onChange={(e) => updateNestedItem('variants', index, 'size', e.target.value)}
                                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="e.g. XL"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider ml-1">Price Override</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={variant.price_override || ''}
                                                                    onChange={(e) => updateNestedItem('variants', index, 'price_override', e.target.value)}
                                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider ml-1">Stock</label>
                                                                <input
                                                                    type="number"
                                                                    value={variant.stock_quantity || 0}
                                                                    onChange={(e) => updateNestedItem('variants', index, 'stock_quantity', e.target.value)}
                                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {activeTab === 'media' && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Media Library</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => addItem('media', { media_url: '', media_type: 'image', is_primary: false })}
                                                        className="flex items-center gap-2 text-xs font-bold text-[#7C4DFF] hover:text-[#6C3DFF] transition-colors"
                                                    >
                                                        <PlusCircle size={16} />
                                                        Add Media
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    {formData.media.length === 0 ? (
                                                        <div className="col-span-2 p-12 border-2 border-dashed border-gray-100 rounded-[32px] text-center">
                                                            <p className="text-xs font-medium text-text-muted italic">No media assets linked. Add image or video URLs.</p>
                                                        </div>
                                                    ) : formData.media.map((med, index) => (
                                                        <div key={index} className="p-6 bg-white rounded-[32px] border border-gray-200 relative group flex flex-col gap-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem('media', index)}
                                                                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-gray-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <MinusCircle size={16} />
                                                            </button>

                                                            {(med.media_url || med.localPreview) && med.media_type === 'image' && (
                                                                <div className="w-full h-32 rounded-2xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center shadow-inner relative">
                                                                    <img src={med.localPreview || med.media_url} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
                                                                    {med.isUploading && (
                                                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                                            <Loader2 className="animate-spin text-primary" size={24} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="space-y-3">
                                                                <label className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider ml-1">Asset Upload</label>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={med.media_url}
                                                                        readOnly
                                                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-100 outline-none text-[10px] font-bold text-gray-400 cursor-not-allowed"
                                                                        placeholder="Upload an image..."
                                                                    />
                                                                    <label className="px-3 py-2.5 rounded-xl bg-primary text-white cursor-pointer hover:bg-black transition-all flex items-center justify-center">
                                                                        <UploadCloud size={14} />
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={async (e) => {
                                                                                const file = e.target.files[0];
                                                                                if (!file) return;
                                                                                try {
                                                                                    const previewUrl = URL.createObjectURL(file);
                                                                                    updateNestedItem('media', index, 'localPreview', previewUrl);
                                                                                    updateNestedItem('media', index, 'isUploading', true);

                                                                                    const res = await productService.uploadMedia(file);

                                                                                    updateNestedItem('media', index, 'media_url', res.url);
                                                                                    updateNestedItem('media', index, 'localPreview', null);
                                                                                } catch (err) {
                                                                                    setError('Failed to upload image. Please try again.');
                                                                                    updateNestedItem('media', index, 'localPreview', null);
                                                                                } finally {
                                                                                    updateNestedItem('media', index, 'isUploading', false);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </label>
                                                                </div>

                                                                <div className="flex justify-between items-center px-1">
                                                                    <div className="flex gap-2">
                                                                        {['image', 'video'].map(type => (
                                                                            <button
                                                                                key={type}
                                                                                type="button"
                                                                                onClick={() => updateNestedItem('media', index, 'media_type', type)}
                                                                                className={`px-3 py-1 rounded-lg text-[8px] font-extrabold uppercase tracking-widest border transition-all ${med.media_type === type ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-text-muted border-gray-100'}`}
                                                                            >
                                                                                {type}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={med.is_primary}
                                                                            onChange={(e) => {
                                                                                // Ensure only one is primary
                                                                                const newMedia = formData.media.map((item, idx) => ({
                                                                                    ...item,
                                                                                    is_primary: idx === index ? e.target.checked : false
                                                                                }));
                                                                                setFormData({ ...formData, media: newMedia });
                                                                            }}
                                                                            className="w-3 h-3 rounded text-primary focus:ring-primary"
                                                                        />
                                                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Primary</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'specs' && (
                                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Technical Specifications</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => addItem('specifications', { spec_key: '', spec_value: '' })}
                                                        className="flex items-center gap-2 text-xs font-bold text-[#7C4DFF] hover:text-[#6C3DFF] transition-colors"
                                                    >
                                                        <PlusCircle size={16} />
                                                        Add Spec
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    {formData.specifications.length === 0 ? (
                                                        <div className="p-12 border-2 border-dashed border-gray-100 rounded-[32px] text-center">
                                                            <p className="text-xs font-medium text-text-muted italic">No specifications defined. Add technical details like Material or Care.</p>
                                                        </div>
                                                    ) : formData.specifications.map((spec, index) => (
                                                        <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-[24px] border border-gray-100 relative group items-center">
                                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                                <input
                                                                    required
                                                                    type="text"
                                                                    value={spec.spec_key}
                                                                    onChange={(e) => updateNestedItem('specifications', index, 'spec_key', e.target.value)}
                                                                    className="px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="Spec Name (e.g. Material)"
                                                                />
                                                                <input
                                                                    required
                                                                    type="text"
                                                                    value={spec.spec_value}
                                                                    onChange={(e) => updateNestedItem('specifications', index, 'spec_value', e.target.value)}
                                                                    className="px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none text-[11px] font-bold focus:border-primary/20"
                                                                    placeholder="Value (e.g. 100% Silk)"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem('specifications', index)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <MinusCircle size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-gray-100 bg-white flex justify-between items-center">
                                <div className="flex gap-2">
                                    <div className={`w-2 h-2 rounded-full ${formData.name && formData.sku && formData.slug && formData.base_price && formData.type_id ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                    <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">
                                        {formData.name && formData.sku && formData.slug && formData.base_price && formData.type_id ? 'Ready for Deployment' : 'Complete Required Fields'}
                                    </span>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-10 py-4 rounded-2xl border-2 border-gray-100 text-xs font-bold text-text-muted hover:bg-gray-50 transition-all uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        form="productForm"
                                        type="submit"
                                        className="px-10 py-4 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-black transition-all shadow-xl shadow-primary/20 uppercase tracking-widest active:scale-95"
                                    >
                                        {editingProduct ? 'Commit Changes' : 'Initialize Product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Category Modal */}
            {
                isCategoryManagementOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] w-full max-w-md flex flex-col relative shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 p-10">
                            <button
                                onClick={() => setIsCategoryManagementOpen(false)}
                                className="absolute top-6 right-6 p-2 text-text-muted hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-primary tracking-tight text-center">New Category</h2>
                                <p className="text-xs text-text-muted font-bold mt-1 text-center uppercase tracking-widest">Organize Your Collection</p>
                            </div>

                            <form onSubmit={handleCategorySubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">Category Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={categoryData.name}
                                        onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white outline-none transition-all text-sm font-medium"
                                        placeholder="e.g. Luxury Footwear"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[1.5px] ml-1">URL Slug</label>
                                    <input
                                        required
                                        type="text"
                                        value={categoryData.slug}
                                        onChange={(e) => setCategoryData({ ...categoryData, slug: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white outline-none transition-all text-sm font-medium"
                                        placeholder="luxury-footwear"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-black transition-all shadow-xl shadow-primary/20 uppercase tracking-widest active:scale-95 mt-4"
                                >
                                    Create Category
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Product Detail Modal */}
            {
                viewingProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden border border-black/5 animate-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Package size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary tracking-tight">{viewingProduct.name}</h2>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{viewingProduct.sku} • {viewingProduct.type?.category?.name || 'Uncategorized'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggleStatus(viewingProduct)}
                                        className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${viewingProduct.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'}`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${viewingProduct.is_active ? 'bg-emerald-600' : 'bg-red-500'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{viewingProduct.is_active ? 'Active' : 'Inactive'}</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setViewingProduct(null);
                                            handleOpenModal(viewingProduct);
                                        }}
                                        className="p-2.5 rounded-xl bg-white border border-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title="Edit Product"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setViewingProduct(null);
                                            handleDeleteClick(viewingProduct);
                                        }}
                                        className="p-2.5 rounded-xl bg-white border border-gray-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        title="Delete Product"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="w-px h-8 bg-gray-200 mx-1"></div>
                                    <button
                                        onClick={() => setViewingProduct(null)}
                                        className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-text-muted hover:text-red-500 transition-all hover:rotate-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-10 bg-white grid grid-cols-12 gap-10">
                                {/* Left Side: Media & Gallery */}
                                <div className="col-span-5 space-y-6">
                                    <div className="aspect-square rounded-[32px] bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner group relative">
                                        {viewingProduct.media?.length > 0 ? (
                                            <>
                                                {/* Main Media Display */}
                                                {viewingProduct.media[selectedMediaIndex].media_type === 'video' ? (
                                                    <video
                                                        src={viewingProduct.media[selectedMediaIndex].media_url}
                                                        controls
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <img
                                                        src={viewingProduct.media[selectedMediaIndex].media_url}
                                                        alt={viewingProduct.name}
                                                        className="max-h-full max-w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                )}

                                                {/* Navigation Buttons (only if multiple) */}
                                                {viewingProduct.media.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedMediaIndex(prev => prev === 0 ? viewingProduct.media.length - 1 : prev - 1);
                                                            }}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <ChevronLeft size={20} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedMediaIndex(prev => prev === viewingProduct.media.length - 1 ? 0 : prev + 1);
                                                            }}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <ChevronRight size={20} />
                                                        </button>
                                                        {/* Index Indicator */}
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
                                                            {selectedMediaIndex + 1} / {viewingProduct.media.length}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-text-muted opacity-30">
                                                <ImageIcon size={48} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">No Media</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnails */}
                                    {viewingProduct.media?.length > 1 && (
                                        <div className="grid grid-cols-5 gap-3">
                                            {viewingProduct.media.map((med, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setSelectedMediaIndex(i)}
                                                    className={`aspect-square rounded-2xl bg-gray-50 border flex items-center justify-center overflow-hidden cursor-pointer transition-all shadow-sm ${selectedMediaIndex === i ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-300'}`}
                                                >
                                                    {med.media_type === 'video' ? (
                                                        <div className="flex items-center justify-center w-full h-full bg-gray-100">
                                                            <span className="text-[8px] font-bold uppercase text-text-muted">Video</span>
                                                        </div>
                                                    ) : (
                                                        <img src={med.media_url} alt="Thumb" className="max-h-full max-w-full object-contain p-1" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="p-6 bg-[#F8F7FF] rounded-3xl border border-[#7C4DFF]/10">
                                        <h4 className="text-[10px] font-bold text-[#7C4DFF] uppercase tracking-[1.5px] mb-3">Pricing Details</h4>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-primary tracking-tighter">
                                                {new Intl.NumberFormat('en-US', {
                                                    style: 'currency',
                                                    currency: viewingProduct.currency || 'USD'
                                                }).format(viewingProduct.base_price || 0)}
                                            </span>
                                            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Base Rate</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Info & Tabs */}
                                <div className="col-span-7 space-y-8">
                                    {viewingProduct.brand && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold tracking-tight uppercase">{viewingProduct.brand}</span>
                                            {viewingProduct.tags && viewingProduct.tags.split(',').map((tag, i) => (
                                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold tracking-tight">{tag.trim()}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px]">Description</h4>
                                        <p className="text-sm text-text-main leading-relaxed font-medium">{viewingProduct.description || 'No detailed description provided.'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px]">Available Variants</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingProduct.variants?.length > 0 ? viewingProduct.variants.map((v, i) => (
                                                    <div key={i} className="px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-start min-w-[80px]">
                                                        <div className="flex items-center justify-between w-full mb-1">
                                                            <span className="text-[9px] font-black text-primary">{v.size || '-'}</span>
                                                            <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded ${v.stock_quantity > 10 ? 'bg-emerald-100 text-emerald-700' : v.stock_quantity > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                                {v.stock_quantity || 0}
                                                            </span>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">{v.color || '-'}</span>
                                                    </div>
                                                )) : (
                                                    <p className="text-[10px] font-bold text-text-muted italic">No variants</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[2px]">Technical Specs</h4>
                                            <div className="space-y-2">
                                                {viewingProduct.specifications?.length > 0 ? viewingProduct.specifications.map((spec, i) => (
                                                    <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                                                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-tight">{spec.spec_key}</span>
                                                        <span className="text-[9px] font-black text-primary">{spec.spec_value}</span>
                                                    </div>
                                                )) : (
                                                    <p className="text-[10px] font-bold text-text-muted italic">No specifications</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50 flex gap-4">
                                        <button
                                            onClick={() => { setViewingProduct(null); handleOpenModal(viewingProduct); }}
                                            className="flex-1 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit2 size={14} />
                                            Modify Product
                                        </button>
                                        <button
                                            onClick={() => { setViewingProduct(null); handleDeleteClick(viewingProduct); }}
                                            className="px-8 py-4 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <ConfirmationDialog
                isOpen={!!deletingProduct}
                onClose={() => { setDeletingProduct(null); setDeletingProductStock(0); }}
                onConfirm={handleDeleteProduct}
                title="Delete Product"
                message={deletingProductStock > 0
                    ? `⚠️ WARNING: "${deletingProduct?.name}" has ${deletingProductStock} items in total stock. Deleting this product will PERMANENTLY remove all variants and wipe their inventory records. Proceed?`
                    : `Are you sure you want to permanently delete "${deletingProduct?.name}"? This action cannot be undone and will remove all variants and media.`
                }
                confirmText={isDeleting ? "Deleting..." : "Delete Product"}
                type="danger"
                isLoading={isDeleting}
            />

            <ConfirmationDialog
                isOpen={!!togglingProduct}
                onClose={() => setTogglingProduct(null)}
                onConfirm={handleConfirmToggle}
                title={togglingProduct?.is_active ? "Deactivate Product" : "Activate Product"}
                message={`Are you sure you want to ${togglingProduct?.is_active ? 'deactivate' : 'activate'} "${togglingProduct?.name}"? ${togglingProduct?.is_active ? 'It will be hidden from the public catalog.' : 'It will become visible in the public catalog.'}`}
                confirmText={isToggling ? "Updating..." : (togglingProduct?.is_active ? "Deactivate" : "Activate")}
                type={togglingProduct?.is_active ? "danger" : "success"}
                isLoading={isToggling}
            />

            {/* Type Management Modal */}
            <TypeManagement
                isOpen={isTypeModalOpen}
                onClose={() => setIsTypeModalOpen(false)}
                types={types}
                categories={categories}
                typeData={typeData}
                setTypeData={setTypeData}
                onAddType={handleTypeSubmit}
                onDeleteType={setDeletingType}
            />

            {/* Category Management Modal */}
            <CategoryManagement
                isOpen={isCategoryManagementOpen}
                onClose={() => setIsCategoryManagementOpen(false)}
                categories={categories}
                categoryData={categoryData}
                setCategoryData={setCategoryData}
                onAddCategory={handleCategorySubmit}
                onDeleteCategory={setDeletingCategory}
            />

            {/* Delete Category Confirmation */}
            <ConfirmationDialog
                isOpen={!!deletingCategory}
                onClose={() => setDeletingCategory(null)}
                onConfirm={handleDeleteCategory}
                title="Delete Category"
                message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone and will remove all associated types if empty.`}
                confirmText={isDeleting ? "Deleting..." : "Delete Category"}
                type="danger"
                isLoading={isDeleting}
            />

            {/* Delete Type Confirmation */}
            <ConfirmationDialog
                isOpen={!!deletingType}
                onClose={() => setDeletingType(null)}
                onConfirm={handleDeleteType}
                title="Delete Product Type"
                message={`Are you sure you want to delete the type "${deletingType?.name}"? This cannot be undone if products are linked.`}
                confirmText={isDeleting ? "Deleting..." : "Delete Type"}
                type="danger"
                isLoading={isDeleting}
            />


            {/* Notifications */}
            <SuccessMessage
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title={successTitle}
                message={successMsg}
                autoClose={true}
            />

            <ErrorDisplay
                error={error}
                onClose={() => setError('')}
            />
        </div >
    );
};

export default Products;
