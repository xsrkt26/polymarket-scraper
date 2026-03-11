#!/usr/bin/env node
/**
 * Polymarket 数据获取 - 方案 C: 直接调用内部 API
 * 
 * 策略: 不使用浏览器,直接分析并调用 Polymarket 的 GraphQL/REST API
 */

const https = require('https');
const http = require('http');

// 在 GitHub Actions 环境中不需要绕过 SSL
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://polymarket.com',
        'Referer': 'https://polymarket.com/',
        ...options.headers
      },
      ...options
    };

    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[${res.statusCode}] ${url}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.abort();
      reject(new Error('Timeout'));
    });
  });
}

async function tryPolymarketAPIs() {
  console.log('🔍 尝试发现 Polymarket API...\n');
  
  const endpoints = [
    // CLOB (Central Limit Order Book) API
    {
      name: 'CLOB Markets',
      url: 'https://clob.polymarket.com/markets',
      params: '?limit=30&active=true'
    },
    // Gamma API
    {
      name: 'Gamma Events',
      url: 'https://gamma-api.polymarket.com/events',
      params: '?limit=30&closed=false'
    },
    {
      name: 'Gamma Markets',  
      url: 'https://gamma-api.polymarket.com/markets',
      params: '?limit=30'
    },
    // Strapi CMS API
    {
      name: 'Strapi Markets',
      url: 'https://strapi-matic.poly.market/markets',
      params: '?_limit=30&_sort=volume:DESC'
    },
    // 探测 GraphQL
    {
      name: 'GraphQL',
      url: 'https://api.polymarket.com/graphql',
      method: 'POST'
    }
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 测试: ${endpoint.name}`);
      const fullUrl = endpoint.url + (endpoint.params || '');
      
      const data = await httpsGet(fullUrl);
      
      console.log(`✅ ${endpoint.name} 成功!`);
      console.log(`   数据类型: ${typeof data}`);
      
      if (Array.isArray(data)) {
        console.log(`   返回 ${data.length} 条记录`);
        if (data.length > 0) {
          console.log(`   示例字段: ${Object.keys(data[0]).slice(0, 5).join(', ')}`);
        }
      } else if (typeof data === 'object') {
        console.log(`   字段: ${Object.keys(data).slice(0, 10).join(', ')}`);
      }
      
      results.push({
        endpoint: endpoint.name,
        url: fullUrl,
        success: true,
        data: data
      });
      
      console.log('');
      break; // 找到一个可用的就停止
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} 失败: ${error.message}\n`);
    }
  }

  return results;
}

async function fetchPolymarketData() {
  const results = await tryPolymarketAPIs();
  
  if (results.length === 0) {
    throw new Error('所有 API 端点均不可用');
  }

  return results[0];
}

function formatMarketReport(apiResult) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN');
  const timeStr = now.toLocaleTimeString('zh-CN');
  
  let report = `📊 **Polymarket 市场动向**\n`;
  report += `📅 日期: ${dateStr}\n`;
  report += `⏰ 生成时间: ${timeStr}\n`;
  report += `🔌 数据源: ${apiResult.endpoint}\n`;
  report += `\n`;

  const data = apiResult.data;
  
  if (Array.isArray(data)) {
    report += `🔥 TOP ${Math.min(30, data.length)} 市场:\n\n`;
    
    data.slice(0, 30).forEach((market, i) => {
      const title = market.question || market.title || market.description || 'N/A';
      const volume = market.volume || market.volume24hr || market.volumeNum || 0;
      const liquidity = market.liquidity || market.liquidityNum || 0;
      
      report += `${i + 1}. ${title}\n`;
      
      if (volume > 0) {
        report += `   💰 交易量: $${Number(volume).toLocaleString('en-US', {maximumFractionDigits: 0})}\n`;
      }
      
      if (liquidity > 0) {
        report += `   💧 流动性: $${Number(liquidity).toLocaleString('en-US', {maximumFractionDigits: 0})}\n`;
      }
      
      // 尝试提取赔率
      if (market.outcomes || market.tokens) {
        const outcomes = market.outcomes || market.tokens || [];
        if (outcomes.length === 2) {
          const yes = outcomes[0];
          const no = outcomes[1];
          const yesPrice = yes.price || yes.last_price || 0;
          const noPrice = no.price || no.last_price || 0;
          
          if (yesPrice > 0 || noPrice > 0) {
            report += `   📈 Yes: ${(yesPrice * 100).toFixed(1)}% | No: ${(noPrice * 100).toFixed(1)}%\n`;
          }
        }
      }
      
      // 类别
      if (market.category || market.tag) {
        report += `   🏷️  类别: ${market.category || market.tag}\n`;
      }
      
      report += `\n`;
    });
  } else {
    report += `⚠️ 数据格式异常\n`;
    report += JSON.stringify(data, null, 2).slice(0, 500);
  }

  return report;
}

async function main() {
  console.log('🚀 Polymarket 数据抓取器 (API 方案)\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    const apiResult = await fetchPolymarketData();
    
    // 保存原始数据
    const fs = require('fs');
    const timestamp = new Date().toISOString().split('T')[0];
    const dataFile = `polymarket_data_${timestamp}.json`;
    fs.writeFileSync(dataFile, JSON.stringify(apiResult, null, 2));
    console.log(`💾 原始数据已保存: ${dataFile}\n`);
    
    // 生成报告
    const report = formatMarketReport(apiResult);
    
    console.log('='.repeat(60));
    console.log(report);
    console.log('='.repeat(60));
    
    // 保存报告
    const reportFile = `polymarket_report_${timestamp}.txt`;
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 报告已保存: ${reportFile}`);
    
    return { success: true, report, data: apiResult };
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  main().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { fetchPolymarketData, formatMarketReport };
