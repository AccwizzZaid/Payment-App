import mongoose from "mongoose";

export const  SaveTransaction = async (req , res ) => {
    const transactiondata = req.body;

    try {
        const transactionscollection = mongoose.connection.collection("transactions");

        const response = await transactionscollection.insertOne(transactiondata);

        return res.status(200).json({ message: "Success" });
        
    } catch (error) {
        console.log(error);
    }

}