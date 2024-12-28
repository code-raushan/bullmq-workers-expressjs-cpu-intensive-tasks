const express = require('express');
const { longRunningQueue } = require('./queueConfig');

const app = express();
app.use(express.json());

// Route to add a new job
app.post('/start-job', async (req, res) => {
    const { iterations = 100 } = req.body; // Lower default, but each iteration is now much heavier

    try {
        const job = await longRunningQueue.add('cpu-intensive', {
            iterations
        });

        res.json({
            message: 'Job added successfully',
            jobId: job.id
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to add job',
            details: error.message
        });
    }
});

// Route to check server responsiveness
app.get('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// Route to get job status
app.get('/job/:id', async (req, res) => {
    try {
        const job = await longRunningQueue.getJob(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();
        res.json({
            jobId: job.id,
            state,
            progress: job.progress
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get job status',
            details: error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 