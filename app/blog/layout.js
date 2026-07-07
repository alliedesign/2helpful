// app/blog/layout.js
// Imports the scoped blog stylesheet so it loads for /blog and /blog/[slug].
import "./blog.css";

export default function BlogLayout({ children }) {
  return children;
}
