// import React, { Component } from "react";
import React from "react";

const NewsItem = (props) => {
    let { title, description, imageUrl, newsUrl, Author, date, source } = props;
    return (
      <div className="my-3">
        <div className="card h-100" style={{fontSize: '0.95rem', minHeight: '450px'}}>
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
          <img 
            src={!imageUrl ? "https://www.shutterstock.com/image-vector/no-image-picture-available-on-white-2450891049" : imageUrl}
            className="card-img-top" 
            alt="..." 
            style={{
              height: '220px', 
              objectFit: 'cover',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}
          />
          <div className="card-body p-3 d-flex flex-column"> 
            <h5 className="card-title" style={{
              fontSize: '1.1rem', 
              lineHeight: '1.3', 
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              {title?.slice(0, 100)}{title?.length > 100 ? '...' : ''}
            </h5>
            <p className="card-text flex-grow-1" style={{
              fontSize: '0.95rem', 
              lineHeight: '1.5', 
              marginBottom: '1.25rem',
              color: '#333'
            }}>
              {description?.slice(0, 150)}{description?.length > 150 ? '...' : ''}
            </p>
            <div className="mt-auto">
              <p className="card-text mb-3" style={{
                fontSize: '0.8rem',
                color: '#666'
              }}>
                <i className="bi bi-person me-1"></i> {Author || 'Unknown'} <br/>
                <i className="bi bi-calendar me-1"></i> {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <a
                rel="noreferrer"
                href={newsUrl}
                target="_blank"
                className="btn btn-dark w-100"
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