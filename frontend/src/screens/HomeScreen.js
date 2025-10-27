import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import BannerCarousel from '../components/BannerCarousel';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import AnimatedSidebar from '../components/AnimatedSidebar';
import WhyChoose from '../components/WhyChoose';
import WelcomeCarousel from '../components/WelcomeCarousel';

const HomeScreen = () => {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const category = qs.get('category');
  const featured = qs.get('featured');
  const trending = qs.get('trending');
  const keyword = qs.get('keyword');
  const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v||''));

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (category !== null && category !== undefined && String(category).trim() !== '' && !['null','undefined'].includes(String(category).toLowerCase())) params.category = category;
        if (featured) params.featured = featured;
        if (trending) params.trending = trending;
        if (keyword) params.keyword = keyword;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        const [catsRes, prodRes, banRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/products', { params }),
          axios.get('/api/banners')
        ]);
        setCategories(catsRes.data);
        setProducts(prodRes.data.products);
        setBanners(banRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, featured, trending, keyword, minPrice, maxPrice]);

  return (
    <div className="home-screen">
      <WelcomeCarousel banners={banners} />

      <a id="categories"/>
      <Container className="my-5">
        <div className="d-flex align-items-center mb-3">
          <h2 className="section-title mb-0">Shop by Category</h2>
        </div>
        <Row className="category-grid justify-content-center g-4">
          {categories.map(category => (
            <Col key={category._id} sm={6} md={3} className="d-flex justify-content-center">
              <CategoryCard category={category} />
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="my-5">
        <div className='d-flex align-items-center mb-2 justify-content-between'>
          <h2 className="section-title mb-0">
            {category 
              ? `${(isObjectId(category) ? (categories.find(c => c._id === category)?.name || 'Category') : category)}`
              : featured 
                ? 'Featured Products' 
                : trending 
                  ? 'Trending Now' 
                  : 'Latest Products'}
          </h2>
          <Form className='filter-bar' onSubmit={(e)=>{e.preventDefault(); const qs = new URLSearchParams(location.search); if (minPrice) qs.set('minPrice', minPrice); else qs.delete('minPrice'); if (maxPrice) qs.set('maxPrice', maxPrice); else qs.delete('maxPrice'); window.location.search = qs.toString();}}>
            <div className='filter-pill'>
              <span className='me-2'>Price</span>
              <Form.Control size='sm' type='number' placeholder='Min' value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} />
              <span className='px-1'>–</span>
              <Form.Control size='sm' type='number' placeholder='Max' value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} />
              <Button size='sm' type='submit' className='ms-2'>Apply</Button>
              {(minPrice || maxPrice) && (
                <Button size='sm' variant='link' className='ms-1 text-danger' onClick={()=>{ setMinPrice(''); setMaxPrice(''); const qs = new URLSearchParams(location.search); qs.delete('minPrice'); qs.delete('maxPrice'); window.location.search = qs.toString(); }}>Clear</Button>
              )}
            </div>
            <Form.Select size='sm' value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className='ms-2' style={{maxWidth:'200px'}} aria-label='Sort products'>
              <option value=''>Sort</option>
              <option value='price-asc'>Price: Low to High</option>
              <option value='price-desc'>Price: High to Low</option>
              <option value='newest'>Newest</option>
            </Form.Select>
          </Form>
        </div>
        {loading && <div className='my-3'><Spinner animation='border' /></div>}
        {error && <Alert variant='danger'>{error}</Alert>}
        <Row className={loading ? 'grid-loading-overlay' : ''}>
          {([...products].sort((a,b)=>{
              if (sortBy==='price-asc') return (a.price||0)-(b.price||0);
              if (sortBy==='price-desc') return (b.price||0)-(a.price||0);
              if (sortBy==='newest') return new Date(b.createdAt||0)-new Date(a.createdAt||0);
              return 0;
            })).map(product => (
            <Col key={product._id} sm={6} md={4} lg={3} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </Container>

      <WhyChoose />
    </div>
  );
};

export default HomeScreen;
