import React from "react";
import { Link } from "react-router-dom";

type LinkNavProps = {
  to: string;
  text: string;
  className?: string;
  title?: string;
};

const LinkNav: React.FC<LinkNavProps> = ({
  to,
  text,
  className = "",
  title,
}) => {
  return (
    <Link
      to={to}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${className}`}
      title={title ?? text}
    >
      {text}
    </Link>
  );
};

export default LinkNav;
