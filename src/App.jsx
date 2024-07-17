import React, {useState} from 'react';
import NavBar from './Components/NavBar';
import News from './Components/News';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar'



const App = () =>{ 
 const pageSize = 15 ;
 const apiKey = "4c32c182087240eab68e36a7d27836e2"
  // state = {
  //  progress : 0 
  // }

  const [progress, setProgress] = useState (0)

  // setProgress = (progress) =>{
  //   setState({progress : progress})
  // }


    return (
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
              element={<News setProgress={setProgress} apiKey = {apiKey}  key="business" pageSize={pageSize} country={"in"} category={"business"} />}
              />
            <Route
             exact path="/entertainment"
              element={<News setProgress={setProgress} apiKey = {apiKey} key="entertainment" pageSize={pageSize} country={"in"} category={"entertainment"} />}
              />
            <Route
             exact path="/health"
              element={<News setProgress={setProgress} apiKey = {apiKey} key="health" pageSize={pageSize} country={"in"} category={"health"} />}
              />
            <Route
             exact path="/science"
              element={<News setProgress={setProgress} apiKey = {apiKey} key="science" pageSize={pageSize} country={"in"} category={"science"} />}
              />
            <Route
             exact path="/sports"
              element={<News setProgress={setProgress} apiKey = {apiKey} key="sports" pageSize={pageSize} country={"in"} category={"sports"} />}
              />
            <Route
             exact path="/technology"
              element={<News setProgress={setProgress} apiKey = {apiKey} key="technology" pageSize={pageSize} country={"in"} category={"technology"} />}
              />
            <Route
             exact path="/"
              element={<News setProgress={setProgress} apiKey = {apiKey} key="/" pageSize={pageSize} country={"in"} category={"general"} />}
            />
          </Routes>
        </div>
      </Router>
    );
  
}

export default App;