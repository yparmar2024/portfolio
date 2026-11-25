const svg = (body) =>
  `<svg viewBox="0 0 32 32" aria-hidden="true">${body}</svg>`;

export const icons = {
  About: svg(
    '<rect x="5" y="7" width="22" height="19" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M8 22q4-7 8 0M20 12h4M20 17h4M12 7V4h8v3"/>',
  ),
  Projects: svg(
    '<path d="M8 5h18v23H8zM12 5v23M5 9h6M5 15h6M5 21h6M16 12l-2 3 2 3M22 12l2 3-2 3"/>',
  ),
  Experience: svg(
    '<rect x="4" y="10" width="24" height="17" rx="2"/><path d="M11 10V5h10v5M4 17q12 7 24 0M14 18h4v5h-4z"/>',
  ),
  Records: svg(
    '<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="4"/><path d="M9 18a7 7 0 0 1 5-9M18 23a7 7 0 0 0 5-9"/>',
  ),
  replay: svg('<path d="M25 12a10 10 0 1 0 1 8M25 4v9h-9"/>'),
  help: svg('<path d="M11 11a5 5 0 0 1 10 0c0 4-5 4-5 8M16 24v1"/>'),
  menu: svg('<path d="M6 9h20M6 16h20M6 23h20"/>'),
  close: svg('<path d="m9 9 14 14M23 9 9 23"/>'),
  square: svg('<rect x="8" y="8" width="16" height="16" rx="1"/>'),
  circle: svg('<circle cx="16" cy="16" r="8"/>'),
  triangle: svg('<path d="m16 6 11 20H5Z"/>'),
  look: svg(
    '<path d="M4 16h24M16 4v24M4 16l4-4M4 16l4 4M28 16l-4-4M28 16l-4 4M16 4l-4 4M16 4l4 4M16 28l-4-4M16 28l4-4"/>',
  ),
};
