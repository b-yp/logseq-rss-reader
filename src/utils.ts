import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";
import React from "react";

let _visible = logseq.isMainUIVisible;

function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

export const genRandomStr = () => Math.random().
  toString(36).
  replace(/[^a-z]+/g, '').
  substring(0, 5)

export const extractBaseURL = (url: string): string | null => {
  const pattern = /(https?:\/\/[^/]+)\/?/;
  const match = url.match(pattern);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}

export const extractURL = (input: string): string | null => {
  const regex = /(http[s]?:\/\/[^\n\s]+)/g;
  const matches = input.match(regex);

  if (matches && matches.length > 0) {
    return matches[0];
  }

  return null;
}

export const formatObject = (object: { [key: string]: any }) => {
  const obj: any = {}
  for (const i in object) {
    const value = typeof object[i] === 'string' ? object[i] : object[i]?.[0]
    if (value) {
      obj[i] = `\`${value}\``
    }
  }
  return obj
}

export const parseObjectValue = (object?: { [key: string]: string }) => {
  if (!object) {
    return ({})
  }
  const obj: any = {}
  for (const i in object) {
    if (object[i]) {
      obj[i] = object[i].replace(/`(.*)`/, "$1");
    }
  }
  return obj
}
