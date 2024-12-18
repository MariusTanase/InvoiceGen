import React from "react";
import { Link } from "react-router-dom";

type LinkNavProps = {
  to: string;
  text: string;
};

const LinkNav: React.FC<LinkNavProps> = ({ to, text }) => {
  return (
    <div>
      <Link
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        to={to}
      >
        {text}
      </Link>
    </div>
  );
};

export default LinkNav;
