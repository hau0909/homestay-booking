// trietcmce180982_sprint3
import Link from "next/link";
import { Binoculars } from "lucide-react";

export default function ExperienceMenuLink() {
  return (
    <Link href="/experience-listings" className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
      <Binoculars size={30} />
      Experiences
    </Link>
  );
}
