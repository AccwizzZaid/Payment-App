import { decrypt } from '../utils/ccavutil.js';
import qs from 'querystring';

export function postRes(req, res) {
    const workingKey = 'FD8F8C638B32CC7D31C0AA3D8585A623'; // Example key
    
    // Directly access the parsed body
    const ccavPOST = req.body;
    
    const encryption = ccavPOST.encResp;
    const ccavResponse = decrypt(encryption, workingKey);

    let pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>';
    pData += ccavResponse.replace(/=/gi, '</td><td>');
    pData = pData.replace(/&/gi, '</td></tr><tr><td>');
    pData += '</td></tr></table>';

    const htmlcode = `<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>${pData}</center><br></body></html>`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(htmlcode);
    res.end();
}
