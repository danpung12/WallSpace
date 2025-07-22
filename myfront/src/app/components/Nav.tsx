import { Button } from "@/components/ui/button";
import Link from "next/link";



const Nav = () => {
  return (
    <nav>
       <header className="sticky flex items-center justify-between w-full h-16 px-4 text-center bg-white shadow-sm">
      <Link href="/">
        <div className="cursor-pointer text-[#4880EE] text-[1.5rem]"> 
            자소서.ai
        </div>
      </Link>

      <div className="cursor-pointer hidden md:flex ml-10 text-[#364153] text-[1rem] gap-x-8"> 

      </div>

      <div className="flex cursor-pointer gap-x-4">
        <Link href="/login">
            <Button className="text-black bg-white"> 로그인 </Button>
        </Link>
        <Button className="bg-[#4880EE]"> 회원가입 </Button>
      </div>

    </header>
    </nav>
  );
}

export default Nav;