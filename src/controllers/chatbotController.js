import request from 'request';

let handleMessage = (sender_psid, received_message) => {
    let response;
    if (received_message.text) {    
        response = {
            "text": `Bạn vừa gửi: "${received_message.text}"`
        }
    }  
    callSendAPI(sender_psid, response);    
}

let handlePostback = (sender_psid, received_postback) => {
    let response = {
        "text": "Cảm ơn!"
    }
    callSendAPI(sender_psid, response);
}

let callSendAPI = (sender_psid, response) => {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    }); 
}

export default {
    handleMessage,
    handlePostback
};