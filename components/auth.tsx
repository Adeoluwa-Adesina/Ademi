"use client"

import { useState } from "react"
import { supabase } from "@/supabaseClient"

export default function Auth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) console.error(error)
    else console.log("User signed up:", data)
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) console.error(error)
    else console.log("Signed in:", data)
  }

  return (
    <div className="p-4">
      <input
        className="border p-2 mr-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mr-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 mr-2" onClick={signUp}>
        Sign Up
      </button>
      <button className="bg-green-500 text-white px-4 py-2" onClick={signIn}>
        Sign In
      </button>
    </div>
  )
}
