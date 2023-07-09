import { CSSObject } from "@mui/material/styles";

export enum Theme {
  Light = "light",
  Dark = "dark",
}

export const articleStyle = (theme: Theme): CSSObject => ({
  fontSize: '0.875rem',
  color: {
    [Theme.Light]: '#111',
    [Theme.Dark]: '#ebebeb',
  }[theme],
  backgroundColor: {
    [Theme.Light]: '#fff',
    [Theme.Dark]: '#222',
  }[theme],
  time: {
    display: 'inline-block',
    width: '100%',
    textAlign: 'center',
    color: {
      [Theme.Light]: '#515151',
      [Theme.Dark]: '#bdc3c7',
    }[theme]
  },
  h1: {
    textAlign: 'center',
  },
  h2: {
    marginBottom: '0.5em',
    borderBottom: '1px solid #d3d3d3',
  },
  p: {
    maxWidth: '100%',
  },
  a: {
    color: {
      [Theme.Light]: '#619dda',
      [Theme.Dark]: '#619dda',
    }[theme],
  },
  img: {
    maxWidth: '100%',
    margin: '10px',
    padding: '5px',
    backgroundColor: '#fff',
    border: '1px solid #bbb',
    boxShadow: '1px 1px 3px #d4d4d4',
    borderRadius: '4px',
  },
  blockquote: {
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
    padding: '4px 8px',
    borderLeft: '4px solid #979797',
    backgroundColor: {
      [Theme.Light]: '#f8f8f8',
      [Theme.Dark]: '#262626',
    }[theme],
  }
})
