// src/actions/authActions.ts
"use server";
import axios from "axios";

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return { success: false, message: "Backend URL is not configured." };
  }

  try {
    const res = await axios.post(`${backendUrl}/api/v1/user/signup`, {
      name,
      email,
      password,
    });

    if (res.data.success) {
      return {
        success: true,
        message: "User signed up successfully!",
        token: res.data.token, // ✅ pass token back
        username: res.data.user.name,
      };
    }

    return { success: false, message: res.data.message };
  } catch (error) {
    console.error("Error during signup:", error);
    return { success: false, message: "An error occurred during signup." };
  }
}

export async function signin(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    return { success: false, message: "Backend URL is not configured." };
  }

  try {
    const res = await axios.post(`${backendUrl}/api/v1/user/signin`, {
      email,
      password,
    });

    if (res.data.success) {
      return {
        success: true,
        message: "User signed in successfully!",
        token: res.data.token, // ✅ pass token back
        username: res.data.user.name,
      };
    }

    return { success: false, message: res.data.message };
  } catch (error) {
    console.error("Error during signin:", error);
    return { success: false, message: "An error occurred during signin." };
  }
}
