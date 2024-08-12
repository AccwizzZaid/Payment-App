import crypto from 'crypto';

export function postReq(req, res) {
    const body = req.body;


    
    const workingKey = 'FD8F8C638B32CC7D31C0AA3D8585A623'; // Example key
    const accessCode = 'AVAR07LG75CI34RAIC'; // Example code


    

    const encRequest = encrypt(JSON.stringify(body), workingKey); // Convert body to string if needed
    const formbody = `<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> 
                      <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
                      <input type="hidden" name="access_code" id="access_code" value="${accessCode}">
                      <script language="javascript">document.redirect.submit();</script>
                    </form>`;

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(formbody);
    res.end();
}

function encrypt(plainText, workingKey) {
    const m = crypto.createHash('md5');
    m.update(workingKey);
    const key = m.digest();
    const iv = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f]);
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    let encoded = cipher.update(plainText, 'utf8', 'hex');
    encoded += cipher.final('hex');
    return encoded;
}

export { encrypt };
