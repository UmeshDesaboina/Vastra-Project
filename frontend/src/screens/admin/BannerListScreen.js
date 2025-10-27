import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Image, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { normalizeImageUrl } from '../../utils/imageUrl';

const BannerListScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', link: '', isActive: true, image: null, imageUrl: '' });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/banners');
      setBanners(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete banner?')) return;
    try {
      await axios.delete(`/api/banners/${id}`, { headers: { Authorization: `Bearer ${userInfo?.token}` } });
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createBannerHandler = async (e) => {
    e.preventDefault();
    try {
      if (!form.image && !String(form.imageUrl||'').trim()) { alert('Please upload an image or provide an image URL.'); return; }
      const fd = new FormData();
      fd.append('title', form.title);
      if (form.description) fd.append('description', form.description);
      if (form.link) fd.append('link', form.link);
      fd.append('isActive', form.isActive);
      const url = form.imageUrl ? normalizeImageUrl(form.imageUrl) : '';
      if (url) fd.append('imageUrls', url);
      if (form.image) fd.append('image', form.image);
      await axios.post('/api/banners', fd, { headers: { Authorization: `Bearer ${userInfo?.token}` } });
      setShowCreate(false);
      setForm({ title: '', description: '', link: '', isActive: true, image: null, imageUrl: '' });
      fetchBanners();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Banners</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={() => setShowCreate(true)}>
            <FaPlus /> Create Banner
          </Button>
        </Col>
      </Row>

      {loading && <Spinner animation='border' />}
      {error && <Alert variant='danger'>{error}</Alert>}

      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>TITLE</th>
            <th>IMAGE</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => {
            const first = (Array.isArray(banner.images) && banner.images.length ? banner.images[0] : banner.image);
            const src = normalizeImageUrl(first);
            return (
              <tr key={banner._id}>
                <td>{banner.title}</td>
                <td><Image src={src} alt={banner.title} width="120" height="60" style={{objectFit:'cover'}} fluid referrerPolicy='no-referrer' /></td>
                <td>{banner.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(banner._id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Form onSubmit={createBannerHandler}>
          <Modal.Header closeButton>
            <Modal.Title>Create Banner</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='mb-2'>
              <Form.Label>Title</Form.Label>
              <Form.Control value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} required />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows={2} value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Link</Form.Label>
              <Form.Control value={form.link} onChange={(e)=>setForm(f=>({...f,link:e.target.value}))} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Check type='switch' label='Active' checked={form.isActive} onChange={(e)=>setForm(f=>({...f,isActive:e.target.checked}))} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Image</Form.Label>
              <Form.Control type='file' onChange={(e)=>setForm(f=>({...f,image:e.target.files[0]}))} />
            </Form.Group>
            <Form.Group className='mb-2'>
              <Form.Label>Or Image URL</Form.Label>
              <Form.Control placeholder='https://...' value={form.imageUrl} onChange={(e)=>setForm(f=>({...f,imageUrl:e.target.value}))} />
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

export default BannerListScreen;
