// app/components/PostBody.js
import Link from "next/link";
import Portfolio from "@/app/components/Portfolio";

// Renders inline HTML (bold, em, anchors) coming from the posts data.
const Html = ({ tag: Tag = "p", html, className }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

function Cta({ block }) {
  return (
    <div className="cta-band">
      <h3>{block.title}</h3>
      <p>{block.text}</p>
      <Link className="btn" href={block.primary.href}>
        {block.primary.label}
      </Link>
      {block.ghost && (
        <Link className="btn-ghost" href={block.ghost.href}>
          {block.ghost.label}
        </Link>
      )}
    </div>
  );
}

function Table({ block }) {
  return (
    <div className="tbl-wrap">
      <table className="cmp">
        <thead>
          <tr>
            {block.head.map((h, i) => (
              <th key={i}>{h || "\u00A0"}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                if (Array.isArray(cell)) {
                  return (
                    <td key={c}>
                      <span className={cell[0]}>{cell[1]}</span>
                    </td>
                  );
                }
                return <td key={c}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PostBody({ blocks }) {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return <Html key={i} tag="p" html={b.html} />;
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
                ))}
              </ol>
            );
          case "callout":
            return (
              <div key={i} className="callout">
                <h3>{b.title}</h3>
                <ul>
                  {b.items.map((it, j) => (
                    <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
                  ))}
                </ul>
              </div>
            );
          case "quote":
            return <blockquote key={i}>{b.text}</blockquote>;
          case "note":
            return <Html key={i} tag="p" className="note" html={b.html} />;
          case "table":
            return <Table key={i} block={b} />;
          case "cta":
            return <Cta key={i} block={b} />;
          case "portfolio":
            return <Portfolio key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
