const { Client } = require('@notionhq/client');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

// GitHub API 클라이언트 초기화
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// GitHub 컨텍스트
const context = github.context;
const { payload, eventName } = context;

// 로깅 설정
const log = (message, data = '') => {
  console.log(`[${new Date().toISOString()}] ${message}`, data || '');
};

// 에러 핸들링
const handleError = (error) => {
  core.setFailed(`Error: ${error.message}`);
  log('Error details:', error);
  process.exit(1);
};

/**
 * 데이터베이스에서 페이지 검색
 */
async function findPageInDatabase(databaseId, uniqueId) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Unique ID',
        rich_text: {
          equals: uniqueId,
        },
      },
    });
    return response.results[0];
  } catch (error) {
    log('Error finding page in database:', error.message);
    return null;
  }
}

/**
 * 새 페이지 생성
 */
async function createPage(databaseId, properties, content = []) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        ...properties,
        'Source': {
          select: { name: 'GitHub' }
        },
        'Last Synced': {
          date: { start: new Date().toISOString() }
        }
      },
      children: content,
    });
    log('✅ Page created:', response.url);
    return response;
  } catch (error) {
    log('❌ Error creating page:', error.message);
    throw error;
  }
}

/**
 * 기존 페이지 업데이트
 */
async function updatePage(pageId, properties, content = []) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: {
        ...properties,
        'Last Synced': {
          date: { start: new Date().toISOString() }
        }
      },
    });
    
    // 페이지 내용 업데이트 (별도 API 호출 필요)
    if (content && content.length > 0) {
      await updatePageContent(pageId, content);
    }
    
    log('🔄 Page updated:', response.url);
    return response;
  } catch (error) {
    log('❌ Error updating page:', error.message);
    throw error;
  }
}

/**
 * 페이지 내용 업데이트
 */
async function updatePageContent(pageId, blocks) {
  try {
    // 기존 블록 삭제
    let hasMore = true;
    let startCursor = undefined;
    
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: startCursor,
        page_size: 100,
      });
      
      // 블록 삭제
      for (const block of response.results) {
        await notion.blocks.delete({
          block_id: block.id,
        });
      }
      
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }
    
    // 새 블록 추가 (100개씩 나누어서 추가)
    const chunkSize = 100;
    for (let i = 0; i < blocks.length; i += chunkSize) {
      const chunk = blocks.slice(i, i + chunkSize);
      await notion.blocks.children.append({
        block_id: pageId,
        children: chunk,
      });
    }
    
    log('📝 Page content updated');
  } catch (error) {
    log('❌ Error updating page content:', error.message);
    throw error;
  }
}

/**
 * GitHub 이슈를 Notion 작업 카드로 변환
 */
async function syncIssueToNotion(issue, repository) {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.');
  }

  const uniqueId = `issue_${issue.number}`;
  const issueUrl = issue.html_url || `${repository.html_url}/issues/${issue.number}`;
  
  // 이슈 라벨에서 상태 매핑 (라벨이 없으면 'To Do'로 기본값 설정)
  const statusMap = {
    'bug': '버그',
    'enhancement': '개선',
    'feature': '기능',
    'documentation': '문서'
  };
  
  const defaultStatus = 'To Do';
  const issueStatus = issue.labels && issue.labels.length > 0 
    ? statusMap[issue.labels[0].name.toLowerCase()] || defaultStatus
    : defaultStatus;

  // Notion 페이지 속성 설정
  const pageProperties = {
    'Unique ID': { 
      rich_text: [{ 
        text: { 
          content: uniqueId 
        } 
      }] 
    },
    'Name': { 
      title: [{ 
        text: { 
          content: `[이슈 #${issue.number}] ${issue.title}`
        } 
      }] 
    },
    'Type': { 
      select: { 
        name: '이슈' 
      } 
    },
    'Status': { 
      select: { 
        name: issueStatus 
      } 
    },
    'Repository': { 
      rich_text: [{ 
        text: { 
          content: repository.full_name 
        } 
      }] 
    },
    'URL': { 
      url: issueUrl 
    },
    'Created At': { 
      date: { 
        start: issue.created_at 
      } 
    },
    'Updated At': { 
      date: { 
        start: issue.updated_at || new Date().toISOString() 
      } 
    }
  };

  // 담당자가 있으면 추가
  if (issue.assignee) {
    pageProperties['Assignee'] = {
      rich_text: [{
        text: {
          content: issue.assignee.login
        }
      }]
    };
  }

  // 이슈 본문을 Notion 블록으로 변환
  let contentBlocks = [];
  if (issue.body) {
    contentBlocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: {
            content: issue.body
          }
        }]
      }
    });
  }

  // 페이지가 이미 존재하는지 확인
  const existingPage = await findPageInDatabase(databaseId, uniqueId);
  
  if (existingPage) {
    // 기존 페이지 업데이트
    log(`Updating existing issue card: #${issue.number}`);
    await updatePage(existingPage.id, pageProperties, contentBlocks);
  } else {
    // 새 페이지 생성
    log(`Creating new issue card: #${issue.number}`);
    await createPage(databaseId, pageProperties, contentBlocks);
  }
}

/**
 * GitHub 이벤트를 Notion에 동기화
 */
