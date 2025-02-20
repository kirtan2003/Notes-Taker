import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import signup from '../assets/sign-up.jpg';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import background from '../assets/water-drops-background.jpg'
import { Link } from 'react-router-dom';
import { Loader2 } from "lucide-react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Signup = () => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setLoading(true);
    if (!username || !email || !password || !confirmPassword) {
      toast.warning("All fields are required!", {
        position: "bottom-center",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", {
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
      }

      const { data } = await axios.post(
        "/api/v1/auth/register",
        { username, email, password, confirmPassword },
        config
      );

      console.log(data);
      toast.success("Account created successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/home");
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
    <div style={{ backgroundImage: `url(${background})` }} className='h-screen flex items-center justify-center'>
      <ToastContainer />
      <div className='w-[70%] h-[73%] flex justify-center gap-16 shadow-lg overflow-hidden bg-white'>
        <div className='flex flex-col items-center justify-center'>
          <div className='mb-4 text-lg tracking-wider font-[Inter]'>
            <label htmlFor="">Username: </label>
            <Input required type="text" placeholder="John17" onChange={(e) => setUsername(e.target.value)} className='mt-1 w-72 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-yellow-300' />
          </div>
          <div className='mb-4 text-lg tracking-wider font-[Inter]'>
            <label htmlFor="">Email: </label>
            <Input type="email" placeholder="john.doe@gmail.com" onChange={(e) => setEmail(e.target.value)} className='mt-1 w-72 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-yellow-300' />
          </div>
          <div className='mb-4 text-lg tracking-wider font-[Inter]'>
            <label htmlFor="">Password: </label>
            <Input type="password" onChange={(e) => setPassword(e.target.value)} className='mt-1 w-72 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-yellow-300' />
          </div>
          <div className='mb-4 text-lg tracking-wider font-[Inter]'>
            <label htmlFor="">Confirm Password: </label>
            <Input type="password" onChange={(e) => setConfirmPassword(e.target.value)} className='mt-1 w-72 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-yellow-300' />
          </div>

          {!loading ?
            (<Button className='bg-[#FFC727] hover:bg-[#ffb728] mb-4' onClick={handleSignUp}>
              Sign Up
            </Button>) :

            (<Button disabled className='w-20 mb-4'>
              <Loader2 className="animate-spin" />
            </Button>)
          }

          <p className=' text-yellow-500'>Already have an account? <Link to={'/login'} className='underline underline-offset-2'>Login</Link> </p>
        </div>

        <div className='w-1/2'>
          <img src={signup} alt="login illustration" />
        </div>
      </div>
    </div>
  )
}

export default Signup