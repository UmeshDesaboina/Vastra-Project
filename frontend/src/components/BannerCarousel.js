import React from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { normalizeImageUrl } from '../utils/imageUrl';

const BannerCarousel = ({ banners = [] }) => {
  if (!Array.isArray(banners) || banners.length === 0) return null;

  return (
    <div className="banner-carousel">
      <Carousel interval={10000} controls={banners.length > 1} indicators={banners.length > 1} fade>
        {banners.map((b) => {
          const first = (Array.isArray(b.images) && b.images.length ? b.images[0] : b.image) || '';
          const src = normalizeImageUrl(first);
          const Img = (
            <img
              src={src}
              alt={b.title}
              className="d-block w-100 banner-img"
              referrerPolicy="no-referrer"
            />
          );
          return (
            <Carousel.Item key={b._id || b.title}>
              {b.link ? <Link to={b.link}>{Img}</Link> : Img}
              {(b.title || b.description) && (
                <Carousel.Caption className="banner-caption">
                  {b.title && <h3>{b.title}</h3>}
                  {b.description && <p>{b.description}</p>}
                </Carousel.Caption>
              )}
            </Carousel.Item>
          );
        })}
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
