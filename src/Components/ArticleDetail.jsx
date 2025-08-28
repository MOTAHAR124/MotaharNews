import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ArticleDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state?.article || null;

  const copyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    } catch (e) {
      alert('Failed to copy link');
    }
  };

  if (!article) {
    return (
      <div className="container" style={{ marginTop: '80px' }}>
        <h2 className="text-body mb-3">Article not found</h2>
        <p className="text-secondary">Open an article from the list to view details.</p>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Go Back
        </button>
      </div>
    );
  }

  const { title, description, imageUrl, url, author, publishedAt, sourceName, content } = article;

  return (
    <div className="container" style={{ marginTop: '80px', maxWidth: '900px' }}>
      <button className="btn btn-link text-decoration-none mb-3" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1"></i> Back
      </button>
      <h2 className="text-body mb-2">{title}</h2>
      <div className="text-secondary mb-3" style={{ fontSize: '0.9rem' }}>
        <i className="bi bi-person me-1"></i> {author || 'Unknown'} ·
        <span className="ms-1"><i className="bi bi-calendar me-1"></i>{new Date(publishedAt).toLocaleString()}</span> ·
        <span className="ms-1"><i className="bi bi-newspaper me-1"></i>{sourceName}</span>
      </div>
      {imageUrl && (
        <img src={imageUrl} alt={title} className="img-fluid rounded mb-3" style={{ maxHeight: '420px', objectFit: 'cover', width: '100%' }} />
      )}
      {description && <p className="lead text-body">{description}</p>}
      {content && <p className="text-body">{content}</p>}
      <div className="d-flex gap-2 mt-3">
        <a href={url} target="_blank" rel="noreferrer" className="btn btn-dark">
          <i className="bi bi-box-arrow-up-right me-2"></i> Read Original
        </a>
        <button className="btn btn-outline-primary" onClick={copyLink}>
          <i className="bi bi-clipboard me-2"></i> Copy Link
        </button>
      </div>
    </div>
  );
};

export default ArticleDetail;
