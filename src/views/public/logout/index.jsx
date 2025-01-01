import React, { useLayoutEffect } from 'react'
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router';

function Logout() {
    const navigate = useNavigate();
  const [,,removeCookie] = useCookies(['user']);
    useLayoutEffect(() => {
        removeCookie('user');
        navigate('/login');
    },[])
  return 'در حال خروج';
}

export default Logout