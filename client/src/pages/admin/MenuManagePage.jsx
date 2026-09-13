import { useEffect, useState, useRef } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } from '../../api/menu';
import { uploadImage } from '../../api/upload';
import { getImageUrl } from '../../utils/imageUrl';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Save, Upload, Link, ImageIcon } from 'lucide-react';
import './MenuManagePage.css';

const CATEGORIES = ['Appetizers', 'Mains', 'Drinks', 'Desserts'];
const ALL_TAGS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Spicy', 'Dairy-Free', 'Nut-Free', 'Popular', 'New', 'Chef Special'];
const EMPTY_FORM = { name: '', description: '', price: '', category: 'Mains', image: '', isAvailable: true, tags: [], preparationTime: 15 };

export default function MenuManagePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const fetchItems = async () => {
    try {
      const res = await getMenuItems();
      setItems(res.data.data);
    } catch { toast.error('Failed to load menu items.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditingItem(null); setForm(EMPTY_FORM); setImageTab('upload'); setShowModal(true); };
  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, image: item.image || '', isAvailable: item.isAvailable, tags: item.tags || [], preparationTime: item.preparationTime || 15 });
    // If existing item has a URL image, default to URL tab so they can see it
    setImageTab(item.image ? 'url' : 'upload');
    setShowModal(true);
  };

  // Handle file picked from device or dropped
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    setImageUploading(true);
    try {
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: res.data.url }));
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast.error('Name, price, and category are required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), preparationTime: parseInt(form.preparationTime) };
      if (editingItem) {
        const res = await updateMenuItem(editingItem._id, payload);
        setItems((prev) => prev.map((i) => i._id === editingItem._id ? res.data.data : i));
        toast.success('Menu item updated!');
      } else {
        const res = await createMenuItem(payload);
        setItems((prev) => [res.data.data, ...prev]);
        toast.success('Menu item created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Item deleted.');
    } catch { toast.error('Failed to delete item.'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleMenuItemAvailability(id);
      setItems((prev) => prev.map((i) => i._id === id ? res.data.data : i));
      toast.info(`Item ${res.data.data.isAvailable ? 'enabled' : 'disabled'}.`);
    } catch { toast.error('Failed to toggle availability.'); }
  };

  const filtered = filterCat === 'All' ? items : items.filter((i) => i.category === filterCat);

  return (
    <div className="menu-manage-page fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Menu Management</h1>
          <p className="admin-page-subtitle">Add, edit, and manage menu items.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-menu-item-btn">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="menu-manage-filter">
        {['All', ...CATEGORIES].map((cat) => (
          <button key={cat} className={`menu-cat-btn ${filterCat === cat ? 'menu-cat-btn--active' : ''}`} onClick={() => setFilterCat(cat)} id={`filter-${cat.toLowerCase()}`}>
            {cat}
          </button>
        ))}
        <span className="menu-manage-count">{filtered.length} items</span>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="menu-manage-grid">
          {filtered.map((item) => (
            <div key={item._id} className={`menu-manage-card ${!item.isAvailable ? 'menu-manage-card--disabled' : ''}`}>
              <div className="menu-manage-card__image">
                {item.image ? <img src={getImageUrl(item.image)} alt={item.name} /> : <div className="menu-manage-card__image-fallback">🍽</div>}
                <div className="menu-manage-card__overlay">
                  <button className="menu-manage-action" onClick={() => openEdit(item)} title="Edit" id={`edit-${item._id}`}><Pencil size={15} /></button>
                  <button className="menu-manage-action menu-manage-action--danger" onClick={() => handleDelete(item._id, item.name)} title="Delete" id={`delete-${item._id}`}><Trash2 size={15} /></button>
                </div>
                {!item.isAvailable && <div className="menu-manage-card__unavail">Unavailable</div>}
              </div>
              <div className="menu-manage-card__body">
                <div className="menu-manage-card__meta">
                  <span className="menu-manage-card__category">{item.category}</span>
                  <span className="menu-manage-card__price">${item.price.toFixed(2)}</span>
                </div>
                <h4 className="menu-manage-card__name">{item.name}</h4>
                <p className="menu-manage-card__desc">{item.description}</p>
                <div className="menu-manage-card__footer">
                  <button
                    className={`toggle-btn ${item.isAvailable ? 'toggle-btn--on' : 'toggle-btn--off'}`}
                    onClick={() => handleToggle(item._id)}
                    id={`toggle-${item._id}`}
                  >
                    {item.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon">🍽</div>
              <h3>No items in this category</h3>
              <button className="btn btn-primary btn-sm" onClick={openCreate}>Add First Item</button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="menu-modal__header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button className="menu-modal__close" onClick={() => setShowModal(false)} id="close-menu-modal"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="menu-modal__form">
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dish name" required />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..." required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input className="form-input" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Prep Time (min)</label>
                  <input className="form-input" type="number" min="1" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
                  <input type="checkbox" id="item-available" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <label htmlFor="item-available" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Available</label>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Image</label>

                  {/* Tab switcher */}
                  <div className="image-tab-switcher">
                    <button type="button" className={`image-tab-btn ${imageTab === 'upload' ? 'image-tab-btn--active' : ''}`} onClick={() => setImageTab('upload')} id="img-tab-upload">
                      <Upload size={13} /> Upload from Device
                    </button>
                    <button type="button" className={`image-tab-btn ${imageTab === 'url' ? 'image-tab-btn--active' : ''}`} onClick={() => setImageTab('url')} id="img-tab-url">
                      <Link size={13} /> Paste URL
                    </button>
                  </div>

                  {imageTab === 'upload' ? (
                    <div
                      className={`image-dropzone ${dragOver ? 'image-dropzone--drag' : ''} ${imageUploading ? 'image-dropzone--loading' : ''}`}
                      onClick={() => !imageUploading && fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                      id="image-dropzone"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-file-input"
                        onChange={(e) => handleImageFile(e.target.files[0])}
                      />
                      {imageUploading ? (
                        <div className="image-dropzone__uploading">
                          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
                          <span>Uploading...</span>
                        </div>
                      ) : form.image && imageTab === 'upload' ? (
                        <div className="image-dropzone__preview">
                          <img src={getImageUrl(form.image)} alt="Preview" />
                          <div className="image-dropzone__preview-overlay">
                            <Upload size={18} />
                            <span>Click to replace</span>
                          </div>
                        </div>
                      ) : (
                        <div className="image-dropzone__placeholder">
                          <ImageIcon size={32} strokeWidth={1.2} />
                          <p><strong>Click to browse</strong> or drag & drop</p>
                          <span>Supports any high-res photo (JPEG, PNG, WebP, AVIF)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="image-url-wrap">
                      <input
                        className="form-input"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        id="image-url-input"
                      />
                      {form.image && (
                        <div className="image-url-preview">
                          <img src={getImageUrl(form.image)} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Current image indicator */}
                  {form.image && (
                    <div className="image-set-indicator">
                      <ImageIcon size={12} />
                      <span>Image set</span>
                      <button type="button" className="image-clear-btn" onClick={() => setForm({ ...form, image: '' })} title="Clear image">
                        <X size={11} /> Clear
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Tags</label>
                  <div className="tag-selector">
                    {ALL_TAGS.map((tag) => (
                      <button key={tag} type="button" className={`diet-btn ${form.tags.includes(tag) ? 'diet-btn--active' : ''}`} onClick={() => handleTagToggle(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="menu-modal__footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} id="save-menu-item-btn">
                  <Save size={15} /> {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
