import * as React from "react";
import Image from "next/image";

const wh = 52;
const Avatar = () => {
  return (
    <div className="flex h-16 w-16 items-center justify-center ">
      <Image
      src="/img/avatar.png"
      alt="Avatar"
      width={wh}
      height={wh}
      priority
    />
    </div>
  );
};

export default Avatar;