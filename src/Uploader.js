import React from "react";
import {Component} from 'react';
import {post} from 'axios';
import toastr from 'toastr';
import "./Uploader.scss";
import Progress from "./Progress";

export default class Uploader extends Component{

    constructor(props) {
        super(props);
        this.state = {
            file: null,
            uploading: false,
            progress : 0,
            upload_ext : null,
            convert : '',
            allowed_types : [
                'webm', 'mkv', 'flv', 'ogg',
                'avi', 'mov' , 'wmv', 'mp4',
                'm4v', 'm4p', 'mpeg', '3gp',
                '3g2',
            ],
            qualities: [
                { key: '720', value: '720p @ 60fps HLS/H.264' },
                { key: '480', value: '480p @ 30fps HLS/H.264' }
            ]
        };
        this.fileInput = React.createRef();
        this.selectFile = this.initFileUpload.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.cancelUpload = this.cancelUpload.bind(this);
        this.handleChange = this.setConversionFormat.bind(this);
    }

    getFileExtension(name){
        return /(?:\.([^.]+))?$/.exec(name)[1];
    }

    validateFile(ext) {
        console.log(ext, ' rrrrrrr');
        return this.state.allowed_types.includes(ext);
    }

    onFileChange(e) {
        if(!e.target.files.length){
            return;
        }

        let file = e.target.files[0],
            ext = this.getFileExtension(file.name);

        if (this.validateFile(ext)) {
            this.setState({
                file: file,
                upload_ext : ext
            })
        }else{
            toastr.error('Error: Invalid file format')
        }
    }

    setConversionFormat(e){
        if(!e.target.value.length){
            this.setState({
                convert : ''
            });
            return;
        }
        this.setState({
            convert : e.target.value
        });
    }

    initFileUpload(e){
        this.fileInput.current.click();
    }

    cancelUpload(e){
        this.setState({
            file: null,
            uploading: false,
            progress : 0,
            upload_ext : null,
            convert : '',
        });
        this.fileInput.current.value = '';
    }

    uploadFile(e){
        if(this.state.file && this.state.convert){
            this.setState({
                uploading: true,
            });
            let data = new FormData();
            data.append('file', this.state.file);
            data.append('convert', this.state.convert);

            post('/upload', data, {
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    this.setState({
                        progress : percentCompleted
                    });
                }
            })
            .then(res => {
                let file = res.data;
                if(file.uploaded){
                    this.props.initEncoding(file.path, this.state.convert);
                }
            })
            .catch(err => {
                console.log(err);
            });
        }else{
            toastr.error('Error: Select a conversion format')
        }
    }

    render(){
        return(
            <div className="uploader">
                {!this.state.uploading ?
                    <div>
                        <div>
                            {this.state.file ?
                                <button  onClick={this.uploadFile}>Upload File</button>
                             :
                                <button onClick={this.selectFile}>Select Video File</button>
                            }
                            {this.state.file &&
                                <button onClick={this.cancelUpload}>Cancel</button>
                            }
                        </div>

                        {this.state.file &&
                            <div>
                                <select value={this.state.convert} onChange={this.handleChange}>
                                    <option value="">
                                        Convert To
                                    </option>
                                    {
                                        this.state.qualities.map((v) => {
                                            return <option key={v.key} value={v.key}>{v.value}</option>
                                        })
                                    }
                                </select>
                            </div>
                        }

                        <input type="file"
                               name="file"
                               className="form-control-file"
                               ref={this.fileInput}
                               onChange={this.onFileChange.bind(this)}/>
                    </div>
                    :
                        <Progress title="Uploading, please wait" progress={this.state.progress}/>
                }
            </div>
        );
    }
}