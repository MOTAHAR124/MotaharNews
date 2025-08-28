import React, { useEffect, useMemo, useState } from 'react'
import NewsItem from './NewsItem'
import Spinner from './Spinner';
import PropTypes from 'prop-types'
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocation } from 'react-router-dom';

const News = (props) =>{
    const [articles, setArticles ] = useState([])
    const [loading, setLoading ] = useState(true)
    const [page,setPage] = useState(1)
    const [totalResults, setTotalResults ] = useState(0)
    const [lastEndpoint, setLastEndpoint] = useState(null); // 'top-in' | 'top-us' | 'everything'
    const [apiKeySlot, setApiKeySlot] = useState('1'); // '1' or '2'

    const API_BASE = import.meta.env.DEV ? '/newsapi' : '/api';
    const location = useLocation();
    const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const q = params.get('q') || '';
    const from = params.get('from') || '';
    const to = params.get('to') || '';
    const sources = params.get('sources') || '';
    const countryParam = params.get('country') || '';
    const country = countryParam || props.country;

    // Cache key per filter set (first page cache)
    const cacheKey = useMemo(() => {
      const payload = { path: location.pathname, q, from, to, sources, country, category: props.category };
      try {
        const s = encodeURIComponent(JSON.stringify(payload));
        return 'newsCache_v1:' + btoa(s).slice(0, 200);
      } catch {
        return 'newsCache_v1:' + location.pathname + location.search;
      }
    }, [location.pathname, location.search, q, from, to, sources, country, props.category]);

    const readCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        return obj && Array.isArray(obj.articles) ? obj : null;
      } catch { return null; }
    };
    const writeCache = (obj) => {
      try { localStorage.setItem(cacheKey, JSON.stringify({ ...obj, cachedAt: Date.now() })); } catch {}
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
   
    const fetchWithFailover = async (url) => {
        // Helper: fetch with timeout
        const fetchWithTimeout = (resource, options = {}, timeout = 12000) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          return fetch(resource, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(id));
        };

        const tryOnce = (useKey) => fetchWithTimeout(url, { headers: { 'X-Use-Key': useKey } });

        // Do up to 3 attempts on transient network errors with backoff
        const transient = (err) => (
          err && (
            err.name === 'AbortError' ||
            err.message?.includes('Failed to fetch') ||
            err.message?.includes('NetworkError') ||
            err.message?.includes('forcibly closed') ||
            err.message?.includes('ECONNRESET')
          )
        );

        let attempt = 0;
        let useKey = apiKeySlot;
        let lastError = null;
        while (attempt < 3) {
          try {
            let res = await tryOnce(useKey);
            // Switch key on 401/429
            if (res.status === 401 || res.status === 429) {
              const alt = useKey === '1' ? '2' : '1';
              const retry = await tryOnce(alt);
              if (retry.ok) {
                setApiKeySlot(alt);
                return retry;
              }
              res = retry; // fallthrough with non-ok
            }
            return res; // may be ok or not-ok; caller handles non-ok
          } catch (err) {
            lastError = err;
            if (!transient(err)) break;
            // backoff: 300ms, 800ms
            const delay = attempt === 0 ? 300 : 800;
            await new Promise(r => setTimeout(r, delay));
          }
          attempt += 1;
        }
        // If we get here due to persistent network error, throw to caller
        throw lastError || new Error('Network error');
    };

    const buildUrl = (targetPage) => {
        // Decide endpoint based on filters
        // - If sources present: use top-headlines with sources (cannot combine with country)
        // - Else if from/to present: use everything (date filters only supported there)
        // - Else: use top-headlines with country/category; q can be included
        const enc = encodeURIComponent;
        if (sources) {
          const qs = new URLSearchParams({
            sources: sources,
            page: String(targetPage),
            pageSize: String(props.pageSize),
          });
          if (q) qs.set('q', q);
          return { url: `${API_BASE}/v2/top-headlines?${qs.toString()}`, endpoint: 'top-sources' };
        }
        if (from || to) {
          const qs = new URLSearchParams({
            page: String(targetPage),
            pageSize: String(props.pageSize),
            sortBy: 'publishedAt',
            language: 'en',
          });
          if (q) qs.set('q', q);
          if (from) qs.set('from', from);
          if (to) qs.set('to', to);
          // Prefer category keyword if no q
          if (!q) qs.set('q', props.category);
          return { url: `${API_BASE}/v2/everything?${qs.toString()}`, endpoint: 'everything' };
        }
        // default top-headlines by country/category, q optional
        const qs = new URLSearchParams({
          country: country,
          category: props.category,
          page: String(targetPage),
          pageSize: String(props.pageSize),
        });
        if (q) qs.set('q', q);
        return { url: `${API_BASE}/v2/top-headlines?${qs.toString()}`, endpoint: `top-${country}` };
    };

    const updateNews = async () => {
        props.setProgress(10);
        // If offline, try cached data immediately
        if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
          const cached = readCache();
          if (cached) {
            setArticles(cached.articles);
            setTotalResults(cached.totalResults || cached.articles.length);
            setLastEndpoint(cached.lastEndpoint || null);
            setLoading(false);
            props.setProgress(100);
            return;
          }
        }
        // Primary URL driven by current filters, with basic fallbacks
        const primary = buildUrl(1);
        const fallbacks = [];
        // If primary was top-headlines with country, try US as a fallback
        if (primary.endpoint.startsWith('top-') && !sources) {
          const qs = new URLSearchParams({
            country: 'us',
            category: props.category,
            page: '1',
            pageSize: String(props.pageSize),
          });
          if (q) qs.set('q', q);
          fallbacks.push({ url: `${API_BASE}/v2/top-headlines?${qs.toString()}`, endpoint: 'top-us' });
          // Also try everything as a last resort
          const qs2 = new URLSearchParams({
            q: q || props.category,
            searchIn: 'title,description',
            language: 'en',
            page: '1',
            pageSize: String(props.pageSize),
            sortBy: 'publishedAt'
          });
          fallbacks.push({ url: `${API_BASE}/v2/everything?${qs2.toString()}`, endpoint: 'everything' });
        }
        
        setLoading(true)
        
        const attempts = [primary, ...fallbacks];
        for (let i = 0; i < attempts.length; i++) {
            try {
                console.log(`Trying API URL ${i + 1}:`, attempts[i].url);
                let data = await fetchWithFailover(attempts[i].url);
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
                    if (i === attempts.length - 1) { // Last attempt
                        alert(`API Error: ${parsedData.message}`);
                    }
                    continue; // Try next URL
                }
                
                if (parsedData.articles && parsedData.articles.length > 0) {
                    console.log("Articles found:", parsedData.articles.length);
                    setArticles(parsedData.articles);
                    setTotalResults(parsedData.totalResults || parsedData.articles.length);
                    // remember which endpoint succeeded for pagination
                    setLastEndpoint(attempts[i].endpoint);
                    // cache first page only
                    writeCache({ articles: parsedData.articles, totalResults: parsedData.totalResults || parsedData.articles.length, lastEndpoint: attempts[i].endpoint });
                    break; // Success, exit loop
                } else {
                    console.log("No articles found, trying next endpoint...");
                    if (i === attempts.length - 1) { // Last attempt
                        const cached = readCache();
                        if (cached) {
                          console.warn('Using cached results due to empty API response.');
                          setArticles(cached.articles);
                          setTotalResults(cached.totalResults || cached.articles.length);
                          setLastEndpoint(cached.lastEndpoint || null);
                        } else {
                          alert("No news articles found. This might be due to API limitations or no available content for the selected category/country.");
                          setArticles([]);
                          setTotalResults(0);
                        }
                    }
                }
                
            } catch (error) {
                console.error(`Fetch error for URL ${i + 1}:`, error);
                if (i === attempts.length - 1) { // Last attempt
                    const cached = readCache();
                    if (cached) {
                      console.warn('Network error, using cached results.');
                      setArticles(cached.articles);
                      setTotalResults(cached.totalResults || cached.articles.length);
                      setLastEndpoint(cached.lastEndpoint || null);
                    } else {
                      alert(`Network Error: ${error.message}`);
                      setArticles([]);
                      setTotalResults(0);
                    }
                }
            }
        }
        
        setLoading(false);
        props.setProgress(100);
    }

    useEffect (() => {
      // filters changed: reset pagination and fetch
      setPage(1);
      setArticles([]);
      setLastEndpoint(null);
      updateNews();
      document.title = `${capitalizeFirstLetter(props.category)} - MotaharNews`;
      // eslint-disable-next-line
    }, [location.search, props.category])

    const fetchMoreData = async () => {
        try {
          // Build URL based on the last successful endpoint to keep pagination consistent
          const nextPage = page + 1;
          let url;
          if (!lastEndpoint) {
            const primary = buildUrl(nextPage);
            url = primary.url;
          } else if (lastEndpoint === 'everything') {
            const qs = new URLSearchParams({
              page: String(nextPage),
              pageSize: String(props.pageSize),
              sortBy: 'publishedAt',
              language: 'en',
            });
            const qEff = q || props.category;
            if (qEff) qs.set('q', qEff);
            if (from) qs.set('from', from);
            if (to) qs.set('to', to);
            url = `${API_BASE}/v2/everything?${qs.toString()}`;
          } else if (lastEndpoint === 'top-sources') {
            const qs = new URLSearchParams({
              sources: sources,
              page: String(nextPage),
              pageSize: String(props.pageSize),
            });
            if (q) qs.set('q', q);
            url = `${API_BASE}/v2/top-headlines?${qs.toString()}`;
          } else if (lastEndpoint.startsWith('top-')) {
            const countryCode = lastEndpoint.split('-')[1] || country;
            const qs = new URLSearchParams({
              country: countryCode,
              category: props.category,
              page: String(nextPage),
              pageSize: String(props.pageSize),
            });
            if (q) qs.set('q', q);
            url = `${API_BASE}/v2/top-headlines?${qs.toString()}`;
          }

          console.log("API URL for next page:", url);
          const res = await fetchWithFailover(url);
          console.log("Fetch response status for next page:", res.status);
          if (!res.ok) {
            console.error('Pagination fetch failed:', res.status, res.statusText);
            return; // stop here; avoid parsing empty body
          }
          let parsedData;
          try {
            parsedData = await res.json();
          } catch (e) {
            console.error('Failed to parse JSON for next page:', e);
            return;
          }
          console.log("API Response for next page:", parsedData);
          console.log("Articles count for next page:", parsedData.articles?.length);
          setPage(nextPage);
          setArticles(articles.concat(parsedData.articles || []));
          if (typeof parsedData.totalResults === 'number') {
            setTotalResults(parsedData.totalResults);
          }
        } catch (err) {
          console.error('fetchMoreData error:', err);
        }
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
                {typeof navigator !== 'undefined' && navigator && navigator.onLine === false && (
                  <div className="container"><div className="alert alert-warning" role="alert">
                    You are offline. Showing last cached results (if available).
                  </div></div>
                )}
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