async function syncToNotion() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID 환경 변수가 설정되지 않았습니다.');
    }

    log(`Processing ${eventName} event...`);
    log('Event payload:', JSON.stringify(payload, null, 2));

    let pageProperties = {};
    let contentBlocks = [];
    let uniqueId = '';

    // 이벤트 유형에 따라 처리
    switch (eventName) {
      case 'issues':
        // 이슈 이벤트 처리 (열기, 닫기, 재오픈, 할당 등)
        if (['opened', 'edited', 'reopened', 'assigned', 'unassigned', 'labeled', 'unlabeled'].includes(payload.action)) {
          await syncIssueToNotion(payload.issue, payload.repository);
        } else if (payload.action === 'deleted') {
          // 이슈 삭제 시 Notion에서도 제거 (선택사항)
          log(`Issue #${payload.issue.number} was deleted`);
        }
        return;
        
      case 'issue_comment':
        // 이슈 코멘트 이벤트 처리 (코멘트 추가, 수정, 삭제)
        if (['created', 'edited'].includes(payload.action)) {
          await syncIssueToNotion(payload.issue, payload.repository);
        }
        return;
        
      case 'push':
        // 푸시 이벤트 처리
        const branch = payload.ref.split('/').pop();
        const commit = payload.head_commit || (payload.commits && payload.commits[0]) || {};
        uniqueId = `push_${payload.after || Date.now()}`;
        
        pageProperties = {
          'Unique ID': { rich_text: [{ text: { content: uniqueId } }] },
          'Title': { 
            title: [{ 
              text: { 
                content: `Push to ${branch}: ${commit.message?.split('\n')[0] || 'No message'}` 
              } 
            }] 
          },
          'Type': { select: { name: 'Push' } },
          'Status': { select: { name: 'Pushed' } },
          'Repository': { rich_text: [{ text: { content: payload.repository?.full_name || 'Unknown' } }] },
          'Branch': { rich_text: [{ text: { content: branch } }] },
          'Commit Count': { number: payload.commits?.length || 0 },
          'URL': { url: commit.url || payload.repository?.html_url || '' },
          'Author': { rich_text: [{ text: { content: commit.author?.name || payload.sender?.login || 'Unknown' } }] },
          'Created At': { date: { start: commit.timestamp || new Date().toISOString() } }
        };

        // 커밋 메시지가 있으면 내용으로 추가
        if (commit.message) {
          contentBlocks = [{
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: commit.message } }]
            }
          }];
        }
        break;

      case 'pull_request':
        // PR 이벤트 처리
        const pr = payload.pull_request || payload;
        uniqueId = `pr_${pr.number}`;
        const prStatus = payload.action === 'closed' ? 
          (pr.merged ? 'Merged' : 'Closed') : 
          pr.state.charAt(0).toUpperCase() + pr.state.slice(1);
        
        pageProperties = {
          'Unique ID': { rich_text: [{ text: { content: uniqueId } }] },
          'Title': { 
            title: [{ 
              text: { content: `PR #${pr.number}: ${pr.title}` } 
            }] 
          },
          'Type': { select: { name: 'Pull Request' } },
          'Status': { select: { name: prStatus } },
          'Repository': { rich_text: [{ text: { content: payload.repository?.full_name || 'Unknown' } }] },
          'URL': { url: pr.html_url },
          'Author': { rich_text: [{ text: { content: pr.user?.login || 'Unknown' } }] },
          'Created At': { date: { start: pr.created_at } },
          'Updated At': { date: { start: pr.updated_at || new Date().toISOString() } }
        };

        // PR 본문 추가
        if (pr.body) {
          contentBlocks = [{
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: pr.body } }]
            }
          }];
        }
        break;

      case 'issues':
        // 이슈 이벤트 처리
        const issue = payload.issue || payload;
        uniqueId = `issue_${issue.number}`;
        
        pageProperties = {
          'Unique ID': { rich_text: [{ text: { content: uniqueId } }] },
          'Title': { 
            title: [{ 
              text: { content: `Issue #${issue.number}: ${issue.title}` } 
            }] 
          },
          'Type': { select: { name: 'Issue' } },
          'Status': { 
            select: { 
              name: issue.state === 'open' ? 'Open' : 'Closed'
            } 
          },
          'Repository': { rich_text: [{ text: { content: payload.repository?.full_name || 'Unknown' } }] },
          'URL': { url: issue.html_url },
          'Author': { rich_text: [{ text: { content: issue.user?.login || 'Unknown' } }] },
          'Created At': { date: { start: issue.created_at } },
          'Updated At': { date: { start: issue.updated_at || new Date().toISOString() } }
        };

        // 이슈 본문 추가
        if (issue.body) {
          contentBlocks = [{
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ type: 'text', text: { content: issue.body } }]
            }
          }];
        }
        break;

      default:
        log(`Unhandled event type: ${eventName}`);
        return;
    }

    // 페이지가 이미 존재하는지 확인
    const existingPage = await findPageInDatabase(databaseId, uniqueId);
    
    if (existingPage) {
      // 기존 페이지 업데이트
      log(`Updating existing page: ${uniqueId}`);
      await updatePage(existingPage.id, pageProperties, contentBlocks);
    } else {
      // 새 페이지 생성
      log(`Creating new page: ${uniqueId}`);
      await createPage(databaseId, pageProperties, contentBlocks);
    }
    
    log('✅ Sync completed successfully');
  } catch (error) {
    handleError(error);
  }
}

// 실행
syncToNotion().catch(console.error);
