import { useState, useEffect } from "react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode: "login" | "signup"
}

export default function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)

  // Update mode when initialMode changes (important!)
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md max-w-md w-full">
        <button onClick={onClose} className="mb-4">Close</button>

        {mode === "login" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Sign In</h2>
            {/* Sign In form */}
          </div>
        )}

        {mode === "signup" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Sign Up</h2>
            {/* Sign Up form */}
          </div>
        )}

        {/* Optional: buttons to switch modes inside modal */}
        <div className="mt-4 text-center">
          {mode === "login" ? (
            <button onClick={() => setMode("signup")} className="text-orange-500">
              Don't have an account? Sign Up
            </button>
          ) : (
            <button onClick={() => setMode("login")} className="text-orange-500">
              Already have an account? Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
