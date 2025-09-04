import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils"; // same helper you used elsewhere

function Page() {
  const { slug } = useParams();
  const [content, setContent] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPage = async () => {
      dispatch(toggleLoading());
      try {
        const token = localStorage.getItem("user");
        const response = await fetch(getApiUrl("/page"), {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug }),
        });

        const result = await response.json();

        if (response.ok) {
          setContent(result.data || "");
        } else {
          console.error("Failed to load page:", result);
        }
      } catch (err) {
        console.error("Error fetching page:", err);
      } finally {
        dispatch(toggleLoading());
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug, dispatch]);

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

export default Page;
