import mongoose from 'mongoose';
// Define the Bill Schema
const BillSchema = new mongoose.Schema({
  
}, { strict: false, timestamps: true });


export const getBillModel = (reference) => {
    return mongoose.model(reference, BillSchema, reference);
};
