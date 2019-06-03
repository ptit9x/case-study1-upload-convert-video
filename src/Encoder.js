import React from "react";
import {Component} from 'react';
import toastr from 'toastr';
import "./Encoder.scss";
import Progress from "./Progress";
import Cookie from 'js-cookie';
import socketIOClient from 'socket.io-client';


export default class Encoder extends Component {
    constructor(props){
        super(props);
        this.state = {
            file: props.file,
            encoded_file: '',
            convert: props.convert,
            frames: 0,
            kbps: 0,
            progress: 0
        }
    }

    componentDidMount(){
        this.socket = socketIOClient();
        this.socket.emit('encode', {
            file : this.state.file,
            user : Cookie('_uid'),
            convert : this.state.convert
        });

        this.socket.on('error', function (data) {
            toastr.error(data);
        }.bind(this));

        this.socket.on('progress', function (data) {
            this.setState({
                frames : data.frames,
                kbps: data.currentKbps,
                progress: 90
            });
        }.bind(this));

        this.socket.on('complete', function (data) {
            this.setState({
                encoded_file : data.encoded_file,
                progress: 100
            });
            toastr.success('Converted!');
        }.bind(this));
    }

    componentWillUnmount(){
        this.socket.disconnect();
        this.props.newEncode();
    }

    render(){
        let filename = this.state.file;
        return (
            <div className="encoder">
                <h3>
                    {filename.substring(filename.indexOf('_') + 1)} <br/>
                    <small>
                        Frames : {this.state.frames ? this.state.frames : 'calculating ... ' }
                    </small>
                    <small>
                        Kbps : {this.state.kbps ? this.state.kbps : 'calculating ... ' }
                    </small>
                </h3>
                <Progress title="" progress={this.state.progress}/>

                {this.state.encoded_file ? (
                    <div>
                        <a href={ '/encoded/' + (Cookie('_uid') || 'none') + '/' + this.state.encoded_file}
                            download>
                            <button>Download</button>
                        </a>

                        <button onClick={this.props.newEncode}>New Upload</button>
                    </div>
                ) : ''}
            </div>
        )
    }
}
