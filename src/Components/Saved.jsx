import React, { useCallback, useEffect, useState } from 'react';
import NewsItem from './NewsItem';

const Saved = () => {
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('savedArticles') || '[]');
      setItems(Array.isArray(arr) ? arr : []);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSavedChange = () => {
    load();
  };

  if (!items.length) {
    return (
      <div className="container" style={{ marginTop: '80px' }}>
        <h2 className="text-body mb-3">Saved Articles</h2>
        <p className="text-secondary">You haven't saved any articles yet.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '80px' }}>
      <h2 className="text-body mb-3">Saved Articles</h2>
      <div className="row">
        {items.map((el) => (
          <div className="col-lg-3 col-md-4 col-sm-6" key={el.url}>
            <NewsItem
              title={el.title || ''}
              description={el.description || ''}
              imageUrl={el.imageUrl}
              newsUrl={el.url}
              Author={el.author}
              date={el.publishedAt}
              source={el.sourceName}
              onSavedChange={handleSavedChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Saved;
