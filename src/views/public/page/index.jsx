import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSend } from "../../../Libs/api";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../../../redux/global";

function Page() {
  const { slug } = useParams();
  const [content,setContent] = useState('');
  const { mutateAsync, isPending } = useSend({ url: "/page" });
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(toggleLoading())
    mutateAsync({slug},{onSuccess: (data) => {
        setContent(data.data);
        dispatch(toggleLoading())
    }})
  },[])
  return <div dangerouslySetInnerHTML={{__html: content}} />;
}

export default Page;
