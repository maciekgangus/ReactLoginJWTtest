import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-slate-900 text-white py-6 px-10">
      <div className="flex justify-between items-center">
        <div className="text-4xl font-bold">Menu</div>

        <nav className="flex gap-6 text-lg">
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
