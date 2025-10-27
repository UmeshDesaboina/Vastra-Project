import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Modal, Form, Spinner, Alert, Image } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useSelector } from 'react-redux';

const CategoryListScreen = () => {
  const { userInfo } = useSelector((s) => s.user);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', image: null, imageUrl: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/categories');
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const deleteHandler = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await axios.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${userInfo?.token}` } });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const createCategoryHandler = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.imageUrl) fd.append('imageUrl', form.imageUrl);
      if (form.image) fd.append('image', form.image);
      await axios.post('/api/categories', fd, { headers: { Authorization: `Bearer ${userInfo?.token}` } });
      setShowCreate(false);
      setForm({ name: '', image: null });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Categories</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={() => setShowCreate(true)}>
            <FaPlus /> Create Category
          </Button>
        </Col>
      </Row>

      {loading && <Spinner animation='border' />}
      {error && <Alert variant='danger'>{error}</Alert>}

      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>NAME</th>
            <th>IMAGE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.name}</td>
              <td>{category.image && <Image src={category.image} width={80} />}</td>
              <td>
                <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(category._id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Form onSubmit={createCategoryHandler}>
          <Modal.Header closeButton>
            <Modal.Title>Create Category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='mb-2'>
              <Form.Label>Name</Form.Label>
              <Form.Control value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} required />
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

export default CategoryListScreen;
