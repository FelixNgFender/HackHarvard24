import { useState } from "react";
import case1PDF from "./assets/pdfs/case1.PDF";
import case2PDF from "./assets/pdfs/case2.PDF";
import case3PDF from "./assets/pdfs/case3.PDF";

// Accordion Item component
function AccordionItem({ title, content, isOpen, onToggle, score }) {
  return (
    <div className="border border-gray-300 rounded mb-2">
      <div
        className="cursor-pointer bg-gray-300 p-2 flex justify-between items-center"
        onClick={onToggle}
      >
        <span>{title}</span>
        <div className="mt-2">
          {/* Similarity Score */}
          <div className="flex justify-between items-center">
            <span>Similarity Score: {score}%</span>
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
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [openItem, setOpenItem] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const accordionItems = [
    {
      id: 1,
      title: "PDF 1: Case 1",
      content: "View Case 1 PDF",
      pdfUrl: case1PDF,
      score: 90,
    },
    {
      id: 2,
      title: "PDF 2: Case 2",
      content: "View Case 2 PDF",
      pdfUrl: case2PDF,
      score: 80,
    },
    {
      id: 3,
      title: "PDF 3: Case 3",
      content: "View Case 3 PDF",
      pdfUrl: case3PDF,
      score: 70,
    },
  ];

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
        <div className="h-full flex flex-col">
          <h2 className="text-lg mb-4">Accordion List</h2>
          <div className="space-y-2">
            {accordionItems.map((item) => (
              <AccordionItem
                key={item.id}
                title={item.title}
                content={item.content}
                isOpen={openItem === item.id}
                onToggle={() => toggleAccordion(item.id, item.pdfUrl)}
                score={item.score}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
