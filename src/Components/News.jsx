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

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
   
    const updateNews = async () => {
        props.setProgress(10);
        // Try different API endpoints if the first one fails
        const urls = [
            `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`,
            `https://newsapi.org/v2/top-headlines?country=us&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`,
            `https://newsapi.org/v2/everything?q=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}&sortBy=publishedAt`
        ];
        
        setLoading(true)
        
        for (let i = 0; i < urls.length; i++) {
            try {
                console.log(`Trying API URL ${i + 1}:`, urls[i]);
                let data = await fetch(urls[i]);
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
      
        const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page+1}&pageSize=${props.pageSize}`;
        console.log("API URL for next page:", url); 
        setPage(page + 1 )
        let data = await fetch(url);
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


        return (
            <>
                <h1 className="text-center" style={{margin: '70px 0px 15px 0px'}}>MotaharNews - Top {capitalizeFirstLetter(props.category)} Headlines</h1>
                {loading && <Spinner/>}
                <InfiniteScroll
                   dataLength={articles.length}
                   next={fetchMoreData}
                   hasMore={articles.length !== totalResults}
                   loader= {<Spinner/>}
                >
                <div className="container">
                  <div className="row"> 
                     { articles.map((element)=>{
                        return <div className="col-lg-3 col-md-4 col-sm-6" key={element.url}>
                        <NewsItem title={element.title?element.title:""} description={element.description?element.description:""} imageUrl={element.urlToImage} newsUrl={element.url}
                                  Author = {element.author} date = {element.publishedAt} source ={element.source.name}/>
                    </div> 
                })} 
                </div> 
             </div>

                </InfiniteScroll>    
                         
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