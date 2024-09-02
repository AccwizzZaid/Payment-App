import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { encryptData, decryptData } from './Functions/Data_protection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import { apiUrl, secretKey } from './constant';



const Form = () => {
    const location = useLocation();


    // Create URLSearchParams from location.search
    const params = new URLSearchParams(location.search);

    // Get specific parameters
    const billguid = params.get('billguid');


    const [billdata, setBilldata] = useState({});
    const [sharedetailsclicked, setSharedetailsclicked] = useState(false);
    const [paymentmode, setPaymentmode] = useState("");
    const [name, setName] = useState("");
    const [remarks, setRemarks] = useState("");
    const [netpayable, setNetpayable] = useState("");

    // States for details box
    const [bankname, setBankname] = useState("");
    const [transactionreference, setTransactionreference] = useState("");
    const [transactiondate, setTransactiondate] = useState("");
    const [comments, setComments] = useState("");
    const [file, setFile] = useState();


    const [merchantid, setMercahntid] = useState(3722062);
    const [currency, setCurrency] = useState("INR");
    const [amount, setAmount] = useState("");
    const [redirect_url, setRedirect_url] = useState(`${apiUrl}ccavResponseHandler`);
    const [cancel_url, setCancel_url] = useState(`${apiUrl}RedirectHandler`);
    const [language, setLanguage] = useState("EN");


    const generateTransactionID = () => {
        const timestamp = Date.now().toString(); // current timestamp in milliseconds
        const randomNumbers = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit random number
        return `${timestamp}${randomNumbers}`;


    }



    const fetchbilldetails = async () => {
        const encryptedbillguid = await encryptData(billguid, secretKey);
        try {
            console.log(encryptedbillguid);

            if (encryptedbillguid) {
                const response = await axios.get(`${apiUrl}getbilldetails`, {
                    params: { billguid: encryptedbillguid }
                });
                const decryptedResponse = decryptData(response.data.payload, secretKey);
                setBilldata(decryptedResponse);
                console.log(decryptedResponse);
                setName(substractname(decryptedResponse));
                setAmount(decryptedResponse.netpayable)
            }


        } catch (error) {
            console.log(error);
        }



    };

    const mobile = 9975241874;

    const fetchapi = async () => {
        try {
            const response = await axios.get(`http://app.chatboat.in/api/sendtemplate.php?LicenseNumber=88885842549&APIKey=xRcD2QusqFdgSJAZP8jwVG7lM&Contact=91${mobile}&Template=socbill2&Param=Lokesh,1,30-10-2024&Name=Lokesh&PDFName=test.pdf`);
            console.log(response);
        } catch (error) {
            console.log(error);

        }


    }

    useEffect(() => {
        fetchbilldetails();
    }, []);

    const getNumberPlaceholder = () => {
        switch (paymentmode.toLocaleLowerCase()) {
            case 'cheque':
                return 'Enter Cheque / DD number';
            case 'upi':
                return 'Enter transaction number';
            case 'netbanking':
                return 'Enter net banking details';
            default:
                return 'Enter payment details';
        }
    };

    const getDatePlaceholder = () => {
        switch (paymentmode.toLocaleLowerCase()) {
            case 'cheque':
                return 'Enter Cheque / DD date';
            case 'upi':
                return 'Enter transaction date';
            case 'netbanking':
                return 'Enter transaction  date';
            default:
                return 'Enter payment date';
        }
    };




    const substractname = (data) => {

        try {
            if (!data || typeof data.ownername !== 'string') {
                console.error('Invalid owner name');
                return;
            }

            let name = data.ownername;
            let count = 0;
            let position = 0;

            for (let i = 0; i < name.length; i++) {
                if (name[i] === " ") {
                    count++;
                    if (count === 2) {
                        position = i;
                        break;
                    }
                }

            }
            if (position != 0) {
                return name.substr(0, position);
            }
            return name
        } catch (error) {
            console.log(error);

        }

    };

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function getTransactionTime() {
        // Generate the current date and time
        const transactionDate = new Date();

        // Get the time components
        const seconds = transactionDate.getSeconds();
        const minutes = transactionDate.getMinutes();
        const hours = transactionDate.getHours();

        // Format the transaction date and time
        const formattedTime = `${hours}h ${minutes}m ${seconds}s`;

        return formattedTime;
    }

    const savetransactiondetails = async (order_id) => {
        try {
            const response = await axios.post(`${apiUrl}savetransaction`, {
                transactionid: order_id,
                gatewaytransactionid: null,
                merchantid: merchantid,
                amount: amount,
                transactiondate: formatDate(new Date()),
                transactiontime: getTransactionTime(),
                billguid: billguid,
                name: name,
                flatshopno: billdata.flatshopno,
                inputlog: {
                    transactionid: order_id,
                    gatewaytransactionid: null,
                    merchantid: merchantid,
                    amount: amount,
                    transactiondate: formatDate(new Date()),
                    transactiontime: getTransactionTime(),
                    billguid: billguid,
                    name: name,
                    flatshopno: billdata.flatshopno,
                },
                outputlog: {},
                transaction_status: null

            });
        } catch (error) {
            console.log(error);
        }


    }


    const initiatePayment = async (e) => {

        e.preventDefault();

        const order_id = generateTransactionID();

        await savetransactiondetails(order_id);

        const payload = {
            merchant_id: merchantid,
            order_id: order_id,
            currency: currency,
            redirect_url: redirect_url,
            cancel_url: cancel_url,
            billing_name: name,
            amount: amount,
            language: language,
            merchant_param1: remarks,
            merchant_param2: billguid,
        };

        console.log(payload);


        try {
            const response = await axios.post(`${apiUrl}ccavRequestHandler`, payload, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/html' });
            console.log(blob);

            const url = URL.createObjectURL(blob);
            window.location.href = url;
        } catch (error) {
            console.log(error);
        }

    };


    const detailsbtnclicked = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        console.log(file);


        try {
            // Create payload object
            const payload = {
                ledid: billdata.ledid,
                billguid: billdata.billguid,
                bldgid: billdata.bldgid,
                vouchertype: 1,
                netpayable: billdata.netpayable,
                paymode: paymentmode,
                paymentdate: transactiondate,
                ownername: name,
                flatshopno: billdata.flatshopno,
                bankname: bankname,
                transactionreference: transactionreference,
                transactiondate: transactiondate,
                amountpaid: amount,
                comments: comments
            };

            // Encrypt the payload
            const encrytedpayload = encryptData(payload, secretKey);



            // Check if file is provided
            if (!file || file.length === 0) {
                throw new Error('No file provided');
            }

            // Convert the file to a Blob
            const fileBlob = new Blob([file], { type: file.type });

            // Create FormData object and append data
            const formData = new FormData();
            formData.append('data', encrytedpayload);
            formData.append('file', fileBlob, file.name);

            // Send POST request
            const response = await axios.post(`${apiUrl}addvoucher`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Decrypt the response data
            const decryptedResponse = decryptData(response.data.data, secretKey);
            console.log(decryptedResponse);

        } catch (error) {
            console.error('Error in detailsbtnclicked:', error);
        }
    }




    return (
        <StyledForm>
            <div className="container">
                <div className="sub-container">
                    <img src="./Resources/logo.png" alt="" id='logo' />
                    <section id='body'>
                        <div>
                            <div className="firstheaderbox"></div>
                            <div className="secondheaderbox">
                                <p style={{ margin: 0, textAlign: 'center', color: '#fff' }}>Payment</p>
                            </div>
                        </div>
                        <div className="info-box">
                            <div className="left">
                                <span>Payee Name :</span>
                                <span>Flat / Shop No :</span>
                                <span>Payment Towards :</span>
                                <span>Bill Amount :</span>
                                <span style={{ display: 'none' }}>View Detailed Bill :</span>
                            </div>
                            <div className="right">
                                <span>{name}</span>
                                <span>{billdata.flatshopno}</span>
                                <span>Society Maintenance</span>
                                <InputContainer>
                                    <input
                                        style={{ width: '65%' }}
                                        type="number"

                                        onChange={(e) => setAmount(e.target.value)}
                                        value={amount}
                                    />
                                    <FontAwesomeIcon icon={faPen} className="icon" />
                                </InputContainer>
                                <button style={{ display: 'none' }}id='download-btn'>Download</button>
                            </div>
                        </div>
                        <div>
                            <input style={{display : 'none'}} type="checkbox" onChange={(e) => setSharedetailsclicked(e.target.checked)} />
                            <span style={{display : 'none'}}> Share Payment Details</span>
                        </div>
                        {
                            sharedetailsclicked && (
                                <div className="payment-option">
                                    <span>Select Payment Option</span>
                                    <div className="paymentselect">
                                        <select
                                            style={{ outline: 'none', border: 'none', backgroundColor: '#FDD5D6' }}
                                            onChange={(e) => setPaymentmode(e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="Upi">UPI</option>
                                            <option value="NetBanking">Net Banking</option>
                                        </select>
                                    </div>
                                </div>
                            )
                        }
                        {sharedetailsclicked && paymentmode && (
                            <div className="details-box">
                                <form className='details-form' >
                                    <span>Please Share the {paymentmode} Payment Details</span>
                                    <InputContainer>
                                        <input className='details-input' type="text" placeholder="Enter Bank Name"
                                            onChange={(e) => setBankname(e.target.value)}
                                        />

                                        <FontAwesomeIcon icon={faAngleRight} className="icon" />
                                    </InputContainer>

                                    <input
                                        className="details-input"
                                        type="text"
                                        onChange={(e) => setTransactionreference(e.target.value)}
                                        placeholder={getNumberPlaceholder()}
                                    />


                                    <input className='details-input'
                                        onChange={(e) => setTransactiondate(e.target.value)} type="date" placeholder={getDatePlaceholder()} />


                                    <input className='details-input' type="number" placeholder="Enter amount"
                                        onChange={(e) => setAmount(e.target.value)}
                                    />


                                    <textarea onChange={(e) => setComments(e.target.value)} placeholder="Additional Notes"></textarea>

                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />

                                    <button onClick={detailsbtnclicked} className="submit-btn">Submit</button>
                                </form>

                            </div>
                        )}
                        {
                            !sharedetailsclicked && (
                                <div className="payment-box">
                                    <form style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
                                        <label >Remarks*</label>
                                        <input type="text" required style={{ border: "none", outline: "none", borderBottom: "1px solid black" }} onChange={(e) => setRemarks(e.target.value)} />
                                        <button id='pay-btn' onClick={(e) => { initiatePayment(e); }}>Pay Now</button>
                                    </form>
                                </div>
                            )
                        }

                    </section>
                </div>
            </div >
        </StyledForm >
    );
};

const InputContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    .icon {
        position: absolute;
        right: 10px;
        font-size: 1rem;
        color: #720C11;
    }

    input {
        width: 100%;
        padding-right: 25px; /* Make room for the icon */
    }
`;

const StyledForm = styled.div`


    .container{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        width: 100%;
        display: grid;
        place-items: center;
        padding-top: 15vh;
    }

    .sub-container {
        width: 20%;
        min-height: 10vh;
        border: 2px solid #720C11;
        box-shadow: 5px 5px #720C11;
        padding: 2vh 1% 0 1%;
        border-radius: 10px;
    }

    .info-box {
        max-width: 100%;
        min-height: 10vh;
        background-color: #F4F2F2;
        border-radius: 20px;
        display: flex;
        padding: 2%;
    }

    .left {
        display: flex;
        flex-direction: column;
        gap: 2vh;
        width: 50%;
        padding: 1%;
        color: #6F6E6E;
    }
    .right {
        display: flex;
        flex-direction: column;
        gap: 2vh;
        width: 50%;
        padding: 1%;
    }
    .payment-mode-box {
        max-width: 100%;
        min-height: 10vh;
        background-color: #F4F2F2;
        border-radius: 20px;
        padding: 2%;
    }

    .payment-mode{
        display: flex;
    }

    .payment-option {
        max-width: 100%;
        background-color: #FDD5D6;
        border-radius: 20px;
        display: flex;
        justify-content: space-between;
        padding: 2vh 3%;
    }

    .payment-box {
       max-width: 100%;

    }

    #logo {
        width: 8%;
    }

    #body {
        display: flex;
        flex-direction: column;
        gap: 2.5vh;
        margin-bottom: 10vh;
        
    }

    .firstheaderbox {
        width: 100%;
        background-color: #720C11;
        height: 0.5vh;
        margin-bottom: 0.2vh;
    }

    .secondheaderbox {
        width: 100%;
        background-color: #720C11;
        height: 2.5vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #download-btn {
        width: 65%;
        background-color: #720C11;
        border: none;
        color: #fff;
        font-size: 0.8rem;
        height: 2.5vh;
    }

    #submit-btn {
        width: 25%;
        background-color: #720C11;
        border: none;
        color: #fff;
        font-size: 0.8rem;
        height: 2.5vh;
        margin-left: 70%;
        border-radius: 10px;
        height: 4vh;
    }

    #pay-btn{
        width: 30%;
        background-color: #720C11;
        border: none;
        color: #fff;
        font-size: 0.8rem;
        height: 2.5vh;
        margin-left: 70%;
        border-radius: 10px;
        height: 5vh;
    }

    .details-box {
        max-width: 100%;
        min-height: 10vh;
        background-color: #FDD5D6;
        border-radius: 20px;
        padding: 4%;
        
    }

    .details-form{
        display: flex;
        flex-direction: column;
        gap: 2vh;
    }

    .details-input {
        height: 2.5vh;
        padding-left: 2%;
    }

    textarea{
        padding-left: 2%;
    }

    .submit-btn {
        width: 25%;
        background: #720C11;
        color: #fff;
        height: 3vh;
        border: none;
        margin-left: auto;
        border-radius: 10px;
    }
    @media screen and (max-width: 480px) {
        .container{
            padding: 0 2%;
        }

        .sub-container {
        width: 100%;
        border: none;
        box-shadow: 0px 0px #720C11;
        padding: 2vh 3% 0 3%;

    }
    }
`;

export default Form;
