---
title: How to write a blog post
date: 2026-11-25
description: A sample post that shows the Markdown you can use. It's a draft, so it only shows while running npm run dev.
tags: Meta, Markdown
draft: true
---

Every post is a Markdown file in `src/posts/`. The file name becomes the URL, so this one lives at `/blog/how-to-write-a-post/`.

## Headings

Use `##` for section headings and `###` for smaller ones.

## Text

Write **bold**, *italic*, and [links to other sites](https://hackaday.com). Links to your own pages, like [my projects](/projects), open without reloading the page.

- Bulleted lists
- work like this

1. Numbered lists
2. work too

> Quotes look like this.

## Images

Put images in `public/blog/` and add them like this:

```md
![What's in the photo](/blog/my-photo.webp)
```

## Code

Inline `code`, or a block:

```cpp
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
}
```

## Publishing

Remove the `draft: true` line (or delete this file), then commit and push. The site rebuilds and the post goes live.
