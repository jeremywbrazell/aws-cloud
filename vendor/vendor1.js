'use strict';

const faker = require('faker');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

//=============Subscribing to delivery queue==========//

const { Consumer } = require('sqs-consumer');

const app = Consumer.create({
  queueUrl: 'https://sqs.eu-central-1.amazonaws.com/457441446271/deliveredV1',
  handleMessage: handler,
});

function handler(message) {
  console.log(message.Body);
}

app.on('error', (err) => {
  console.error(err.message);
});

app.on('processing_error', (err) => {
  console.error(err.message);
});

app.start();

//=============Publishing to SNS==========//


const sns = new AWS.SNS();

const topic = 'arn:aws:sns:us-west-2:570173358891:pickup.fifo';


let timeoutID = setInterval( () => {
const payload = {
  Message: JSON.stringify({
    orderID: faker.datatype.uuid(),
    customer: `${faker.name.firstName()} ${faker.name.lastName()}`,
    vendorId: 'https://sqs.us-west-2.amazonaws.com/570173358891/delivered'
  }),
  TopicArn: topic,
  MessageGroupId: '1',
};

sns.publish(payload).promise()
  .then(data => {
    console.log(data);
  })
  .catch(console.error);

}, 7000)

setTimeout( () => {
  clearTimeout(timeoutID)
}, 50000)
