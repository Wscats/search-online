import * as 模型 from './数据类型'
import * as 词典常量 from './词典相关常量'

export function 取按词性释义(中文释义: string): Map<string, string[]> {
  let 所有释义 = 中文释义.split('\\n');
  let 词性到释义 = new Map<string, string[]>();
  for (let i in 所有释义) {
    let 除去词性 = 所有释义[i];
    let 首空格位置 = 除去词性.indexOf(' ');
    let 当前词性 = 首空格位置 > 0 ? 除去词性.substring(0, 首空格位置) : '';
    if (当前词性 && 词典常量.词性.has(当前词性)) {
      除去词性 = 除去词性.substring(当前词性.length).trim();
    } else {
      当前词性 = '';
    }

    // 按逗号分隔词义
    // TODO: 也有分号分隔
    let 词义 = 除去词性.split(/[；;,]/);
    let 此词性的释义: string[] = []
    for (let 某词义 of 词义) {
      此词性的释义.push(某词义.trim());
    }
    词性到释义.set(当前词性, 此词性的释义);
  }
  return 词性到释义;
}

export function 选取释义(所有词条: 模型.单词条[], 所有词: string[]): string[] {
  let 所有释义 = [];

  // TODO: 重构
  if (所有词条.length == 2) {
    let 词1释义 = 所有词条[0].释义;
    let 词2释义 = 所有词条[1].释义;
    if (词1释义 && 取按词性释义(词1释义).has(词典常量.词性_形容词)
      && 词2释义 && 取按词性释义(词2释义).has(词典常量.词性_名词)) {
      所有释义.push(首选(词1释义, 词典常量.词性_形容词));
      所有释义.push(首选(词2释义, 词典常量.词性_名词));
      return (所有释义);
    }
  }

  for (let i = 0; i < 所有词条.length; i++) {
    let 词条 = 所有词条[i];
    所有释义.push(词条.释义 ? 首选(词条.释义, 词典常量.词性_计算机) : 所有词[i]);
  }
  return 所有释义;
}

export function 首选(中文释义: string, 首选词性: string): string {
  if (!中文释义) {
    return "";
  }
  let 首选词义 = "";

  // TODO: 减少重复调用
  let 词性到释义 = 取按词性释义(中文释义);
  if (词性到释义.has(词典常量.词性_计算机)) {
    // @ts-ignore
    首选词义 = 词性到释义.get(词典常量.词性_计算机)[0];
  } else if (词性到释义.has(首选词性)) {
    // @ts-ignore
    首选词义 = 词性到释义.get(首选词性)[0];
  } else {
    // 取第一个词性的第一释义
    for (let [k, v] of 词性到释义) {
      首选词义 = v[0];
      break;
    }
  }
  首选词义 = 消除所有括号内容(首选词义);
  return 首选词义;
}

// @ts-ignore
export function 取原型(词: string, 词形): string {
  if (词形) {
    let 原词 = 词;
    let 为复数形式 = false;
    for (let 某词形 of 词形) {
      if (某词形.类型 == "原型变换形式" && (某词形.变化.includes("名词复数形式") || 某词形.变化.includes("现在分词"))) {
        为复数形式 = true;
      }
      if (某词形.类型 == "原型") {
        原词 = 某词形.变化;
      }
    }
    if (为复数形式) {
      return 原词;
    }
  }
  return 词;
}

///////////////// 原文本处理


// 假设每个字段除了词, 其他都是非英文字符.
// 仅翻译无空格的片段
export function 取字段中所有词(字段文本: string): string[] {
  // 删去所有前后空格后再提取单词
  let 删除前后空格 = 字段文本.trim();
  // 确认无空格
  if (!删除前后空格.match(/^[^\s]+$/g)) {
    return [];
  }
  let 单词 = 删除前后空格.match(/[a-zA-Z]+/g);
  if (单词) {
    // @ts-ignore
    let 分词 = [];
    for (let 某单词 of 单词) {
      // @ts-ignore
      分词 = 分词.concat(拆分骆驼命名(某单词))
    }
    return 分词;
  }
  return [];
}

function 拆分骆驼命名(命名: string): string[] {
  // 参考: https://stackoverflow.com/a/46409373/1536803
  // Firefox仍不支持lookbehinds: https://stackoverflow.com/questions/49816707/firefox-invalid-regex-group
  // 不知为何结果中有空字符串, 暂时过滤即可
  return 命名.split(/([A-Z]+|[A-Z]?[a-z]+)(?=[A-Z]|\b)/).filter(词 => 词);
}

function 消除所有括号内容(中文释义: string): string {
  // 不确定是否存在多个括号的情况: 清理后.replace(/ *（[^）]*） */g, ""); //
  let 清理后 = 消除括号内容(中文释义, "（", "）");
  清理后 = 消除英文小括号内容(清理后);
  清理后 = 清理后.replace(/ *\[[^)]*\] */g, "");
  return 清理后.trim();
}

export function 消除英文小括号内容(字符串: string): string {
  return 字符串.replace(/ *\([^)]*\) */g, "");
}

function 消除括号内容(中文释义: string, 开括号: string, 闭括号: string): string {
  let 开括号位置 = 中文释义.indexOf(开括号);
  let 闭括号位置 = 中文释义.indexOf(闭括号);
  if (开括号位置 == -1 || 闭括号位置 == -1) {
    return 中文释义;
  }
  let 括号内容 = 中文释义.substring(开括号位置, 闭括号位置 + 1);
  return 中文释义.replace(括号内容, "");
}