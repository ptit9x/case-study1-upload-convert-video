## Testing

##### case study 1
Thiết kế mô hình xử lý, các API, và viết API/Service làm chức năng: 
Nhận file video mà user upload rồi thực hiện convert file ra các format
720p @ 60fps HLS/H.264,
480p @ 30fps HLS/H.264
File output ra được lưu lên S3.

##### Solution
```
- Create React Application
- Create a input file
- Select file video
- Use fluent-ffmpeg library to convert quality video
- Upload video to encoded folder
- Upload video from encoded folder to S3
```

##### Setup Instructions`

# Install dependencies
$ npm install 

# Configure Web Server port
$ nano config/default.json

{
  "port" : 3000
}

# Building frontend code
$ npm run watch

# Running dev server to watch code with nodemon
$ npm run dev-server

# Running server
$ npm run start
```