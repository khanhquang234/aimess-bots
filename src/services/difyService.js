import axios from 'axios';

const DIFY_API_KEY = 'app-hXs1mX9QoddWjk0bnxcIwVSX';
const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages';

const difyService = {
    async chat(message) {
        try {
            const response = await axios.post(DIFY_API_URL, {
                messages: [{
                    role: 'user',
                    content: message
                }]
            }, {
                headers: {
                    'Authorization': `Bearer ${DIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data.answer;
        } catch (error) {
            console.error('Dify API Error:', error);
            return 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
        }
    }
};

export default difyService;