const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const amqp = require('amqplib/callback_api');
const config = require('./config/index');
const { publish } = require('./servers/lib/rabbitmq');

amqp.connect(config.amqp.URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    const q = config.amqp.PATH_UPLOADED_VIDEO;

    ch.assertQueue(q, {durable: true});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [Received] %s", msg.content.toString());
      const file = msg.content.toString();
      let command,
        completed = false,
        user ='none',
        convert = '480', // config 480 or 720
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
                console.log('Error when convert video ', err.message)
            })	
            .on('progress', function(progress) {
                console.log(progress);
            })
            .on('end', function() { 
                completed = true;
                console.log('Finished processing ', encoded_file); 
                publish(encoded_file, config.amqp.PATH_CONVERTED_VIDEO);
            }).run();
    }, {noAck: true});
  });
});
