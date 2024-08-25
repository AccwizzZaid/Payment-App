import { decrypt } from '../utils/ccavutil.js';

export function postRes(req, res) {
    const workingKey = 'F513139AD7BB70032A899E75AE7C0340'; // Example key
    
    // Directly access the parsed body
    const ccavPOST = req.body;
    
    const encryption = ccavPOST.encResp;
    const ccavResponse = decrypt(encryption, workingKey);

    console.log(ccavResponse, "This is decrypted response from cc avenue");

    // Encode the response to be URL-safe
    const encodedResponse = encodeURIComponent(ccavResponse);

    // Ensure the URL has the correct protocol
    const redirectUrl = `http://payment.accwizz.com/response.html?ccavResponse=${encodedResponse}`;
    res.redirect(redirectUrl);
}

  // let pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>';
    // pData += ccavResponse.replace(/=/gi, '</td><td>');
    // pData = pData.replace(/&/gi, '</td></tr><tr><td>');
    // pData += '</td></tr></table>';

    // const htmlcode = `<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>${pData}</center><br></body></html>`;
    // res.writeHead(200, { "Content-Type": "text/html" });
    // res.write(htmlcode);
    // res.end();