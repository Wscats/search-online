# 特性

<a href="https://marketplace.visualstudio.com/items?itemName=Wscats.search"><img src="https://img.shields.io/badge/Download-+-orange" alt="Download" /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=Wscats.search"><img src="https://img.shields.io/badge/Macketplace-v1.X-brightgreen" alt="Macketplace" /></a>
<a href="https://github.com/Wscats/search-online"><img src="https://img.shields.io/badge/Github Page-Wscats-yellow" alt="Github Page" /></a>
<a href="https://github.com/Wscats"><img src="https://img.shields.io/badge/Author-Eno Yao-blueviolet" alt="Eno Yao" /></a>

[English](https://github.com/Wscats/search-online/blob/master/README.md) | [中文](https://gitee.com/wscats/search-online/blob/master/README.CN.md)

一款让您在代码中进行搜索或者翻译的 VS Code 插件。

# 使用

## 搜索

你可以在编辑器中，选中代码中对应的关键词，然后点击鼠标右键，在出现的菜单面板中选择 `Search Online` 菜单项，插件会自动帮你打开默认浏览器，并搜索对应的关键词和显示搜索结果。

你还可以选中对应的关键词后，使用快捷键 `cmd+enter(mac)` / `ctrl+enter(win)` 去打开浏览器进行搜索。

![img](./img/2.gif?raw=true)

## 翻译

你可以在编辑器中，选中代码中对应的关键词，然后点击鼠标右键，在出现的菜单面板中选择 `Traslate Online` 菜单项，插件会自动帮你打开默认浏览器，并进入谷歌翻译搜索，搜索对应的关键词的翻译结果。

你还可以选中对应的关键词后，使用快捷键 `cmd+shift+enter(mac) / ctrl+shift+enter(win)` 去打开浏览器进行翻译。

![img](./img/1.gif?raw=true)

支持离线词典的搜索，只需打开设置 `search-online.show-status-bar` 为 `true` 把开关打开(默认关闭)，选中代码中的关键词，翻译结果会出现在底部栏右下角，如果你想查看更详细的翻译结果，可以点击底部栏右下角的中文翻译结果，此时会打开你的默认浏览器进行线上翻译。

```json
{
  "search-online.show-status-bar": true
}
```

![img](./img/8.png?raw=true)

# 切换搜索引擎

如果你有需要，你可以切换不同的搜索引擎，只需要点击在编辑器底部栏右侧 `Search Engine`，然后在弹窗选项中选择你需要的搜索引擎即可切换。

![img](./img/3.gif?raw=true)

你还可以在右键菜单栏中选择 `Search Online By Switch Engine`菜单项，直接切换对应的搜索引擎进行搜索。

![img](./img/4.gif?raw=true)

如果预设的搜索引擎地址不能满足你的使用，你可以手动更新搜索引擎地址，进入插件的 `Extesion Settings` 里设置即可。

![img](./img/5.png?raw=true)

默认的各搜索引擎地址格式如下：

> 注意：使用 `%SELECTION%` 来替换搜索引擎选中的关键词.

| Engine       | Url                                             |
| ------------ | ----------------------------------------------- |
| Google       | https://www.google.com/search?q=%SELECTION%     |
| Bing         | https://www.bing.com/search?q=%SELECTION%       |
| Github       | https://www.github.com/search?q=%SELECTION%     |
| Baidu        | https://www.baidu.com/search?q=%SELECTION%      |
| Npm          | https://www.npmjs.com/search?q=%SELECTION%      |
| Yahoo        | https://search.yahoo.com/search?p=%SELECTION%   |
| Wiki         | https://wikipedia.org/wiki/%SELECTION%          |
| Duck         | https://duckduckgo.com/?q=%SELECTION%           |
| Code Pen     | https://codepen.io/search/pens?q=%SELECTION%    |
| Code Sandbox | https://codesandbox.io/search?query=%SELECTION% |

你还可以通过修改 `.vscode/setting.json` 文件，来设置默认搜索引擎，例如修改 `search-online.search-engine` 的配置参数为 `Bing`，即可使用 `Bing` 作为默认搜索引擎来搜索。

```json
{
  "search-online.search-engine": "Bing"
}
```

通过更改 `.vscode/setting.json` 文件的 `search-online.add-search-engine` 的配置参数，可以添加额外的搜索引擎。

```json
{
  "search-online.add-search-engine": [
    {
      "name": "Visual Studio Marketplace",
      "url": "https://marketplace.visualstudio.com/search?term=%SELECTION%&target=VSCode"
    },
    {
      "name": "Pypi",
      "url": "https://pypi.org/search/?q=%SELECTION%"
    }
  ]
}
```

你还可以通过可视化界面来增加搜索引擎，在切换引擎的面板底部点击 `➕ Add Search Engine`，然后会出现两次输入框，分别填入如以下内容，即可增加搜索引擎 ↓

> name: Visual Studio Marketplace

> url: https://marketplace.visualstudio.com/search?term=%SELECTION%&target=VSCode

![img](./img/6.png?raw=true)

# 切换翻译引擎

你在设置面板更改需要翻译的语言，默认设置是英文翻译成中文。

![img](./img/7.png?raw=true)

# 鸣谢

<b><details><summary>开发团队</summary></b>

| [<img src="https://avatars1.githubusercontent.com/u/17243165?s=460&v=4" width="60px;"/><br /><sub>Eno Yao</sub>](https://github.com/Wscats) | [<img src="https://avatars0.githubusercontent.com/u/30444763?s=200&v=4" width="60px;"/><br /><sub>中文编程</sub>](https://github.com/program-in-chinese) |
| - | - |

</details>

如果插件对您有帮助，恳请您在 [**插件商城**](https://marketplace.visualstudio.com/items?itemName=Wscats.search&ssr=false#review-details) 中给我们一个五星好评，您的鼓励是我前进的最大动力！

如果您有任何问题和建议，您可以进入该 [**链接**](https://github.com/Wscats/search-online/issues/new) 留言，我会尽快回复您。
