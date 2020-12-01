export interface 词形变化 {
  类型: string;
  变化: string;
}

export interface 单词条 {
  词: string;
  释义: string;
  词形: 词形变化[];
}

export interface 字段释义 {
  原字段: string;
  释义: string;
  各词: 单词条[];
}
