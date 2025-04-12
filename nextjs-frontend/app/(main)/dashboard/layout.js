import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="px-10">
    <div className="flex flex-col">
          <h1 className="font-bold text-5xl md:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm ml-7 mt-5">
          Industry Insights
          </h1>
      
        </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
}
