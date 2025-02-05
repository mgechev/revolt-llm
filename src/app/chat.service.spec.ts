import { streamingParser } from "./chat.service";

describe("streaming parser", () => {
  it("should buffer symbols", () => {
    const parser = streamingParser();
    parser.write("<revolt-res");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("");

    parser.write("ponse>");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("");

    parser.write("<revolt-explanation>");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("");

    const parser2 = streamingParser();
    parser2.write(`<revolt-response>
    <revolt-explanation>`);
    expect(parser2.code()).toBe("");
    expect(parser2.explanation()).toBe("");
  });

  it("should start streaming explanation", () => {
    const parser = streamingParser();
    parser.write("<revolt-response><revolt-explanation>H");

    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("H");

    parser.write("ello");
    expect(parser.explanation()).toBe("Hello");
    expect(parser.code()).toBe("");
  });

  it("should handle partially closed tags", () => {
    const parser = streamingParser();
    parser.write("<revolt-response><revolt-explanation>Hello</revolt-e");

    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("xpl");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("ana");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("tion>");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");
  });

  it("should handle both code and explanation", () => {
    const parser = streamingParser();
    parser.write(
      "<revolt-response><revolt-explanation>Hello</revolt-explanation>"
    );

    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("<revolt-code");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write(">");
    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("Foo");
    expect(parser.code()).toBe("Foo");
    expect(parser.explanation()).toBe("Hello");

    parser.write("Foo Bar");
    expect(parser.code()).toBe("FooFoo Bar");
    expect(parser.explanation()).toBe("Hello");

    parser.write("</revolt-code>");
  });

  it("should handle special symbols in the code", () => {
    const parser = streamingParser();
    parser.write(
      "<revolt-response><revolt-explanation>Hello</revolt-explanation>"
    );

    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("<revolt-code>() => {}");

    expect(parser.code()).toBe("() => {}");
    expect(parser.explanation()).toBe("Hello");
    parser.write("</revolt-code>");
  });

  it("should handle other XML in the code", () => {
    const parser = streamingParser();
    parser.write(
      "<revolt-response><revolt-explanation>Hello</revolt-explanation>"
    );

    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello");

    parser.write("<revolt-code>() => {}<span></span>");

    expect(parser.code()).toBe("() => {}<span></span>");
    expect(parser.explanation()).toBe("Hello");

    parser.write("</revolt-code>");
    expect(parser.code()).toBe("() => {}<span></span>");
    expect(parser.explanation()).toBe("Hello");
  });

  it("should handle other XML in the response", () => {
    const parser = streamingParser();
    parser.write(
      "<revolt-response><revolt-explanation>Hello<div></div></revolt-explanation>"
    );

    expect(parser.code()).toBe("");
    expect(parser.explanation()).toBe("Hello<div></div>");

    parser.write("<revolt-code>() => {}<span></span>");

    expect(parser.code()).toBe("() => {}<span></span>");
    expect(parser.explanation()).toBe("Hello<div></div>");

    parser.write("</revolt-code>");
    expect(parser.code()).toBe("() => {}<span></span>");
    expect(parser.explanation()).toBe("Hello<div></div>");
  });
});
