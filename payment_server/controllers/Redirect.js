import { decrypt } from "../utils/ccavutil.js";
export const Redirect = (req, res) => {
    const workingKey = 'F513139AD7BB70032A899E75AE7C0340';
    const body = req.body;

    console.log(body, "See this");

    const encryption = body.encResp;
    const ccavResponse = decrypt(encryption, workingKey);

    console.log(ccavResponse, "cancel log");


    const params = new URLSearchParams(ccavResponse);

    // Extract the value of 'merchant_param2'
    const billguid = params.get('merchant_param2');

    // Redirect to a specific link
    res.redirect(`http://payment.accwizz.com/?billguid=${billguid}`);
};


