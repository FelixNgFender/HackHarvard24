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

    let userMessageContent = input;
    if (file) {
      userMessageContent += ` (File "${file.name}" uploaded)`; // Append file name if uploaded
    }

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file); // Add the file only if it's present
      formData.append("message", input);

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
        {/* <button
          onClick={toggleInstructions}
          className="mb-2 text-blue-500 hover:underline focus:outline-none"
        >
          {showInstructions ? "Hide Instructions" : "Show Instructions"}
        </button> */}
        
        {showInstructions && (
          <p className="mt-5 mb-2 mx-2 text-gray-900 text-base text-center font-bold">
            Get case recommendations tailored to your client’s situation. To do so: 
          <p className="mb-2 mx-2 text-gray-600 text-sm text-center font-normal">
            - Upload meeting notes directly if you have them saved.
          <p className="mb-2 mx-2 text-gray-600 text-sm text-center">
            - Or describe your client’s facts in the chat box — type key details, issues, or case background.
          <p className="mb-5 mx-2 text-gray-900 text-base text-center font-bold">
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
          <div className="mb-4 space-y-2 overflow-auto h-32">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-md ${
                  message.role === "user"
                    ? "bg-blue-100 text-gray-700 text-right"
                    : "bg-gray-200 text-gray-700 text-left"
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
            <label
              htmlFor="file-upload"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-md cursor-pointer hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.0799 12.4202L11.8999 18.6102C11.0897 19.3302 10.0351 19.7135 8.95164 19.6816C7.86821 19.6497 6.83792 19.2051 6.07149 18.4386C5.30506 17.6722 4.86043 16.6419 4.82853 15.5585C4.79664 14.4751 5.1799 13.4204 5.89992 12.6102L13.8999 4.61021C14.3775 4.15651 15.0112 3.90354 15.6699 3.90354C16.3287 3.90354 16.9623 4.15651 17.4399 4.61021C17.9053 5.0818 18.1662 5.71768 18.1662 6.38021C18.1662 7.04274 17.9053 7.67862 17.4399 8.15021L10.5399 15.0402C10.4716 15.1138 10.3895 15.1731 10.2983 15.2149C10.2071 15.2567 10.1085 15.2802 10.0082 15.2839C9.90791 15.2876 9.80788 15.2715 9.7138 15.2366C9.61973 15.2016 9.53346 15.1485 9.45992 15.0802C9.38638 15.0119 9.32701 14.9298 9.2852 14.8386C9.24339 14.7474 9.21995 14.6488 9.21624 14.5485C9.21253 14.4482 9.2286 14.3482 9.26355 14.2541C9.29849 14.16 9.35163 14.0738 9.41992 14.0002L14.5499 8.88021C14.7382 8.69191 14.844 8.43651 14.844 8.17021C14.844 7.90391 14.7382 7.64852 14.5499 7.46021C14.3616 7.27191 14.1062 7.16612 13.8399 7.16612C13.5736 7.16612 13.3182 7.27191 13.1299 7.46021L7.99992 12.6002C7.74322 12.8549 7.53948 13.1579 7.40045 13.4917C7.26141 13.8256 7.18983 14.1836 7.18983 14.5452C7.18983 14.9068 7.26141 15.2649 7.40045 15.5987C7.53948 15.9325 7.74322 16.2355 7.99992 16.4902C8.52429 16.9897 9.22072 17.2683 9.94492 17.2683C10.6691 17.2683 11.3655 16.9897 11.8899 16.4902L18.7799 9.59021C19.5748 8.73716 20.0075 7.60888 19.987 6.44308C19.9664 5.27727 19.4941 4.16496 18.6696 3.34048C17.8452 2.516 16.7329 2.04373 15.5671 2.02316C14.4012 2.00259 13.273 2.43533 12.4199 3.23021L4.41992 11.2302C3.34111 12.425 2.76494 13.9901 2.81145 15.5992C2.85795 17.2083 3.52355 18.7374 4.66955 19.868C5.81556 20.9985 7.35359 21.6433 8.9632 21.6679C10.5728 21.6925 12.1299 21.0951 13.3099 20.0002L19.4999 13.8202C19.5932 13.727 19.6671 13.6163 19.7176 13.4945C19.768 13.3726 19.794 13.2421 19.794 13.1102C19.794 12.9784 19.768 12.8478 19.7176 12.726C19.6671 12.6041 19.5932 12.4935 19.4999 12.4002C19.4067 12.307 19.296 12.233 19.1742 12.1826C19.0523 12.1321 18.9218 12.1061 18.7899 12.1061C18.6581 12.1061 18.5275 12.1321 18.4057 12.1826C18.2838 12.233 18.1732 12.307 18.0799 12.4002V12.4202Z" fill="#718096"/> 
              </svg>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
            <p className="text-sm text-gray-700">
            Selected: {file.name}
            </p>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-900 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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