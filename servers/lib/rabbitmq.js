'use strict';

const amqp = require('amqplib');
const config = require('../../config/index');

function publish(message, queueName) {
  return amqp.connect(config.amqp.url)
    .then(async (conn) => {
      return conn.createChannel().then(async (ch) => {
        return ch.assertQueue(queueName).then(function (ok) {
          ch.sendToQueue(queueName, new Buffer(message), { deliveryMode: true, persistent: true });
          
          ch.close();
          return true;
        });
      }).then((ok) => {
        conn.close();
        return ok;
      });
    })
    .catch((error) => {
      conn.close();
      return error;
    });
}

module.exports = { publish };
