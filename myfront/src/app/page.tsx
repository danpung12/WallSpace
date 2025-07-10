"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"




const features = [
  {
    title: "자소서 관리",
    desc: (
      <>
        자소서 작성/수정/삭제,
        <br className="block md:hidden" />
        템플릿 제공 및 버전 관리, <br />
        클라우드 저장 및 동기화
      </>
    ),
    image: "/images/feature1.jpg"
  },
  {
    title: "AI 분석",
    desc: (
      <>
        문법/맞춤법 검사, 키워드 추출 및 분석,
        <br />
        회사/직무별 핵심 역량 매칭, <br className="block md:hidden" />경쟁력 분석 리포트
      </>
    ),
    image: "/images/feature2.jpg"
  },
  {
    title: "개인화된 피드백",
    desc: (
      <>
        맞춤형 개선 제안, 성공 사례 기반 추천, 실시간 작성 가이드
      </>
    ),
    image: "/images/feature3.jpg"
  }
];




const Process = [
  { step: 1, title: "자소서 작성", desc: "제공된 템플릿을 활용하거나,\n 자유롭게 자소서를 작성하세요.", icon: "fas fa-pencil-alt" },
  { step: 2, title: "AI 분석", desc: "작성한 자소서를 꼼꼼하게 분석해\n 점수와 개선 방향을 알려드립니다.", icon: "fas fa-robot" },
  { step: 3, title: "맞춤형 피드백", desc: "분석 결과를 바탕으로 \n 맞춤형 피드백을 제공합니다.", icon: "fas fa-chart-line" }
] as const;

const Footer = [
  { title: "서비스", links: ["자소서 분석", "맞춤형 피드백", "템플릿 제공", "성공 사례"] },
  { title: "회사 정보", links: ["회사 소개", "팀 소개", "채용 정보", "뉴스룸"] },
  { title: "고객 지원", links: ["FAQ", "문의하기", "개인정보처리방침", "이용약관"] }
] as const;


const MainPage = () => (

  <div className = "flex flex-col min-h-screen text-center">
    {/* 네비게이션 */}
    <header className="sticky flex items-center justify-between w-full h-16 px-4 text-center bg-white shadow-sm">
      <div className="cursor-pointer text-[#4880EE] text-[1.5rem]"> 
        자소서.ai
      </div>

      <div className="cursor-pointer hidden md:flex ml-10 text-[#364153] text-[1rem] gap-x-8"> 

      </div>

      <div className="flex cursor-pointer gap-x-4">
        <Button className="text-black bg-white"> 로그인 </Button>
         <Button className="bg-[#4880EE]"> 회원가입 </Button>
      </div>

    </header>

    <div className="container  px-4 p-8 mx-auto text-center   bg-opacity-90 md:mt-[131px] rounded-xl font-black font-public xl:px-40 " >
      <div className="z-10 flex flex-col min-h-[480px] justify-center shadow-lg items-center gap-2  md:rounded-xl" 
      style={{
        backgroundImage: "linear-gradient( rgba(0, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.40) 100%), url('/images/main1.png')",
        
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",

      }}>
        <h1 className="text-white text-[1.8rem] mb-[24px] leading-relaxed md:text-[2.25rem]" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }} > 당신의 자소서를 분석해보세요 </h1>
        <h1 className="text-white mb-[33px] leading-loose font-normal " style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.4)" }} > AI 기반 자소서 분석 플랫폼은 <br className="block md:hidden" /> 
           
          사용자의 자소서를 AI로 분석하여 점수화하고, <br className="block md:hidden" />
          
          개선 방향을 제시하는 서비스입니다. 
        <br/> <br className="block md:hidden" />
        회사/직무별 맞춤형 피드백을 제공하여 <br className="block md:hidden" />
        
         취업 준비생들의 자소서 작성을 도와줍니다. </h1>
          <Button className="flex rounded-full min-w-[84px] max-w-[480px]  bg-[#508ceb] text-white hover:bg-[#3877ce] px-6 h-10 font-bold">
            <span className="truncate">내 자기소개서 분석</span>
          </Button>
      </div>


    </div>



      <section id="features" className="py-20">
        <div className="container px-8 mx-auto md:px-20">
          <div className="text-3xl font-bold text-gray-800 md:text-4xl">
            AI 자소서 분석의 <span className="text-[#4880EE]">핵심 기능</span>
          </div>
          <div className="mt-4 text-xl text-[#4A5565]">
            최신 AI 기술로 자소서를 분석하고,  <br className="block md:hidden" /> 
           
            맞춤형 피드백을 제공합니다.
          </div>

          <div className="grid gap-8 mt-16 md:grid-cols-3">
            {features.map((items, index) => (
              <Card key={index}>
                <div className="h-48 overflow-hidden ">
                    <Image
                      src={items.image}
                      alt={items.title}
                      width={400}           // 가로 크기 (px)
                      height={192}          // 세로 크기 (px) 비율 맞게 조절 가능
                      className="object-cover object-top w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">
                  {items.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 min-h-[48px] whitespace-pre-line">{items.desc}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-[#4880EE] hover:bg-[#f0f5ff]">더 알아보기 </Button>
                </CardFooter>
              </Card>
            ))}


          </div>
        </div>
      </section>


        <section id="process" className="bg-[#f8faff] py-20 ">
            <div className="container px-8 mx-auto md:px-20 ">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 md:text-4xl">
                  <span className="text-[#4880EE]">3단계</span>로 완성하는 자소서
                </h2>
                <p className="mt-4 text-xl text-gray-600">
                  간단한 단계를 통해 
                  <br className="block md:hidden" />
                  자소서를 작성하고 분석 받아 보세요.
                </p>
              </div>
              <div className="grid items-center justify-center gap-8 mt-16 md:grid-cols-3">
                {Process.map((items,index)=> (
                  <div key={index}>
                    <Card className="">
                      
                      <CardHeader >
                        <div className="flex items-center justify-center w-12 mb-2 text-xl text-center text-white bg-blue-500 rounded-full h-11">{items.step}</div>
                        <CardTitle>{items.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-[#4A5565] mb-10 whitespace-pre-line">{items.desc}</div>
                      </CardContent>
                    </Card>
                  </div>

                ))}
              </div>
            </div>
       </section>

         <section id="start" className="bg-[#4880EE] py-20">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            지금 바로 <br className="block md:hidden" />자소서 분석을 시작하세요.
          </h2>
          <p className="mt-6 text-xl text-white/90">
            AI로 첨삭한 완성도 있는 자소서를 만드세요.
          </p>
          <Button className="mt-10 md-20 bg-white text-[#4880EE]">
            무료로 시작하기
          </Button>
        </div>


       </section>

        <footer>
          <div className="container  mb-12 mt-[64px]   mx-auto grid md:grid-cols-4 md:text-left text-[#4A5565]">
              <div>
                <div className="text-2xl text-[#4880EE]">자소서.ai</div>
                <p className="mb-5">AI로 취업 준비생의 자소서 작성을 돕는 사이트입니다.</p>
              </div>
              {Footer.map((items, index)=> (
                <div key={index} className="mb-5">
                  <h3 className="mb-4 font-bold text-gray-800 md:mb-4 ">
                    {items.title}
                  </h3>
                  <ul className="space-y-2">
                    {items.links.map((items,index)=>(
                      <li key={index} className="text-gray-600 hover:text-[#4880EE]">
                        {items}
                    </li>
                    ))}
                  </ul>
                </div>
                
                ))}

              </div>
          
       </footer>








  </div>










)

export default MainPage;