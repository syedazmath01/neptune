import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// AI answers are untrusted text. react-markdown never renders raw HTML and strips unsafe URL
// schemes (javascript:, data:); images are dropped so an answer can't load tracking pixels.
export function AnswerText({ text }: { text: string }) {
  return (
    <div className="md">
      <Markdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={["img"]}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="nofollow noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
