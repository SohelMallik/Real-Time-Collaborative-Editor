// Import Tailwind CSS styles
import "./App.css";
// Monaco Editor component (the same code editor used in VS Code)
import { Editor } from "@monaco-editor/react";
// Connects Yjs shared text to the Monaco Editor so multiple users can edit together
import { MonacoBinding } from "y-monaco";
// React hooks for references, memoized values, component state, and side effects
import { useRef, useMemo, useState, useEffect } from "react";
// Yjs library for Conflict-free Replicated Data Types (CRDT) enabling real-time collaboration
import * as Y from "yjs";
// Client provider that syncs the Yjs document with the backend server via Socket.IO
import { SocketIOProvider } from "y-socket.io";



function App() {
  // Store a reference to the mounted Monaco Editor instance
  const editorRef = useRef(null)

  // Store the current user's name; initializes from the URL query string (?username=...) if present
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  // Store the list of currently connected users in the collaborative session
  const [ users, setUsers ] = useState([])

  // Create a single Yjs document instance that persists across component re-renders
  const ydoc = useMemo(() => new Y.Doc(), [])
  // Get or create a shared text type named "monaco" inside the Yjs document
  const yText = useMemo(() => ydoc.getText("monaco"), [ ydoc ])


  // Callback triggered when the Monaco Editor finishes loading in the browser
  const handleMount = (editor) => {
    editorRef.current = editor

    // Bind the shared Yjs text ("monaco") to the Monaco Editor's text model
    // so any typing is synced in real time across all connected users
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([ editorRef.current ]),
    )
  }




  // Handle the username form submission when a user clicks "Join"
  const handleJoin = (e) => {
    e.preventDefault() // Prevent the browser from reloading the page
    setUsername(e.target.username.value) // Save the entered username in state
    // Update the browser URL with ?username=... without refreshing the page
    window.history.pushState({}, "", "?username=" + e.target.username.value)



  }

  // Connect to the Socket.IO server and track active users whenever `username` or `ydoc` changes
  useEffect(() => {

    console.log(username)

    // Only connect if the user has entered a username
    if (username) {

      // Connect to the backend Socket.IO server (root "/" path) for the "monaco" room
      const provider = new SocketIOProvider("/", "monaco", ydoc, {
        autoConnect: true,
      })

      // Broadcast this user's info (awareness state) to all other connected clients
      provider.awareness.setLocalStateField("user", { username })


      // Read the initial list of connected users from awareness states
      const states = Array.from(provider.awareness.getStates().values())

      console.log(states)

      // Filter out any empty states and update the `users` list in React state
      setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))

      // Listen for awareness changes (e.g., when someone joins or leaves) and update the user list
      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      })

      // Clear this user's awareness state right before the browser tab/window closes
      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforeUnload)


      // Cleanup function: disconnect Socket.IO and remove the event listener when unmounting
      return () => {
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [
    username,
    ydoc
  ])

  // If the user hasn't entered a username yet, show the login/join screen
  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center" >
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    )
  }

  // Once logged in, render the main collaborative workspace:
  // Left sidebar (active users list) + Right main area (Monaco code editor)
  return (
    <main
      className="h-screen w-full bg-gray-950 flex gap-4 p-4"
    >
      {/* Sidebar displaying all active users currently in the room */}
      <aside
        className="h-full w-1/4 bg-amber-50 rounded-lg "
      >
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>

      </aside>
      {/* Main code editor panel */}
      <section
        className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>

    </main>
  )
}

export default App