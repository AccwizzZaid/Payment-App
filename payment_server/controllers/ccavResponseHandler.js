import { decrypt } from '../utils/ccavutil.js';
import mongoose from 'mongoose';
import axios from 'axios';

export async function postRes(req, res) {
  const workingKey = 'F513139AD7BB70032A899E75AE7C0340'; // Example key

  // Directly access the parsed body
  const ccavPOST = req.body;

  console.log(ccavPOST);

  const encryption = ccavPOST.encResp;
  const ccavResponse = decrypt(encryption, workingKey);

  console.log(ccavResponse, "This is decrypted response from cc avenue");

  // Encode the response to be URL-safe
  const encodedResponse = encodeURIComponent(ccavResponse);

  // Ensure the URL has the correct protocol
  const redirectUrl = `https://payment.accwizz.com/response.html?ccavResponse=${encodedResponse}`;
  res.redirect(redirectUrl);

  function getQueryParams(queryString) {
    const urlParams = new URLSearchParams(queryString);
    const params = {};

    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  const params = getQueryParams(ccavResponse);
  console.log(params);

  // Access the order_status from the parsed parameters
  const orderStatus = params.order_status;
  const billguid = params.merchant_param2;
  const amount = params.amount;
  const paymentdate = params.trans_date;
  const merchantid = params.merchant_id;
  const transactionid = params.order_id;
  const gatewaytransactionid = params.tracking_id;
  const bank_ref_no = params.bank_ref_no;


  const collectionname = billguid.split("_");


  if (orderStatus == "Success") {
    try {

      const collection = mongoose.connection.collection(collectionname[0]);

      const bill = await collection.findOne({ billguid: billguid }, null, { sort: { _id: -1 } });


      const payload = {
        ledid: bill.ledid,
        billguid: billguid,
        bldgid: bill.bldgid,
        netpay: bill.netpay,
        amountpaid: amount,
        paymode: "Online",
        paymentdate: paymentdate,
        onlinepayment: true,
        transactionid: transactionid,
        transactionstatus: "Success",
        merchantid: merchantid,
        gatewaytransactionid: gatewaytransactionid,
        mobileno : bill.mobileno,
      }

      const messageresponse = await axios.get(`https://app.chatboat.in/api/sendtemplate.php?LicenseNumber=88885842549&APIKey=xRcD2QusqFdgSJAZP8jwVG7lM&Contact=91${bill.mobileno}&Template=socpay&Param=${bank_ref_no},${amount}`);

      console.log(messageresponse);

      const vouchercollection = mongoose.connection.collection("vouchers");

      const response = await vouchercollection.insertOne(payload);

      console.log(response, "THis is Voucher insertion response");


    } catch (error) {
      console.log(error);

    }
  }

  const transactioncollection = mongoose.connection.collection("transactions");

  try {
    const transactionresponse = await transactioncollection.updateOne(
      { transactionid: transactionid },  // Query to find the document
      { $set: { ["transaction_status"]: orderStatus } }  // Update operation
    );

    if (transactionresponse.matchedCount > 0) {
      console.log('Transaction status updated successfully.');
    } else {
      console.log('No matching transaction found.');
    }
  } catch (error) {
    console.error('Error updating transaction status:', error);
  }









}

// let pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>';
// pData += ccavResponse.replace(/=/gi, '</td><td>');
// pData = pData.replace(/&/gi, '</td></tr><tr><td>');
// pData += '</td></tr></table>';

// const htmlcode = `<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>${pData}</center><br></body></html>`;
// res.writeHead(200, { "Content-Type": "text/html" });
// res.write(htmlcode);
// res.end();