import Navbar from "./Navbar";
 
/*
Layout wraps every page
variant="home" for pages with nav links
variant="overview" for overview/login/signup
*/

const Layout = ({ children, navVariant = "home" }) => {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0A0A0A", color: "#F8F8F8" }}
    >
      <Navbar variant={navVariant} />
 
      {/* Main content area - pt-20 to clear fixed navbar */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
};
 
export default Layout;