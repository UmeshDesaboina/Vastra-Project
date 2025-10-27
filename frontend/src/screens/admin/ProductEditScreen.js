import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Button, Row, Col, Image, Spinner, Alert, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { normalizeImageUrl } from '../../utils/imageUrl';

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector(s => s.user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [fabric, setFabric] = useState('');
  const [sizes, setSizes] = useState('');
  const [deliveryCharges, setDeliveryCharges] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [existingImages, setExistingImages] = useState([]); // strings
  const [newImages, setNewImages] = useState([]); // FileList
  const [imageUrls, setImageUrls] = useState(''); // text area

  const outOfStock = useMemo(() => Number(countInStock) <= 0, [countInStock]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/api/products/${id}`);
      setName(data.name || '');
      setDescription(data.description || '');
      setCategory(data.category?.name || data.category || '');
      setPrice(data.price ?? '');
      setDiscountPrice(data.discountPrice ?? '');
      setCountInStock(data.countInStock ?? '');
      setFabric(data.fabric || '');
      setSizes((data.sizes || []).join(','));
      setDeliveryCharges(data.deliveryCharges ?? '');
      setIsFeatured(!!data.isFeatured);
      setIsTrending(!!data.isTrending);
      setExistingImages(Array.isArray(data.images) ? data.images : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); /* eslint-disable-next-line */ }, [id]);

  const removeExisting = (img) => {
    setExistingImages(prev => prev.filter(i => i !== img));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('price', price);
      fd.append('discountPrice', discountPrice || 0);
      fd.append('countInStock', countInStock);
      fd.append('fabric', fabric);
      fd.append('sizes', sizes);
      fd.append('isFeatured', isFeatured);
      fd.append('isTrending', isTrending);
      // compute removed images by comparing with server state? we simplified by sending removeImages as those not kept
      // For reliable removal, we need original server images; fetchDetails setExistingImages to server list, but user may remove some; we can send removeImages based on removed
      // Here we compute removeImages from a hidden field by re-fetch? Instead, we keep a separate state
      // Simpler: we include 'removeImages' as JSON of images to remove comparing with data fetched initially. We'll store initialImages in ref
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  // Keep a copy of original images
  const [originalImages, setOriginalImages] = useState([]);
  useEffect(() => { setOriginalImages(prev => (prev.length ? prev : existingImages)); }, [existingImages]);

  const doSave = async (fd) => {
    await axios.put(`/api/products/${id}`, fd, {
      headers: { Authorization: `Bearer ${userInfo?.token}` },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const fd = new FormData();
      const keepSet = new Set(existingImages);
      const removed = (originalImages || []).filter(img => !keepSet.has(img));
      fd.append('name', name);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('price', price);
      fd.append('discountPrice', discountPrice || 0);
      fd.append('countInStock', countInStock);
      fd.append('fabric', fabric);
      fd.append('sizes', sizes);
      fd.append('deliveryCharges', deliveryCharges || 0);
      fd.append('isFeatured', isFeatured);
      fd.append('isTrending', isTrending);
      if (imageUrls) fd.append('imageUrls', imageUrls);
      if (removed.length) fd.append('removeImages', JSON.stringify(removed));
      for (let i = 0; i < (newImages?.length || 0); i++) {
        fd.append('images', newImages[i]);
      }

      await doSave(fd);
      alert('Product updated');
      navigate('/admin/productlist');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link to="/admin/productlist" className="btn btn-light my-3">Go Back</Link>
      <h1>Edit Product</h1>
      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className='mb-2'>
                <Form.Label>Name</Form.Label>
                <Form.Control value={name} onChange={(e)=>setName(e.target.value)} required />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Description</Form.Label>
                <Form.Control as='textarea' rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} required />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className='mb-2'>
                    <Form.Label>Category (name or id)</Form.Label>
                    <Form.Control value={category} onChange={(e)=>setCategory(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className='mb-2'>
                    <Form.Label>Fabric</Form.Label>
                    <Form.Control value={fabric} onChange={(e)=>setFabric(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className='mb-2'>
                    <Form.Label>Original Price (₹)</Form.Label>
                    <Form.Control type='number' value={price} onChange={(e)=>setPrice(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-2'>
                    <Form.Label>Discount Price (₹)</Form.Label>
                    <Form.Control type='number' value={discountPrice} onChange={(e)=>setDiscountPrice(e.target.value)} placeholder='Optional' />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className='mb-2'>
                    <Form.Label>Stock</Form.Label>
                    <Form.Control type='number' value={countInStock} onChange={(e)=>setCountInStock(e.target.value)} required />
                    <Form.Check className='mt-2' type='checkbox' label='Mark Out of Stock' checked={outOfStock} onChange={(e)=>setCountInStock(e.target.checked ? '0' : '1')} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className='mb-2'>
                <Form.Label>Sizes (comma separated)</Form.Label>
                <Form.Control value={sizes} onChange={(e)=>setSizes(e.target.value)} />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Delivery Charges (₹)</Form.Label>
                <Form.Control type='number' value={deliveryCharges} onChange={(e)=>setDeliveryCharges(e.target.value)} placeholder='0' />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Check type='checkbox' label='Featured' checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} />
                </Col>
                <Col md={6}>
                  <Form.Check type='checkbox' label='Trending' checked={isTrending} onChange={(e)=>setIsTrending(e.target.checked)} />
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <h5>Existing Images</h5>
              <ListGroup className='mb-3'>
                {existingImages.map((img) => (
                  <ListGroup.Item key={img} className='d-flex align-items-center justify-content-between'>
                    <div className='d-flex align-items-center'>
                      <Image src={normalizeImageUrl(img)} alt='' thumbnail style={{width: 64, height: 64, objectFit: 'cover'}} />
                      <small className='ms-2 text-truncate' style={{maxWidth: 160}}>{img}</small>
                    </div>
                    <Button variant='outline-danger' size='sm' onClick={()=>removeExisting(img)}>Remove</Button>
                  </ListGroup.Item>
                ))}
                {existingImages.length === 0 && <div className='text-muted'>No images</div>}
              </ListGroup>
              <Form.Group className='mb-2'>
                <Form.Label>Add New Images</Form.Label>
                <Form.Control type='file' multiple onChange={(e)=>setNewImages(e.target.files)} />
              </Form.Group>
              <Form.Group className='mb-2'>
                <Form.Label>Or Image URLs (one per line)</Form.Label>
                <Form.Control as='textarea' rows={3} value={imageUrls} onChange={(e)=>setImageUrls(e.target.value)} placeholder='https://...\nhttps://...' />
              </Form.Group>
            </Col>
          </Row>
          <div className='mt-3 d-flex justify-content-between'>
            <Button variant='secondary' onClick={()=>navigate('/admin/productlist')}>Cancel</Button>
            <Button type='submit' disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ProductEditScreen;
