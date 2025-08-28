import React, {useState} from 'react';
import NavBar from './Components/NavBar';
import News from './Components/News';
import Saved from './Components/Saved';
import ArticleDetail from './Components/ArticleDetail';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar'
import { ThemeProvider } from './ThemeContext';

const App = () =>{ 
 const pageSize = 8;
  // state = {
  //  progress : 0 
  // }

  const [progress, setProgress] = useState (0)

  // setProgress = (progress) =>{
  //   setState({progress : progress})
  // }


    return (
      <ThemeProvider>
        <Router>
          <div>
          
          <NavBar />
          <LoadingBar
          
        color='#f11946'
        progress={progress}
      />
          <Routes>
            <Route
            exact path="/business"
              element={<News setProgress={setProgress} key="business" pageSize={pageSize} country={"in"} category={"business"} />}
              />
            <Route
             exact path="/entertainment"
              element={<News setProgress={setProgress} key="entertainment" pageSize={pageSize} country={"in"} category={"entertainment"} />}
              />
            <Route
             exact path="/health"
              element={<News setProgress={setProgress} key="health" pageSize={pageSize} country={"in"} category={"health"} />}
              />
            <Route
             exact path="/science"
              element={<News setProgress={setProgress} key="science" pageSize={pageSize} country={"in"} category={"science"} />}
              />
            <Route
             exact path="/sports"
              element={<News setProgress={setProgress} key="sports" pageSize={pageSize} country={"in"} category={"sports"} />}
              />
            <Route
             exact path="/technology"
              element={<News setProgress={setProgress} key="technology" pageSize={pageSize} country={"in"} category={"technology"} />}
              />
            <Route
             exact path="/"
              element={<News setProgress={setProgress} key="/" pageSize={pageSize} country={"in"} category={"general"} />}
            />
            <Route
             exact path="/saved"
             element={<Saved />}
            />
            <Route
             exact path="/article"
             element={<ArticleDetail />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </ThemeProvider>
    );
  
}

export default App;