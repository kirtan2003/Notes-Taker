import React, { useState } from 'react';
import login from '../assets/login.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import background from '../assets/water-drops-background.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const Login = () => {

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    if (!emailOrUsername || !password) {
      toast.warn("All fields are required!", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/v1/auth/login",
        { emailOrUsername, password },
        config
      );

      toast.success("Account created successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      navigate('/home');
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error Occurred! Please try again later.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundImage: `url(${background})` }} className='h-screen flex items-center justify-center '>
      <ToastContainer/>
      <div className='w-[70%] h-[73%] flex justify-center gap-10 shadow-lg overflow-hidden bg-white'>
        <div className='w-1/2'>
          <img src={login} alt="login illustration" />
        </div>

        <div className='flex flex-col items-center justify-center'>
          <div className='mb-7 text-lg tracking-wider font-[Inter]'>
            <label htmlFor="">Email or Useraname: </label>
            <Input type="text" onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="enter email or username" className='mt-2 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-yellow-300' />
          </div>
          <div className='mb-7 text-lg tracking-wider font-[Inter]'>
            <label htmlFor="">Password: </label>
            <Input type="password" onChange={(e) => setPassword(e.target.value)} className='mt-2 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-yellow-300' />
          </div>

          {
            !loading ? (
              <Button className='bg-[#FFC727] hover:bg-[#ffb728]' onClick={handleLogin}>Login</Button>
            ) : (
              <Button disabled className='w-20 mb-4'>
                <Loader2 className="animate-spin" />
              </Button>
            )
          }
        </div>
      </div>

      
    </div>
  )
}

export default Login