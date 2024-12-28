const { Worker } = require('bullmq');
const { redisConnection } = require('./queueConfig');

// Simulate a very heavy CPU-intensive task with sleep
function cpuIntensiveTask(iterations) {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
        // Make each iteration more expensive
        for (let j = 0; j < 10000; j++) {
            result += Math.sin(Math.sqrt(j)) * Math.cos(Math.sqrt(j));
            // Add some non-optimizable calculations
            result = Math.pow(result, 2);
            result = Math.sqrt(Math.abs(result));
        }

        // Add blocking sleep
        const start = Date.now();
        while (Date.now() - start < 1000) {
            // Busy wait for 100ms
        }
    }
    return result;
}

const worker = new Worker('longRunning', async job => {
    const { iterations } = job.data;
    console.log(`Starting job ${job.id} with ${iterations} iterations`);

    // Actually use the cpuIntensiveTask function
    let lastProgress = 0;
    const batchSize = Math.max(1, Math.floor(iterations / 100)); // Update progress every 1%

    for (let i = 0; i < iterations; i += batchSize) {
        // Perform CPU-intensive calculation for this batch
        cpuIntensiveTask(batchSize);

        // Update progress
        const progress = Math.floor((i / iterations) * 100);
        if (progress > lastProgress) {
            await job.updateProgress(progress);
            lastProgress = progress;
            console.log(`Job ${job.id} progress: ${progress}%`);
        }
    }

    return { completed: true, iterations };
}, {
    connection: redisConnection,
    concurrency: 1 // Ensure only one job runs at a time
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

console.log('Worker started'); 