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

/**
 * Formats text for inline display in the editor.
 * Keeps the markdown symbols but styles the text they enclose.
 * Symbols are styled to be semi-transparent.
 */
export const formatInline = (content: string): React.ReactNode[] => {
  if (!content) return [];

  const rules: {
    name: string;
    regex: RegExp;
    render: (...args: any[]) => React.ReactNode;
  }[] = [
    {
      name: 'bold',
      regex: /(\*\*)(.*?)(\*\*)/g,
      render: (match, s1, text, s2, idx) => (
        <span key={`bold-${idx}`} className="font-bold">
          <span className="opacity-30 font-normal">{s1}</span>
          {text}
          <span className="opacity-30 font-normal">{s2}</span>
        </span>
      )
    },
    {
      name: 'italic',
      regex: /(\*)(.*?)(\*)/g,
      render: (match, s1, text, s2, idx) => (
        <span key={`italic-${idx}`} className="italic">
          <span className="opacity-30 italic-none font-normal">{s1}</span>
          {text}
          <span className="opacity-30 italic-none font-normal">{s2}</span>
        </span>
      )
    },
    {
      name: 'underline',
      regex: /(__)(.*?)(__)/g,
      render: (match, s1, text, s2, idx) => (
        <span key={`underline-${idx}`} className="underline">
          <span className="opacity-30 no-underline font-normal">{s1}</span>
          {text}
          <span className="opacity-30 no-underline font-normal">{s2}</span>
        </span>
      )
    },
    {
      name: 'strikethrough',
      regex: /(~~)(.*?)(~~)/g,
      render: (match, s1, text, s2, idx) => (
        <span key={`strike-${idx}`} className="line-through">
          <span className="opacity-30 no-line-through font-normal">{s1}</span>
          {text}
          <span className="opacity-30 no-line-through font-normal">{s2}</span>
        </span>
      )
    },
    {
      name: 'code',
      regex: /(`)(.*?)(`)/g,
      render: (match, s1, text, s2, idx) => (
        <span key={`code-${idx}`} className="bg-black/10 dark:bg-white/10 px-0.5 rounded font-mono text-sm">
          <span className="opacity-30 font-normal">{s1}</span>
          {text}
          <span className="opacity-30 font-normal">{s2}</span>
        </span>
      )
    },
    {
      name: 'link',
      regex: /(\[)(.*?)(\])(\()(.*?)(\))/g,
      render: (match, s1, text, s2, s3, url, s4, idx) => (
        <span key={`link-${idx}`} className="text-blue-500 dark:text-blue-400 underline decoration-blue-500/30">
          <span className="opacity-30 no-underline">{s1}</span>
          {text}
          <span className="opacity-30 no-underline">{s2}{s3}</span>
          <span className="opacity-30 no-underline">{url}</span>
          <span className="opacity-30 no-underline">{s4}</span>
        </span>
      )
    }
  ];

  let parts: (string | React.ReactNode)[] = [content];

  rules.forEach(rule => {
    const newParts: (string | React.ReactNode)[] = [];
    parts.forEach((part, partIdx) => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }

      let lastIndex = 0;
      let match;
      rule.regex.lastIndex = 0;
      let matchIdx = 0;
      
      while ((match = rule.regex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          newParts.push(part.substring(lastIndex, match.index));
        }

        const uniqueIdx = `${partIdx}-${matchIdx}`;
        if (rule.name === 'link') {
          newParts.push(rule.render(match[0], match[1], match[2], match[3], match[4], match[5], match[6], uniqueIdx));
        } else {
          newParts.push(rule.render(match[0], match[1], match[2], match[3], uniqueIdx));
        }

        lastIndex = rule.regex.lastIndex;
        matchIdx++;
      }

      if (lastIndex < part.length) {
        newParts.push(part.substring(lastIndex));
      }
    });
    parts = newParts;
  });

  return parts as React.ReactNode[];
};
