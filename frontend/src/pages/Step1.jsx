import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation to Step2

function Step1({ setResults }) {
  // Pass setResults prop to store API response
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false); // State to toggle instructions
  const [selectedFile, setSelectedFile] = useState(null); // State to store the uploaded file
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Update state with the selected file
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input && !selectedFile) return; // Ensure the user provides either text or a file

    // Add the user message to the chat box
    setMessages([
      ...messages,
      { role: "user", content: input || selectedFile.name },
    ]);
    setInput("");
    setLoading(true);

    try {
      // Make an API request to your FastAPI backend
      const response = await axios.get(
        `http://localhost:8000/opinions/most-relevant`,
        {
          params: { query: input },
        }
      );

      // Convert the distance to a similarity percentage
      const resultsWithPercentage = response.data.map((result) => ({
        ...result,
        similarity: Math.max(0, Math.min(100, 100 / (1 + result._distance))), // Convert distance to percentage
      }));

      // Store the response in the parent state and navigate to Step2
      setResults(resultsWithPercentage);
      navigate("/step2"); // Navigate to Step2 to display results
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
        <h1>
          cite<span className="font-bold">wise</span>
        </h1>
        <h2 className="text-lg font-bold mb-6">Workspace</h2>
        <nav className="space-y-4">
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            New Query
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            My Workspace
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            Home
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            All Folders
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            All Documents
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            All Cases
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            Favorites
          </button>
        </nav>
        <div className="mt-auto">
          <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-md">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-2xl text-blue-950 font-bold text-center mb-4">
          Welcome to{" "}
          <span className="font-normal bg-white rounded-full px-2 py-1">
            cite<span className="font-bold">wise</span>
          </span>
        </h1>

        {/* Instruction Section */}
        <div className="w-3/4 p-4 mx-2 bg-white rounded-lg shadow-lg">
          <button
            onClick={toggleInstructions}
            className="mb-2 text-blue-500 hover:underline focus:outline-none"
          >
            {showInstructions ? "Hide Instructions" : "Show Instructions"}
          </button>

          {showInstructions && (
            <p className="mb-2 text-gray-900 text-base text-center font-bold">
              Get case recommendations tailored to your client’s situation. To
              do so:{" "}
              <p className="mb-2 text-gray-600 text-sm text-center font-normal">
                - Upload meeting notes directly if you have them saved.
                <p className="mb-2 text-gray-600 text-sm text-center">
                  - Or describe your client’s facts in the chat box — type key
                  details, issues, or case background.
                  <p className="mb-5 text-gray-900 text-base text-center font-bold">
                    Once submitted, we’ll analyze the input and scan millions of
                    cases across various jurisdictions to show relevant cases
                    ranked by similarity.
                  </p>
                </p>
              </p>
            </p>
          )}
        </div>

        {/* Spacer */}
        <div className="h-8 bg-gray-200"></div>

        {/* Chat Section and File Upload */}
        <div className="w-3/4 p-4 px-4 mx-2 bg-white rounded-lg shadow-lg">
          <div className="mb-4 space-y-2 overflow-auto h-64">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  message.role === "user"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-200 text-left"
                }`}
              >
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="p-3 bg-gray-200 rounded-md">Fetching data...</div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center mt-4 space-x-2"
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="border rounded-md"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your query..."
              className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Step1;
