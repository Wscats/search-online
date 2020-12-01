import * as 释义处理 from './翻译/处理'
import * as 自定义词典 from './翻译/自定义词典'
import * as 模型 from './翻译/数据类型'
import * as 词典常量 from './翻译/词典相关常量'
import * as 词典 from './加载词典'

const 词形_原型变换形式 = "原型变换形式"
const 词形类型 = Object.freeze({
  "p": "过去式", // past tense
  "d": "过去分词",
  "i": "现在分词", // -ing
  "3": "第三人称单数",
  "r": "形容词比较级", // -er
  "t": "形容词最高级", // -est
  "s": "名词复数形式",
  "0": "原型",
  "1": 词形_原型变换形式
});

export function 取释义(选中文本: string): 模型.字段释义 {
  let 所有词 = 释义处理.取字段中所有词(选中文本);
  let 所有词条 = [];
  for (let 单词 of 所有词) {
    let 处理后词 = 单词;

    if (处理后词 != 单词.toUpperCase()) {
      处理后词 = 单词.toLowerCase();
    } else {
      // 应付全大写词, 多见于常量, 如SHIPMENT
      // @ts-ignore
      if (!词典.词典数据[处理后词]) {
        处理后词 = 单词.toLowerCase();
      }
    }
    if (处理后词 in 自定义词典.不翻译) {
      // TODO: 使用"单词条"数据结构
      所有词条.push({
        词: 处理后词,
        释义: 处理后词});
      continue;
    }

    // TODO: 重构
    // 仅在命名包含多词时取原型
    if (所有词.length > 1) {
      // @ts-ignore
      处理后词 = 释义处理.取原型(处理后词, 提取词形(词典.词形变化数据[处理后词]));
    }
    // @ts-ignore
    let 所有词形 = 提取词形(词典.词形变化数据[处理后词]);

    // TODO: 使用"单词条"数据结构
    所有词条.push({
      词: 处理后词,
      // @ts-ignore
      释义: 词典.词典数据[处理后词],
      词形: 所有词形
    });
  }
  let 释义 = 选中文本;
  if (所有词条.length > 1) {
    let 短语释义 = 按短语查询(所有词条);
    if (短语释义) {
      释义 = 短语释义;
    } else {
      释义 = 逐词翻译(选中文本, 所有词条, 所有词);
    }
  } else if (所有词条.length == 1) {
    // TODO: 简化词条 (以适应状态栏宽度)
    释义 = 所有词条[0].释义;
  }
  return {
    原字段: 选中文本,
    释义: 释义,
    // @ts-ignore
    各词: 所有词条
  };
}

// @ts-ignore
function 逐词翻译(选中文本, 所有词条, 所有词): string {
  let 释义 = 选中文本;
  let 首选释义 = 释义处理.选取释义(所有词条, 所有词);
  let 各释义 = []
  for (let 序号 = 0; 序号 < 所有词.length; 序号++) {
    let 下一词 = 所有词[序号];
    let 位置 = 释义.indexOf(下一词);

    if (位置 > 0) {
      各释义.push(释义.substring(0, 位置));
    }
    // @ts-ignore
    各释义.push(自定义词典.常用命名[所有词条[序号].词] || 首选释义[序号]);
    释义 = 释义.substring(位置 + 下一词.length);
  }
  if (释义 !== "") {
    各释义.push(释义);
  }
  if (各释义.length > 1 && 各释义[0].indexOf("...") > 0) {
    释义 = 各释义[0].replace("...", 各释义.splice(1).join(""))
  } else {
    释义 = 各释义.join("");
  }
  return 释义;
}

// 词形部分数据格式描述: https://github.com/skywind3000/ECDICT#%E8%AF%8D%E5%BD%A2%E5%8F%98%E5%8C%96
function 提取词形(原字符串: string): 模型.词形变化[] {
  // @ts-ignore
  let 变化 = [];
  if (!原字符串) {
    // @ts-ignore
    return 变化;
  }
  let 词形字段 = 原字符串.split("/");
  for (let 某字段 of 词形字段) {
    let 分段 = 某字段.split(":");

    // @ts-ignore
    let 类型 = 词形类型[分段[0]];
    let 原型变化形式 = [];
    if (类型 == 词形_原型变换形式) {
      for (let 变化形式 of 分段[1]) {
        // @ts-ignore
        原型变化形式.push(词形类型[变化形式]);
      }
    }
    // 如hyphen(vt): s:hyphens/p:hyphened/i:/3:hyphens/d:, i与d内容缺失, 用空字符串占位
    变化.push({
      类型: 类型,
      变化: 分段.length == 1 ? "" : (类型 == 词形_原型变换形式 ? 原型变化形式 : 分段[1])}
    );
  }
  // @ts-ignore
  return 变化;
}

// @ts-ignore
function 按短语查询(所有词条): string {
  let 所有词 = [];
  for (let 词条 of 所有词条) {
    所有词.push(词条.词);
  }
  let 短语 = 所有词.join(" ");
  // @ts-ignore
  return 自定义词典.常用短语[短语] || 释义处理.首选(词典.词典数据[短语], 词典常量.词性_计算机);
}