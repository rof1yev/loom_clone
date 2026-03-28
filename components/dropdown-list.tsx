"use client";

import Image from "next/image";
import { useState } from "react";
import { filterOptions } from "@/constants";

const DropdownList = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <div className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="filter-trigger">
          <figure>
            <Image
              src="/assets/icons/hamburger.svg"
              alt="Hamburger icon"
              width={14}
              height={14}
            />
            Most resent
          </figure>
          <Image
            src="/assets/icons/arrow-down.svg"
            alt="Arrow down icon"
            width={16}
            height={16}
          />
        </div>
      </div>

      {isOpen && (
        <ul className="dropdown">
          {filterOptions.map((option: string) => (
            <li key={option} className="list-item">
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropdownList;
