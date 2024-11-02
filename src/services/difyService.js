import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DIFY_API_URL = 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

const difyService = {
    async chat(message, user_id) {
        try {
            console.log("Calling Dify API with:", {message, user_id});
            
            const response = await axios.post(`${DIFY_API_URL}/chat-messages`, {
                inputs: {},
                query: message,
                user: user_id,
                response_mode: "blocking",
                conversation_id: null
            }, {
                headers: {
                    'Authorization': `Bearer ${DIFY_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("Dify API response:", response.data);
            return response.data.answer;
        } catch (error) {
            console.error('Dify API Error:', error.response?.data || error.message);
            return 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
        }
    }
};

export default difyService;