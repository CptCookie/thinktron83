import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./md";
const parser = new DOMParser();

function parseHTML(html: string) {
  const doc = parser.parseFromString(html, "text/html");
  return Array.from(doc.body.childNodes);
}

describe("Markdown tests for basic line elements", () => {
  it("header 1", () => {
    const mark = renderMarkdown("# text");
    const html = parseHTML("<h1>text</h1>");
    expect(mark).toEqual(html);
  });

  it("header 2", () => {
    const mark = renderMarkdown("## text");
    const html = parseHTML("<h2>text</h2>");
    expect(mark).toEqual(html);
  });

  it("header 3", () => {
    const mark = renderMarkdown("### text");
    const html = parseHTML("<h3>text</h3>");
    expect(mark).toEqual(html);
  });

  it("header 4", () => {
    const mark = renderMarkdown("#### text");
    const html = parseHTML("<h4>text</h4>");
    expect(mark).toEqual(html);
  });

  it("header 5", () => {
    const mark = renderMarkdown("##### text");
    const html = parseHTML("<h5>text</h5>");
    expect(mark).toEqual(html);
  });

  it("header 6", () => {
    const mark = renderMarkdown("###### text");
    const html = parseHTML("<h6>text</h6>");
    expect(mark).toEqual(html);
  });
});

describe("Markdown tests for block elements", () => {
  it("paragraph", () => {
    const mark = renderMarkdown("paragraph");
    const html = parseHTML("<p>paragraph</p>");
    expect(mark).toEqual(html);
  });

  it("paragraph ignored leeding spaces", () => {
    const mark = renderMarkdown("  paragraph");
    const html = parseHTML("<p>paragraph</p>");
    expect(mark).toEqual(html);
  });

  it("paragraph ignored leeding tabs", () => {
    const mark = renderMarkdown("\tparagraph");
    const html = parseHTML("<p>paragraph</p>");
    expect(mark).toEqual(html);
  });

  it("paragraphs single linebreak", () => {
    const mark = renderMarkdown("paragraph 1\nstill paragraph 1");
    const html = parseHTML("<p>paragraph 1\nstill paragraph 1</p>");
    expect(mark).toEqual(html);
  });

  it("2 paragraphs", () => {
    const mark = renderMarkdown("paragraph 1\n\nparagraph 2");
    const html = parseHTML("<p>paragraph 1</p><p>paragraph 2</p>");
    expect(mark).toEqual(html);
  });

  it("2 paragraphs with broader gap ", () => {
    const mark = renderMarkdown("paragraph 1\n\n\nparagraph 2");
    const html = parseHTML("<p>paragraph 1</p><p>paragraph 2</p>");
    expect(mark).toEqual(html);
  });

  it("2 paragraphs with much broader gap ", () => {
    const mark = renderMarkdown("paragraph 1\n\n\n\n\nparagraph 2");
    const html = parseHTML("<p>paragraph 1</p><p>paragraph 2</p>");
    expect(mark).toEqual(html);
  });

  it("2 paragraphs with broader gap ", () => {
    const mark = renderMarkdown("paragraph 1\nstill 1\n\nparagraph 2\nstill 2");
    const html = parseHTML(
      "<p>paragraph 1\nstill 1</p><p>paragraph 2\nstill 2</p>",
    );
    expect(mark).toEqual(html);
  });
});

describe("Markdown tests for inline elements", () => {
  it("link", () => {
    const mark = renderMarkdown("text [link](https://foo.bar) ");
    const html = parseHTML(
      "<p>text <a href='https://foo.bar' target='_blank'>link</a></p>",
    );
    expect(mark).toEqual(html);
  });
});
