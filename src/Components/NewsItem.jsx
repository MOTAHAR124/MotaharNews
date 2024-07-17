// import React, { Component } from "react";
import React  from "react";

// export class NewsItem extends Component {     {  //{Used only on class Based }
  // render() {
  const NewsItem = (props) => {
    let { title, description, imageUrl, newsUrl, Author, date, source } = props;
    return (
      <div className="my-3">
        <div className="card">
        <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        position: 'absolute',
                        right: '0'
                    }
                    }>
                       <span className="badge rounded-pill bg-danger"> {source} </span>
                       </div>
          <img src={ !imageUrl ? "https://www.shutterstock.com/image-vector/no-image-picture-available-on-white-2450891049" : imageUrl }
            className="card-img-top" alt="..."
          />
          <div className="card-body"> 
            <h5 className="card-title">
              {title}
              
            </h5>
            <p className="card-text">{description}</p>
            <p className="card-text">
              <b className="text-body-secondary">
                By {Author ? Author : "Unknown"} on{" "}
                {new Date(date).toGMTString()}
              </b>
            </p>
            <a
              rel="noreferrer"
              href={newsUrl}
              target="_blank"
              className="btn btn-sm btn-dark"
            >
              Read More
            </a>
          </div>
        </div>
      </div>
    );
  }


export default NewsItem;
