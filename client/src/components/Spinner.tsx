import { LoaderCircle } from "lucide-react";

const Spinner = ({ className = "w-4 h-4" }: { className?: string }) => {
  return <LoaderCircle className={`animate-spin ${className}`} />;
};

export default Spinner;
