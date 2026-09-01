const Footer = ({ sidebarCollapsed }: any) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={`transition-all duration-300 ease-in-out bg-white border-t border-gray-200 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
      <div className="p-4 text-center text-sm text-gray-600">
        © {currentYear} Malpani Group. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;