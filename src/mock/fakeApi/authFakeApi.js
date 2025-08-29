import { Response } from "miragejs";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import { logout } from "../../redux/auth/authusers/auth";
import { useDispatch } from "react-redux";
import getHttpCodeMessage from "../../Libs/httpcodes/httpcodes";


export function Bootstrap(server, apiPrefix) {
	server.get(`${apiPrefix}/api/bootstrap`, () => {
	  return { message: "Bootstrap data loaded" };
	});
  }
  
export default function authFake(server, apiPrefix) {

	server.passthrough("http://localhost:5000/api/**"); 
  
	// ای‌پی‌آی برای ارسال اس‌ام‌اس و بررسی وجود کاربر با شماره موبایل
	server.post(`${apiPrefix}/auth/sms`, async (schema, { requestBody }) => {
		const body = JSON.parse(requestBody);
	  
		try {
		  const response = await fetch(getApiUrl("/sms/newsmscode"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		  });
	  
		  const text = await response.text(); // get raw response first
		  const data = text ? JSON.parse(text) : null; // parse only if not empty
	  
		  if (!response.ok) {
			const error = {
			  status: response.status,
			  message: data?.message || getHttpCodeMessage(response.status),
			};
	  
			return {
			  message: "Failed to send SMS",
			  error,
			};
		  }
	  
		  return {
			message: "SMS sent successfully",
			data,
		  };
		} catch (error) {
		  return {
			message: "Internal Server Error",
			error: error.message || error,
		  };
		}
	  });
	  

	// ای‌پی‌آی برای لاگین با استفاده از شماره موبایل و کد اس‌ام‌اس
	server.post(`${apiPrefix}/auth/login`, async (schema, { requestBody }) => {
		const req = JSON.parse(requestBody);
	  
		try {
		  const response = await fetch(getApiUrl("/auth/login"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(req)
		  });
	  
		  const data = await response.json();

		//   const dispatch = useDispatch();

    // Only update/remove 'user' token if 'token' exists in the response
    if ("token" in data) {
		if (data.token) {
		  localStorage.setItem("user", data.token); // ✅ Store token
		} else {
		  localStorage.removeItem("user"); // ✅ Remove token if null or empty
		//   dispatch(logout());
		}
	  }
  
	  // Only update/remove 'user_master' token if 'token_master' exists in the response
	  if ("token_master" in data) {
		if (data.token_master) {
		  localStorage.setItem("user_master", data.token_master); // ✅ Store token
		} else {
		  localStorage.removeItem("user_master"); // ✅ Remove token if null or empty
		}
	  }


		  // Check 'verified' instead of 'success' in the response data
		  if (response.ok && data.user) {
			return new Response(200, {}, { message: "ok", user: data.user });
		  } else {
			return new Response(400, {}, { error: "کد وارد شده اشتباه است" });
		  }
		} catch (error) {
		  console.error("Error processing request:", error);
		  return new Response(500, {}, { message: "Internal Server Error", error: error.message });
		}
	  });
	  
	  

	server.post(`${apiPrefix}/auth/register`, async (schema, { requestBody }) => {
		const req = JSON.parse(requestBody);
		
		try {
			const response = await fetch((getApiUrl("/auth/signup")), {
			  method: "POST",
			  headers: { "Content-Type": "application/json" },
			  body: JSON.stringify(req)
			});
		  
	  
			const text = await response.text(); // get raw response first
			const data = text ? JSON.parse(text) : null; // parse only if not empty
		
			if (!response.ok) {
			  const error = {
				status: response.status,
				message: data?.message || getHttpCodeMessage(response.status),
			  };
		
			  return {
				message: "خطایی در ثبت نام کاربر رخ داده است",
				error,
			  };
			}

			return { message: "موفقیت در ثبت نام", data};

	  
			} catch (error) {
			  return { message: "error", error };
			}
		
		
		
		
		
		
		
		
		
		
		
		// if (req.mobile) {
		// 	const user = schema.users.where({mobile: req.mobile});
		// 	if(!user.models.length  > 0){
		// 		// اگر کد اس‌ام‌اس صحیح بود، اطلاعات کاربر و توکن برگردانده می‌شود
		// 	    schema.users.create({
		// 			id: "",
		// 			name: req.name,
		// 			family: req.family,
		// 			nationalCode: req.nationalCode,
		// 			mobile: req.mobile,
		// 			birthday: "",
		// 			email: "",
		// 			status: 'pending' // active,deactive,pending
		// 		});
		// 		return {
		// 			"message": "ok"
		// 		}
		// 	}
		// 	else{
		// 		// اگر کد اس‌ام‌اس اشتباه بود، خطا برگردانده می‌شود
		// 		return new Response(
		// 			200,
		// 			{some: "header"},
		// 			{error: {
		// 				mobile: "شماره موبایل تکراری است",
		// 			}}
		// 		)
		// 	}
		// }
		// // اگر شماره موبایل یا کد اس‌ام‌اس ارسال نشده باشد، خطای ۴۰۱ برگردانده می‌شود
		// return new Response(
		// 	401,
		// 	{ some: "header" },
		// 	{ message: "NOTHING" }
		// );




	});

	server.post(`${apiPrefix}/auth/verifyregister`, async (schema, { requestBody }) => {
		let body = JSON.parse(requestBody);
		const token = localStorage.getItem("user");

		try {
		  // Call the existing verifySMS API to validate the code
		  const response = await fetch(getApiUrl("/sms/verifysms"), {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			headers: new Headers({
				'Authorization': `Bearer ${token}`, 
				"Content-Type": "application/json"      
			  }),		  
			});
	  
		  const result = await response.json();
	  
		  if (response.ok) {
			// If the response from the verifySMS API is successful
			return { message: "ok" }; // Same response format as the original API
		  } else {
			// If there's an error from the verifySMS API (invalid code)
			return {
			  status: 400,
			  error: result.error, // Error returned from verifySMS
			};
		  }
		} catch (error) {
		  // Handle any errors from the fetch request
		  console.error("Error forwarding request to verifySMS:", error);
		  return { status: 500, error: { code: "Internal Server Error" } };
		}
	  });
	  


	server.get(`${apiPrefix}/auth/verify`, async (schema, { requestBody }) => {

		const token = localStorage.getItem("user");

		try {
			const response = await fetch(getApiUrl("/auth/verify-user"), {
			  method: "GET",
			  headers: { "Content-Type": "application/json" },
			  headers: new Headers({
				'Authorization': `Bearer ${token}`, 
				"Content-Type": "application/json"      
			  }),
			});
		  
			const data = await response.json();
	
		  if (response?.ok) {
			return { message: "User added successfully", data };
		  } else {
			return { message: "Failed to verify user", error: data };
		  }
		} catch (error) {
		  console.error("Error processing request:", error);
		  return { message: "Internal Server Error", error };
		}
	  }
	  
	  );
	

}