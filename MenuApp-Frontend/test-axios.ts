import axios from 'axios';
import { supabaseAdapter } from './src/api/supabaseAdapter';

const api = axios.create();
api.defaults.adapter = supabaseAdapter;

async function test() {
  try {
    await api.post('/auth/login', { email: 'mozo@entrepanes.com', password: 'wrong' });
  } catch (err: any) {
    console.log('Error caught:');
    console.log('err.message:', err.message);
    console.log('err.response:', err.response?.data);
  }
}

test();
