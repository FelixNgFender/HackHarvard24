import * as React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    // <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
    //   <Container>
    //     <Navbar.Brand></Navbar.Brand>
    //     <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    //     <Navbar.Collapse id="responsive-navbar-nav">
    //       {/* Center the Nav Links using justify-content-center */}
    //       <Nav className="justify-content-center w-100">
    //         <Nav.Link as={Link} to="/Step1">
    //           Step1
    //         </Nav.Link>
    //         <Nav.Link as={Link} to="/Step2">
    //           Step2
    //         </Nav.Link>
    //       </Nav>
    //     </Navbar.Collapse>
    //   </Container>
    // </Navbar>

    <nav className="fixed bottom-0 left-0 right-0  p-4">
      <div className="container mx-auto flex justify-center items-center">
        <div className="flex space-x-8">
          <Nav.Link
            as={Link}
            to="/Step1"
            className="bg-gray-500 hover:bg-blue-900 text-sm text-white font-bold w-16 h-16 rounded-full flex items-center justify-center transition duration-300"
          >
            Search
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/Step2"
            className="bg-gray-500 hover:bg-blue-900 text-sm text-white font-bold w-16 h-16 rounded-full flex items-center justify-center transition duration-300"
          >
            Analyze
          </Nav.Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
