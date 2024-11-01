const { removeBackground } = require('@imgly/background-removal-node');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Set view engine and static folder
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Function to convert file to data URL
async function fileToDataURL(filePath) {
    const buffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
}

// Function to remove background from an image
async function removeImageBackground(imgSource) {
    try {
        // Removing background
        const blob = await removeBackground(imgSource);

        // Converting Blob to buffer
        const buffer = Buffer.from(await blob.arrayBuffer());

        // Generating data URL
        const dataURL = `data:image/png;base64,${buffer.toString("base64")}`;
        
        // Returning the data URL
        return dataURL;
    } catch (error) {
        // Handling errors
        throw new Error('Error removing background: ' + error);
    }
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { outputImage: null });
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        // Convert original image to data URL
        const originalImageDataURL = await fileToDataURL(req.file.path);

        // Remove background from uploaded image
        const resultDataURL = await removeImageBackground(req.file.path);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Render result with both images
        res.render('index', { 
            outputImage: resultDataURL,
            originalImage: originalImageDataURL 
        });
    } catch (error) {
        res.status(500).send('Error processing image: ' + error.message);
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});