import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import Cookie from 'js-cookie';
import Navbar from "./Navbar";
import Uploader from "./Uploader";
import Encoder from "./Encoder";
import History from "./History";
import './App.scss';

console.log(Cookie('_uid'));

class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            encoder : false,
            uploader : true,
            file: '',
            convert : ''
        }
    }

    initEncoding(file, ext) {
        this.setState({
            encoder: true,
            uploader: false,
            file: file,
            convert : ext
        });
    }

    clearEncode(e = null){
        this.setState({
            encoder : false,
            uploader : true,
            file: '',
            convert : ''
        })
    }

    render() {
        return (
            <div className="App">
                <Navbar/>
                <Route exact path="/" render={(props) => (
                    <div className="wrapper">
                        {this.state.uploader ? (
                            <Uploader initEncoding={this.initEncoding.bind(this)}/>
                        ) :
                            <Encoder
                                file={this.state.file}
                                convert={this.state.convert}
                                newEncode={this.clearEncode.bind(this)}/>
                        }
                    </div>
                )}/>

                <Route exact path="/encodes" component={History}/>
            </div>
        );
    }
}

export default App;
