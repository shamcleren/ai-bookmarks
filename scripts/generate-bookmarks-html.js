#!/usr/bin/env node
/**
 * AI Bookmarks HTML 生成器
 * 
 * 功能：
 * 1. 克隆/更新 ai-bookmarks 仓库
 * 2. 扫描所有日期目录
 * 3. 为缺少 HTML 的日期目录生成详情页和列表页
 * 4. 自动提交并推送（仅当有变更时）
 * 
 * 用法：
 *   node generate-bookmarks-html.js [--dry-run] [--repo /path/to/repo]
 * 
 * 推荐：通过 cron 定期执行，或在 ai_paper_daily.py 抓取数据后调用
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/shamcleren/ai-bookmarks.git';
const DEFAULT_REPO_PATH = '/tmp/ai-bookmarks';

// CLI 参数解析
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const localMode = args.includes('--local') || args.includes('--no-git');
const repoArg = args.find(a => a.startsWith('--repo='));
const repoPath = repoArg ? repoArg.split('=')[1] : DEFAULT_REPO_PATH;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function starRating(ease, useful, hype) {
  if (!ease && !useful && !hype) return '☆☆☆☆☆';
  const avg = ((ease || 0) + (useful || 0) + (hype || 0)) / 3;
  const full = Math.round(avg / 20);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function renderTags(tags) {
  return (tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
}

function makeDetailPage(date, tool) {
  const rating = starRating(tool.easeScore, tool.usefulScore, tool.hypeScore);
  const tagsHtml = renderTags(tool.tags);
  const canTestBadge = tool.canTest ? '<span class="badge badge-test">🤖 可评测</span>' : '';

  let sourceLink = '';
  if (tool.sourceUrl) {
    if (tool.sourceUrl.includes('news.ycombinator.com')) {
      sourceLink = `<a href="${tool.sourceUrl}" class="hn" target="_blank">📰 HN讨论</a>`;
    } else if (tool.sourceUrl.includes('github.com/trending')) {
      sourceLink = `<a href="${tool.sourceUrl}" class="hn" target="_blank">📰 GitHub Trending</a>`;
    } else if (tool.sourceUrl.includes('github.com')) {
      sourceLink = `<a href="${tool.sourceUrl}" class="hn" target="_blank">📰 GitHub</a>`;
    }
  }

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(tool.name)} - AI 工具评测</title>
    <script src="../calendar.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; color: #fff; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .back { color: #666; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 30px; }
        .back:hover { color: #00d9ff; }
        .header { margin-bottom: 40px; padding-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .header h1 { font-size: 1.8rem; margin-bottom: 12px; }
        .links { margin: 10px 0; }
        .links a { color: #00d9ff; text-decoration: none; margin-right: 15px; font-size: 14px; }
        .links a.hn { color: #ff6600; }
        .stars { color: #ffc107; font-size: 28px; letter-spacing: 4px; margin: 15px 0; }
        .tag { display: inline-block; padding: 5px 14px; background: rgba(0,255,136,0.12); color: #00ff88; border-radius: 14px; font-size: 13px; margin-right: 8px; margin-bottom: 8px; }
        .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; }
        .badge-test { background: rgba(138,43,226,0.2); color: #b366ff; }
        .section { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 25px; margin-bottom: 20px; }
        .section h2 { font-size: 1.15rem; color: #00d9ff; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .section p { color: #ccc; line-height: 1.8; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <a href="list.html" class="back">← 返回列表</a>
        <a href="../index.html" class="back" style="margin-left:10px;">🏠 首页</a>
        <div class="header">
            <h1>${escapeHtml(tool.name)}</h1>
            <div class="links">
                ${tool.url ? `<a href="${tool.url}" target="_blank">🔗 原文</a>` : ''}
                ${sourceLink}
            </div>
            <div class="stars">${rating}</div>
            <div>${tagsHtml} ${canTestBadge}</div>
        </div>
        <div class="section">
            <h2>📝 简介</h2>
            <p>${escapeHtml(tool.desc || '暂无描述')}</p>
        </div>
        <div class="section">
            <h2>📊 评测</h2>
            <p><strong>推荐程度：${rating}</strong></p>
            <p>${tool.status === 'rated' && tool.verdict ? escapeHtml(tool.verdict) : '该工具尚未完成实测评测，敬请期待。'}</p>
        </div>
    </div>
</body>
</html>`;
}

function makeListPage(date, tools) {
  const toolsHtmlArr = tools.map(t => {
    const statusTag = t.status === 'rated'
      ? '<span class="tag rated">⭐ 已评测</span>'
      : '<span class="tag pending">待评测</span>';
    const testBadge = t.canTest
      ? '<span class="badge badge-test">🤖 可 AI 评测</span>'
      : '<span class="badge badge-untest">⏳ 暂不支持</span>';
    return `<div class="item"><div class="item-header"><h3><a href="${encodeURIComponent(t.id)}.html" target="_blank">${escapeHtml(t.name)}</a></h3>${statusTag}</div><p class="desc">${escapeHtml(t.desc)}</p><div class="meta">${(t.tags||[]).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}${testBadge}</div><a href="${encodeURIComponent(t.id)}.html" class="btn-detail">查看详情 →</a></div>`;
  });
  const toolsHtmlJson = JSON.stringify(toolsHtmlArr.join(''));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <script src="../calendar.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${date} AI 工具列表 - AI 工具评测</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; color: #fff; padding: 40px 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        .back { color: #666; text-decoration: none; font-size: 14px; display: inline-block; margin-bottom: 30px; }
        .back:hover { color: #00d9ff; }
        h1 { font-size: 1.8rem; margin-bottom: 10px; }
        .subtitle { color: #888; margin-bottom: 30px; }
        .nav { display: flex; justify-content: center; gap: 15px; margin-bottom: 40px; }
        .nav a { color: #888; text-decoration: none; padding: 12px 24px; border-radius: 10px; transition: all 0.3s; }
        .nav a:hover, .nav a.active { color: #00d9ff; background: rgba(0,217,255,0.15); }
        .item { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 20px; margin-bottom: 12px; transition: all 0.3s; border: 1px solid transparent; }
        .item:hover { background: rgba(255,255,255,0.08); border-color: rgba(0,217,255,0.2); }
        .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .item h3 { font-size: 17px; }
        .item h3 a { color: #00d9ff; text-decoration: none; }
        .item h3 a:hover { text-decoration: underline; }
        .item .desc { color: #999; font-size: 14px; line-height: 1.6; margin: 10px 0; }
        .item .meta { display: flex; gap: 10px; font-size: 12px; margin-top: 12px; flex-wrap: wrap; }
        .tag { padding: 4px 12px; background: rgba(0,255,136,0.12); color: #00ff88; border-radius: 12px; font-size: 12px; }
        .tag.rated { background: rgba(255,193,7,0.15); color: #ffc107; }
        .tag.pending { background: rgba(100,100,100,0.2); color: #888; }
        .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; }
        .badge-test { background: rgba(138,43,226,0.2); color: #b366ff; }
        .badge-untest { background: rgba(100,100,100,0.2); color: #666; }
        .btn-detail { display: inline-block; margin-top: 12px; color: #00d9ff; text-decoration: none; font-size: 13px; }
        .btn-detail:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <a href="../index.html" class="back">← 返回首页</a>
        <h1>📅 ${date}</h1>
        <p class="subtitle">本期收录 ${tools.length} 款 AI 工具</p>
        <div class="nav">
            <a href="../index.html">🏠 首页</a>
            <a href="#" data-open-calendar>📅 日历</a>
            <a href="../rank.html">🏆 榜单</a>
        </div>
        <div id="list"></div>
    </div>
    <script>
        fetch('tools.json')
            .then(r => r.json())
            .then(data => {
                document.getElementById('list').innerHTML = ${toolsHtmlJson};
            });
    </script>
</body>
</html>`;
}

function syncAndPull(repoPath) {
  if (!fs.existsSync(repoPath)) {
    if (localMode) {
      throw new Error(`本地仓库不存在: ${repoPath}，请先不使用 --local 运行以克隆仓库`);
    }
    log(`📥 克隆新仓库: ${repoPath}`);
    execSync(`git clone ${REPO_URL} ${repoPath}`, { stdio: 'inherit' });
    return;
  }
  
  if (localMode) {
    log(`📂 使用本地仓库: ${repoPath} (跳过 git 操作)`);
    return;
  }
  
  log(`📂 更新现有仓库: ${repoPath}`);
  try {
    execSync('git fetch origin', { cwd: repoPath, stdio: 'inherit' });
    execSync('git pull origin main --rebase', { cwd: repoPath, stdio: 'inherit' });
  } catch (e) {
    log(`⚠️ Git pull 失败 (可能网络问题)，使用本地版本: ${e.message}`);
  }
}

function generateHtmlForDate(repoPath, date) {
  const dir = path.join(repoPath, date);
  const jsonPath = path.join(dir, 'tools.json');
  const listHtmlPath = path.join(dir, 'list.html');

  if (!fs.existsSync(jsonPath)) {
    return { date, generated: 0, skipped: 'no tools.json' };
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let generated = 0;

  // 生成每个工具的详情页
  data.tools.forEach(tool => {
    const detailPath = path.join(dir, `${tool.id}.html`);
    if (!fs.existsSync(detailPath)) {
      const html = makeDetailPage(date, tool);
      fs.writeFileSync(detailPath, html);
      generated++;
    }
  });

  // 生成列表页（如果不存在）
  if (!fs.existsSync(listHtmlPath)) {
    const html = makeListPage(date, data.tools);
    fs.writeFileSync(listHtmlPath, html);
    generated++;
  }

  return { date, generated, total: data.tools.length };
}

function commitAndPush(repoPath, dryRun) {
  const { status } = require('child_process').spawnSync(
    'git', ['status', '--porcelain'], { cwd: repoPath }
  );
  
  if (!status.toString().trim()) {
    log('✅ 没有变更需要提交');
    return false;
  }

  log('📝 有新文件需要提交...');
  
  if (dryRun) {
    log('🔍 [DRY RUN] 执行以下命令:');
    log('   git add -A');
    log('   git commit -m "fix: 自动生成详情页 HTML"');
    log('   git push origin main');
    return true;
  }

  try {
    execSync('git add -A', { cwd: repoPath, stdio: 'inherit' });
    execSync('git commit -m "fix: 自动生成详情页 HTML"', { cwd: repoPath, stdio: 'inherit' });
    execSync('git push origin main', { cwd: repoPath, stdio: 'inherit', timeout: 60000 });
    log('✅ 已推送至 GitHub');
    return true;
  } catch (e) {
    log('⚠️ 推送失败，可能是远程有新提交，尝试 pull 后重试...');
    try {
      execSync('git pull origin main --rebase', { cwd: repoPath, stdio: 'inherit' });
      execSync('git push origin main', { cwd: repoPath, stdio: 'inherit', timeout: 60000 });
      log('✅ pull 后推送成功');
      return true;
    } catch (e2) {
      log('❌ 推送失败: ' + e2.message);
      return false;
    }
  }
}

function main() {
  log('🚀 AI Bookmarks HTML 生成器启动');
  
  if (dryRun) {
    log('⚠️ 运行在 DRY RUN 模式，不会实际提交或推送');
  }

  // 1. 同步仓库
  syncAndPull(repoPath);

  // 2. 扫描所有日期目录
  const entries = fs.readdirSync(repoPath);
  const dateDirs = entries.filter(e => {
    return fs.statSync(path.join(repoPath, e)).isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e);
  });

  log(`📅 发现 ${dateDirs.length} 个日期目录`);

  // 3. 为每个日期生成 HTML
  const results = [];
  for (const date of dateDirs.sort()) {
    const result = generateHtmlForDate(repoPath, date);
    results.push(result);
    if (result.generated > 0) {
      log(`   ${date}: 生成了 ${result.generated} 个文件 (共 ${result.total} 个工具)`);
    }
  }

  const totalGenerated = results.reduce((sum, r) => sum + (r.generated || 0), 0);
  if (totalGenerated === 0) {
    log('✅ 所有日期目录都已生成 HTML，无需更新');
    return;
  }

  // 4. 提交并推送
  log('📤 提交变更...');
  commitAndPush(repoPath, dryRun);
  
  log('✅ 完成！');
  log(`   总共生成了 ${totalGenerated} 个 HTML 文件`);
}

// 运行
main();
