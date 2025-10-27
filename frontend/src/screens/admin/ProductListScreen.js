import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ProductListScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', discountPrice: '', deliveryCharges: '', countInStock: '', sizes: '', images: [], imageUrls: '' });
  const [cats, setCats] = useState([]);

  const fetchProducts = React.useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get('/api/products', { params: { pageNumber: pageNum, t: Date.now() } });
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchProducts(page); }, [page, fetchProducts]);

  useEffect(() => { (async ()=>{ try { const { data } = await axios.get('/api/categories', { params: { t: Date.now() } }); setCats(data); } catch (e) { /* ignore */ } })(); }, []);

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${userInfo?.token}` } });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createProductHandler = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries({
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.price,
        discountPrice: form.discountPrice || 0,
        deliveryCharges: form.deliveryCharges || 0,
        countInStock: form.countInStock,
        sizes: form.sizes,
      }).forEach(([k, v]) => fd.append(k, v));
      if (form.imageUrls) fd.append('imageUrls', form.imageUrls);
      for (let i = 0; i < form.images.length; i++) fd.append('images', form.images[i]);

      const { data } = await axios.post('/api/products', fd, {
        headers: { Authorization: `Bearer ${userInfo?.token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg(`Created: ${data?.name || 'Product'}`);
      setTimeout(()=>setSuccessMsg(''), 3000);
      setShowCreate(false);
      setForm({ name: '', description: '', category: '', price: '', discountPrice: '', deliveryCharges: '', countInStock: '', sizes: '', images: [], imageUrls: '' });
      // go back to first page to ensure the new product is visible
      setPage(1);
      fetchProducts(1);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
          {!loading && !error && <div className='text-muted'>Total: {total}</div>}
          {successMsg && <Alert variant='success' className='mt-2'>{successMsg}</Alert>}
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={() => setShowCreate(true)}>
            <FaPlus /> Create Product
          </Button>
        </Col>
      </Row>

      {loading && <Spinner animation='border' />}
      {error && <Alert variant='danger'>{error}</Alert>}

      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>NAME</th>
            <th>PRICE</th>
            <th>STOCK</th>
            <th>FEATURED</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>₹{product.price}</td>
              <td>{product.countInStock || product.stock || 0}</td>
              <td>{product.isFeatured ? 'Yes' : 'No'}</td>
              <td>
                <Link to={`/admin/product/${product._id}/edit`}>
                  <Button variant='light' className='btn-sm mx-2'>
                    <FaEdit />
                  </Button>
                </Link>
                <Button
                  variant='danger'
                  className='btn-sm'
                  onClick={() => deleteHandler(product._id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row>
        <Col>Showing page {page} of {pages} (total {total})</Col>
        <Col className='text-end'>
          <Button disabled={page<=1} className='me-2' onClick={() => setPage(p => p-1)}>Prev</Button>
          <Button disabled={page>=pages} onClick={() => setPage(p => p+1)}>Next</Button>
        </Col>
      </Row>

      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Form onSubmit={createProductHandler}>
          <Modal.Header closeButton>
            <Modal.Title>Create Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='mb-2'>
              <Form.Label>Name</Form.Label>
              <Form.Control value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows={3} value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} required />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Category</Form.Label>
              <Form.Select value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))} required>
                <option value='' disabled>Choose...</option>
                {cats.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Form.Select>
              <Form.Text muted>Select an existing category to avoid mismatches.</Form.Text>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-2'>
                  <Form.Label>Original Price (₹)</Form.Label>
                  <Form.Control type='number' value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-2'>
                  <Form.Label>Discount Price (₹)</Form.Label>
                  <Form.Control type='number' value={form.discountPrice} onChange={(e)=>setForm(f=>({...f,discountPrice:e.target.value}))} placeholder='Optional' />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-2'>
                  <Form.Label>Delivery Charges (₹)</Form.Label>
                  <Form.Control type='number' value={form.deliveryCharges} onChange={(e)=>setForm(f=>({...f,deliveryCharges:e.target.value}))} placeholder='0' />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className='mb-2'>
                  <Form.Label>Stock</Form.Label>
                  <Form.Control type='number' value={form.countInStock} onChange={(e)=>setForm(f=>({...f,countInStock:e.target.value}))} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className='mb-2'>
              <Form.Label>Sizes (comma separated)</Form.Label>
              <Form.Control value={form.sizes} onChange={(e)=>setForm(f=>({...f,sizes:e.target.value}))} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Images</Form.Label>
              <Form.Control type='file' multiple onChange={(e)=>setForm(f=>({...f,images:e.target.files}))} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Or Image URLs (one per line)</Form.Label>
              <Form.Control as='textarea' rows={3} value={form.imageUrls} onChange={(e)=>setForm(f=>({...f,imageUrls:e.target.value}))} placeholder='https://...\nhttps://...' />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={()=>setShowCreate(false)}>Cancel</Button>
            <Button type='submit'>Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ProductListScreen;
