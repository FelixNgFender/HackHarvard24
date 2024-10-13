import { useState } from "react";

// Helper function to render the title or opinion with pre-highlighted keywords
function renderPreprocessedText(text) {
  return { __html: text }; // Assuming the text is already preprocessed with <mark> or other highlights
}

// Accordion Item component
function AccordionItem({
  title,
  score,
  onToggle,
  isOpen,
  opinions,
  absoluteUrl,
}) {
  return (
    <div className="border border-gray-300 rounded mb-2">
      <div
        className="cursor-pointer bg-gray-300 p-2 flex justify-between items-center"
        onClick={onToggle}
      >
        {/* Render the preprocessed title and make it clickable */}
        <a
          href={absoluteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-blue-600 hover:underline"
          dangerouslySetInnerHTML={renderPreprocessedText(title)}
        ></a>

        <div className="mt-2">
          {/* Similarity Score */}
          <div className="flex justify-between items-center text-blue-900">
            <span>Similarity Score: {score.toFixed(2)}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-2.5 mt-1">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
        <span>{isOpen ? "-" : "+"}</span>
      </div>
      {isOpen && (
        <div className="p-2 bg-gray-100">
          <ul>
            {/* Display the list of opinions with clickable and preprocessed snippets */}
            {opinions.map((opinion, index) => (
              <li key={index}>
                <a
                  href={opinion.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  dangerouslySetInnerHTML={renderPreprocessedText(
                    opinion.snippet || `Opinion ${index + 1}`
                  )}
                ></a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Step2({ results }) {
  const [openItem, setOpenItem] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const toggleAccordion = (id, pdfUrl) => {
    if (openItem === id) {
      setOpenItem(null); // Close the item if it's already open
      setSelectedPdf(null); // Reset the selected PDF
    } else {
      setOpenItem(id); // Open the clicked item
      setSelectedPdf(pdfUrl); // Set the corresponding PDF
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane - Black displaying PDF */}
      <div className="w-1/2 bg-black p-4">
        <div className="h-full flex items-center justify-center">
          {selectedPdf ? (
            <iframe
              src={selectedPdf}
              width="100%"
              height="100%"
              className="border-2 border-white"
              title="PDF Viewer"
            >
              <p>
                Your browser does not support PDFs.{" "}
                <a href={selectedPdf}>Download the PDF</a>.
              </p>
            </iframe>
          ) : (
            <p className="text-white">
              Select a case from the right to view the PDF.
            </p>
          )}
        </div>
      </div>

      {/* Right Pane - Gray with Accordion */}
      <div className="w-1/2 bg-gray-200 p-4">
        <h2 className="text-lg mb-4 text-blue-950">
          Based on your prompt, these are the most relevant cases:
        </h2>
        <div className="h-full flex flex-col space-y-2">
          {/* Iterate over the results array, coming from the backend */}
          {results
            .filter((item) =>
              item.opinions.some((opinion) => opinion.download_url)
            ) // Filter out cases without any valid download_url
            .map((item, index) => (
              <AccordionItem
                key={index}
                title={item.caseName} // Assuming caseName is preprocessed and has marked keywords
                score={item.similarity} // Using similarity score from backend
                isOpen={openItem === index}
                opinions={item.opinions.filter(
                  (opinion) => opinion.download_url
                )} // Filter opinions with valid download_url
                absoluteUrl={
                  "https://www.courtlistener.com" + item.absolute_url
                }
                onToggle={() =>
                  toggleAccordion(index, item.opinions[0]?.download_url)
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default Step2;
