import React, { useEffect, useState } from 'react'
import NewsItem from './NewsItem'
import Spinner from './Spinner';
import PropTypes from 'prop-types'
import InfiniteScroll from "react-infinite-scroll-component";

const News = (props) =>{
    const [articles, setArticles ] = useState([])
    const [loading, setLoading ] = useState(true)
    const [page,setPage] = useState(1)
    const [totalResults, setTotalResults ] = useState(0)
    const [lastEndpoint, setLastEndpoint] = useState(null); // 'top-in' | 'top-us' | 'everything'
    const [apiKeySlot, setApiKeySlot] = useState('1'); // '1' or '2'

    const API_BASE = import.meta.env.DEV ? '/newsapi' : '/api';

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
   
    const fetchWithFailover = async (url) => {
        // Try current key first; on 401/429 retry with alternate key (mainly for dev proxy)
        const tryOnce = (useKey) => fetch(url, {
          headers: { 'X-Use-Key': useKey }
        });
        let res = await tryOnce(apiKeySlot);
        if (res.status === 401 || res.status === 429) {
          const alt = apiKeySlot === '1' ? '2' : '1';
          const retry = await tryOnce(alt);
          if (retry.ok) {
            setApiKeySlot(alt);
            return retry;
          }
          // if retry also fails, return the retry response for error handling
          return retry;
        }
        return res;
    };

    const updateNews = async () => {
        props.setProgress(10);
        // Try different API endpoints if the first one fails
        const urls = [
            // Valid: top-headlines requires country OR sources (not language). Country + category is allowed.
            `${API_BASE}/v2/top-headlines?country=${props.country}&category=${props.category}&page=${page}&pageSize=${props.pageSize}`,
            `${API_BASE}/v2/top-headlines?country=us&category=${props.category}&page=${page}&pageSize=${props.pageSize}`,
            // Fallback to Everything with language/searchIn/sortBy as per docs
            `${API_BASE}/v2/everything?q=${props.category}&searchIn=title,description&language=en&page=${page}&pageSize=${props.pageSize}&sortBy=publishedAt`
        ];
        
        setLoading(true)
        
        for (let i = 0; i < urls.length; i++) {
            try {
                console.log(`Trying API URL ${i + 1}:`, urls[i]);
                let data = await fetchWithFailover(urls[i]);
                props.setProgress(30);
                console.log("Response status:", data.status);
                
                if (!data.ok) {
                    console.error(`HTTP Error: ${data.status} ${data.statusText}`);
                    continue; // Try next URL
                }
                
                let parsedData = await data.json();
                props.setProgress(70);
                console.log("Full API Response:", parsedData);
                
                if (parsedData.status === "error") {
                    console.error("API Error:", parsedData.message);
                    if (i === urls.length - 1) { // Last attempt
                        alert(`API Error: ${parsedData.message}`);
                    }
                    continue; // Try next URL
                }
                
                if (parsedData.articles && parsedData.articles.length > 0) {
                    console.log("Articles found:", parsedData.articles.length);
                    setArticles(parsedData.articles);
                    setTotalResults(parsedData.totalResults || parsedData.articles.length);
                    // remember which endpoint succeeded for pagination
                    if (i === 0) setLastEndpoint('top-in');
                    else if (i === 1) setLastEndpoint('top-us');
                    else if (i === 2) setLastEndpoint('everything');
                    break; // Success, exit loop
                } else {
                    console.log("No articles found, trying next endpoint...");
                    if (i === urls.length - 1) { // Last attempt
                        alert("No news articles found. This might be due to API limitations or no available content for the selected category/country.");
                        setArticles([]);
                        setTotalResults(0);
                    }
                }
                
            } catch (error) {
                console.error(`Fetch error for URL ${i + 1}:`, error);
                if (i === urls.length - 1) { // Last attempt
                    alert(`Network Error: ${error.message}`);
                    setArticles([]);
                    setTotalResults(0);
                }
            }
        }
        
        setLoading(false);
        props.setProgress(100);
    }

    useEffect (() => {
      updateNews();
      document.title = `${capitalizeFirstLetter(props.category)} - MotaharNews`;
      // eslint-disable-next-line
    }, [])

    const fetchMoreData = async () => {
        // Build URL based on the last successful endpoint to keep pagination consistent
        const nextPage = page + 1;
        let url;
        switch (lastEndpoint) {
          case 'top-us':
            url = `${API_BASE}/v2/top-headlines?country=us&category=${props.category}&page=${nextPage}&pageSize=${props.pageSize}`;
            break;
          case 'everything':
            url = `${API_BASE}/v2/everything?q=${props.category}&searchIn=title,description&language=en&page=${nextPage}&pageSize=${props.pageSize}&sortBy=publishedAt`;
            break;
          case 'top-in':
          default:
            url = `${API_BASE}/v2/top-headlines?country=${props.country}&category=${props.category}&page=${nextPage}&pageSize=${props.pageSize}`;
            break;
        }

        console.log("API URL for next page:", url); 
        setPage(nextPage)
        let data = await fetchWithFailover(url);
        console.log("Fetch response status for next page:", data.status); 
        let parsedData = await data.json()
        console.log("API Response for next page:", parsedData); 
        console.log("Articles count for next page:", parsedData.articles?.length); 
        setArticles (articles.concat(parsedData.articles))
        setTotalResults(parsedData.totalResults)
      };

  // const  handlePrevClick = async () => {
  //     setPage(page - 1)
  //       updateNews();
  //   }

  //  const handleNextClick = async () => {
        
  //       setPage(page + 1)
  //       updateNews();
  //   }


        const renderSkeletons = (count = 8) => (
            <div className="container">
              <div className="row">
                {Array.from({ length: count }).map((_, idx) => (
                  <div className="col-lg-3 col-md-4 col-sm-6" key={idx}>
                    <div className="card my-3 h-100">
                      <div className="bg-light" style={{ height: '220px', borderBottom: '1px solid rgba(0,0,0,0.1)' }} />
                      <div className="card-body">
                        <div className="placeholder-glow">
                          <span className="placeholder col-8"></span>
                        </div>
                        <div className="placeholder-glow mt-2">
                          <span className="placeholder col-12"></span>
                          <span className="placeholder col-10 mt-1"></span>
                          <span className="placeholder col-9 mt-1"></span>
                        </div>
                        <div className="d-grid mt-3">
                          <span className="btn btn-dark disabled placeholder col-12" style={{ height: '38px' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        );

        return (
            <>
                <h1 className="text-center text-body" style={{margin: '70px 0px 15px 0px'}}>MotaharNews - Top {capitalizeFirstLetter(props.category)} Headlines</h1>
                {loading ? (
                  renderSkeletons()
                ) : articles.length === 0 ? (
                  <div className="container my-5">
                    <div className="row justify-content-center">
                      <div className="col-lg-8">
                        <div className="text-center p-4 border rounded bg-body-tertiary">
                          <h4 className="mb-2 text-body">No articles found</h4>
                          <p className="mb-3 text-secondary">
                            We couldn’t find recent news for "{capitalizeFirstLetter(props.category)}" with the current filters. This might be due to API limits or sparse content. Try again or pick another category.
                          </p>
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-primary" onClick={updateNews}>
                              <i className="bi bi-arrow-clockwise me-1"></i> Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <InfiniteScroll
                    dataLength={articles.length}
                    next={fetchMoreData}
                    hasMore={articles.length !== totalResults}
                    loader={<Spinner/>}
                  >
                    <div className="container">
                      <div className="row">
                        {articles.map((element) => {
                          return (
                            <div className="col-lg-3 col-md-4 col-sm-6" key={element.url}>
                              <NewsItem
                                title={element.title ? element.title : ""}
                                description={element.description ? element.description : ""}
                                imageUrl={element.urlToImage}
                                newsUrl={element.url}
                                Author={element.author}
                                date={element.publishedAt}
                                source={element.source.name}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </InfiniteScroll>
                )}
            </>
        )
    }


News.defaultProps = {
    country: 'in',
    pageSize: 9, 
    category: 'general',
  }

  News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number, 
    category: PropTypes.string,
  }

export default News