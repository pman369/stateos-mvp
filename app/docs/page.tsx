import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

const docsDirectory = path.join(process.cwd(), 'docs');

function getAllDocs() {
  const fileNames = fs.readdirSync(docsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return {
        slug: fileName.replace(/\.md$/, ''),
        title: data.title || fileName.replace(/\.md$/, ''),
        description: data.description || '',
      };
    });
}

export default function DocsIndex() {
  const docs = getAllDocs();

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>
      <ul className="space-y-4">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold text-blue-700">{doc.title}</h2>
              {doc.description && (
                <p className="text-gray-600 mt-1">{doc.description}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}