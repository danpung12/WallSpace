const Footer = () => {
    

    const Footer = [
    { title: "서비스", links: ["자소서 분석", "맞춤형 피드백", "템플릿 제공", "성공 사례"] },
    { title: "회사 정보", links: ["회사 소개", "팀 소개", "채용 정보", "뉴스룸"] },
    { title: "고객 지원", links: ["FAQ", "문의하기", "개인정보처리방침", "이용약관"] }
    ] as const;



    return(
        <div>
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

     );


}

export default Footer;
