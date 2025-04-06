import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-sky-800">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
