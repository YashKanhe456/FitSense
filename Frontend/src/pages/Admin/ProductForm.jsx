import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Camera, ImagePlus, LoaderCircle, Upload } from 'lucide-react';
import { resolveImage } from '../../assets';
import StatePanel from '../../components/StatePanel';
import { apiServices } from '../../services/api';
import { formatCurrency } from '../../utils/storefront';

const categories = ['Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Formal Wear', 'Casual Wear'];
const defaultForm = {
  name: '',
  description: '',
  category: 'Shirts',
  price: '',
  image: '',
  stock: '',
  isFeatured: false,
  sizes: 'S, M, L',
  brand: 'Patil Mens Wear'
};

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [imageSource, setImageSource] = useState('none');

  useEffect(() => {
    if (!isEditMode) return;

    const loadProduct = async () => {
      try {
        const { data } = await apiServices.getProductById(id);
        const product = data.data;
        setForm({
          name: product.name,
          description: product.description,
          category: product.category,
          price: String(product.price),
          image: product.image,
          stock: String(product.stock),
          isFeatured: Boolean(product.isFeatured),
          sizes: product.sizes?.join(', ') || '',
          brand: product.brand || 'Patil Mens Wear'
        });
        setPreviewImage(product.image);
        setImageSource(product.image ? 'url' : 'none');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isEditMode]);

  const resolvedPreview = useMemo(() => resolveImage(previewImage || form.image), [form.image, previewImage]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'image') {
      setPreviewImage(value);
      setImageSource(value.trim() ? 'url' : 'none');
    }
    setFormErrors([]);
  };

  const validateForm = () => {
    const errors = [];

    if (form.name.trim().length < 3) {
      errors.push('Product name must be at least 3 characters long.');
    }

    if (form.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long.');
    }

    if (!form.image.trim()) {
      errors.push('Provide at least one image source: upload a file or enter an image URL.');
    }

    if (form.price === '' || Number(form.price) < 0) {
      errors.push('Price must be 0 or more.');
    }

    if (form.stock === '' || Number(form.stock) < 0) {
      errors.push('Stock must be 0 or more.');
    }

    return errors;
  };

  const handleImageUpload = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      const message = 'Please select a valid image file.';
      setFormErrors([message]);
      toast.error(message);
      return;
    }

    const localPreview = URL.createObjectURL(selectedFile);
    setPreviewImage(localPreview);
    setImageSource('upload');
    setFormErrors([]);

    const uploadData = new FormData();
    uploadData.append('image', selectedFile);

    try {
      setUploadingImage(true);
      const { data } = await apiServices.uploadProductImage(uploadData);
      const imageUrl = data.data?.url || data.data?.path || '';
      setForm((current) => ({ ...current, image: imageUrl }));
      setPreviewImage(imageUrl);
      setImageSource('upload');
      toast.success('Image uploaded successfully.');
    } catch (err) {
      const responseErrors = err.response?.data?.errors || [];
      const message = responseErrors[0] || err.response?.data?.message || 'Unable to upload image.';
      setFormErrors([message]);
      toast.error(message);
      setImageSource(form.image.trim() ? 'url' : 'none');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const clearImageSource = () => {
    setForm((current) => ({ ...current, image: '' }));
    setPreviewImage('');
    setImageSource('none');
    setFormErrors([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();

    if (errors.length > 0) {
      setFormErrors(errors);
      toast.error(errors[0]);
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      brand: form.brand.trim(),
      image: form.image.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: form.sizes
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean)
    };

    try {
      if (isEditMode) {
        await apiServices.updateProduct(id, payload);
        toast.success('Product updated successfully.');
      } else {
        await apiServices.createProduct(payload);
        toast.success('Product created successfully.');
      }
      navigate('/admin/products');
    } catch (err) {
      const responseErrors = err.response?.data?.errors || [];
      setFormErrors(responseErrors);
      toast.error(responseErrors[0] || err.response?.data?.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <StatePanel title="Loading product form" description="Preparing product details for editing..." />;
  }

  if (error) {
    return <StatePanel title="Could not load product" description={error} />;
  }

  return (
    <section className="admin-page admin-page--compact">
      <div className="section-heading section-heading--inline admin-heading">
        <div>
          <p className="section-kicker">{isEditMode ? 'Edit Product' : 'Add Product'}</p>
          <h1>{isEditMode ? 'Update an existing product' : 'Create a new product listing'}</h1>
        </div>
        <Link to="/admin/products" className="ghost-button">Back to products</Link>
      </div>

      <form className="admin-form admin-form--compact" onSubmit={handleSubmit}>
        {formErrors.length > 0 ? (
          <div className="admin-inline-error">
            <strong>Fix these fields before saving:</strong>
            <ul>
              {formErrors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="form-grid">
          <label className="form-grid__full">
            Product Name
            <input name="name" value={form.name} onChange={handleChange} minLength={3} required />
          </label>
          <label className="form-grid__full">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              minLength={20}
              required
            />
          </label>
          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <input name="brand" value={form.brand} onChange={handleChange} />
          </label>
          <label>
            Price
            <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} required />
          </label>
          <label>
            Stock
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
          </label>
          <label className="form-grid__full">
            Sizes (comma separated)
            <input name="sizes" value={form.sizes} onChange={handleChange} />
          </label>
        </div>

        <div className="admin-upload-panel">
          <div className="admin-upload-panel__copy">
            <p className="section-kicker">Product Image</p>
            <h3>Upload from gallery or take a photo</h3>
            <p>Use your device camera on mobile or choose an image file from your system. Upload completes before product save.</p>
          </div>

          <div className="admin-upload-panel__controls">
            <div className="admin-upload-panel__group">
              <div className="admin-upload-panel__label-row">
                <span className="admin-upload-panel__label">Upload Product Image</span>
                {imageSource === 'upload' ? <span className="admin-upload-panel__active">Using uploaded image</span> : null}
              </div>

              <div className="admin-upload-panel__button-row">
                <label className="admin-upload-button">
                  <Upload size={16} />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload from device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || imageSource === 'url'}
                  />
                </label>

                <label className="admin-upload-button admin-upload-button--secondary">
                  <Camera size={16} />
                  <span>{uploadingImage ? 'Uploading...' : 'Use camera'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || imageSource === 'url'}
                  />
                </label>

                {imageSource === 'upload' ? (
                  <button type="button" className="ghost-button small-button" onClick={clearImageSource}>
                    Clear upload
                  </button>
                ) : null}
              </div>
            </div>

            <div className="admin-upload-panel__or">OR</div>

            <div className="admin-upload-panel__group">
              <div className="admin-upload-panel__label-row">
                <span className="admin-upload-panel__label">Enter Image URL</span>
                {imageSource === 'url' ? <span className="admin-upload-panel__active">Using image URL</span> : null}
              </div>

              <label className="form-grid__full">
                Image URL
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/product-image.jpg"
                  disabled={imageSource === 'upload'}
                />
              </label>

              {imageSource === 'url' ? (
                <button type="button" className="ghost-button small-button admin-upload-clear" onClick={clearImageSource}>
                  Clear URL
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <label className="checkbox-field">
          <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
          Feature this product on the homepage
        </label>

        <div className="admin-preview-card admin-preview-card--rich">
          <div className="admin-preview-card__image">
            {resolvedPreview ? (
              <img src={resolvedPreview} alt={form.name || 'Product preview'} />
            ) : (
              <div className="admin-preview-card__empty">
                <ImagePlus size={18} />
                <span>Preview will appear here</span>
              </div>
            )}
            {uploadingImage ? (
              <div className="admin-preview-card__status">
                <LoaderCircle size={16} className="spin" />
                <span>Uploading image...</span>
              </div>
            ) : null}
          </div>

          <div>
            <p className="section-kicker">Live Preview</p>
            <h3>{form.name || 'Product name preview'}</h3>
            <p>{form.description || 'Product description preview will appear here as you type.'}</p>
            <strong>{formatCurrency(form.price || 0)}</strong>
            <span>{form.category} · {form.stock || 0} in stock</span>
          </div>
        </div>

        <button type="submit" className="primary-button" disabled={saving || uploadingImage}>
          {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </section>
  );
}

export default ProductForm;
