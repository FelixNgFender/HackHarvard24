import { useState } from "react";
import axios from "axios";

function Step1() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true); // State to control visibility
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "" && !file) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file); // Append the file to the FormData
      formData.append("message", input); // Include the text message if needed

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo", // or 'gpt-4'
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENAI_API_KEY`,
            "Content-Type": "application/json",
          },
        }
      );
      const assistantResponse = response.data.choices[0].message.content;
      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantResponse },
      ]);
      setFile(null);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error: Unable to fetch a response." },
      ]);
    }
    setLoading(false);
  };

  const toggleInstructions = () => {
    setShowInstructions((prev) => !prev);
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
            New Chat
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
            All Bundles of Authority
          </button>
          <button className="text-left w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-md">
            Favourites
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
          <span className="font-normal bg-white rounded-full">
            cite<span className="font-bold">wise</span>
          </span>
        </h1>
         
        {/* instruction */}
        <div className="w-3/4 p-4 p-4 mx-2 bg-white rounded-lg shadow-lg">
        <button
          onClick={toggleInstructions}
          className="mb-2 text-blue-500 hover:underline focus:outline-none"
        >
          {showInstructions ? "Hide Instructions" : "Show Instructions"}
        </button>
        
        {showInstructions && (
          <p className="mb-2 text-gray-900 text-base text-center font-bold">
            Get case recommendations tailored to your client’s situation. To do so: 
          <p className="mb-2 text-gray-600 text-sm text-center font-normal">
            - Upload meeting notes directly if you have them saved.
          <p className="mb-2 text-gray-600 text-sm text-center">
            - Or describe your client’s facts in the chat box — type key details, issues, or case background.
          <p className="mb-5 text-gray-900 text-base text-center font-bold">
            Once submitted, we’ll analyze the input and scan millions of cases across various jurisdictions to show relevant cases ranked by similarity.
          </p>
          </p>
          </p>
          </p>
        )}
        </div>

        <div className="h-8 bg-gray-200"></div> 

        {/* chat */}

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
              <div className="p-3 bg-gray-200 rounded-md">Typing...</div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center mt-4 space-x-2"
          >
            <input
            type="file"
            onChange={handleFileChange}
            className=" border rounded-md"
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
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
