import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import Step1 from "./pages/Step1"; // Import Step1 component
import Step2 from "./pages/Step2"; // Import Step2 component
import NavBar from "./components/NavBar"; // Import NavBar component

const App = () => {
  const [results, setResults] = useState([]); // State to hold results

  return (
    <>
      <NavBar />
      <Container
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "100vh", maxWidth: "100%" }} // Ensure container takes full width
        id="main-container"
      >
        <Routes>
          <Route path="/" element={<Step1 setResults={setResults} />} />
          <Route path="/step1" element={<Step1 setResults={setResults} />} />
          <Route path="/step2" element={<Step2 results={results} />} />
        </Routes>
      </Container>
    </>
  );
};

export default App;
