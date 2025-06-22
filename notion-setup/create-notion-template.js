require('dotenv').config();
const { Client } = require('@notionhq/client');

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 프로젝트 관리 템플릿 생성 함수
async function createProjectManagementTemplate() {
  try {
    console.log('프로젝트 관리 템플릿 생성을 시작합니다...');
    
    // 1. 프로젝트 개요 페이지 생성
    const projectOverviewPage = await createPage({
      parent: { page_id: process.env.PARENT_PAGE_ID },
      properties: {
        title: [
          {
            text: {
              content: '프로젝트 관리 대시보드',
            },
          },
        ],
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: '📊 프로젝트 개요' } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '이 페이지는 프로젝트의 전반적인 진행 상황을 한눈에 확인할 수 있는 대시보드입니다.',
                },
              },
            ],
          },
        },
      ],
    });

    console.log('프로젝트 개요 페이지가 생성되었습니다.');

    // 2. 작업(Tasks) 데이터베이스 생성
    const tasksDatabase = await createDatabase({
      parent: { page_id: projectOverviewPage.id },
      title: '✅ 작업 목록',
      properties: {
        '이름': { title: {} },
        '상태': {
          select: {
            options: [
              { name: '할 일', color: 'red' },
              { name: '진행 중', color: 'blue' },
              { name: '검토 중', color: 'yellow' },
              { name: '완료', color: 'green' },
            ],
          },
        },
        '우선순위': {
          select: {
            options: [
              { name: '높음', color: 'red' },
              { name: '중간', color: 'yellow' },
              { name: '낮음', color: 'gray' },
            ],
          },
        },
        '마감일': { date: {} },
        '담당자': { people: {} },
        '연결된 이슈': { url: {} },
      },
    });

    console.log('작업 목록 데이터베이스가 생성되었습니다.');

    // 3. 문서(Docs) 데이터베이스 생성
    const docsDatabase = await createDatabase({
      parent: { page_id: projectOverviewPage.id },
      title: '📄 프로젝트 문서',
      properties: {
        '이름': { title: {} },
        '유형': {
          select: {
            options: [
              { name: '기술 문서', color: 'blue' },
              { name: 'API 문서', color: 'purple' },
              { name: '회의록', color: 'green' },
              { name: '기타', color: 'gray' },
            ],
          },
        },
        '상태': {
          select: {
            options: [
              { name: '초안', color: 'yellow' },
              { name: '검토 중', color: 'blue' },
              { name: '완료', color: 'green' },
            ],
          },
        },
        '마지막 수정일': { last_edited_time: {} },
      },
    });

    console.log('문서 데이터베이스가 생성되었습니다.');

    // 4. 팀 멤버 페이지 생성
    const teamPage = await createPage({
      parent: { page_id: projectOverviewPage.id },
      properties: {
        title: [
          {
            text: {
              content: '👥 팀 멤버',
            },
          },
        ],
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '프로젝트에 참여하는 팀원들의 역할과 연락처 정보를 관리합니다.',
                },
              },
            ],
          },
        },
      ],
    });

    console.log('팀 멤버 페이지가 생성되었습니다.');

    // 5. 회의록 페이지 생성
    const meetingsPage = await createPage({
      parent: { page_id: projectOverviewPage.id },
      properties: {
        title: [
          {
            text: {
              content: '📅 회의록',
            },
          },
        ],
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '프로젝트 관련 회의록을 작성하고 관리하는 공간입니다.',
                },
              },
            ],
          },
        },
      ],
    });

    console.log('회의록 페이지가 생성되었습니다.');

    // 6. 링크 모음 페이지 생성
    const linksPage = await createPage({
      parent: { page_id: projectOverviewPage.id },
      properties: {
        title: [
          {
            text: {
              content: '🔗 유용한 링크',
            },
          },
        ],
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '개발 관련' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'GitHub 저장소',
                  link: { url: 'https://github.com/your-username/your-repo' },
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '배포 환경',
                  link: { url: 'https://your-app.vercel.app' },
                },
              },
            ],
          },
        },
      ],
    });

    console.log('링크 모음 페이지가 생성되었습니다.');

    console.log('✅ 프로젝트 관리 템플릿이 성공적으로 생성되었습니다!');
    console.log(`Notion에서 확인하기: ${projectOverviewPage.url}`);

  } catch (error) {
    console.error('템플릿 생성 중 오류가 발생했습니다:', error);
  }
}

// 페이지 생성 헬퍼 함수
async function createPage(pageData) {
  return await notion.pages.create({
    ...pageData,
    children: pageData.children || [],
  });
}

// 데이터베이스 생성 헬퍼 함수
async function createDatabase({ parent, title, properties }) {
  return await notion.databases.create({
    parent,
    title: [
      {
        type: 'text',
        text: {
          content: title,
        },
      },
    ],
    properties,
  });
}

// 실행
if (!process.env.NOTION_API_KEY || !process.env.PARENT_PAGE_ID) {
  console.error('오류: .env 파일에 NOTION_API_KEY와 PARENT_PAGE_ID를 설정해주세요.');
  console.log('예시 파일을 참고하세요: cp .env.example .env');
  process.exit(1);
}

createProjectManagementTemplate();
