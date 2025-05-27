/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

export default function DebugPage() {
  const [email, setEmail] = useState("admin@megapdf.com");
  const [password, setPassword] = useState("admin123");
  const [response, setResponse] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [cookies, setCookies] = useState<string>("");

  const testLogin = async () => {
    try {
      console.log("Testing login...");

      const loginResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const loginData = await loginResponse.json();

      // Get cookies from the response
      const setCookieHeader = loginResponse.headers.get("set-cookie");
      setCookies(setCookieHeader || "No cookies set");

      setResponse({
        status: loginResponse.status,
        ok: loginResponse.ok,
        data: loginData,
        headers: {
          "set-cookie": setCookieHeader,
          "content-type": loginResponse.headers.get("content-type"),
        },
      });

      // If login was successful, test token validation
      if (loginResponse.ok) {
        console.log("Login successful, testing token validation...");

        const tokenResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/validate-token`,
          {
            credentials: "include",
          }
        );

        console.log("Token validation status:", tokenResponse.status);

        if (tokenResponse.ok) {
          const tokenValidation = await tokenResponse.json();
          setTokenData({
            status: tokenResponse.status,
            data: tokenValidation,
          });
        } else {
          const errorData = await tokenResponse
            .json()
            .catch(() => ({ error: "Unknown error" }));
          setTokenData({
            status: tokenResponse.status,
            error: errorData,
          });
        }
      }
    } catch (error) {
      setResponse({ error: error });
    }
  };

  const testTokenDirectly = async () => {
    try {
      const tokenResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/validate-token`,
        {
          credentials: "include",
        }
      );

      const tokenData = await tokenResponse.json();
      setTokenData({
        status: tokenResponse.status,
        data: tokenData,
        note: "Direct token test (no login first)",
      });
    } catch (e) {
      setTokenData({ error: e });
    }
  };

  const checkCookies = () => {
    const allCookies = document.cookie;
    alert(`Browser cookies: ${allCookies || "No cookies found"}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Login Debug Tool</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin@megapdf.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={testLogin}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Test Login Flow
            </button>

            <button
              onClick={testTokenDirectly}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Test Token Validation Only
            </button>

            <button
              onClick={checkCookies}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Check Browser Cookies
            </button>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-md">
          <h3 className="font-bold mb-2">Current Settings:</h3>
          <p className="text-sm">
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
          </p>
          <p className="text-sm">
            <strong>Login URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
            /api/auth/login
          </p>
          <p className="text-sm">
            <strong>Token URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
            /api/validate-token
          </p>

          <div className="mt-4">
            <h4 className="font-medium">Cookies Set by Server:</h4>
            <p className="text-xs bg-white p-2 rounded mt-1 break-all">
              {cookies || "None detected"}
            </p>
          </div>
        </div>
      </div>

      {response && (
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-bold mb-2">Login Response:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {tokenData && (
        <div className="bg-blue-100 p-4 rounded-md">
          <h3 className="font-bold mb-2">Token Validation:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(tokenData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
