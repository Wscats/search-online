# Feature

<a href="https://marketplace.visualstudio.com/items?itemName=Wscats.search"><img src="https://img.shields.io/badge/Download-+-orange" alt="Download" /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=Wscats.search"><img src="https://img.shields.io/badge/Macketplace-v1.X-brightgreen" alt="Macketplace" /></a>
<a href="https://github.com/Wscats/search-online"><img src="https://img.shields.io/badge/Github Page-Wscats-yellow" alt="Github Page" /></a>
<a href="https://github.com/Wscats"><img src="https://img.shields.io/badge/Author-Eno Yao-blueviolet" alt="Eno Yao" /></a>

A simple extension for VSCode to search or translate online easily using different engine.

# How To Use

## Search

You can select a keyword in the code, right-click to open the drop-down menu, select `Search Online`, it will automatically open the browser for you and search for related content.

Or select a keyword in the code, use the shortcut key `cmd+q(mac)` / `ctrl+q(win)` to open the browser search results.

<!-- ![img](./img/2.gif?raw=true) -->
![2](https://user-images.githubusercontent.com/17243165/100498121-06e07f80-319b-11eb-90d5-68ab242824f1.gif)

## Translate

You can select a keyword in the code, right-click the drop-down menu and select `Traslate Online`, it will automatically open the browser and use Google Translate to help you translate the content.

Or select a keyword in the code, use the shortcut key `cmd+r(mac) / ctrl+r(win)` to translate the content.

<!-- ![img](./img/1.gif?raw=true) -->
![1](https://user-images.githubusercontent.com/17243165/100498131-152e9b80-319b-11eb-82d1-4296aaf9f12f.gif)

# Switch Search Engine

You can switch between different search engines according to your needs, just click `Search Engine` in the bottom bar of vscode, and you can switch search engines. Google search used by the search engine by default.

<!-- ![img](./img/3.gif?raw=true) -->
![3](https://user-images.githubusercontent.com/17243165/100498140-24154e00-319b-11eb-94f6-a2c14d33863c.gif)


Or, you can right-click to open the drop-down menu after selecting the keywords, and click `Search Online By Switch Engine`, you can switch the engine to search results.

<!-- ![img](./img/4.gif?raw=true) -->
![4](https://user-images.githubusercontent.com/17243165/100498152-35f6f100-319b-11eb-8e96-fef096c8c75f.gif)


If necessary, you can change the request address of the search engine.

<!-- ![img](./img/5.png?raw=true) -->
<img alt="5" src="https://user-images.githubusercontent.com/17243165/100498217-9c7c0f00-319b-11eb-8fa3-6235597f4f3f.png">


The default request address format for each search is as follows. Note that the keywords searched in the link use `%SELECTION%` instead.

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

Or modify the `.vscode/setting.json` file to change the default search engine. For example, modify to the following configuration, then every time you click on `Search Online`, you will use `Bing` to search for related content.

```json
{
  "search-online.search-engine": "Bing"
}
```

Or modify the `.vscode/setting.json` file to add a new search engine. For example, by modifying `.vscode/setting.json` below, two new search engines, Visual Studio Marketplace and Pypi, are added.

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

You can also use the add search engine option to manually add a search engine, you need to provide the name and search address, for example↓.

> name: Visual Studio Marketplace

> url: https://marketplace.visualstudio.com/search?term=%SELECTION%&target=VSCode

<!-- ![img](./img/6.png?raw=true) -->
<img alt="6" src="https://user-images.githubusercontent.com/17243165/100498209-8c642f80-319b-11eb-81d7-5a8cf9544618.png">


# Switch Language Engine

You can change the translation language configuration item of the extension to help you translate different texts.

<!-- ![img](./img/7.png?raw=true) -->
<img alt="7" src="https://user-images.githubusercontent.com/17243165/100498226-ae5db200-319b-11eb-9a3f-993e82b4c304.png">

# Thanks

<b><details><summary>Author Of Tencent Alloyteam Team</summary></b>
| [<img src="https://avatars1.githubusercontent.com/u/17243165?s=460&v=4" width="60px;"/><br /><sub>Eno Yao</sub>](https://github.com/Wscats) |
| - |
</details>

If the extension can help you, please enter the [Rating & Review](https://marketplace.visualstudio.com/items?itemName=Wscats.search&ssr=false#review-details) link to give me a five-star praise.

If you have any questions or suggestions during use, please leave a message in the [issue](https://github.com/Wscats/search-online/issues/new).
