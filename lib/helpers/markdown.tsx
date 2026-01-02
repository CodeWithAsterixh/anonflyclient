import React from 'react';

/**
 * A simple, lightweight markdown-like parser for chat messages.
 * Supports:
 * - **bold**
 * - *italic*
 * - __underline__
 * - ~~strikethrough~~
 * - `inline code`
 * - [text](url) or auto-linking URLs
 */
export const formatMessage = (content: string): React.ReactNode[] => {
  if (!content) return [];

  // Regex for different formatting rules
  const rules: {
    name: string;
    regex: RegExp;
    render: (...args: string[]) => React.ReactNode;
  }[] = [
    {
      name: 'bold',
      regex: /\*\*(.*?)\*\*/g,
      render: (text: string) => <strong key={text} className="font-bold">{text}</strong>
    },
    {
      name: 'italic',
      regex: /\*(.*?)\*/g,
      render: (text: string) => <em key={text} className="italic">{text}</em>
    },
    {
      name: 'underline',
      regex: /__(.*?)__/g,
      render: (text: string) => <u key={text} className="underline">{text}</u>
    },
    {
      name: 'strikethrough',
      regex: /~~(.*?)~~/g,
      render: (text: string) => <del key={text} className="line-through">{text}</del>
    },
    {
      name: 'code',
      regex: /`(.*?)`/g,
      render: (text: string) => <code key={text} className="bg-black/10 dark:bg-white/10 px-1 rounded font-mono text-sm">{text}</code>
    },
    {
      name: 'link',
      regex: /\[(.*?)\]\((.*?)\)/g,
      render: (text: string, url: string) => {
        const isSafe = !url.toLowerCase().startsWith('javascript:');
        const href = isSafe ? (url.startsWith('http') ? url : `https://${url}`) : '#';
        return (
          <a 
            key={url} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline break-all"
          >
            {text}
          </a>
        );
      }
    },
    {
      name: 'autolink',
      regex: /(https?:\/\/[^\s]+)/g,
      render: (url: string) => {
        const isSafe = !url.toLowerCase().startsWith('javascript:');
        return isSafe ? (
          <a 
            key={url} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline break-all"
          >
            {url}
          </a>
        ) : <span key={url}>{url}</span>;
      }
    }
  ];

  // We'll process the string by splitting it and matching rules
  // For simplicity and to avoid nested complex logic, we'll apply them sequentially
  // but a more robust way is to find all matches and sort them.
  
  // For this lightweight version, we'll use a recursive-like approach or just a simple split-and-match
  
  let parts: (string | React.ReactNode)[] = [content];

  rules.forEach(rule => {
    const newParts: (string | React.ReactNode)[] = [];
    
    parts.forEach(part => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }

      let lastIndex = 0;
      let match;
      
      // Reset regex index
      rule.regex.lastIndex = 0;
      
      while ((match = rule.regex.exec(part)) !== null) {
        // Push text before match
        if (match.index > lastIndex) {
          newParts.push(part.substring(lastIndex, match.index));
        }

        // Push rendered match
        if (rule.name === 'link') {
          newParts.push(rule.render(match[1], match[2]));
        } else {
          newParts.push(rule.render(match[1]));
        }

        lastIndex = rule.regex.lastIndex;
      }

      // Push remaining text
      if (lastIndex < part.length) {
        newParts.push(part.substring(lastIndex));
      }
    });
    
    parts = newParts;
  });

  return parts as React.ReactNode[];
};
