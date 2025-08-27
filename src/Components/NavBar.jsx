import React, { useContext } from 'react'
import { Link, NavLink } from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';

const NavBar = () =>{
    const { isDark, toggleTheme } = useContext(ThemeContext);

    return (
        <div>
            <nav className={`navbar navbar-expand-lg ${isDark ? 'navbar-dark bg-body-tertiary' : 'navbar-light bg-white border-bottom'} shadow-sm fixed-top`}>
                <div className="container-fluid">
                    <Link className="navbar-brand text-body fw-bold" to="/">MotaharNews</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item"><NavLink end className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} aria-current="page" to="/">All-News</NavLink></li>                           
                        <li className="nav-item"><NavLink className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} to="/business">Business</NavLink></li>
                        <li className="nav-item"><NavLink className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} to="/entertainment">Entertainment</NavLink></li>
                        {/* <li className="nav-item"><Link className="nav-link" to="/general">General</Link></li> */}
                        <li className="nav-item"><NavLink className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} to="/health">Health</NavLink></li>
                        <li className="nav-item"><NavLink className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} to="/science">Science</NavLink></li>
                        <li className="nav-item"><NavLink className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} to="/sports">Sports</NavLink></li>
                        <li className="nav-item"><NavLink className={({isActive}) => `nav-link fw-bold ${isActive ? 'active' : ''}`} to="/technology">Technology</NavLink></li>                                                   
                    </ul>
                    <div className="d-flex ms-auto">
                      <button
                        type="button"
                        className={`btn d-flex align-items-center ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`}
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'} me-2`}></i>
                        <span className="d-none d-sm-inline">{isDark ? 'Light' : 'Dark'} Mode</span>
                      </button>
                    </div>
                    </div>
                </div>
                </nav>
        </div>
    )
}
export default NavBar