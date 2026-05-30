import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảo Khang Gadget",
  description: "This is Home - Bảo Khang Gadget",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
