import { useState } from "react";

// Helper function to render the title with pre-highlighted keywords
function renderPreprocessedTitle(title) {
  return { __html: title }; // Assuming the title is already preprocessed with <mark> or other highlights
}

// Accordion Item component
function AccordionItem({ title, score, onToggle, isOpen }) {
  return (
    <div className="border border-gray-300 rounded mb-2">
      <div
        className="cursor-pointer bg-gray-300 p-2 flex justify-between items-center"
        onClick={onToggle}
      >
        {/* Use dangerouslySetInnerHTML to render the preprocessed title */}
        <span dangerouslySetInnerHTML={renderPreprocessedTitle(title)}></span>
        <div className="mt-2">
          {/* Similarity Score */}
          <div className="flex justify-between items-center">
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
          <p>Click the title to view the PDF.</p>
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
        <h2 className="text-lg mb-4">
          Based on your prompt, these are the most relevant cases:
        </h2>
        <div className="h-full flex flex-col space-y-2">
          {/* Iterate over the results array, coming from the backend */}
          {results.map((item, index) => (
            <AccordionItem
              key={index}
              title={item.caseName} // Assuming caseName is preprocessed and has marked keywords
              score={item.similarity} // Using similarity score from backend
              isOpen={openItem === index}
              url={"https://www.courtlistener.com" + item.absolute_url}
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
