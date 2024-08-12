import express from 'express';
import { decryptData, encryptData } from './Data_protection.js';
import { secretKey } from './constant.js';
import mongoose from 'mongoose';
import multer from 'multer';

export const approuter = express.Router();

approuter.get('/getbilldetails', async (req, res) => {
    const { billguid } = req.query;
    console.log('Received billguid:', billguid);

    if (!billguid) {
        console.error('billguid is missing');
        return res.status(400).send('Bad Request: billguid is required');
    }

    let decryptedbillguid;
    try {
        decryptedbillguid = await decryptData(billguid, secretKey);
    } catch (error) {
        console.error('Error decrypting billguid:', error);
        return res.status(500).send('Internal Server Error');
    }

    if (!decryptedbillguid) {
        console.error('Decryption returned null or undefined');
        return res.status(500).send('Internal Server Error');
    }

    console.log('Decrypted billguid:', decryptedbillguid);

    const collectionname = decryptedbillguid.split("_");



    try {
        const collection = mongoose.connection.collection(collectionname[0]);
        const documents = await collection.findOne({ billguid: decryptedbillguid });

        if (!documents) {
            console.error('No documents found for billguid:', decryptedbillguid);
            return res.status(404).send('Not Found');
        }

        const encryptedResponse = encryptData(documents, secretKey);
        res.json({ payload: encryptedResponse });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Set up multer for file handling
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

approuter.post("/addvoucher", upload.single('file'), async (req, res) => {
    try {
        // Decrypt the payload data
        const decryptedData = decryptData(req.body.data, secretKey);

        // Handle file buffer
        const fileBuffer = req.file ? req.file.buffer : null;

        // Combine data and file buffer for MongoDB document
        const doc = {
            ...decryptedData,
            file: fileBuffer // Store the file as binary data
        };

        // Insert into MongoDB
        const collection = mongoose.connection.collection("vouchers");
        const response = await collection.insertOne(doc);

        if (response.acknowledged) {
            return res.json({
                data: {
                    data: decryptedData, // Send decrypted data back to client
                    file: fileBuffer ? fileBuffer.toString('base64') : null // Optionally, encode file as base64 for response
                },
                status: true
            });
        } else {
            throw new Error('Failed to insert document');
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});