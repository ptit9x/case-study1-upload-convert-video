import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import './Navbar.scss';

class Navbar extends Component {
    render() {
        return (
            <div className="App-header">
                <header>
                    <div className="container">
                        <Link
                            to={'/'}
                            className='logo'><h2>case study 1</h2>
                        </Link>

                        <Link
                            to={'/encodes'}
                            className='button'>
                            Convert History
                        </Link>
                    </div>
                </header>
            </div>
        );
    }
}

export default Navbar;
