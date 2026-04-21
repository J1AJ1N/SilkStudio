# GitHub Pages 发布说明

这个项目已经配置好 GitHub Pages 自动发布。

## 你需要做什么

1. 在 GitHub 新建一个 repository，比如 `silk-studio-web`。
2. 把本项目上传到这个 repository。
3. 打开 GitHub repository 的 `Settings`。
4. 进入 `Pages`。
5. 在 `Build and deployment` 里把 `Source` 选择为 `GitHub Actions`。
6. 回到 repository 的 `Actions` 页面，等待 `Deploy to GitHub Pages` 跑完。

## 网页链接格式

如果你的 GitHub 用户名是：

```text
your-name
```

repository 名字是：

```text
silk-studio-web
```

别人打开这个链接就能访问网页：

```text
https://your-name.github.io/silk-studio-web/
```

## 以后怎么更新网页

以后只要你修改代码，然后 push 到 GitHub 的 `main` 分支，GitHub Actions 会自动重新发布网页。
