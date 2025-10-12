'use client';

const Footer = () => {
  return (
    <footer className="w-full mt-auto py-8 lg:px-40 px-4">
      <div className="border-t border-gray-200"></div>
      <p className="text-center text-sm text-gray-400 mt-8">
        © {new Date().getFullYear()} WallSpace. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
