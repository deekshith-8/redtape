"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { supabase } from "@/lib/supabase"

type Role = "user" | "lawyer"

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("user")
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!userId.trim()) {
      setError("ID / Username cannot be empty.")
      return
    }
    if (userId.includes("@")) {
      setError("Username cannot contain '@'. Use a plain username, not an email.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)

    const email = `${userId.trim()}@redtape.local`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError("Signup failed. Try again.")
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: userId.trim(),
      role,
    })

    if (profileError) {
      setError("Account created but profile setup failed: " + profileError.message)
      setLoading(false)
      return
    }

    if (role === "lawyer") {
      router.push("/lawyers/dashboard")
    } else {
      router.push("/home")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 flex flex-col justify-center items-center py-16 px-6 relative swiss-grid-pattern">
        <div className="w-full max-w-md bg-white border-2 border-black animate-reveal relative z-10">
          <div className="border-b-2 border-black p-6 swiss-diagonal flex justify-between items-center">
            <div>
              <span className="swiss-section-number">SECURE PORTAL</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
                Create Account
              </h2>
            </div>
            <span className="h-10 w-10 flex items-center justify-center bg-black text-white text-xs font-bold">
              ✍️
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <label className="swiss-label text-black/60">Choose Profile</label>
              <div className="grid grid-cols-2 border-2 border-black">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`py-3 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-150 cursor-pointer ${
                    role === "user" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"
                  }`}
                >
                  👤 User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("lawyer")}
                  className={`py-3 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-150 cursor-pointer ${
                    role === "lawyer" ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"
                  }`}
                >
                  ⚖️ Lawyer
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="swiss-label text-black/60 block mb-1">
                  Choose a Username
                </label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={role === "lawyer" ? "E.g., BAR_99201" : "E.g., citizen_sharma"}
                  className="swiss-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="swiss-label text-black/60 block mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="swiss-input"
                />
              </div>
            </div>

            {error && (
              <div className="border-2 border-[#FF3000] p-3 text-xs font-bold text-[#FF3000] uppercase bg-[#FF3000]/5 tracking-wider">
                ⚠️ Error: {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="swiss-btn-primary w-full justify-center">
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="text-center text-xs text-black/50">
              Already have an account? <a href="/" className="font-bold underline">Sign in here</a>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}