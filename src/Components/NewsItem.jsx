import React, { useContext, useEffect, useMemo, useState } from "react";
import placeholderLogo from "../assets/motahar-logo.svg";
import placeholderLogoDark from "../assets/motahar-logo-dark.svg";
import { ThemeContext } from "../ThemeContext";

const NewsItem = (props) => {
    let { title, description, imageUrl, newsUrl, Author, date, source, onSavedChange } = props;
    const [imgError, setImgError] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const { isDark } = useContext(ThemeContext);
    const showImage = Boolean(imageUrl) && !imgError;

    const article = useMemo(() => ({
      title, description, imageUrl, url: newsUrl, author: Author, publishedAt: date, sourceName: source,
    }), [title, description, imageUrl, newsUrl, Author, date, source]);

    const readSaved = () => {
      try { return JSON.parse(localStorage.getItem('savedArticles') || '[]'); } catch { return []; }
    };
    const writeSaved = (arr) => localStorage.setItem('savedArticles', JSON.stringify(arr));

    useEffect(() => {
      const saved = readSaved();
      setIsSaved(saved.some(a => a.url === newsUrl));
      // eslint-disable-next-line
    }, [newsUrl]);

    const toggleSave = () => {
      const saved = readSaved();
      const idx = saved.findIndex(a => a.url === newsUrl);
      if (idx >= 0) {
        saved.splice(idx, 1);
        setIsSaved(false);
      } else {
        saved.unshift(article);
        setIsSaved(true);
      }
      writeSaved(saved);
      if (typeof onSavedChange === 'function') onSavedChange();
    };
    return (
      <div className="my-3">
        <div className="card h-100 bg-body" style={{fontSize: '0.95rem', minHeight: '430px'}}>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            position: 'absolute',
            right: '0',
            zIndex: 1
          }}>
            <span className="badge rounded-pill bg-danger" style={{fontSize: '0.8rem', padding: '0.4em 0.8em'}}> 
              {source?.slice(0, 15)} 
            </span>
          </div>
          {showImage ? (
            <img
              src={imageUrl}
              className="card-img-top"
              alt={title || 'News image'}
              onError={() => setImgError(true)}
              loading="lazy"
              style={{
                height: '200px',
                objectFit: 'cover',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
              }}
            />
          ) : (
            <div
              className="bg-body-tertiary"
              style={{
                height: '200px',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
              }}
              aria-label="No image available"
            >
              <img
                src={isDark ? placeholderLogoDark : placeholderLogo}
                alt="No image available"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
          <div className="card-body p-3 d-flex flex-column"> 
            <h5 className="card-title" style={{
              fontSize: '1.1rem', 
              lineHeight: '1.3', 
              marginBottom: '1rem',
              fontWeight: '600',
              color: 'var(--bs-body-color)'
            }}>
              {title?.slice(0, 100)}{title?.length > 100 ? '...' : ''}
            </h5>
            <p className="card-text flex-grow-1" style={{
              fontSize: '0.95rem', 
              lineHeight: '1.5', 
              marginBottom: '1.25rem',
              color: 'var(--bs-body-color)'
            }}>
              {description?.slice(0, 150)}{description?.length > 150 ? '...' : ''}
            </p>
            <div className="mt-auto d-flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={toggleSave}
                className={`btn btn-${isSaved ? 'success' : (isDark ? 'outline-light' : 'outline-dark')} flex-grow-1`}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', fontWeight: '500', borderRadius: '4px' }}
                title={isSaved ? 'Saved' : 'Save for later'}
              >
                <i className={`bi ${isSaved ? 'bi-bookmark-check-fill' : 'bi-bookmark-plus'} me-2`}></i>
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <a
                rel="noreferrer"
                href={newsUrl}
                target="_blank"
                className={`btn btn-dark ${isDark ? 'border border-2 border-light' : ''} rounded-pill shadow flex-grow-1`}
                style={{
                  fontSize: '0.9rem', 
                  padding: '0.5rem 1rem',
                  fontWeight: '500',
                  borderRadius: '4px'
                }}
              >
                <i className="bi bi-newspaper me-2"></i>Read Full Story
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default NewsItem;