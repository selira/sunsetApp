import axios from 'axios';

const API_URL = 'https://api.example.com/data'; // Replace with your actual API URL

export const fetchData = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};