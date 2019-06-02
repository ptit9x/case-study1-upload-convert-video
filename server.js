const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const multer  = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieMiddleware = require('./middleware/userCookie');
const fs = require('fs');
const config = require('config');
const PORT = config.get('port');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/public'));
app.use('/encoded', express.static(__dirname + '/encoded'));
app.use(cookieParser());
app.use(cookieMiddleware());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname , 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '_' + file.originalname)
    }
});

const upload = multer({storage : storage});

app.get('/history', (req, res) => {
    let dir = path.join(__dirname, 'encoded', req.cookies._uid || 'none');
    fs.exists(dir, (exists) => {
        if(exists){
            fs.readdir(dir, (err, files) => {
                if (err) throw err;
                res.json(files.reverse());
            });
        }else{
            res.json([]);
        }
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    if(req.file){
        let video = req.file,
            user = req.cookies._uid || 'none';
        let upload_path = video.path,
            user_upload = path.join(__dirname, '/uploads/', user),
            move_path = path.join(__dirname, '/uploads/' , user , video.filename);


        fs.exists(user_upload, (exists) => {
            if(!exists){
                fs.mkdir(user_upload,function(err){
                    if (err) {
                        return console.error(err);
                    }
                    moveUploadedFileToUserDir(
                        upload_path, move_path, video.filename,  res
                    );
                });
            }else{
                moveUploadedFileToUserDir(
                    upload_path, move_path, video.filename, res
                );
            }
        });
        createUserEncodeDir(user);
    }else{
        res.json({
            uploaded : false
        })
    }
});

app.get('*', (req, res) => {
    res.render('app');
});

let moveUploadedFileToUserDir = (upload_path, move_path, filename, res) =>{
    fs.rename(upload_path, move_path, (err) => {
        if (err) throw err;
        res.json({
            uploaded : true,
            path : filename
        });
    });
};

let createUserEncodeDir = (user) => {
    let dir = path.join(__dirname, '/encoded/', user);
    fs.exists(dir, (exists) => {
        if(!exists) {
            fs.mkdir(dir, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        }
    });
};

let deleteVideo = (path) => {
    fs.unlink(path, (err) => {
        if (err) throw err;
    });
};

io.on('connection', (socket) => {

    socket.on('encode', (data) => {
        let command,
            completed = false,
            file = data.file,
            user = data.user || 'none',
            convert = data.convert,
            input = path.join(__dirname, '/uploads/', user, '/' + file),
            array_file = file.split('.');
            encoded_file = array_file[0] + '_to_' + convert + '.' + array_file[1],
            size = (convert == '720') ? '1280x720' : '640x480',
            fps = (convert == '720') ? 60 : 30
            output = path.join(__dirname, '/encoded/', user , '/', encoded_file);

        command = ffmpeg(input)
            .output(output)
            .videoCodec('libx264') 
            .fps(fps)
            .noAudio()
            .size(size)
            .on('error', function(err) {
                socket.emit('error', err.message);
                
            })	
            .on('progress', function(progress) {
                socket.emit('progress', progress);
            })
            .on('end', function() { 
                completed = true;
                socket.emit('complete',{
                    encoded_file : encoded_file
                });
                console.log('Finished processing'); 
                
            }).run();

        socket.on('disconnect', () => {
            if(!completed){
                console.log('Not completed');
                // command.kill('SIGTERM');s
                deleteVideo(input);
                deleteVideo(output);
            }
        });
    });
});

server.listen(PORT, () => console.log('Server running on Port: '+ PORT));
