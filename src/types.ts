enum Type {
  Text = 'text',
  Mention = 'mention',
  Equation = 'equation',
}

export interface RichText {
  type?: Type
  [Type.Text]: {
    content: string
    link?: string | null
  }
}

export interface RssOption {
  feedUrl: string;

  url: string;
  title: string;
  siteName: string | undefined;
  description: string | undefined;
  mediaType: string;
  contentType: string | undefined;
  images: string[];
  videos: {
    url: string | undefined;
    secureUrl: string | null | undefined;
    type: string | null | undefined;
    width: string | undefined;
    height: string | undefined;
  }[];
  favicons: string[];
}
