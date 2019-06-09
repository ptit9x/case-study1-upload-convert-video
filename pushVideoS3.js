const s3 = require('s3');
const path = require('path');
const amqp = require('amqplib/callback_api');
const config = require('./config/index');
 
const client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: "AKIAQLNXF5DSIAJI3YOI",
    secretAccessKey: "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"
  },
});

amqp.connect(config.amqp.URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    const q = config.amqp.PATH_CONVERTED_VIDEO;
    ch.assertQueue(q, {durable: true});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [Received] %s", msg.content.toString());
      const filename = msg.content.toString();
      const pathFile = path.join(__dirname, '/encoded/none/', filename);
      console.log(pathFile, 'path');
      const params = {
        localFile: pathFile,
       
        s3Params: {
          Bucket: "huynhnh",
          Key: filename,
        },
      };
      const uploader = client.uploadFile(params);
      uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
      });
      uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        console.log("done uploading");
      });
    }, {noAck: true});
  });
});
