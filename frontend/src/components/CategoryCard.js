import React from 'react';
import { Link } from 'react-router-dom';
import { FaMale, FaFemale, FaChild, FaTshirt, FaGem } from 'react-icons/fa';
import { normalizeImageUrl } from '../utils/imageUrl';

const iconFor = (name = '') => {
  const n = String(name).toLowerCase();
  if (n.includes('men')) return <FaMale />;
  if (n.includes('women') || n.includes('ladies') || n.includes('woman')) return <FaFemale />;
  if (n.includes('kid') || n.includes('child')) return <FaChild />;
  if (n.includes('saree') || n.includes('sari') || n.includes('premium')) return <FaGem />;
  return <FaTshirt />;
};

const CategoryCard = ({ category }) => {
  const label = category.name;
  const catParam = category._id || category.name; // prefer id for exact filtering
  const imgSrc = category.image ? normalizeImageUrl(category.image) : '';
  return (
    <Link to={`/?category=${encodeURIComponent(catParam)}`} className="text-decoration-none">
      <div className={`category-card ${imgSrc ? 'category-img-card' : 'category-icon-card'}`}>
        {imgSrc ? (
          <img src={imgSrc} alt={label} className="category-img" referrerPolicy="no-referrer" />
        ) : (
          <div className="category-icon" aria-hidden>{iconFor(label)}</div>
        )}
      </div>
      <div className="category-caption text-center mt-2">
        <h3 className="category-title mb-0">{label}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
