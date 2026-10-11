import { PaperIntelligence } from '../types/research';

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'BibTeX' | 'IEEE';

export function generateCitation(paper: PaperIntelligence, style: CitationStyle): string {
  const authors = paper.authors && paper.authors.length > 0 ? paper.authors : ['Anonymous'];
  const title = paper.title.trim();
  const venue = paper.venueYear || 'Preprint / Conference Proceedings';
  const doi = paper.doi && paper.doi !== 'N/A' ? paper.doi : '';
  const doiUrl = doi ? (doi.startsWith('http') ? doi : `https://doi.org/${doi}`) : '';

  // Extract year if present, otherwise default to current year
  const yearMatch = venue.match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : '2024';

  switch (style) {
    case 'APA': {
      // Format: Author, A. A., & Author, B. B. (Year). Title. Venue. DOI
      const formattedAuthors = authors.map((name) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        const last = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
        return `${last}, ${initials}`;
      });

      let authorStr = '';
      if (formattedAuthors.length === 1) {
        authorStr = formattedAuthors[0];
      } else if (formattedAuthors.length === 2) {
        authorStr = `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
      } else {
        authorStr = `${formattedAuthors.slice(0, -1).join(', ')}, & ${formattedAuthors[formattedAuthors.length - 1]}`;
      }

      return `${authorStr} (${year}). ${title}. ${venue}.${doiUrl ? ` ${doiUrl}` : ''}`;
    }

    case 'MLA': {
      // Format: Author, First. "Title." Venue, Year, DOI.
      const firstParts = authors[0].trim().split(/\s+/);
      const firstAuthor = firstParts.length > 1
        ? `${firstParts[firstParts.length - 1]}, ${firstParts.slice(0, -1).join(' ')}`
        : authors[0];
      
      const authorStr = authors.length > 2
        ? `${firstAuthor}, et al.`
        : authors.length === 2
        ? `${firstAuthor}, and ${authors[1]}`
        : firstAuthor;

      return `${authorStr}. "${title}." ${venue}, ${year}.${doiUrl ? ` ${doiUrl}.` : ''}`;
    }

    case 'Chicago': {
      // Format: Author, First. "Title." Venue (Year). DOI.
      const firstParts = authors[0].trim().split(/\s+/);
      const firstAuthor = firstParts.length > 1
        ? `${firstParts[firstParts.length - 1]}, ${firstParts.slice(0, -1).join(' ')}`
        : authors[0];
      
      const authorStr = authors.length > 3
        ? `${firstAuthor} et al.`
        : authors.length > 1
        ? `${firstAuthor}, and ${authors.slice(1).join(', ')}`
        : firstAuthor;

      return `${authorStr}. "${title}." ${venue} (${year}).${doiUrl ? ` ${doiUrl}.` : ''}`;
    }

    case 'Harvard': {
      // Format: Author, A. et al., Year. Title. Venue.
      const firstParts = authors[0].trim().split(/\s+/);
      const firstLast = firstParts[firstParts.length - 1];
      const firstInitials = firstParts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
      const authorStr = authors.length > 1
        ? `${firstLast}, ${firstInitials} et al.`
        : `${firstLast}, ${firstInitials}`;

      return `${authorStr}, ${year}. ${title}. ${venue}.${doiUrl ? ` Available at: <${doiUrl}>.` : ''}`;
    }

    case 'IEEE': {
      // Format: [1] A. Author and B. Author, "Title," Venue, Year.
      const formatted = authors.map((name) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        const last = parts[parts.length - 1];
        const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
        return `${initials} ${last}`;
      });
      const authorStr = formatted.length > 2
        ? `${formatted[0]} et al.`
        : formatted.join(' and ');

      return `[1] ${authorStr}, "${title}," ${venue}, ${year}.${doi ? ` doi: ${doi}.` : ''}`;
    }

    case 'BibTeX': {
      // Cite key: first author last name + year + first keyword
      const firstParts = authors[0].trim().split(/\s+/);
      const last = (firstParts[firstParts.length - 1] || 'author').toLowerCase().replace(/[^a-z0-9]/g, '');
      const firstWord = (title.split(/\s+/)[0] || 'paper').toLowerCase().replace(/[^a-z0-9]/g, '');
      const citeKey = `${last}${year}${firstWord}`;

      const bibAuthors = authors.join(' and ');

      return `@article{${citeKey},
  title     = {${title}},
  author    = {${bibAuthors}},
  journal   = {${venue}},
  year      = {${year}},${doi ? `\n  doi       = {${doi}},` : ''}${doiUrl ? `\n  url       = {${doiUrl}},` : ''}
  publisher = {Scholarly Publication}
}`;
    }

    default:
      return `${authors.join(', ')} (${year}). ${title}. ${venue}.`;
  }
}
