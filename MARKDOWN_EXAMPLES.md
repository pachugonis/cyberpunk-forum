# Markdown Examples for Cyberpunk Forum

This document provides examples of markdown syntax you can use in the forum posts, comments, and messages.

## Text Formatting

**Bold text** - use `**bold text**` or `__bold text__`

*Italic text* - use `*italic text*` or `_italic text_`

~~Strikethrough~~ - use `~~strikethrough~~`

**_Bold and italic_** - combine them with `**_text_**`

## Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

## Links

[Link to Google](https://google.com) - use `[Link text](url)`

<https://example.com> - automatic link with `<url>`

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

```markdown
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3
```

### Ordered List
1. First item
2. Second item
3. Third item

```markdown
1. First item
2. Second item
3. Third item
```

### Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

## Code

### Inline Code
Use `inline code` with backticks: `` `code` ``

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('Cyberpunk');
\`\`\`

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("Cyberpunk")
\`\`\`

## Blockquotes

> This is a blockquote
> It can span multiple lines
>
> And have multiple paragraphs

```markdown
> This is a blockquote
> It can span multiple lines
```

## Tables

| Feature | Status | Description |
|---------|--------|-------------|
| Markdown | ✅ | Full support |
| Tables | ✅ | GitHub Flavored |
| Syntax | ✅ | Highlighting |

```markdown
| Feature | Status | Description |
|---------|--------|-------------|
| Markdown | ✅ | Full support |
| Tables | ✅ | GitHub Flavored |
```

## Horizontal Rules

Use three or more dashes, asterisks, or underscores:

---

***

___

```markdown
---
```

## Images

![Cyberpunk Logo](https://via.placeholder.com/150)

```markdown
![Alt text](image-url)
```

## Combining Elements

You can combine different markdown elements:

### Example Post

**Welcome to the Cyberpunk Forum!**

This is a community for discussing:
- Cyberpunk culture
- Technology
- Gaming
- And much more!

Check out our [rules](https://example.com/rules) and enjoy your stay.

> "The street finds its own uses for things." - William Gibson

```javascript
// Example code snippet
const greeting = "Hello, Choom!";
console.log(greeting);
```

---

*Happy posting!* 🚀
