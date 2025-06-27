import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Badge() {
  return (
    <Link
      href={"https://bolt.new"}
      rel="noopener noreferrer"
      target="_blank"
      className="fixed bottom-4 right-4 z-50 backdrop-blur-sm rounded-full p-1"
      role="bolt.new badge"
    >
      <Image
        src={"/builtwithbolt.svg"}
        alt="Built with bolt.new badge"
        width={70}
        height={70}
        loading="lazy"
        decoding="async"
        data-nimg="1"
      />
    </Link>
  );
}
