
import { decrypt , encrypt } from '../utils/ccavutil.js';

export function postReq(req, res) {
    // const body = "merchant_id=3722062&currency=INR&order_id=7500982&amount=100";

    const body = req.body;

    const workingKey = 'F513139AD7BB70032A899E75AE7C0340'; 
    const accessCode = 'AVDB12LH97BJ71BDJB'; 

    const queryString = new URLSearchParams(body).toString(); 

    // const encRequest = encrypt(JSON.stringify(body), workingKey); // Convert body to string

    const encRequest = encrypt(queryString , workingKey);

    // const encRequest = "eedabc244334f35d44c9fdae964f9bcb3a0226c725d4f75674ec15538b01673cef404b2843fc13f6f1e03e7a1ad26797c3a4124b2b0378af4a779581d17a83653b3a80b59745fdb32953e1a89bb316acfd492c51da3419dc45e264b2a446b86c"

    console.log(encRequest ,"This is enc Request");
    



    const decrypted = decrypt(encRequest , workingKey);

    console.log(decrypted, "This is decrypted");

    const formbody = `<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"> 
                      <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
                      <input type="hidden" name="access_code" id="access_code" value="${accessCode}">
                      <script language="javascript">document.redirect.submit();</script>
                    </form>`;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(formbody);
    res.end();
}


// function encrypt(plainText, workingKey) {
//     console.log(plainText);
//     console.log(workingKey);

    
//     const m = crypto.createHash('md5');
//     m.update(workingKey);
//     const key = m.digest();
//     const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
//     const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
//     let encoded = cipher.update(plainText, 'utf8', 'hex');
//     encoded += cipher.final('hex');
//     return encoded;
// }


