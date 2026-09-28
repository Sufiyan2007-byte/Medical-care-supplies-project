import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import './AdminDashboard.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function AdminDashboard() {
  const { token } = useAuth();
  const { addToast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    sku: '',
  });
  
  const [isSet, setIsSet] = useState(false);
  const [setData, setSetData] = useState({
    piece_count: '',
    material: '',
    sterilization: '',
    tray_case: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${BASE_URL}/api/products?limit=100`),
        fetch(`${BASE_URL}/api/categories`)
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        addToast('Product deleted successfully.', 'success');
      } else {
        addToast('Failed to delete product.', 'error');
      }
    } catch (err) {
      console.error('Failed to delete product', err);
      addToast('An error occurred while deleting.', 'error');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ name: '', category_id: categories[0]?.id || '', description: '', sku: '' });
    setIsSet(false);
    setSetData({ piece_count: '', material: '', sterilization: '', tray_case: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      sku: product.sku || '',
    });
    
    if (product.surgical_set) {
      setIsSet(true);
      setSetData({
        piece_count: product.surgical_set.piece_count || '',
        material: product.surgical_set.material || '',
        sterilization: product.surgical_set.sterilization || '',
        tray_case: product.surgical_set.tray_case || '',
      });
    } else {
      setIsSet(false);
      setSetData({ piece_count: '', material: '', sterilization: '', tray_case: '' });
    }
    
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSetChange = (e) => {
    setSetData({ ...setData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const payload = { ...formData };
    if (isSet) {
      payload.surgical_set = { ...setData };
    }

    try {
      const url = modalMode === 'add' 
        ? `${BASE_URL}/api/products` 
        : `${BASE_URL}/api/products/${editingId}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save product');

      await fetchData(); // Refresh table
      closeModal();
      addToast(
        modalMode === 'add' ? 'Product added successfully!' : 'Product updated successfully!',
        'success'
      );
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="add-btn" onClick={openAddModal}>+ Add Product</button>
      </header>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading catalog...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category?.name || 'Unknown'}</td>
                  <td>{p.sku || '-'}</td>
                  <td>
                    <span className={`badge ${p.surgical_set ? 'set' : 'product'}`}>
                      {p.surgical_set ? 'Surgical Set' : 'Product'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>&times;</button>
            <h2>{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>

            {formError && <div className="form-error">{formError}</div>}

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleFormChange} />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select required name="category_id" value={formData.category_id} onChange={handleFormChange}>
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>SKU</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleFormChange} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange}></textarea>
              </div>

              <div className="form-group checkbox-group">
                <input 
                  type="checkbox" 
                  id="isSet" 
                  checked={isSet} 
                  onChange={(e) => setIsSet(e.target.checked)} 
                />
                <label htmlFor="isSet">This is a Surgical Set</label>
              </div>

              {isSet && (
                <div className="set-fields">
                  <h3>Surgical Set Details</h3>
                  <div className="form-group">
                    <label>Piece Count</label>
                    <input type="number" name="piece_count" required={isSet} value={setData.piece_count} onChange={handleSetChange} />
                  </div>
                  <div className="form-group">
                    <label>Material</label>
                    <input type="text" name="material" value={setData.material} onChange={handleSetChange} />
                  </div>
                  <div className="form-group">
                    <label>Sterilization</label>
                    <input type="text" name="sterilization" value={setData.sterilization} onChange={handleSetChange} />
                  </div>
                  <div className="form-group">
                    <label>Tray / Case Type</label>
                    <input type="text" name="tray_case" value={setData.tray_case} onChange={handleSetChange} />
                  </div>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

