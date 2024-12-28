const { Queue } = require('bullmq');

const redisConnection = {
    host: 'localhost',
    port: 6379
};

const longRunningQueue = new Queue('longRunning', {
    connection: redisConnection
});

module.exports = {
    longRunningQueue,
    redisConnection
}; 