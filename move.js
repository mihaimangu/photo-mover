const fs = require('fs');
const path = require('path');
const { stringify } = require('querystring');

// Function to check if a file is a JPEG/JPG image
function isJPEG(file) {
    return ['.jpg', '.jpeg', '.mp4'].includes(path.extname(file).toLowerCase());
}

// Function to get the creation date of a file
function getCreationDate(filePath) {
    const stats = fs.statSync(filePath);

    // get the creation date frmo the image exif
    const exif = exiftool.read(filePath);
    if (exif.hasOwnProperty('CreateDate')) {
        return exif['CreateDate'];
    }
    

    return stats.birthtime; // birthtime represents the creation time of the file
}

// Function to extract creation date from the filename
function extractCreationDate(filename) {
    //extracting creation date

    // if filename starts with "IMG_", remove that from the string

    if (filename.startsWith("IMG_")) {
        filename = filename.substring(4);
    }

    if (filename.startsWith("IMG-")) {
        filename = filename.substring(4);
    }

    if (filename.startsWith("VID-")) {
        filename = filename.substring(4);
    }


    // Assuming filename format: YYYYMMDD_HHMMSS
    const regex = /(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;
    const match = filename.match(regex);

    if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Months are zero-based in JavaScript Date object
        const day = parseInt(match[3], 10);
        const hour = parseInt(match[4], 10);
        const minute = parseInt(match[5], 10);
        const second = parseInt(match[6], 10);

        // Create a new Date object
        const date = new Date(year, month, day);
        return date;
    } else {
        console.error("Invalid filename format. Please provide a filename in the format YYYYMMDD_HHMMSS.");
        return null;
    }
}

// Function to move a file to a destination folder
async function moveFileToFolder(filePath, destinationFolder) {
    const fileName = path.basename(filePath);
    const newFilePath = path.join(destinationFolder, fileName);
    fs.renameSync(filePath, newFilePath);
    console.log(`Moved file "${fileName}" to folder "${destinationFolder}".`);
}


function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}

// Function to search for JPEG/JPG images in the current folder
function searchImages() {
    const currentFolder = process.cwd(); // Get the current working directory
    fs.readdir(currentFolder, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        // Filter out only JPEG/JPG images
        const imageFiles = files.filter(isJPEG);

        // Iterate through each image file and get its creation date
        imageFiles.forEach(file => {
            const filePath = path.join(currentFolder, file);
            const creationDate = extractCreationDate(filePath);
            if (creationDate) {
                // console.log(`${file}: Creation Date - ${creationDate}`);

                // extract the momth frmo the creationDate
                const processedDate = new Date(creationDate);
                const month =  (processedDate.getMonth() + 1).toString();
                console.log(`${file}: Creation Month - ${month}`);

                const monthFolder = path.join(currentFolder, month);
            
                createFolderIfNotExists(monthFolder);
                moveFileToFolder(path.join(currentFolder, file), monthFolder);

            } else {
                console.log(`${file}: Unable to extract creation date from filename.`);
            }
        
        });
    });
}

// Call the function to start the search
searchImages();
