import Link from 'next/link';

const Button = ({ href, children }) => {
  return (
    <Link href={href}>
      <button>{children}</button>
    </Link>
  );
};

export default Button;
