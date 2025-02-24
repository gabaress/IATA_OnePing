import React from "react";
import './navbar.css';
import search from '../../assets/search.png';
import onealert from '../../assets/onealert.png';

const Navbar = () => {
    return (
        <header class="header">
       <nav class="nav container">
          <div class="nav__data">
             <a href="/home" class="nav__logo">
             <img src={onealert} alt="OneAlert Logo" className="logo"/>OnePing
             </a>
             
             <div class="nav__toggle" id="nav-toggle">
                <i class="ri-menu-line nav__burger"></i>
                <i class="ri-close-line nav__close"></i>
             </div>
          </div>

          <div class="nav__menu" id="nav-menu">
             <ul class="nav__list">
                <li><a href="/home" class="nav__link">Dashboard</a></li>

             </ul>
          </div>
       </nav>
    </header>
    )
}

export default Navbar;