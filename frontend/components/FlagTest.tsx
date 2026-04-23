"use client";

import React from "react";
import Image from "next/image";

const flags = [
  { code: "pt", name: "Português", flag: "/brazil.png" },
  { code: "en", name: "English", flag: "/united-states.png" },
  { code: "es", name: "Español", flag: "/spain.png" },
  { code: "it", name: "Italiano", flag: "/italy.png" },
];

export default function FlagTest() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Teste das Bandeiras</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {flags.map((flag) => (
          <div key={flag.code} className="flex items-center space-x-3 p-3 border rounded-lg">
            <div className="w-10 h-6 relative rounded overflow-hidden shadow-sm border border-gray-200">
              <Image
                src={flag.flag}
                alt={`Bandeira ${flag.name}`}
                width={40}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="font-medium">{flag.name}</p>
              <p className="text-sm text-gray-600">{flag.code.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
